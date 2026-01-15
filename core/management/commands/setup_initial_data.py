"""
Management command to set up initial data for Mayor K. Guest Palace.
Creates room types, rooms, expense categories, and demo users.
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import User
from bookings.models import RoomType, Room
from finance.models import ExpenseCategory


class Command(BaseCommand):
    help = 'Set up initial data for Mayor K. Guest Palace Hotel'
    
    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Setting up Mayor K. Guest Palace initial data...\n')
        
        # Create room types
        self.create_room_types()
        
        # Create rooms (30 rooms as specified)
        self.create_rooms()
        
        # Create expense categories
        self.create_expense_categories()
        
        # Create demo users
        self.create_demo_users()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Initial data setup complete!'))
    
    def create_room_types(self):
        self.stdout.write('Creating room types...')
        
        room_types = [
            {
                'name': 'Standard',
                'description': 'Comfortable room with basic amenities',
                'base_rate_short_rest': Decimal('5000.00'),
                'base_rate_overnight': Decimal('12000.00'),
                'base_rate_lodge': Decimal('10000.00'),
                'capacity': 2,
                'amenities': ['AC', 'TV', 'Fan']
            },
            {
                'name': 'Deluxe',
                'description': 'Spacious room with modern amenities',
                'base_rate_short_rest': Decimal('8000.00'),
                'base_rate_overnight': Decimal('18000.00'),
                'base_rate_lodge': Decimal('15000.00'),
                'capacity': 2,
                'amenities': ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Hot Water']
            },
            {
                'name': 'VIP Suite',
                'description': 'Premium suite with luxury amenities',
                'base_rate_short_rest': Decimal('12000.00'),
                'base_rate_overnight': Decimal('30000.00'),
                'base_rate_lodge': Decimal('25000.00'),
                'capacity': 3,
                'amenities': ['AC', 'Smart TV', 'WiFi', 'Full Fridge', 'Hot Water', 'Jacuzzi', 'King Bed']
            },
        ]
        
        for rt_data in room_types:
            rt, created = RoomType.objects.get_or_create(
                name=rt_data['name'],
                defaults=rt_data
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  - {rt.name}: {status}')
    
    def create_rooms(self):
        self.stdout.write('\nCreating 30 rooms...')
        
        standard = RoomType.objects.get(name='Standard')
        deluxe = RoomType.objects.get(name='Deluxe')
        vip = RoomType.objects.get(name='VIP Suite')
        
        # 30 rooms distributed across floors and types
        # Floor 1: Rooms 101-110 (8 Standard, 2 Deluxe)
        # Floor 2: Rooms 201-210 (5 Standard, 4 Deluxe, 1 VIP)
        # Floor 3: Rooms 301-310 (3 Standard, 5 Deluxe, 2 VIP)
        
        room_configs = [
            # Floor 1
            ('101', standard, 1), ('102', standard, 1), ('103', standard, 1),
            ('104', standard, 1), ('105', standard, 1), ('106', standard, 1),
            ('107', standard, 1), ('108', standard, 1), ('109', deluxe, 1),
            ('110', deluxe, 1),
            # Floor 2
            ('201', standard, 2), ('202', standard, 2), ('203', standard, 2),
            ('204', standard, 2), ('205', standard, 2), ('206', deluxe, 2),
            ('207', deluxe, 2), ('208', deluxe, 2), ('209', deluxe, 2),
            ('210', vip, 2),
            # Floor 3
            ('301', standard, 3), ('302', standard, 3), ('303', standard, 3),
            ('304', deluxe, 3), ('305', deluxe, 3), ('306', deluxe, 3),
            ('307', deluxe, 3), ('308', deluxe, 3), ('309', vip, 3),
            ('310', vip, 3),
        ]
        
        created_count = 0
        for room_number, room_type, floor in room_configs:
            room, created = Room.objects.get_or_create(
                room_number=room_number,
                defaults={
                    'room_type': room_type,
                    'floor': floor,
                    'current_state': Room.State.AVAILABLE
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(f'  - Created {created_count} rooms (30 total: 16 Standard, 11 Deluxe, 3 VIP)')
    
    def create_expense_categories(self):
        self.stdout.write('\nCreating expense categories...')
        
        categories = [
            ('Utilities', 'Electricity, water, internet bills'),
            ('Supplies', 'Cleaning supplies, toiletries, linens'),
            ('Maintenance', 'Repairs and equipment maintenance'),
            ('Staff', 'Staff salaries and allowances'),
            ('Security', 'Security services and equipment'),
            ('Marketing', 'Advertising and promotional expenses'),
            ('Fuel', 'Generator fuel (backup)'),
            ('Solar Maintenance', 'Solar inverter servicing and battery maintenance'),
            ('Food & Beverages', 'Restaurant and bar supplies'),
            ('Miscellaneous', 'Other operational expenses'),
        ]
        
        for name, description in categories:
            cat, created = ExpenseCategory.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  - {cat.name}: {status}')
    
    def create_demo_users(self):
        self.stdout.write('\nCreating demo users...')
        
        demo_users = [
            {
                'username': 'manager',
                'email': 'manager@mayork.com',
                'first_name': 'John',
                'last_name': 'Manager',
                'role': User.Role.MANAGER,
                'password': 'manager123'
            },
            {
                'username': 'receptionist',
                'email': 'reception@mayork.com',
                'first_name': 'Ada',
                'last_name': 'Receptionist',
                'role': User.Role.RECEPTIONIST,
                'password': 'reception123'
            },
            {
                'username': 'stakeholder',
                'email': 'stakeholder@mayork.com',
                'first_name': 'Family',
                'last_name': 'Stakeholder',
                'role': User.Role.STAKEHOLDER,
                'password': 'stakeholder123'
            },
        ]
        
        for user_data in demo_users:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(f'  - {user.username} ({user.get_role_display()}): Created (password: {password})')
            else:
                self.stdout.write(f'  - {user.username}: Already exists')
