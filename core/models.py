"""
Core models for Mayor K. Guest Palace Hotel Management System.
Contains: Custom User model with roles, SystemEvents for audit logging.
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with role-based access control.
    """
    class Role(models.TextChoices):
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        MANAGER = 'MANAGER', 'Manager'
        STAKEHOLDER = 'STAKEHOLDER', 'Stakeholder'
        ADMIN = 'ADMIN', 'Admin'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.RECEPTIONIST
    )
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
    
    @property
    def is_manager_or_admin(self):
        return self.role in [self.Role.MANAGER, self.Role.ADMIN]
    
    @property
    def is_stakeholder(self):
        return self.role == self.Role.STAKEHOLDER
    
    @property
    def can_approve_expenses(self):
        return self.role in [self.Role.MANAGER, self.Role.ADMIN]


class SystemEvent(models.Model):
    """
    Immutable audit log capturing all user actions and system events.
    This is the foundation for the data engineering analytics layer.
    """
    class EventCategory(models.TextChoices):
        BOOKING = 'BOOKING', 'Booking'
        PAYMENT = 'PAYMENT', 'Payment'
        ROOM = 'ROOM', 'Room'
        EXPENSE = 'EXPENSE', 'Expense'
        AUTH = 'AUTH', 'Authentication'
        ADMIN = 'ADMIN', 'Administration'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # What happened
    event_type = models.CharField(max_length=50, db_index=True)
    event_category = models.CharField(
        max_length=20, 
        choices=EventCategory.choices,
        db_index=True
    )
    
    # Who did it
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='events'
    )
    actor_role = models.CharField(max_length=20, blank=True)  # Denormalized for query speed
    
    # What was affected
    target_table = models.CharField(max_length=50, blank=True, db_index=True)
    target_id = models.UUIDField(null=True, blank=True)
    
    # Full context (before/after states, extra data)
    payload = models.JSONField(default=dict, blank=True)
    
    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamp (never changes)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'system_events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['actor', '-created_at']),
            models.Index(fields=['target_table', 'target_id']),
            models.Index(fields=['event_category', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.event_type} by {self.actor} at {self.created_at}"
    
    @classmethod
    def log(cls, event_type, category, actor=None, target=None, payload=None, request=None):
        """
        Helper method to create audit log entries.
        
        Usage:
            SystemEvent.log(
                event_type='BOOKING_CREATED',
                category=SystemEvent.EventCategory.BOOKING,
                actor=request.user,
                target=booking,
                payload={'room_number': '101', 'guest_name': 'John Doe'},
                request=request
            )
        """
        event = cls(
            event_type=event_type,
            event_category=category,
            actor=actor,
            actor_role=actor.role if actor else '',
            payload=payload or {},
        )
        
        if target:
            event.target_table = target._meta.db_table
            event.target_id = target.pk
        
        if request:
            event.ip_address = cls._get_client_ip(request)
            event.user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        
        event.save()
        return event
    
    @staticmethod
    def _get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
