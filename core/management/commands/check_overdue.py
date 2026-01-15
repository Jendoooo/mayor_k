from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from bookings.models import Booking, Room
from core.models import SystemEvent, User

class Command(BaseCommand):
    help = 'Checks for overdue bookings and auto-checks out if paid, or flags for attention.'

    def handle(self, *args, **options):
        now = timezone.now()
        # Find bookings that are CHECKED_IN but passed expected checkout time
        # Buffer of 30 minutes to allow for latency or grace period
        threshold = now - timedelta(minutes=30)
        
        overdue_bookings = Booking.objects.filter(
            status=Booking.Status.CHECKED_IN,
            expected_checkout__lt=threshold
        )

        processed_count = 0
        
        system_actor = User.objects.filter(role=User.Role.ADMIN).first() # Fallback, ideally use system account

        for booking in overdue_bookings:
            self.stdout.write(f"Processing Booking #{booking.booking_ref} (Room {booking.room.room_number})")
            
            # Logic:
            # 1. If FULLY PAID, auto check-out? 
            #    - For Short Rest: Yes, often desirable to just close it. 
            #    - For Overnight: Maybe guest extended? 
            #    Let's mark as AUTO_CHECKED_OUT or just CHECKED_OUT with special note.
            
            is_fully_paid = booking.amount_paid >= booking.total_amount
            
            if is_fully_paid:
                # Auto Checkout
                booking.check_out(
                    checked_out_by=system_actor,
                    notes="Auto-checkout by system (Time expired & fully paid)"
                )
                self.stdout.write(self.style.SUCCESS(f" -> Auto Checked Out"))
                
                SystemEvent.log(
                    event_type='BOOKING_AUTO_CHECKOUT',
                    category=SystemEvent.EventCategory.SYSTEM,
                    actor=None,
                    target=booking,
                    description=f"Auto-checkout for Booking {booking.booking_ref} (Time expired)"
                )
            else:
                # Not fully paid - Flag as Overdue (if we add OVERDUE status) or just Log
                # Since we don't have OVERDUE status yet, we will just log a high-priority system event
                # And maybe set a flag on the room?
                
                # Check if we already logged to avoid spamming
                recent_logs = SystemEvent.objects.filter(
                    event_type='BOOKING_OVERDUE_ALERT',
                    target_id=booking.id,
                    created_at__gte=now - timedelta(hours=1)
                ).exists()
                
                if not recent_logs:
                    SystemEvent.log(
                        event_type='BOOKING_OVERDUE_ALERT',
                        category=SystemEvent.EventCategory.SYSTEM,
                        actor=None,
                        target=booking,
                        description=f"Booking {booking.booking_ref} is OVERDUE and UNPAID. Balance: {booking.total_amount - booking.amount_paid}"
                    )
                    self.stdout.write(self.style.WARNING(f" -> Flagged as Overdue (Unpaid)"))
            
            processed_count += 1

        self.stdout.write(self.style.SUCCESS(f"Processed {processed_count} overdue bookings."))
