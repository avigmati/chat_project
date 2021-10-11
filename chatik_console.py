"""
set DEBUG=True to see Dce debug log
Prompt.ask() is blocking function so need to be called via loop.run_in_executor()
on_connect(dce) - callback function called on connect, "dce" is Dce instance
"""

import asyncio
import logging
import signal
import sys
from dataclasses import dataclass
from typing import Optional
from channels_endpoints.client import Dce, DceException, consumer
from rich.prompt import Prompt, IntPrompt
from rich import print
from rich.text import Text


DEBUG = True
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)
loop = asyncio.get_event_loop()


async def on_connect(dce):
    """ update backend ChatUser.channel_name on reconnect """
    await dce.request('chatik.connect_user', {'uuid': user.uuid})


dce = Dce('http://127.0.0.1:8000/ws/chatik/', on_connect=on_connect)  # at this point Dce runs reconnection task
msg_task = None


@dataclass
class User:
    uuid: Optional[str]
    nickname: Optional[str]


@dataclass
class Room:
    id: int
    name: str

    def __init__(self, data):
        self.id = data['pk']
        self.name = data['fields']['name']

    @classmethod
    def get_current_room(cls, room_id):
        for r in rooms:
            if r.id == room_id:
                return r


user = User(uuid=None, nickname=None)
rooms = None
room = None


def shutdown():
    """ Cancel all tasks and exit"""

    if loop.is_running():
        for task in asyncio.all_tasks():
            task.cancel()
    sys.exit(777)


@consumer
async def MessageConsumer(response):
    """ receive messages and print """

    logger.debug(f'MessageConsumer: {response["data"]}')
    user_nickname, msg = response["data"]['user'], response["data"]['text']
    if not user_nickname == user.nickname:
        print(Text.assemble('<', (f'{user_nickname}', "green"), '>', f" {msg}"))


@consumer
async def UsersConsumer(request):
    """ receive users actions and print """

    logger.debug(f'UsersConsumer: {request["data"]}')
    nickname, action = request["data"]['nickname'], request["data"]['action']
    print(Text(f'{nickname} {action}', 'magenta underline'))


async def register():
    """ register user and set nickname"""

    global user

    # register
    user.uuid = await dce.request('chatik.register_user', {'uuid': None})

    # set nickname
    while True:
        # Prompt.ask() is blocking function so need to be called via loop.run_in_executor()
        nickname = await loop.run_in_executor(None, lambda: Prompt.ask("Enter your nickname"))

        try:
            await dce.request('chatik.set_nickname', {'nickname': nickname})
        except DceException as e:
            print(Text(f"Error: {e.data}", "red"))
        else:
            user.nickname = nickname
            break


async def join_room():
    """ fetch rooms and join selected """

    global rooms, room

    # get rooms
    rooms = [Room(r) for r in await dce.request('chatik.get_rooms', None)]
    _rooms = ', '.join([f'"{r.name}" id: {r.id}' for r in rooms])
    print(f'Available rooms: {_rooms}')

    # join and set current room
    room_id = await loop.run_in_executor(None, lambda: IntPrompt.ask("Select room:", choices=[str(r.id) for r in rooms]))
    response = await dce.request('chatik.join_room', {'room_id': room_id})
    room = Room.get_current_room(room_id)
    room_users = response['users']

    print(
        Text.assemble(
            'Chat in ',
            (f'{room.name}', 'magenta'),
            ', users in room: ',
            *((f'{u} ', "green") for u in room_users)
        )
    )


async def input_loop():
    """ create messaging input loop """

    global msg_task

    async def input_messages():
        try:
            while True:
                msg = str(await loop.run_in_executor(None, Prompt.ask))
                if msg:
                    if msg == '!quit':
                        break
                    else:
                        await dce.request('chatik.send', {'message': msg}, push=True)
        except asyncio.CancelledError:
            pass

    msg_task = loop.create_task(input_messages())
    await msg_task
    raise asyncio.CancelledError()


if __name__ == '__main__':
    signal.signal(signal.SIGINT, lambda n, f: shutdown())
    try:
        print('Connecting...')
        loop.run_until_complete(register())
        loop.run_until_complete(join_room())
        loop.run_until_complete(input_loop())
        loop.run_forever()
    except asyncio.CancelledError as e:
        pass
    except (KeyboardInterrupt, SystemExit) as e:
        pass
    except Exception as e:
        logger.exception(e)
    finally:
        if msg_task:
            msg_task.cancel()
        dce.close()
        loop.close()
