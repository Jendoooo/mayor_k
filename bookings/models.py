"""
Booking models for Mayor K. Guest Palace Hotel Management System.
Contains: RoomType, Room, Guest, Booking, BookingExtension, RoomStateTransition.
"""
import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from core.models import User


class RoomType(models.Model):
    """
    Room categories with their base rates.
    Examples: Standard, Deluxe, VIP Suite
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Base rates in Naira (₦)
    base_rate_short_rest = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Rate for 2-4 hour short rest"
    )
    base_rate_overnight = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Rate for overnight stay (checkout by 12 PM)"
    )
    base_rate_lodge = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Weekly/extended stay rate (optional)"
    )
    
    capacity = models.PositiveSmallIntegerField(default=2)
    amenities = models.JSONField(default=list, blank=True)  # ['AC', 'TV', 'WiFi']
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'room_types'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} (₦{self.base_rate_overnight}/night)"


class Room(models.Model):
    """
    Physical rooms in the hotel.
    """
    class State(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        OCCUPIED = 'OCCUPIED', 'Occupied'
        DIRTY = 'DIRTY', 'Dirty'
        CLEANING = 'CLEANING', 'Being Cleaned'
        MAINTENANCE = 'MAINTENANCE', 'Under Maintenance'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.ForeignKey(
        RoomType,
        on_delete=models.PROTECT,
        related_name='rooms'
    )
    
    floor = models.PositiveSmallIntegerField(default=1)
    current_state = models.CharField(
        max_length=15,
        choices=State.choices,
        default=State.AVAILABLE,
        db_index=True
    )
    
    notes = models.TextField(blank=True, help_text="Internal notes about the room")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rooms'
        ordering = ['room_number']
    
    def __str__(self):
        return f"Room {self.room_number} ({self.room_type.name}) - {self.get_current_state_display()}"
    
    @property
    def is_available(self):
        return self.current_state == self.State.AVAILABLE and self.is_active
    
    def change_state(self, new_state, changed_by, notes=''):
        """
        Change room state and log the transition for analytics.
        """
        from core.models import SystemEvent
        
        old_state = self.current_state
        self.current_state = new_state
        self.save(update_fields=['current_state', 'updated_at'])
        
        # Log state transition for analytics (dirty duration tracking, etc.)
        RoomStateTransition.objects.create(
            room=self,
            from_state=old_state,
            to_state=new_state,
            transitioned_by=changed_by,
            notes=notes
        )
        
        # Log system event
        SystemEvent.log(
            event_type=f'ROOM_{new_state}',
            category=SystemEvent.EventCategory.ROOM,
            actor=changed_by,
            target=self,
            payload={
                'room_number': self.room_number,
                'from_state': old_state,
                'to_state': new_state,
                'notes': notes
            }
        )
        
        return self


class RoomStateTransition(models.Model):
    """
    Event-sourced log of all room state changes.
    This enables analytics like: "Average time a room stays dirty"
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='state_transitions')
    
    from_state = models.CharField(max_length=15)
    to_state = models.CharField(max_length=15)
    
    transitioned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='room_transitions'
    )
    transitioned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'room_state_transitions'
        ordering = ['-transitioned_at']
        indexes = [
            models.Index(fields=['room', '-transitioned_at']),
            models.Index(fields=['to_state', 'transitioned_at']),
        ]
    
    def __str__(self):
        return f"{self.room.room_number}: {self.from_state} → {self.to_state}"


