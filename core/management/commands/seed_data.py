from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random
from core.models import User, SystemEvent
from bookings.models import RoomType, Room, Guest, Booking, RoomStateTransition, BookingExtension
from finance.models import Transaction, ExpenseCategory, Expense

class Command(BaseCommand):
    help = 'Seeds database with realistic test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Users
        admin, _ = User.objects.get_or_create(username='admin', defaults={'role': 'ADMIN', 'email': 'admin@hotel.com'})
        if _: admin.set_password('admin'); admin.save()
        
        manager, _ = User.objects.get_or_create(username='manager', defaults={'role': 'MANAGER', 'email': 'manager@hotel.com'})
        if _: manager.set_password('manager'); manager.save()
        
        reception, _ = User.objects.get_or_create(username='reception', defaults={'role': 'RECEPTIONIST', 'email': 'recep@hotel.com'})
        if _: reception.set_password('reception'); reception.save()

        # 2. Room Types & Rooms
        std_type, _ = RoomType.objects.get_or_create(
            name='Standard',
            defaults={
                'base_rate_short_rest': 5000,
                'base_rate_overnight': 15000,
                'description': 'Cozy standard room'
            }
        )
        dlx_type, _ = RoomType.objects.get_or_create(
            name='Deluxe',
            defaults={
                'base_rate_short_rest': 8000,
                'base_rate_overnight': 25000,
                'description': 'Spacious deluxe room'
            }
        )

        rooms = []
        for i in range(101, 111): # 10 rooms
            rtype = std_type if i < 106 else dlx_type
            room, _ = Room.objects.get_or_create(
                room_number=str(i),
                defaults={'room_type': rtype, 'floor': 1}
            )
            rooms.append(room)

        # 3. Guests
        guests = []
        names = ['John Doe', 'Jane Smith', 'Chief Obi', 'Alhaji Musa', 'Sarah Connor']
        for i, name in enumerate(names):
            guest, _ = Guest.objects.get_or_create(
                phone=f'0801234567{i}',
                defaults={'name': name}
            )
            guests.append(guest)

        # 4. Expense Categories
        cats = ['Maintenance', 'Utilities', 'Supplies', 'Fuel']
        exp_cats = {}
        for c in cats:
            obj, _ = ExpenseCategory.objects.get_or_create(name=c)
            exp_cats[c] = obj

        # 5. Populate History (Last 30 Days)
        today = timezone.now()
        
        # Clear existing non-essential data to avoid dupes if re-run? No, get_or_create is safer.
        
        self.stdout.write('Generating bookings...')
        for d in range(30, -1, -1):
            date = today - timedelta(days=d)
            # Create 1-3 bookings per day
            num_bookings = random.randint(1, 4)
            
            for _ in range(num_bookings):
                room = random.choice(rooms)
                guest = random.choice(guests)
                
                # Randomized stay info
                is_short = random.random() > 0.7
                if is_short:
                    stay_type = 'SHORT_REST'
                    rate = room.room_type.base_rate_short_rest
                    checkin = date.replace(hour=random.randint(10, 18), minute=0)
                    checkout = checkin + timedelta(hours=3)
                else:
                    stay_type = 'OVERNIGHT'
                    rate = room.room_type.base_rate_overnight
                    checkin = date.replace(hour=random.randint(18, 22), minute=0)
                    checkout = (date + timedelta(days=1)).replace(hour=12, minute=0)

                # Skip if room busy logic omitted for simplicity (just simple seeding)
                
                status = 'CHECKED_OUT' if d > 0 else 'CHECKED_IN'
                
                booking = Booking.objects.create(
                    guest=guest,
                    room=room,
                    stay_type=stay_type,
                    status=status,
                    source='WALK_IN',
                    check_in_date=checkin.date(),
                    check_in_time=checkin.time(),
                    expected_checkout=checkout,
                    actual_checkout=checkout if status == 'CHECKED_OUT' else None,
                    room_rate=rate,
                    total_amount=rate,
                    amount_paid=rate,
                    created_by=reception
                )
                
                # Transaction
                Transaction.objects.create(
                    booking=booking,
                    transaction_type='PAYMENT',
                    payment_method='CASH',
                    status='CONFIRMED',
                    amount=rate,
                    processed_by=reception,
                    created_at=checkin
                )
                
                # If d=0 (Today), set some alerting states
                if d == 0:
                    # Make one overdue
                    if random.random() > 0.8:
                        booking.expected_checkout = timezone.now() - timedelta(minutes=30)
                        booking.save()
                        room.current_state = 'OCCUPIED'
                        room.save()
                    # Make one checked out -> Dirty
                    elif random.random() > 0.5:
                        booking.status = 'CHECKED_OUT'
                        booking.save()
                        room.current_state = 'DIRTY'
                        room.save()
                    else:
                        room.current_state = 'OCCUPIED'
                        room.save()

        # 6. Generate Room History (Dirty Durations)
        self.stdout.write('Generating room history...')
        for room in rooms:
            # Create a fake history
            ts = today - timedelta(days=7)
            RoomStateTransition.objects.create(
                room=room,
                from_state='AVAILABLE',
                to_state='DIRTY',
                transitioned_by=reception,
                transitioned_at=ts
            )
            # Cleaned 45 mins later
            RoomStateTransition.objects.create(
                room=room,
                from_state='DIRTY',
                to_state='AVAILABLE',
                transitioned_by=reception,
                transitioned_at=ts + timedelta(minutes=random.randint(30, 90))
            )

        # 7. Expenses
        self.stdout.write('Generating expenses...')
        Expense.objects.create(
            category=exp_cats['Fuel'],
            description='Diesel for Generator',
            amount=Decimal('45000.00'),
            expense_date=today.date(),
            logged_by=manager,
            status='PENDING'
        )
        Expense.objects.create(
            category=exp_cats['Supplies'],
            description='Toiletries restock',
            amount=Decimal('120000.00'), # High value alert
            expense_date=today.date(),
            logged_by=manager,
            status='PENDING'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database! Refresh your dashboard.'))
