"""
Django Admin configuration for finance app.
"""
from django.contrib import admin
from .models import Transaction, ExpenseCategory, Expense, MaintenanceLog


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_ref', 'booking', 'transaction_type', 'payment_method', 
        'amount', 'status', 'processed_by', 'created_at'
    )
    list_filter = ('transaction_type', 'payment_method', 'status', 'created_at')
    search_fields = ('transaction_ref', 'booking__booking_ref', 'external_ref')
    date_hierarchy = 'created_at'
    readonly_fields = (
        'id', 'transaction_ref', 'booking', 'transaction_type', 'payment_method',
        'status', 'amount', 'split_details', 'original_transaction', 'correction_reason',
        'processed_by', 'verified_by', 'verified_at', 'external_ref', 'notes', 'created_at'
    )
    raw_id_fields = ('booking',)
    
    def has_add_permission(self, request):
        return False  # Transactions are created via API
    
    def has_change_permission(self, request, obj=None):
        return False  # Immutable
    
    def has_delete_permission(self, request, obj=None):
        return False  # Immutable - use corrections instead


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        'expense_ref', 'category', 'description_short', 'amount', 
        'status', 'logged_by', 'approved_by', 'expense_date'
    )
    list_filter = ('status', 'category', 'expense_date')
    search_fields = ('expense_ref', 'description', 'vendor_name')
    date_hierarchy = 'expense_date'
    readonly_fields = ('expense_ref', 'created_at', 'updated_at')
    raw_id_fields = ('logged_by', 'approved_by')
    
    fieldsets = (
        ('Expense Info', {
            'fields': ('expense_ref', 'category', 'description', 'amount', 'vendor_name', 'expense_date')
        }),
        ('Receipt', {
            'fields': ('receipt_image',)
        }),
        ('Approval Workflow', {
            'fields': ('status', 'logged_by', 'approved_by', 'approved_at', 'rejection_reason')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_expenses', 'reject_expenses']
    
    @admin.action(description='Approve selected expenses')
    def approve_expenses(self, request, queryset):
        for expense in queryset.filter(status=Expense.Status.PENDING):
            expense.approve(request.user)
    
    @admin.action(description='Reject selected expenses (requires reason in notes)')
    def reject_expenses(self, request, queryset):
        for expense in queryset.filter(status=Expense.Status.PENDING):
            expense.reject(request.user, 'Rejected via admin bulk action')
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = 'Description'


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('maintenance_type', 'description_short', 'cost', 'maintenance_date', 'next_scheduled', 'vendor')
    list_filter = ('maintenance_type', 'maintenance_date')
    search_fields = ('description', 'vendor')
    date_hierarchy = 'maintenance_date'
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = 'Description'
