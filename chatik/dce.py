import asyncio
import logging
import uuid
import re
from django.core import serializers
from django.core.exceptions import ValidationError
from asgiref.sync import sync_to_async
from channels_endpoints.main import endpoint, disconnect, Response
from servitin.lib.zmq.client import Servitin
from servitin.lib.zmq.client import ValidationError as ZmqValidationError
import chatik.settings

from .models import Room, ChatUser
from .permissions import PermissionCreateRoom, PermissionDeleteRoom


logger = logging.getLogger(__name__)


def log(request, msg):
    logger.info(f'[chat] {request.log} : {msg}')


chatik_service = Servitin('chatik')


@endpoint
async def register_user(request):
    """
    register user on chat page
    """

    def register():
        if not request.data['uuid']:
            # register if not
            user = ChatUser.objects.create(user=request.user if request.user.is_authenticated else None,
                                           channel_name=request.consumer.channel_name,
                                           uuid=str(uuid.uuid4()))
            return {
                "id": user.id,
                "uuid": user.uuid,
                "channel": user.channel_name,
            }
        return None  # already registered

    user = await sync_to_async(register, thread_sensitive=False)()
    if user:
        log(request, user)
        return Response(request, user['uuid'])
    return Response(request, None)


@endpoint
async def connect_user(request):
    """
    update registered user channel_name on reconnect
    this need then user browser lost connection, but user still on page
    """

    def do():
        try:
            user = ChatUser.objects.get(uuid=request.data['uuid'])
            user.channel_name = request.consumer.channel_name
            user.save()
            return {
                "id": user.id,
                "uuid": user.uuid,
                "channel": user.channel_name,
                "nickname": user.nickname,
                "room_id": user.room.id if user.room else None
            }
        except ChatUser.DoesNotExist:
            return None

    user = await sync_to_async(do, thread_sensitive=False)()
    if user:
        log(request, f'reconnected after lost connection: {user}')
    return Response(request, None)


@disconnect
async def disconnect_user(consumer, close_code):
    """
    this happens then user close page in browser
    """

    def discard():
        try:
            _user = ChatUser.objects.get(channel_name=consumer.channel_name)
        except ChatUser.DoesNotExist:
            return None

        user = {
            "id": _user.id,
            "username": _user.user.username if _user.user else None,
            "nickname": _user.nickname,
            "uuid": _user.uuid,
            "channel": _user.channel_name,
            "room_id": _user.room.id if _user.room else None
        }
        _user.delete()
        return user

    user = await sync_to_async(discard, thread_sensitive=False)()
    if user:
        logger.info(f"[chat] {user['username']} {consumer.get_client_ip()} chatik.disconnect_user : {user}")

        # notify all room users about user leave
        await notify_user_list(consumer, user['room_id'], user['id'], {'action': 'leave', 'nickname': user['nickname']})


@endpoint
async def get_nickname(request):
    def getn():
        try:
            user = ChatUser.objects.get(channel_name=request.consumer.channel_name)
        except ChatUser.DoesNotExist:
            return None
        return user.nickname

    return Response(request, await sync_to_async(getn, thread_sensitive=False)())


@endpoint
async def set_nickname(request):
    def set_nick():
        old_nickname = None
        try:
            user = ChatUser.objects.get(channel_name=request.consumer.channel_name)
        except ChatUser.DoesNotExist:
            user = None
        else:
            old_nickname = user.nickname
            user.nickname = request.data['nickname']
            user.full_clean()
            if old_nickname == request.data['nickname']:
                return None, None
            user.save()
        return user, old_nickname

    try:
        user, old_nickname = await sync_to_async(set_nick, thread_sensitive=False)()
        if user:
            log(request, user.nickname)
        r = Response(request, None)
    except ValidationError as e:
        r = Response(request, None, error_data=' '.join(e.messages), error='ValidationError')
    await request.consumer.send(text_data=r)


@endpoint
async def get_rooms(request):
    def getr():
        return serializers.serialize('python', Room.objects.all().order_by('name'), fields=('name', 'owner'))

    return Response(request, await sync_to_async(getr, thread_sensitive=False)())


@endpoint(permissions=[PermissionCreateRoom])
async def create_room(request):
    """
    creates room and join
    """

    def create():
        # create room
        room = Room(name=request.data['name'], owner=request.user if request.user.is_authenticated else None)
        room.full_clean()
        room.save()

        # join room
        chat_user = ChatUser.objects.get(channel_name=request.consumer.channel_name)
        chat_user.room = room
        chat_user.save()
        return room

    try:
        room = await sync_to_async(create, thread_sensitive=False)()
        r = Response(request, {'name': room.name, 'id': room.id})
        log(request, room.name)
    except ValidationError as e:
        r = Response(request, None, error_data=' '.join(e.messages), error='ValidationError')
    await request.consumer.send(text_data=r)


