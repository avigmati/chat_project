from servitin.lib.zmq.server import zmq, Response
from asgiref.sync import sync_to_async
from pydantic import BaseModel, validator

from .models import ChatUser


class BotValidator(BaseModel):
    command: str
    data: str

    @validator('command')
    def validate_command(self, value):
        if not isinstance(value, str):
            raise ValueError('command must be string')

        commands = ['hello', 'users']
        if value not in commands:
            cmds = ', '.join(commands)
            raise ValueError(f'Unknown command "{value}", accepted commands: {cmds}')
        return value

    @validator('data')
    def validate_data(self, value):
        if not isinstance(value, str):
            raise ValueError('"data" must be string')
        return value


@zmq(validator=BotValidator)
async def bot(request):
    """
    bot commands endpoint
    """

    command = request.data.get('command')
    data = request.data.get('data')
    response = None

    if command == 'hello':
        response = Response(request, f'hello {data}')

    if command == 'users':
        def get_data():
            return ', '.join([u.nickname for u in ChatUser.objects.all()])

        data = await sync_to_async(get_data, thread_sensitive=False)()
        response = Response(request, f'users online: {data}')

    request.log.info(f'command: {command}', id=request.request_id, name='@bot')
    return response
