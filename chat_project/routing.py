from django.urls import re_path

from chat_tutorial.consumers import ChatConsumer
from chatik.consumers import ChatikConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat_tutorial/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/chatik/$', ChatikConsumer.as_asgi())
]
