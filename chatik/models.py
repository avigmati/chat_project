from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


def validate_nickname_min_length(value):
    if len(value) < 2:
        raise ValidationError("Nickname must be 2 characters minimal length.")


def validate_nickname_unique(value):
    if ChatUser.objects.filter(nickname=value).exclude().exists():
        raise ValidationError("Nickname owned someone else.")


class ChatUser(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    nickname = models.CharField(max_length=50, null=True, blank=True, validators=[validate_nickname_min_length])
    channel_name = models.CharField(max_length=100)
    uuid = models.CharField(max_length=50)
    room = models.ForeignKey("Room", null=True, blank=True, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.nickname

    def clean(self):
        if ChatUser.objects.filter(nickname=self.nickname).exclude(id=self.id).exists():
            raise ValidationError("Nickname owned someone else.")
        super(ChatUser, self).clean()


def validate_room_min_length(value):
    if len(value) < 2:
        raise ValidationError("Room name must be 2 characters minimal length.")


def validate_room_name(value):
    if not value.isalnum():
        raise ValidationError("Room name may contain only alphanumeric characters.")


def validate_room_name_unique(value):
    if Room.objects.filter(name=value).exists():
        raise ValidationError("A room with that name exists.")


class Room(models.Model):
    name = models.CharField(max_length=50, validators=[validate_room_min_length, validate_room_name, validate_room_name_unique])
    owner = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.name
