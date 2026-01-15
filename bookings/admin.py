"""
Django Admin configuration for bookings app.
"""
from django.contrib import admin
from .models import RoomType, Room, Guest, Booking, BookingExtension, RoomStateTransition


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_rate_short_rest', 'base_rate_overnight', 'capacity', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'room_type', 'floor', 'current_state', 'is_active')
    list_filter = ('current_state', 'room_type', 'floor', 'is_active')
    search_fields = ('room_number',)
    list_editable = ('current_state',)
    
    actions = ['mark_available', 'mark_dirty', 'mark_maintenance']
    
    @admin.action(description='Mark selected rooms as Available')
    def mark_available(self, request, queryset):
        for room in queryset:
            room.change_state(Room.State.AVAILABLE, changed_by=request.user, notes='Bulk action via admin')
    
    @admin.action(description='Mark selected rooms as Dirty')
    def mark_dirty(self, request, queryset):
        for room in queryset:
            room.change_state(Room.State.DIRTY, changed_by=request.user, notes='Bulk action via admin')
    
    @admin.action(description='Mark selected rooms as Under Maintenance')
    def mark_maintenance(self, request, queryset):
        for room in queryset:
            room.change_state(Room.State.MAINTENANCE, changed_by=request.user, notes='Bulk action via admin')


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'total_stays', 'total_spent', 'is_blocked')
    list_filter = ('is_blocked', 'created_at')
    search_fields = ('name', 'phone', 'email')
    readonly_fields = ('total_stays', 'total_spent', 'created_at', 'updated_at')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_ref', 'guest', 'room', 'stay_type', 'status', 
        'check_in_date', 'total_amount', 'balance_due', 'source'
    )
    list_filter = ('status', 'stay_type', 'source', 'check_in_date')
    search_fields = ('booking_ref', 'guest__name', 'guest__phone', 'room__room_number')
    date_hierarchy = 'check_in_date'
    readonly_fields = ('booking_ref', 'created_at', 'updated_at', 'balance_due')
    raw_id_fields = ('guest', 'room')
    
    fieldsets = (
        ('Booking Info', {
            'fields': ('booking_ref', 'guest', 'room', 'status', 'source')
        }),
        ('Stay Details', {
            'fields': ('stay_type', 'check_in_date', 'check_in_time', 'expected_checkout', 
                      'actual_checkout', 'num_nights', 'num_guests')
        }),
        ('Financial', {
            'fields': ('room_rate', 'total_amount', 'amount_paid', 'balance_due',
                      'discount_amount', 'discount_reason', 'is_complimentary', 'complimentary_reason')
        }),
        ('Metadata', {
            'fields': ('notes', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['check_in_selected', 'check_out_selected']
    
    @admin.action(description='Check in selected bookings')
    def check_in_selected(self, request, queryset):
        for booking in queryset.filter(status=Booking.Status.CONFIRMED):
            booking.check_in(request.user)
    
    @admin.action(description='Check out selected bookings')
    def check_out_selected(self, request, queryset):
        for booking in queryset.filter(status=Booking.Status.CHECKED_IN):
            booking.check_out(request.user)


@admin.register(BookingExtension)
class BookingExtensionAdmin(admin.ModelAdmin):
    list_display = ('booking', 'original_checkout', 'new_checkout', 'additional_amount', 'approved_by')
    list_filter = ('created_at',)
    search_fields = ('booking__booking_ref',)
    raw_id_fields = ('booking',)


@admin.register(RoomStateTransition)
class RoomStateTransitionAdmin(admin.ModelAdmin):
    list_display = ('room', 'from_state', 'to_state', 'transitioned_by', 'transitioned_at')
    list_filter = ('from_state', 'to_state', 'transitioned_at')
    search_fields = ('room__room_number',)
    readonly_fields = ('id', 'room', 'from_state', 'to_state', 'transitioned_by', 'transitioned_at', 'notes')
    date_hierarchy = 'transitioned_at'
    
    def has_add_permission(self, request):
        return False  # Transitions are created via Room.change_state()
    
    def has_change_permission(self, request, obj=None):
        return False  # Immutable
    
    def has_delete_permission(self, request, obj=None):
        return False  # Immutable
