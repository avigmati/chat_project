from servitin.base import BaseService
from servitin.lib.zmq.server import ZMQServer


class Service(ZMQServer, BaseService):
    pass
