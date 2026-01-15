"""
Management command to create test users for all staff roles.
"""
from django.core.management.base import BaseCommand
from core.models import User


class Command(BaseCommand):
    help = 'Create test users for all staff roles'

    def handle(self, *args, **options):
        test_users = [
            {'username': 'receptionist1', 'role': 'RECEPTIONIST', 'first_name': 'Grace', 'last_name': 'Okafor'},
            {'username': 'housekeeping1', 'role': 'HOUSEKEEPING', 'first_name': 'Blessing', 'last_name': 'Adeyemi'},
            {'username': 'barstaff1', 'role': 'BAR_STAFF', 'first_name': 'Chidi', 'last_name': 'Nwosu'},
            {'username': 'accountant1', 'role': 'ACCOUNTANT', 'first_name': 'Funke', 'last_name': 'Bello'},
            {'username': 'manager1', 'role': 'MANAGER', 'first_name': 'Tunde', 'last_name': 'Afolabi'},
            {'username': 'stakeholder1', 'role': 'STAKEHOLDER', 'first_name': 'Chief', 'last_name': 'Mayor'},
            {'username': 'admin1', 'role': 'ADMIN', 'first_name': 'Admin', 'last_name': 'User'},
        ]

        for user_data in test_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'role': user_data['role'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'email': f"{user_data['username']}@mayork.local",
                    'is_active': True,
                }
            )
            if created:
                user.set_password('test123')
                user.save()
                self.stdout.write(self.style.SUCCESS(
                    f"✅ Created {user_data['role']}: {user.username} (password: test123)"
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f"⚠️ User already exists: {user.username}"
                ))

        self.stdout.write(self.style.SUCCESS("\n🎉 Test users ready! Login at /login with password 'test123'"))
