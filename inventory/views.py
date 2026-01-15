from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, StockLog, Order, Vendor
from bookings.models import Booking
from .serializers import CategorySerializer, ProductSerializer, StockLogSerializer, OrderSerializer, VendorSerializer, ActiveBookingSerializer
from core.models import SystemEvent

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ActiveBookingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Booking.objects.filter(status='CHECKED_IN')
    serializer_class = ActiveBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_person', 'email']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'category__name']

    @action(detail=True, methods=['post'])
    def audit_stock(self, request, pk=None):
        """
        Manual stock adjustment (Stock Take / Restock)
        Expects: { "new_quantity": 50, "reason": "Restock from Supplier" }
        """
        product = self.get_object()
        new_quantity = int(request.data.get('new_quantity', 0))
        reason = request.data.get('reason', 'Manual Adjustment')
        
        old_quantity = product.quantity
        diff = new_quantity - old_quantity
        
        if diff == 0:
            return Response({'message': 'No change in quantity'})

        # action type
        action_type = 'RESTOCK' if diff > 0 else 'LOSS'
        if 'audit' in reason.lower():
            action_type = 'AUDIT'
            
        # Update product
        product.quantity = new_quantity
        product.save()
        
        # Log Stock Movement
        StockLog.objects.create(
            product=product,
            action=action_type,
            quantity_change=diff,
            old_quantity=old_quantity,
            new_quantity=new_quantity,
            user=request.user,
            notes=reason
        )
        
        # Create System Event for global Audit Log
        SystemEvent.objects.create(
            category='INVENTORY',
            event_type='STOCK_AUDIT',
            description=f"Stock adjusted for {product.name}: {old_quantity} -> {new_quantity} ({diff > 0 and '+' or ''}{diff}). Reason: {reason}",
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR', '')
        )
        
        return Response({'status': 'Stock updated', 'new_quantity': new_quantity})

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'user']

    def perform_create(self, serializer):
        # The actual creation logic is in the serializer, this just triggers it
        serializer.save(user=self.request.user)

class StockLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockLog.objects.all().order_by('-created_at')
    serializer_class = StockLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'action', 'user']
