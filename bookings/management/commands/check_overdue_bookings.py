"""
Django Management Command: check_overdue_bookings

Identifies bookings that are past their expected checkout time and:
1. Logs them to the console.
2. Optionally triggers auto-checkout (with --auto-checkout flag).

Usage:
  # Dry run - just list overdue bookings
  python manage.py check_overdue_bookings

  # Auto-checkout overdue bookings
  python manage.py check_overdue_bookings --auto-checkout

  # Run via cron every 15 minutes:
  */15 * * * * cd /path/to/project && python manage.py check_overdue_bookings --auto-checkout >> /var/log/overdue.log 2>&1
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from bookings.models import Booking, Room
from core.models import SystemEvent


class Command(BaseCommand):
    help = 'Check for overdue bookings and optionally auto-checkout'

    def add_arguments(self, parser):
        parser.add_argument(
            '--auto-checkout',
            action='store_true',
            help='Automatically check out overdue bookings',
        )
        parser.add_argument(
            '--grace-minutes',
            type=int,
            default=30,
            help='Grace period in minutes before flagging as overdue (default: 30)',
        )

    def handle(self, *args, **options):
        auto_checkout = options['auto_checkout']
        grace_minutes = options['grace_minutes']
        
        now = timezone.now()
        grace_threshold = now - timezone.timedelta(minutes=grace_minutes)
        
        # Find all checked-in bookings past their expected checkout
        overdue_bookings = Booking.objects.filter(
            status=Booking.Status.CHECKED_IN,
            expected_checkout__lt=grace_threshold
        ).select_related('room', 'guest')
        
        count = overdue_bookings.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No overdue bookings found.'))
            return
        
        self.stdout.write(self.style.WARNING(f'Found {count} overdue booking(s):'))
        
        for booking in overdue_bookings:
            overdue_by = now - booking.expected_checkout
            minutes_overdue = int(overdue_by.total_seconds() / 60)
            
            self.stdout.write(
                f'  - Room {booking.room.room_number}: {booking.guest.name} '
                f'(Ref: {booking.booking_ref}) - Overdue by {minutes_overdue} minutes'
            )
            
            if auto_checkout:
                self._auto_checkout(booking, now)
        
        if auto_checkout:
            self.stdout.write(self.style.SUCCESS(f'Auto-checked out {count} booking(s).'))
        else:
            self.stdout.write(
                self.style.NOTICE(
                    'Run with --auto-checkout flag to automatically check out these bookings.'
                )
            )

    def _auto_checkout(self, booking, checkout_time):
        """Perform automatic checkout for a booking."""
        try:
            # Update booking status
            booking.status = Booking.Status.CHECKED_OUT
            booking.actual_checkout = checkout_time
            booking.save(update_fields=['status', 'actual_checkout', 'updated_at'])
            
            # Mark room as dirty
            booking.room.change_state(
                new_state=Room.State.DIRTY,
                changed_by=None,  # System action, no user
                notes='Auto-checkout: Guest exceeded expected checkout time'
            )
            
            # Log system event
            SystemEvent.log(
                event_type='AUTO_CHECKOUT',
                category=SystemEvent.EventCategory.BOOKING,
                actor=None,
                target=booking,
                payload={
                    'booking_ref': booking.booking_ref,
                    'room_number': booking.room.room_number,
                    'guest_name': booking.guest.name,
                    'expected_checkout': str(booking.expected_checkout),
                    'actual_checkout': str(checkout_time),
                    'reason': 'System auto-checkout for overdue booking'
                }
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'    ✓ Room {booking.room.room_number} checked out automatically.')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'    ✗ Failed to checkout Room {booking.room.room_number}: {str(e)}')
            )
