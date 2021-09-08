from asgiref.sync import sync_to_async
from channels_endpoints.auth import BasePermission
from channels_endpoints.exceptions import AccessForbidden

from .models import Room


class PermissionCreateRoom(BasePermission):
    async def check_perm(self):
        if not self.user.is_authenticated:
            raise AccessForbidden(self.request, self.path, log_exc=False)


class PermissionDeleteRoom(BasePermission):
    def check(self):
        if self.user.is_superuser:
            return True
        return self.user == Room.objects.get(id=self.request.data['room_id']).owner

    async def check_perm(self):
        if not await sync_to_async(self.check)():
            raise AccessForbidden(self.request, self.path)


class PermissionLogs(BasePermission):
    async def check_perm(self):
        if not self.user.is_superuser:
            raise AccessForbidden(self.request, self.path, log_exc=False)
