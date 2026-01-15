"""
Django Admin configuration for inventory app.
"""
from django.contrib import admin
from .models import Category, Product, Vendor, Order, OrderItem, StockLog


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'phone', 'email', 'created_at')
    search_fields = ('name', 'contact_person', 'phone', 'email')
    list_filter = ('created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'cost_price', 'quantity', 'is_low_stock', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'category__name')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('category', 'preferred_vendor')
    
    fieldsets = (
        ('Product Info', {
            'fields': ('name', 'category', 'preferred_vendor', 'is_active')
        }),
        ('Pricing', {
            'fields': ('price', 'cost_price')
        }),
        ('Inventory', {
            'fields': ('quantity', 'low_stock_threshold')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('reference', 'user', 'total_amount', 'payment_method', 'status', 'guest_name', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('reference', 'guest_name', 'user__username')
    readonly_fields = ('reference', 'created_at')
    raw_id_fields = ('user', 'booking')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Order Info', {
            'fields': ('reference', 'user', 'status', 'created_at')
        }),
        ('Customer', {
            'fields': ('booking', 'guest_name')
        }),
        ('Payment', {
            'fields': ('payment_method', 'total_amount')
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'unit_price', 'total_price')
    list_filter = ('order__created_at',)
    search_fields = ('order__reference', 'product__name')
    raw_id_fields = ('order', 'product')


@admin.register(StockLog)
class StockLogAdmin(admin.ModelAdmin):
    list_display = ('product', 'action', 'quantity_change', 'old_quantity', 'new_quantity', 'user', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('product__name', 'user__username', 'notes')
    readonly_fields = ('id', 'product', 'action', 'quantity_change', 'old_quantity', 'new_quantity', 'user', 'created_at', 'notes')
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Stock logs are created via API/serializers
    
    def has_change_permission(self, request, obj=None):
        return False  # Immutable
    
    def has_delete_permission(self, request, obj=None):
        return False  # Immutable
