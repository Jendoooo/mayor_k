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
    
    Role Hierarchy:
    - RECEPTIONIST: Front desk operations, bookings, Bar POS
    - HOUSEKEEPING: Room status management (clean/dirty)
    - BAR_STAFF: Bar POS only
    - ACCOUNTANT: Financial reports, no approvals
    - MANAGER: All operations + expense approval (≤₦100k)
    - STAKEHOLDER: Read-only financial dashboard
    - ADMIN: Full access including audit logs
    """
    class Role(models.TextChoices):
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        HOUSEKEEPING = 'HOUSEKEEPING', 'Housekeeping'
        BAR_STAFF = 'BAR_STAFF', 'Bar Staff'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'
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
    def full_name(self):
        """Return user's full name or username if not set."""
        return self.get_full_name() or self.username
    
    @property
    def is_manager_or_admin(self):
        return self.role in [self.Role.MANAGER, self.Role.ADMIN]
    
    @property
    def is_stakeholder(self):
        return self.role == self.Role.STAKEHOLDER
    
    @property
    def can_approve_expenses(self):
        """Only Manager and Admin can approve expenses."""
        return self.role in [self.Role.MANAGER, self.Role.ADMIN]
    
    @property
    def can_submit_expenses(self):
        """Staff who can submit expense requests (all except Stakeholder and Accountant)."""
        return self.role in [
            self.Role.RECEPTIONIST, 
            self.Role.HOUSEKEEPING, 
            self.Role.BAR_STAFF,
            self.Role.MANAGER, 
            self.Role.ADMIN
        ]
    
    @property
    def can_view_finance(self):
        """Staff who can view financial reports."""
        return self.role in [
            self.Role.ACCOUNTANT,
            self.Role.MANAGER, 
            self.Role.STAKEHOLDER,
            self.Role.ADMIN
        ]
    
    @property
    def can_manage_rooms(self):
        """Staff who can manage room status."""
        return self.role in [
            self.Role.RECEPTIONIST,
            self.Role.HOUSEKEEPING,
            self.Role.MANAGER, 
            self.Role.ADMIN
        ]
    
    @property
    def can_use_bar_pos(self):
        """Staff who can use the Bar POS system."""
        return self.role in [
            self.Role.RECEPTIONIST,
            self.Role.BAR_STAFF,
            self.Role.MANAGER, 
            self.Role.ADMIN
        ]
    
    @property
    def can_make_bookings(self):
        """Staff who can create/manage bookings."""
        return self.role in [
            self.Role.RECEPTIONIST,
            self.Role.MANAGER, 
            self.Role.ADMIN
        ]


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
        AUTH = 'AUTH', 'Auth'
        ADMIN = 'ADMIN', 'Admin'
        SECURITY = 'SECURITY', 'Security'
        SYSTEM = 'SYSTEM', 'System'
        INVENTORY = 'INVENTORY', 'Inventory'
    
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
    
    description = models.TextField(blank=True)
    
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
        return f"{self.event_type} - {self.actor} - {self.created_at}"


class WorkShift(models.Model):
    """
    Represents a staff work shift. 
    Crucial for tracking cash-in-hand and accountability.
    """
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shifts')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Cash Reconciliation
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Cash in drawer at start")
    closing_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Cash declared at end")
    system_cash_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Cash recorded by system during shift")
    
    notes = models.TextField(blank=True, help_text="Handover notes or variance explanation")
    
    class Meta:
        ordering = ['-start_time']
        
    def __str__(self):
        return f"{self.user.username} - {self.start_time.date()} ({self.status})"
        
    @property
    def discrepancy(self):
        if self.closing_balance is None:
            return None
        # Discrepancy = Declared - (Opening + System)
        expected = self.opening_balance + self.system_cash_total
        return self.closing_balance - expected

    def close(self, closing_balance, notes=""):
        from django.utils import timezone
        self.closing_balance = closing_balance
        self.end_time = timezone.now()
        self.status = self.Status.CLOSED
        self.notes = notes
        self.save()
    
    @classmethod
    def log(cls, event_type, category, actor=None, target=None, payload=None, request=None, description=''):
        """
        Helper method to create audit log entries.
        """
        event = cls(
            event_type=event_type,
            event_category=category,
            actor=actor,
            actor_role=actor.role if actor else '',
            payload=payload or {},
            description=description,
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
