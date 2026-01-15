"""
API Views for Mayor K. Guest Palace.
"""
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import User, SystemEvent
from core.serializers import (
    UserSerializer, SystemEventSerializer, RoomTypeSerializer, RoomSerializer,
    RoomAvailabilitySerializer, GuestSerializer, GuestCreateSerializer,
    BookingSerializer, QuickBookSerializer, TransactionSerializer,
    ExpenseCategorySerializer, ExpenseSerializer, ExpenseCreateSerializer,
    DashboardStatsSerializer, StakeholderDashboardSerializer
)
from bookings.models import RoomType, Room, Guest, Booking, RoomStateTransition
from finance.models import Transaction, ExpenseCategory, Expense
from django.contrib.auth import login, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# ============ AUTH VIEWS ============

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Support both JSON and FormData
        if not username:
            username = request.POST.get('username')
            password = request.POST.get('password')
            
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if not user.is_active:
                return Response({'error': 'Account is disabled'}, status=403)
                
            login(request, user)
            return Response({'status': 'ok', 'user': UserSerializer(user).data})
        else:
            return Response({'error': 'Invalid credentials'}, status=400)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'status': 'ok'})

# ============ PERMISSIONS ============

class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_manager_or_admin


class IsStakeholder(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_stakeholder


class CanApproveExpenses(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_approve_expenses


# ============ VIEWSETS ============

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class SystemEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemEvent.objects.all()
    serializer_class = SystemEventSerializer
    permission_classes = [IsManagerOrAdmin]
    filterset_fields = ['event_category', 'event_type', 'actor']
    search_fields = ['event_type', 'target_table']
    ordering_fields = ['created_at']


class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManagerOrAdmin()]
        return super().get_permissions()


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.select_related('room_type').all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['current_state', 'room_type', 'floor', 'is_active']
    search_fields = ['room_number']
    ordering_fields = ['room_number', 'floor']
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available rooms."""
        rooms = self.queryset.filter(
            current_state=Room.State.AVAILABLE,
            is_active=True
        )
        serializer = RoomAvailabilitySerializer(rooms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_clean(self, request, pk=None):
        """Mark room as clean after housekeeping."""
        room = self.get_object()
        room.change_state(Room.State.AVAILABLE, changed_by=request.user)
        return Response({'status': 'Room marked as available', 'room': RoomSerializer(room).data})
    
    @action(detail=True, methods=['post'])
    def mark_dirty(self, request, pk=None):
        """Mark room as dirty."""
        room = self.get_object()
        room.change_state(Room.State.DIRTY, changed_by=request.user)
        return Response({'status': 'Room marked as dirty', 'room': RoomSerializer(room).data})
    
    @action(detail=True, methods=['post'])
    def mark_maintenance(self, request, pk=None):
        """Mark room under maintenance."""
        room = self.get_object()
        notes = request.data.get('notes', '')
        room.change_state(Room.State.MAINTENANCE, changed_by=request.user, notes=notes)
        return Response({'status': 'Room under maintenance', 'room': RoomSerializer(room).data})


class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_blocked']
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['name', 'total_stays', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GuestCreateSerializer
        return GuestSerializer
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        """Lookup guest by phone number."""
        phone = request.query_params.get('phone', '')
        if not phone:
            return Response({'error': 'Phone number required'}, status=400)
        
        try:
            guest = Guest.objects.get(phone=phone)
            return Response(GuestSerializer(guest).data)
        except Guest.DoesNotExist:
            return Response({'found': False})


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('guest', 'room', 'room__room_type', 'created_by').all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'stay_type', 'source', 'room']
    search_fields = ['booking_ref', 'guest__name', 'guest__phone', 'room__room_number']
    ordering_fields = ['check_in_date', 'created_at', 'total_amount']
    
    @action(detail=False, methods=['post'])
    def quick_book(self, request):
        """Quick booking for walk-in guests."""
        serializer = QuickBookSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in a booking."""
        booking = self.get_object()
        if booking.status != Booking.Status.CONFIRMED:
            return Response(
                {'error': f'Cannot check in: booking is {booking.get_status_display()}'},
                status=400
            )
        booking.check_in(request.user)
        return Response(BookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        """Check out a booking."""
        booking = self.get_object()
        if booking.status != Booking.Status.CHECKED_IN:
            return Response(
                {'error': f'Cannot check out: booking is {booking.get_status_display()}'},
                status=400
            )
        booking.check_out(request.user)
        return Response(BookingSerializer(booking).data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's bookings."""
        today = timezone.now().date()
        bookings = self.queryset.filter(
            Q(check_in_date=today) | Q(status=Booking.Status.CHECKED_IN)
        )
        return Response(BookingSerializer(bookings, many=True).data)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """Transactions are read-only in API (created through booking flow)."""
    queryset = Transaction.objects.select_related('booking', 'processed_by').all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['transaction_type', 'payment_method', 'status', 'booking']
    search_fields = ['transaction_ref', 'booking__booking_ref', 'external_ref']
    ordering_fields = ['created_at', 'amount']
    
    @action(detail=True, methods=['post'], permission_classes=[IsManagerOrAdmin])
    def create_correction(self, request, pk=None):
        """Create a correction entry for a transaction."""
        transaction = self.get_object()
        reason = request.data.get('reason', '')
        new_amount = request.data.get('amount')
        
        if not reason:
            return Response({'error': 'Reason is required'}, status=400)
        
        correction = Transaction.create_correction(
            original=transaction,
            reason=reason,
            corrected_by=request.user,
            new_amount=Decimal(new_amount) if new_amount else None
        )
        return Response(TransactionSerializer(correction).data, status=status.HTTP_201_CREATED)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsManagerOrAdmin]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('category', 'logged_by', 'approved_by').all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'category', 'expense_date']
    search_fields = ['expense_ref', 'description', 'vendor_name']
    ordering_fields = ['expense_date', 'amount', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        serializer.save(logged_by=self.request.user)
        
        # Log event
        SystemEvent.log(
            event_type='EXPENSE_CREATED',
            category=SystemEvent.EventCategory.EXPENSE,
            actor=self.request.user,
            target=serializer.instance,
            payload={
                'expense_ref': serializer.instance.expense_ref,
                'amount': str(serializer.instance.amount),
                'category': serializer.instance.category.name
            }
        )
    
    @action(detail=True, methods=['post'], permission_classes=[CanApproveExpenses])
    def approve(self, request, pk=None):
        """Approve an expense."""
        expense = self.get_object()
        
        # Manager Limit Check
        if request.user.role == 'MANAGER':
            limit = Decimal('100000.00')
            if expense.amount > limit:
                return Response(
                    {'error': f'Managers can only approve expenses up to ₦{limit:,.2f}. Please escalate to Admin or Stakeholder.'},
                    status=403
                )

        if expense.status != Expense.Status.PENDING:
            return Response({'error': 'Only pending expenses can be approved'}, status=400)
        expense.approve(request.user)
        return Response(ExpenseSerializer(expense).data)
    
    @action(detail=True, methods=['post'], permission_classes=[CanApproveExpenses])
    def reject(self, request, pk=None):
        """Reject an expense."""
        expense = self.get_object()
        reason = request.data.get('reason', '')
        if not reason:
            return Response({'error': 'Reason is required'}, status=400)
        expense.reject(request.user, reason)
        return Response(ExpenseSerializer(expense).data)


# ============ DASHBOARD VIEWS ============

class DashboardView(APIView):
    """Dashboard statistics for receptionist/manager."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Room stats
        total_rooms = Room.objects.filter(is_active=True).count()
        room_states = Room.objects.filter(is_active=True).values('current_state').annotate(count=Count('id'))
        state_counts = {s['current_state']: s['count'] for s in room_states}
        
        # Today's bookings and revenue
        today_bookings = Booking.objects.filter(check_in_date=today).count()
        today_revenue = Transaction.objects.filter(
            created_at__date=today,
            transaction_type=Transaction.Type.PAYMENT,
            status=Transaction.Status.CONFIRMED
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        today_checkouts = Booking.objects.filter(
            actual_checkout__date=today
        ).count()
        
        # Pending expenses
        pending_expenses = Expense.objects.filter(status=Expense.Status.PENDING).count()
        
        # Occupancy rate
        occupied = state_counts.get('OCCUPIED', 0)
        occupancy_rate = (occupied / total_rooms * 100) if total_rooms > 0 else 0
        
        data = {
            'total_rooms': total_rooms,
            'available_rooms': state_counts.get('AVAILABLE', 0),
            'occupied_rooms': occupied,
            'dirty_rooms': state_counts.get('DIRTY', 0),
            'today_bookings': today_bookings,
            'today_revenue': today_revenue,
            'today_checkouts': today_checkouts,
            'pending_expenses': pending_expenses,
            'occupancy_rate': round(occupancy_rate, 1),
        }
        
        return Response(DashboardStatsSerializer(data).data)


class StakeholderDashboardView(APIView):
    """Simplified dashboard for stakeholders (family members)."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        month_start = today.replace(day=1)
        
        # Helper to get revenue
        def get_revenue(start_date, end_date=None):
            qs = Transaction.objects.filter(
                transaction_type=Transaction.Type.PAYMENT,
                status=Transaction.Status.CONFIRMED,
                created_at__date__gte=start_date
            )
            if end_date:
                qs = qs.filter(created_at__date__lte=end_date)
            return qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Helper to get expenses
        def get_expenses(start_date, end_date=None):
            qs = Expense.objects.filter(
                status=Expense.Status.APPROVED,
                expense_date__gte=start_date
            )
            if end_date:
                qs = qs.filter(expense_date__lte=end_date)
            return qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Revenue
        revenue_today = get_revenue(today)
        revenue_week = get_revenue(week_start)
        revenue_month = get_revenue(month_start)
        
        # Expenses
        expenses_today = get_expenses(today)
        expenses_week = get_expenses(week_start)
        expenses_month = get_expenses(month_start)
        
        # Occupancy
        total_rooms = Room.objects.filter(is_active=True).count()
        occupied_today = Room.objects.filter(current_state=Room.State.OCCUPIED).count()
        occupancy_today = (occupied_today / total_rooms * 100) if total_rooms > 0 else 0
        
        # Anomalies detection
        anomalies = []
        
        # Check for large single expenses
        large_expenses = Expense.objects.filter(
            expense_date__gte=week_start,
            amount__gte=50000  # Flag expenses over ₦50k
        ).values('expense_ref', 'description', 'amount', 'expense_date')
        
        for exp in large_expenses:
            anomalies.append({
                'type': 'LARGE_EXPENSE',
                'message': f"Large expense: N{exp['amount']} - {exp['description'][:30]}",
                'date': str(exp['expense_date']),
                'ref': exp['expense_ref']
            })
        
        # Check for high void/discount ratio
        total_bookings = Booking.objects.filter(created_at__date__gte=week_start).count()
        discounted = Booking.objects.filter(
            created_at__date__gte=week_start,
            discount_amount__gt=0
        ).count()
        
        if total_bookings > 10 and discounted / total_bookings > 0.2:
            anomalies.append({
                'type': 'HIGH_DISCOUNT_RATIO',
                'message': f"High discount ratio: {discounted}/{total_bookings} bookings this week had discounts",
                'date': str(today),
            })
        
        data = {
            'total_revenue_today': revenue_today,
            'total_revenue_week': revenue_week,
            'total_revenue_month': revenue_month,
            'total_expenses_today': expenses_today,
            'total_expenses_week': expenses_week,
            'total_expenses_month': expenses_month,
            'net_revenue_today': revenue_today - expenses_today,
            'net_revenue_week': revenue_week - expenses_week,
            'net_revenue_month': revenue_month - expenses_month,
            'occupancy_rate_today': round(occupancy_today, 1),
            'avg_occupancy_week': round(occupancy_today, 1),  # Simplified for now
            'anomalies': anomalies,
        }
        
        return Response(StakeholderDashboardSerializer(data).data)


class RoomAnalyticsView(APIView):
    """Analytics for room state durations (dirty time, etc.)."""
    permission_classes = [IsManagerOrAdmin]
    
    def get(self, request):
        # Calculate average dirty duration per room
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        dirty_to_clean = []
        
        rooms = Room.objects.all()
        for room in rooms:
            transitions = RoomStateTransition.objects.filter(room=room).order_by('transitioned_at')
            
            if start_date:
                transitions = transitions.filter(transitioned_at__date__gte=start_date)
            if end_date:
                transitions = transitions.filter(transitioned_at__date__lte=end_date)
                
            dirty_start = None
            durations = []
            
            for t in transitions:
                if t.to_state == 'DIRTY':
                    dirty_start = t.transitioned_at
                elif t.from_state == 'DIRTY' and t.to_state == 'AVAILABLE' and dirty_start:
                    duration_minutes = (t.transitioned_at - dirty_start).total_seconds() / 60
                    durations.append(duration_minutes)
                    dirty_start = None
            
            if durations:
                dirty_to_clean.append({
                    'room_number': room.room_number,
                    'avg_dirty_minutes': round(sum(durations) / len(durations), 1),
                    'total_cleanings': len(durations)
                })
        
        return Response({
            'room_dirty_durations': dirty_to_clean,
            'overall_avg_dirty_minutes': round(
                sum(r['avg_dirty_minutes'] for r in dirty_to_clean) / len(dirty_to_clean), 1
            ) if dirty_to_clean else 0
        })