class Guest(models.Model):
    """
    Guest directory.
    Stores basic info for repeat guest recognition.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True)
    
    notes = models.TextField(blank=True, help_text="VIP status, preferences, etc.")
    is_blocked = models.BooleanField(default=False, help_text="Block problematic guests")
    
    total_stays = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'guests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.phone})"


class Booking(models.Model):
    """
    Core booking model - the heart of the system.
    """
    class StayType(models.TextChoices):
        SHORT_REST = 'SHORT_REST', 'Short Rest (2-4 hrs)'
        OVERNIGHT = 'OVERNIGHT', 'Overnight'
        LODGE = 'LODGE', 'Lodge (Multi-night)'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CHECKED_IN = 'CHECKED_IN', 'Checked In'
        CHECKED_OUT = 'CHECKED_OUT', 'Checked Out'
        CANCELLED = 'CANCELLED', 'Cancelled'
        NO_SHOW = 'NO_SHOW', 'No Show'
    
    class Source(models.TextChoices):
        WALK_IN = 'WALK_IN', 'Walk-in'
        ONLINE = 'ONLINE', 'Online Booking'
        PHONE = 'PHONE', 'Phone Reservation'
        CORPORATE = 'CORPORATE', 'Corporate Account'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_ref = models.CharField(max_length=12, unique=True, db_index=True)
    
    guest = models.ForeignKey(Guest, on_delete=models.PROTECT, related_name='bookings')
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name='bookings')
    
    stay_type = models.CharField(
        max_length=15,
        choices=StayType.choices,
        default=StayType.OVERNIGHT
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    source = models.CharField(
        max_length=15,
        choices=Source.choices,
        default=Source.WALK_IN
    )
    
    # Timing
    check_in_date = models.DateField()
    check_in_time = models.TimeField(null=True, blank=True)
    expected_checkout = models.DateTimeField()
    actual_checkout = models.DateTimeField(null=True, blank=True)
    
    # For multi-night stays
    num_nights = models.PositiveSmallIntegerField(default=1)
    num_guests = models.PositiveSmallIntegerField(default=1)
    
    # Financial
    room_rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Discounts/Complimentary
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_reason = models.CharField(max_length=200, blank=True)
    is_complimentary = models.BooleanField(default=False)
    complimentary_reason = models.CharField(max_length=200, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='bookings_created'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['check_in_date', 'status']),
            models.Index(fields=['room', 'status']),
        ]
    
    def __str__(self):
        return f"{self.booking_ref} - {self.guest.name} in Room {self.room.room_number}"
    
    @property
    def balance_due(self):
        return self.total_amount - self.amount_paid - self.discount_amount
    
    @property
    def is_fully_paid(self):
        return self.balance_due <= Decimal('0.00')
    
    def save(self, *args, **kwargs):
        if not self.booking_ref:
            self.booking_ref = self._generate_booking_ref()
        super().save(*args, **kwargs)
    
    def _generate_booking_ref(self):
        """Generate unique booking reference: MK-YYMMDD-XXXX"""
        import random
        import string
        date_part = timezone.now().strftime('%y%m%d')
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"MK-{date_part}-{random_part}"
    
    def check_in(self, user):
        """Process check-in: mark room occupied, log event."""
        from core.models import SystemEvent
        
        self.status = self.Status.CHECKED_IN
        self.check_in_time = timezone.now().time()
        self.save(update_fields=['status', 'check_in_time', 'updated_at'])
        
        # Mark room as occupied
        self.room.change_state(Room.State.OCCUPIED, changed_by=user)
        
        SystemEvent.log(
            event_type='BOOKING_CHECKED_IN',
            category=SystemEvent.EventCategory.BOOKING,
            actor=user,
            target=self,
            payload={
                'booking_ref': self.booking_ref,
                'room': self.room.room_number,
                'guest': self.guest.name
            }
        )
        
        return self
    
    def check_out(self, user):
        """Process checkout: mark room dirty, log event."""
        from core.models import SystemEvent
        
        self.status = self.Status.CHECKED_OUT
        self.actual_checkout = timezone.now()
        self.save(update_fields=['status', 'actual_checkout', 'updated_at'])
        
        # Mark room as dirty (Dirty Room Protocol)
        self.room.change_state(Room.State.DIRTY, changed_by=user)
        
        # Update guest stats
        self.guest.total_stays += 1
        self.guest.total_spent += self.amount_paid
        self.guest.save(update_fields=['total_stays', 'total_spent', 'updated_at'])
        
        SystemEvent.log(
            event_type='BOOKING_CHECKED_OUT',
            category=SystemEvent.EventCategory.BOOKING,
            actor=user,
            target=self,
            payload={
                'booking_ref': self.booking_ref,
                'room': self.room.room_number,
                'guest': self.guest.name,
                'total_paid': str(self.amount_paid)
            }
        )
        
        return self


class BookingExtension(models.Model):
    """
    Track when guests extend their stay.
    Each extension is a separate record for audit purposes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='extensions')
    
    original_checkout = models.DateTimeField()
    new_checkout = models.DateTimeField()
    
    additional_nights = models.PositiveSmallIntegerField(default=0)
    additional_hours = models.PositiveSmallIntegerField(default=0)
    additional_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='extensions_approved'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'booking_extensions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Extension for {self.booking.booking_ref}"