@endpoint(permissions=[PermissionDeleteRoom])
async def delete_room(request):
    """
    removes a room object and room from users objects, also notify all users about room deleted
    """

    room_id = request.data['room_id']

    def delete():
        """ removes room object and room from users objects """
        room = Room.objects.get(id=room_id)
        for u in ChatUser.objects.filter(room=room):
            u.room = None
            u.save()
        room_name = room.name
        room.delete()
        return room_name

    room_name = await sync_to_async(delete, thread_sensitive=False)()
    log(request, room_name)
    await request.consumer.send(text_data=Response(request, None))

    # notify users
    def get_all_channels():
        return [u.channel_name for u in ChatUser.objects.all()]

    channels = await sync_to_async(get_all_channels, thread_sensitive=False)()

    await asyncio.gather(*[
        request.consumer.send_to_channel(
            channel,
            Response(None, {'action': 'delete', 'room': room_id}, consumers=['RoomsConsumer'])
        )
        for channel in channels
    ])


@endpoint
async def join_room(request):
    """
    join user to room and notify all about this
    """

    # join room and send response back
    def join():
        chat_user = ChatUser.objects.get(channel_name=request.consumer.channel_name)
        room = Room.objects.get(id=request.data['room_id'])
        chat_user.room = room
        chat_user.save()

        # make room data for response
        room_data = {
            'id': room.id,
            'name': room.name,
            'users': [u.nickname for u in ChatUser.objects.filter(room=room).order_by('nickname')]
        }
        return chat_user, room_data

    chat_user, room_data = await sync_to_async(join, thread_sensitive=False)()
    await request.consumer.send(text_data=Response(request, room_data))
    log(request, f"nickname: {chat_user.nickname}, room: {room_data['name']}")

    # notify all room users about new user joined
    await notify_user_list(request.consumer, chat_user.room.id, chat_user.id, {'action': 'join', 'nickname': chat_user.nickname})


@endpoint
async def leave_room(request):
    """
    leave user from room and notify all about this
    """

    # leave room and send response back
    def leave():
        chat_user = ChatUser.objects.get(channel_name=request.consumer.channel_name)
        room_id = chat_user.room.id
        room_name = chat_user.room.name
        chat_user.room = None
        chat_user.save()
        return chat_user, room_id, room_name

    chat_user, room_id, room_name = await sync_to_async(leave, thread_sensitive=False)()
    await request.consumer.send(text_data=Response(request, None))
    log(request, f"nickname: {chat_user.nickname}, room: {room_name}")

    # notify all room users about user leave
    await notify_user_list(request.consumer, room_id, chat_user.id, {'action': 'leave', 'nickname': chat_user.nickname})


async def notify_user_list(consumer, room_id, user_id, data):
    """
    notifies all users in room about changes in user list
    """

    if data['action'] == 'leave' and not room_id:
        return

    def get_room_users_channels():
        return [u.channel_name for u in ChatUser.objects.filter(room=room_id).exclude(id=user_id)]

    room_channels = await sync_to_async(get_room_users_channels, thread_sensitive=False)()

    await asyncio.gather(*[
        consumer.send_to_channel(
            channel,
            Response(None, data, consumers=['UserListConsumer'])
        )
        for channel in room_channels
    ])


@endpoint
async def send(request):
    """
    send message to all users in room
    """

    # sand messsage to all in room
    def get_data():
        cuser = ChatUser.objects.get(channel_name=request.consumer.channel_name)
        return {'room_channels': [u.channel_name for u in ChatUser.objects.filter(room=cuser.room)], 'user': cuser.nickname}

    data = await sync_to_async(get_data, thread_sensitive=False)()

    message = request.data['message']
    user = data['user']

    await asyncio.gather(*[
        request.consumer.send_to_channel(
            channel,
            Response(None, {'text': message, 'user': user}, consumers=['MessageConsumer'])
        )
        for channel in data['room_channels']
    ])

    # proceed bot command
    command_p = re.compile('(bot:) (.*)', re.IGNORECASE)
    b = re.search(command_p, message)
    command = None
    if b:
        _, command = b.groups()

    if command:
        error = None
        try:
            answer = await chatik_service.request('bot', {'command': command, 'data': user})
            answer = answer['data']
        except ZmqValidationError as errors:
            answer = ' '.join([e['msg'] for e in errors.args[0]])
        except Exception as e:
            answer = e.__repr__()
            error = e

        await asyncio.gather(*[
            request.consumer.send_to_channel(
                channel,
                Response(None, {'text': answer, 'user': 'bot'}, consumers=['MessageConsumer'])
            )
            for channel in data['room_channels']
        ])

        if error:
            raise Exception(f'Service error:: {error.__repr__()}')
