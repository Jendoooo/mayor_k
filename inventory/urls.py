from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, OrderViewSet, StockLogViewSet, VendorViewSet, ActiveBookingViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'active-bookings', ActiveBookingViewSet, basename='active-bookings')
router.register(r'vendors', VendorViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'stock-logs', StockLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
