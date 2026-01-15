from rest_framework import serializers
from .models import Category, Product, StockLog, Order, OrderItem, Vendor
from bookings.models import Booking
from core.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    vendor_name = serializers.CharField(source='preferred_vendor.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class StockLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = StockLog
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class ActiveBookingSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    guest_name = serializers.CharField(source='guest.name', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'booking_ref', 'room_number', 'guest_name']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    # Write-only field to accept items during creation
    items_data = serializers.ListField(write_only=True, required=False)

    def validate_items_data(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        for item in value:
            if not item.get('product_id'):
                raise serializers.ValidationError("Each item must have a product_id.")
            if not item.get('quantity'):
                raise serializers.ValidationError("Each item must have a quantity.")
            try:
                int(item.get('quantity'))
            except (ValueError, TypeError):
                raise serializers.ValidationError("Quantity must be an integer.")
        return value

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['reference', 'total_amount', 'user', 'created_at']

    def create(self, validated_data):
        from django.db import transaction
        from finance.models import Transaction
        import logging
        from bookings.models import Booking
        
        logger = logging.getLogger(__name__)
        
        try:
            items_data = validated_data.pop('items_data', [])
            # Get user from validated_data (passed by view's perform_create) or fall back to request
            user = validated_data.pop('user', None) or self.context['request'].user
            
            # Handle empty booking string from frontend
            if 'booking' in validated_data:
                if not validated_data['booking']:
                    validated_data.pop('booking')

            with transaction.atomic():
                # Create Order
                order = Order.objects.create(user=user, **validated_data)
                
                total_amount = 0
                
                # Process items
                for item_data in items_data:
                    product_id = item_data.get('product_id')
                    # Ensure quantity is int
                    try:
                        quantity = int(item_data.get('quantity'))
                    except (TypeError, ValueError):
                        logger.warning(f"Invalid quantity for product {product_id}: {item_data.get('quantity')}")
                        continue

                    try:
                        product = Product.objects.get(id=product_id)
                        unit_price = product.price
                        
                        # Create OrderItem
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            unit_price=unit_price,
                            total_price=unit_price * quantity
                        )
                        
                        # Deduct Stock
                        product.quantity -= quantity
                        product.save()
                        
                        # Create Stock Log
                        StockLog.objects.create(
                            product=product,
                            action='SALE',
                            quantity_change=-quantity,
                            old_quantity=product.quantity + quantity,
                            new_quantity=product.quantity,
                            user=user,
                            notes=f"Sale Order {order.reference}"
                        )
                        
                        total_amount += (unit_price * quantity)
                        
                    except Product.DoesNotExist:
                        logger.error(f"Product {product_id} not found")
                        continue
                        
                # Update Order Total
                order.total_amount = total_amount
                order.save()
                
                # Create Financial Transaction (if not Room Charge, or maybe separate logic?)
                # User wants "Master Transaction List".
                # If Room Charge -> No immediate cash flow, but we can log it as 'PENDING' or just rely on Booking aggregation.
                # User asked: "I hope all these are being added to the master transaction list"
                
                if order.payment_method != 'ROOM_CHARGE':
                     Transaction.objects.create(
                        transaction_type=Transaction.Type.PAYMENT,
                        payment_method=order.payment_method,
                        status=Transaction.Status.CONFIRMED,
                        amount=order.total_amount,
                        processed_by=user,
                        booking=order.booking if order.booking else None,
                        notes=f"Bar Order {order.reference}",
                        external_ref=order.reference
                     )
                
                return order
                
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}", exc_info=True)
            raise serializers.ValidationError(f"Failed to process order: {str(e)}")
