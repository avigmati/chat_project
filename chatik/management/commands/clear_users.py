from django.core.management import BaseCommand

from chatik.models import ChatUser


class Command(BaseCommand):
    help = 'Clear ChatUser table'

    def handle(self, *args, **options):
        removed = []
        for u in ChatUser.objects.all():
            removed.append(u.nickname)
            u.delete()
        removed = ', '.join(removed)
        self.stdout.write(self.style.SUCCESS(f'Removed users: {removed}'))
