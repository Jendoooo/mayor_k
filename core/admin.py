"""
Django Admin configuration for core app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, SystemEvent


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'get_full_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Hotel Role', {'fields': ('role', 'phone')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Hotel Role', {'fields': ('role', 'phone')}),
    )


@admin.register(SystemEvent)
class SystemEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'event_category', 'actor', 'target_table', 'created_at')
    list_filter = ('event_category', 'event_type', 'created_at')
    search_fields = ('event_type', 'actor__username', 'target_table')
    readonly_fields = (
        'id', 'event_type', 'event_category', 'actor', 'actor_role',
        'target_table', 'target_id', 'payload', 'ip_address', 'user_agent', 'created_at'
    )
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Events are created via SystemEvent.log()
    
    def has_change_permission(self, request, obj=None):
        return False  # Events are immutable
    
    def has_delete_permission(self, request, obj=None):
        return False  # Events are immutable
