"""
Management command to create admin superuser.
"""
from django.core.management.base import BaseCommand
from core.models import User


class Command(BaseCommand):
    help = 'Create admin superuser for Mayor K. Guest Palace'
    
    def handle(self, *args, **options):
        if User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return
        
        User.objects.create_superuser(
            username='admin',
            email='admin@mayork.com',
            password='admin123',
            role=User.Role.ADMIN,
            first_name='Admin',
            last_name='User'
        )
        self.stdout.write(self.style.SUCCESS('Admin superuser created! (username: admin, password: admin123)'))
