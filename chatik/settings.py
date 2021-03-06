from django.conf import settings
import os


settings.SERVITIN_CHATIK_ZMQ = getattr(settings, 'SERVITIN_CHATIK_ZMQ', {
    'BIND_ADDRESS': os.environ.get('SERVITIN_CHATIK_ZMQ_BIND_ADDRESS', 'tcp://*:5555'),
    'CONNECT_ADDRESS': os.environ.get('SERVITIN_CHATIK_ZMQ_CONNECT_ADDRESS', 'tcp://127.0.0.1:5555'),
    'SECRET': ''
})

settings.SERVITIN_CHATIK_LOGGING = getattr(settings, 'SERVITIN_CHATIK_LOGGING', {
    'handlers': {
        'servitin_chatik_file': {
            'formatter': 'servitin_default',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': settings.BASE_DIR.joinpath('logs', 'chatik_service.log'),
            'maxBytes': 1024 * 1024 * 20,  # 20 MB
            'backupCount': 10,
            'encoding': 'utf8'
        },
    },
    'loggers': {
        'servitin_chatik_logger': {
            'handlers': [
                'servitin_chatik_file'
            ],
            'level': "DEBUG" if settings.DEBUG else "INFO",
            'propagate': True if settings.DEBUG else False  # allow log to main django log, be careful on production!
        },
    }})
