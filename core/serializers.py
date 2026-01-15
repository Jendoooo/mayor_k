"""
API Serializers for Mayor K. Guest Palace.
"""
from decimal import Decimal
from django.db.models import Sum
from rest_framework import serializers
from django.utils import timezone
from core.models import User, SystemEvent, WorkShift
from bookings.models import RoomType, Room, Guest, Booking, BookingExtension, RoomStateTransition
from finance.models import Transaction, ExpenseCategory, Expense


# ============ CORE SERIALIZERS ============

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'role_display', 'phone', 'is_active', 'last_login', 'password']
        read_only_fields = ['id', 'role_display', 'last_login', 'full_name']
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


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

    def get_price(self, obj):
        return obj.room_type.base_rate_overnight

class WorkShiftSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    discrepancy = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = WorkShift
        fields = [
            'id', 'user', 'user_name', 'status', 'start_time', 'end_time',
            'opening_balance', 'closing_balance', 'system_cash_total',
            'discrepancy', 'notes'
        ]
        read_only_fields = ['user', 'start_time', 'end_time', 'status', 'system_cash_total', 'discrepancy']

    def create(self, validated_data):
        # Ensure only one open shift per user
        user = self.context['request'].user
        if WorkShift.objects.filter(user=user, status=WorkShift.Status.OPEN).exists():
            raise serializers.ValidationError("You already have an open shift.")
        
        validated_data['user'] = user
        return super().create(validated_data)()


class RoomSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    state_display = serializers.CharField(source='get_current_state_display', read_only=True)
    current_booking_id = serializers.SerializerMethodField()
    booking_stay_info = serializers.SerializerMethodField()
    # Add rate fields from room_type for QuickBook modal
    overnight_rate = serializers.DecimalField(
        source='room_type.base_rate_overnight', 
        max_digits=10, decimal_places=2, read_only=True
    )
    short_rest_rate = serializers.DecimalField(
        source='room_type.base_rate_short_rest', 
        max_digits=10, decimal_places=2, read_only=True
    )
    price = serializers.DecimalField(
        source='room_type.base_rate_overnight', 
        max_digits=10, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'room_type_name', 'floor',
                  'current_state', 'state_display', 'notes', 'is_active', 'is_available',
                  'overnight_rate', 'short_rest_rate', 'price',
                  'current_booking_id', 'booking_stay_info']

    def get_current_booking_id(self, obj):
        if obj.current_state == 'OCCUPIED':
            booking = self._get_active_booking(obj)
            return booking.id if booking else None
        return None

    def get_booking_stay_info(self, obj):
        if obj.current_state == 'OCCUPIED':
            booking = self._get_active_booking(obj)
            if booking:
                return {
                    'check_in': booking.check_in_time, # Time only if today, else datetime?
                    # We need full datetime for accurate calculation. 
                    # Booking model has check_in_date and check_in_time separately.
                    'check_in_full': f"{booking.check_in_date}T{booking.check_in_time}",
                    'expected_checkout': booking.expected_checkout,
                    'stay_type': booking.stay_type,
                    'guest_name': booking.guest.name
                }
        return None

    def _get_active_booking(self, room):
        # Optimization: storing this in context or prefetching would be better, 
        # but for now a simple helper works.
        return Booking.objects.filter(
            room=room, 
            status=Booking.Status.CHECKED_IN
        ).order_by('-check_in_date', '-created_at').first()


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
    price = serializers.DecimalField(
        source='room_type.base_rate_overnight',
        max_digits=10, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type_name', 'floor', 
                  'current_state', 'overnight_rate', 'short_rest_rate', 'price']


class GuestSerializer(serializers.ModelSerializer):
    total_stays = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    last_visit = serializers.SerializerMethodField()
    
    class Meta:
        model = Guest
        fields = ['id', 'guest_code', 'name', 'phone', 'email', 'notes', 'is_blocked',
                  'total_stays', 'total_spent', 'last_visit', 'created_at']
        read_only_fields = ['id', 'guest_code', 'total_stays', 'total_spent', 'last_visit', 'created_at']
    
    def get_total_stays(self, obj):
        """Count all completed and active bookings for this guest."""
        return obj.bookings.filter(
            status__in=[Booking.Status.CHECKED_IN, Booking.Status.CHECKED_OUT]
        ).count()
    
    def get_total_spent(self, obj):
        """Sum of all payments from this guest (both current and past stays)."""
        total = obj.bookings.filter(
            status__in=[Booking.Status.CHECKED_IN, Booking.Status.CHECKED_OUT]
        ).aggregate(total=Sum('amount_paid'))['total']
        return total or Decimal('0.00')
    
    def get_last_visit(self, obj):
        """Most recent check-in or checkout date."""
        # First try checked-out bookings
        last_booking = obj.bookings.filter(
            status=Booking.Status.CHECKED_OUT
        ).order_by('-actual_checkout').first()
        if last_booking and last_booking.actual_checkout:
            return last_booking.actual_checkout
        # Fall back to most recent check-in
        last_booking = obj.bookings.order_by('-check_in_date').first()
        return last_booking.check_in_date if last_booking else None


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
    
    # Financials
    total_room_charges = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_bar_charges = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    grand_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    is_fully_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_ref', 'guest', 'guest_name', 'guest_phone',
            'room', 'room_number', 'room_type', 'stay_type', 'stay_type_display',
            'status', 'status_display', 'source', 'check_in_date', 'check_in_time',
            'expected_checkout', 'actual_checkout', 'num_nights', 'num_guests',
            'room_rate', 'total_amount', 'amount_paid', 
            'total_room_charges', 'total_bar_charges', 'grand_total', 'balance_due',
            'is_fully_paid', 'is_overdue',
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
