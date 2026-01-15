"""
API URL configuration for Mayor K. Guest Palace.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    UserViewSet, SystemEventViewSet, RoomTypeViewSet, RoomViewSet,
    GuestViewSet, BookingViewSet, TransactionViewSet,
    ExpenseCategoryViewSet, ExpenseViewSet,
    DashboardView, StakeholderDashboardView, RoomAnalyticsView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'events', SystemEventViewSet)
router.register(r'room-types', RoomTypeViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'guests', GuestViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'expense-categories', ExpenseCategoryViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('dashboard/stakeholder/', StakeholderDashboardView.as_view(), name='stakeholder-dashboard'),
    path('analytics/rooms/', RoomAnalyticsView.as_view(), name='room-analytics'),
    
    # Authentication
    path('auth/', include('rest_framework.urls')),
]
