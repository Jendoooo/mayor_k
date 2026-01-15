"""
API Serializers for Mayor K. Guest Palace.
"""
from rest_framework import serializers
from django.utils import timezone
from core.models import User, SystemEvent
from bookings.models import RoomType, Room, Guest, Booking, BookingExtension, RoomStateTransition
from finance.models import Transaction, ExpenseCategory, Expense


# ============ CORE SERIALIZERS ============

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'role_display', 'phone', 'is_active']
        read_only_fields = ['id', 'role_display']


class SystemEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    
    class Meta:
        model = SystemEvent
        fields = ['id', 'event_type', 'event_category', 'actor', 'actor_name',
                  'actor_role', 'target_table', 'target_id', 'payload', 'created_at']


# ============ BOOKING SERIALIZERS ============

class RoomTypeSerializer(serializers.ModelSerializer):
    room_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RoomType
        fields = ['id', 'name', 'description', 'base_rate_short_rest',
                  'base_rate_overnight', 'base_rate_lodge', 'capacity',
                  'amenities', 'is_active', 'room_count']
    
    def get_room_count(self, obj):
        return obj.rooms.count()


class RoomSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    state_display = serializers.CharField(source='get_current_state_display', read_only=True)
    current_booking_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'room_type_name', 'floor',
                  'current_state', 'state_display', 'notes', 'is_active', 'is_available',
                  'current_booking_id']

    def get_current_booking_id(self, obj):
        if obj.current_state == 'OCCUPIED':
            booking = Booking.objects.filter(
                room=obj, 
                status=Booking.Status.CHECKED_IN
            ).order_by('-check_in_date', '-created_at').first()
            return booking.id if booking else None
        return None


class RoomAvailabilitySerializer(serializers.ModelSerializer):
    """Lightweight serializer for room availability display."""
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    overnight_rate = serializers.DecimalField(
        source='room_type.base_rate_overnight', 
        max_digits=10, decimal_places=2, read_only=True
    )
    short_rest_rate = serializers.DecimalField(
        source='room_type.base_rate_short_rest',
        max_digits=10, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type_name', 'floor', 
                  'current_state', 'overnight_rate', 'short_rest_rate']


class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ['id', 'name', 'phone', 'email', 'notes', 'is_blocked',
                  'total_stays', 'total_spent', 'created_at']
        read_only_fields = ['id', 'total_stays', 'total_spent', 'created_at']


class GuestCreateSerializer(serializers.ModelSerializer):
    """For creating/updating guests."""
    class Meta:
        model = Guest
        fields = ['name', 'phone', 'email', 'notes']


class BookingSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source='guest.name', read_only=True)
    guest_phone = serializers.CharField(source='guest.phone', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    stay_type_display = serializers.CharField(source='get_stay_type_display', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_fully_paid = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_ref', 'guest', 'guest_name', 'guest_phone',
            'room', 'room_number', 'room_type', 'stay_type', 'stay_type_display',
            'status', 'status_display', 'source', 'check_in_date', 'check_in_time',
            'expected_checkout', 'actual_checkout', 'num_nights', 'num_guests',
            'room_rate', 'total_amount', 'amount_paid', 'balance_due', 'is_fully_paid',
            'discount_amount', 'discount_reason', 'is_complimentary', 
            'complimentary_reason', 'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_ref', 'created_at', 'updated_at']


class QuickBookSerializer(serializers.Serializer):
    """
    Quick booking serializer for walk-in guests.
    Handles guest creation and booking in one request.
    """
    # Guest info
    guest_name = serializers.CharField(max_length=100)
    guest_phone = serializers.CharField(max_length=20)
    
    # Booking info
    room_id = serializers.UUIDField()
    stay_type = serializers.ChoiceField(choices=Booking.StayType.choices)
    num_nights = serializers.IntegerField(min_value=1, default=1)
    num_guests = serializers.IntegerField(min_value=1, default=1)
    
    # Payment info
    payment_method = serializers.ChoiceField(choices=Transaction.Method.choices)
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Optional
    notes = serializers.CharField(required=False, allow_blank=True)
    discount_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, default=0
    )
    discount_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_room_id(self, value):
        try:
            room = Room.objects.get(id=value)
            if not room.is_available:
                raise serializers.ValidationError(
                    f"Room {room.room_number} is not available ({room.get_current_state_display()})."
                )
        except Room.DoesNotExist:
            raise serializers.ValidationError("Room not found.")
        return value
    
    def create(self, validated_data):
        from decimal import Decimal
        from django.utils import timezone
        from datetime import timedelta
        
        user = self.context['request'].user
        room = Room.objects.get(id=validated_data['room_id'])
        
        # Get or create guest
        guest, _ = Guest.objects.get_or_create(
            phone=validated_data['guest_phone'],
            defaults={'name': validated_data['guest_name']}
        )
        
        # Calculate rate based on stay type
        stay_type = validated_data['stay_type']
        if stay_type == Booking.StayType.SHORT_REST:
            room_rate = room.room_type.base_rate_short_rest
            expected_checkout = timezone.now() + timedelta(hours=4)
        elif stay_type == Booking.StayType.OVERNIGHT:
            room_rate = room.room_type.base_rate_overnight
            expected_checkout = timezone.now().replace(hour=12, minute=0) + timedelta(days=1)
        else:  # LODGE
            room_rate = room.room_type.base_rate_lodge or room.room_type.base_rate_overnight
            expected_checkout = timezone.now().replace(hour=12, minute=0) + timedelta(days=validated_data['num_nights'])
        
        total_amount = room_rate * validated_data['num_nights']
        discount = validated_data.get('discount_amount', Decimal('0'))
        
        # Create booking
        booking = Booking.objects.create(
            guest=guest,
            room=room,
            stay_type=stay_type,
            status=Booking.Status.CHECKED_IN,  # Walk-in = immediate check-in
            source=Booking.Source.WALK_IN,
            check_in_date=timezone.now().date(),
            check_in_time=timezone.now().time(),
            expected_checkout=expected_checkout,
            num_nights=validated_data['num_nights'],
            num_guests=validated_data['num_guests'],
            room_rate=room_rate,
            total_amount=total_amount,
            amount_paid=validated_data['amount_paid'],
            discount_amount=discount,
            discount_reason=validated_data.get('discount_reason', ''),
            notes=validated_data.get('notes', ''),
            created_by=user
        )
        
        # Mark room as occupied
        room.change_state(Room.State.OCCUPIED, changed_by=user, notes=f'Booking {booking.booking_ref}')
        
        # Create transaction
        Transaction.objects.create(
            booking=booking,
            transaction_type=Transaction.Type.PAYMENT,
            payment_method=validated_data['payment_method'],
            status=Transaction.Status.CONFIRMED,
            amount=validated_data['amount_paid'],
            processed_by=user,
            notes=f'Walk-in booking {booking.booking_ref}'
        )
        
        # Log event
        SystemEvent.log(
            event_type='BOOKING_QUICK_CREATED',
            category=SystemEvent.EventCategory.BOOKING,
            actor=user,
            target=booking,
            payload={
                'booking_ref': booking.booking_ref,
                'guest': guest.name,
                'room': room.room_number,
                'total': str(total_amount),
                'paid': str(validated_data['amount_paid'])
            }
        )
        
        return booking


# ============ FINANCE SERIALIZERS ============

class TransactionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    booking_ref = serializers.CharField(source='booking.booking_ref', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_ref', 'booking', 'booking_ref',
            'transaction_type', 'type_display', 'payment_method', 'method_display',
            'status', 'status_display', 'amount', 'split_details',
            'original_transaction', 'correction_reason', 'processed_by',
            'processed_by_name', 'verification_notes', 'verified_by',
            'verified_at', 'external_ref', 'notes', 'created_at'
        ]


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'is_active']


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'expense_ref', 'category', 'category_name', 'description',
            'amount', 'vendor_name', 'receipt_image', 'status', 'status_display',
            'logged_by', 'logged_by_name', 'approved_by', 'approved_by_name',
            'approved_at', 'rejection_reason', 'expense_date', 'created_at'
        ]
        read_only_fields = ['id', 'expense_ref', 'logged_by', 'approved_by', 
                           'approved_at', 'rejection_reason']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """For creating new expenses."""
    class Meta:
        model = Expense
        fields = ['category', 'description', 'amount', 'vendor_name', 
                  'receipt_image', 'expense_date']


# ============ DASHBOARD SERIALIZERS ============

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    total_rooms = serializers.IntegerField()
    available_rooms = serializers.IntegerField()
    occupied_rooms = serializers.IntegerField()
    dirty_rooms = serializers.IntegerField()
    
    today_bookings = serializers.IntegerField()
    today_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_checkouts = serializers.IntegerField()
    
    pending_expenses = serializers.IntegerField()
    
    occupancy_rate = serializers.FloatField()


class StakeholderDashboardSerializer(serializers.Serializer):
    """Simplified dashboard for stakeholders (siblings)."""
    # Revenue
    total_revenue_today = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_revenue_week = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_revenue_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Expenses
    total_expenses_today = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses_week = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Net
    net_revenue_today = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_revenue_week = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_revenue_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Occupancy
    occupancy_rate_today = serializers.FloatField()
    avg_occupancy_week = serializers.FloatField()
    
    # Anomalies / Alerts
    anomalies = serializers.ListField(child=serializers.DictField())
