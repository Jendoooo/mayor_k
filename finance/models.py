"""
Finance models for Mayor K. Guest Palace Hotel Management System.
Contains: Transaction (immutable ledger), ExpenseCategory, Expense, MaintenanceLog.
"""
import uuid
from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from core.models import User


class Transaction(models.Model):
    """
    Immutable financial ledger.
    We NEVER delete transactions - only add correction entries.
    This is the "Truth Layer" for financial integrity.
    """
    class Type(models.TextChoices):
        PAYMENT = 'PAYMENT', 'Payment Received'
        REFUND = 'REFUND', 'Refund Issued'
        CORRECTION = 'CORRECTION', 'Correction Entry'
        VOID = 'VOID', 'Voided Transaction'
    
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash'
        TRANSFER = 'TRANSFER', 'Bank Transfer'
        POS = 'POS', 'POS'
        PAYSTACK = 'PAYSTACK', 'Paystack (Online)'
        SPLIT = 'SPLIT', 'Split Payment'
    
    class Status(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PENDING = 'PENDING', 'Pending Verification'
        AWAITING_TRANSFER = 'AWAITING_TRANSFER', 'Awaiting Transfer Confirmation'
        FAILED = 'FAILED', 'Failed'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_ref = models.CharField(max_length=20, unique=True)
    
    # Link to booking (optional - some transactions may be standalone)
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transactions'
    )
    
    transaction_type = models.CharField(
        max_length=15,
        choices=Type.choices,
        default=Type.PAYMENT
    )
    payment_method = models.CharField(
        max_length=15,
        choices=Method.choices,
        default=Method.CASH
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
        db_index=True
    )
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # For split payments
    split_details = models.JSONField(
        null=True,
        blank=True,
        help_text="E.g., {'cash': 10000, 'transfer': 5000}"
    )
    
    # For corrections/voids - link to original transaction
    original_transaction = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='corrections'
    )
    correction_reason = models.TextField(blank=True)
    
    # Who processed it
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions_processed'
    )
    
    # For pending/awaiting verification
    verification_notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions_verified'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # External references
    external_ref = models.CharField(
        max_length=100,
        blank=True,
        help_text="POS terminal ID, Paystack reference, etc."
    )
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # IMMUTABLE: No updated_at - transactions should never be modified
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', '-created_at']),
            models.Index(fields=['transaction_type', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.transaction_ref} - ₦{self.amount} ({self.get_transaction_type_display()})"
    
    def save(self, *args, **kwargs):
        if not self.transaction_ref:
            self.transaction_ref = self._generate_ref()
        
        # Enforce immutability (only new records allowed)
        if self.pk and Transaction.objects.filter(pk=self.pk).exists():
            raise ValidationError("Transactions cannot be modified. Create a correction entry instead.")
        
        super().save(*args, **kwargs)
        
        # Update booking amount_paid if this is a confirmed payment
        if self.booking and self.transaction_type == self.Type.PAYMENT and self.status == self.Status.CONFIRMED:
            self.booking.amount_paid += self.amount
            self.booking.save(update_fields=['amount_paid', 'updated_at'])
    
    def _generate_ref(self):
        """Generate unique transaction reference: TXN-YYMMDD-XXXXX"""
        import random
        import string
        from django.utils import timezone
        date_part = timezone.now().strftime('%y%m%d')
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        return f"TXN-{date_part}-{random_part}"
    
    @classmethod
    def create_correction(cls, original, reason, corrected_by, new_amount=None):
        """
        Create a correction entry for a transaction.
        The original transaction remains unchanged (immutable).
        """
        from core.models import SystemEvent
        
        correction = cls.objects.create(
            booking=original.booking,
            transaction_type=cls.Type.CORRECTION,
            payment_method=original.payment_method,
            status=cls.Status.CONFIRMED,
            amount=new_amount if new_amount is not None else -original.amount,
            original_transaction=original,
            correction_reason=reason,
            processed_by=corrected_by,
            notes=f"Correction for {original.transaction_ref}: {reason}"
        )
        
        SystemEvent.log(
            event_type='TRANSACTION_CORRECTED',
            category=SystemEvent.EventCategory.PAYMENT,
            actor=corrected_by,
            target=correction,
            payload={
                'original_ref': original.transaction_ref,
                'correction_ref': correction.transaction_ref,
                'reason': reason,
                'original_amount': str(original.amount),
                'correction_amount': str(correction.amount)
            }
        )
        
        return correction


class ExpenseCategory(models.Model):
    """
    Categories for expense tracking.
    Examples: Utilities, Supplies, Maintenance, Staff, Diesel, etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'expense_categories'
        verbose_name_plural = 'Expense Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Expense(models.Model):
    """
    Operational expense tracking with approval workflow.
    Receptionist logs → Manager approves
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense_ref = models.CharField(max_length=15, unique=True)
    
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Vendor/recipient info
    vendor_name = models.CharField(max_length=100, blank=True)
    
    # Receipt image (for audit)
    receipt_image = models.ImageField(
        upload_to='receipts/%Y/%m/',
        null=True,
        blank=True
    )
    
    # Workflow
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    logged_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses_logged'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses_approved'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expenses'
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['status', '-expense_date']),
            models.Index(fields=['category', '-expense_date']),
        ]
    
    def __str__(self):
        return f"{self.expense_ref} - ₦{self.amount} ({self.category.name})"
    
    def save(self, *args, **kwargs):
        if not self.expense_ref:
            self.expense_ref = self._generate_ref()
        super().save(*args, **kwargs)
    
    def _generate_ref(self):
        """Generate unique expense reference: EXP-YYMMDD-XXX"""
        import random
        import string
        from django.utils import timezone
        date_part = timezone.now().strftime('%y%m%d')
        random_part = ''.join(random.choices(string.digits, k=3))
        return f"EXP-{date_part}-{random_part}"
    
    def approve(self, approved_by):
        """Approve expense."""
        from django.utils import timezone
        from core.models import SystemEvent
        
        if not approved_by.can_approve_expenses:
            raise ValidationError("User does not have permission to approve expenses.")
        
        self.status = self.Status.APPROVED
        self.approved_by = approved_by
        self.approved_at = timezone.now()
        self.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        
        SystemEvent.log(
            event_type='EXPENSE_APPROVED',
            category=SystemEvent.EventCategory.EXPENSE,
            actor=approved_by,
            target=self,
            description=f"Expense of ₦{self.amount} for {self.category.name} approved by {approved_by.get_full_name() or approved_by.username}",
            payload={
                'expense_ref': self.expense_ref,
                'amount': str(self.amount),
                'category': self.category.name
            }
        )
        
        return self
    
    def reject(self, rejected_by, reason):
        """Reject expense with reason."""
        from core.models import SystemEvent
        
        self.status = self.Status.REJECTED
        self.rejection_reason = reason
        self.save(update_fields=['status', 'rejection_reason', 'updated_at'])
        
        SystemEvent.log(
            event_type='EXPENSE_REJECTED',
            category=SystemEvent.EventCategory.EXPENSE,
            actor=rejected_by,
            target=self,
            description=f"Expense rejected by {rejected_by.get_full_name() or rejected_by.username}: {reason}",
            payload={
                'expense_ref': self.expense_ref,
                'amount': str(self.amount),
                'reason': reason
            }
        )
        
        return self


class MaintenanceLog(models.Model):
    """
    Track solar inverter and equipment maintenance.
    Simplified from diesel tracking based on user's solar setup.
    """
    class MaintenanceType(models.TextChoices):
        SOLAR_INVERTER = 'SOLAR_INVERTER', 'Solar Inverter'
        GENERATOR = 'GENERATOR', 'Generator'
        AC_UNIT = 'AC_UNIT', 'Air Conditioning'
        PLUMBING = 'PLUMBING', 'Plumbing'
        ELECTRICAL = 'ELECTRICAL', 'Electrical'
        OTHER = 'OTHER', 'Other'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices
    )
    description = models.TextField()
    
    vendor = models.CharField(max_length=100, blank=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # Scheduling
    maintenance_date = models.DateField()
    next_scheduled = models.DateField(null=True, blank=True)
    
    logged_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='maintenance_logs'
    )
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'maintenance_logs'
        ordering = ['-maintenance_date']
    
    def __str__(self):
        return f"{self.get_maintenance_type_display()} - {self.maintenance_date}"
