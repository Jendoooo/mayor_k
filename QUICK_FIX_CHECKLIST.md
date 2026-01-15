# Quick Fix Checklist - Critical Issues Only

## 🔴 **MUST FIX TODAY** (6 Critical Issues)

### 1. **Remove CSRF_EXEMPT from Login** ⚠️ **SECURITY**
**File:** `core/views.py:30`
```python
# REMOVE THIS LINE:
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
```
**Why:** Security vulnerability - allows CSRF attacks.

---

### 2. **Add Missing EventCategory Values** ⚠️ **BUG**
**File:** `core/models.py:119-125`
**Add these 3 missing categories:**
```python
class EventCategory(models.TextChoices):
    BOOKING = 'BOOKING', 'Booking'
    PAYMENT = 'PAYMENT', 'Payment'
    ROOM = 'ROOM', 'Room'
    EXPENSE = 'EXPENSE', 'Expense'
    AUTH = 'AUTH', 'Authentication'
    ADMIN = 'ADMIN', 'Administration'
    # ADD THESE:
    SECURITY = 'SECURITY', 'Security'  # Used in signals.py
    SYSTEM = 'SYSTEM', 'System'        # Used in views.py
    INVENTORY = 'INVENTORY', 'Inventory'  # Used in inventory/views.py
```
**Why:** Code references these but they don't exist - will crash.

---

### 3. **Fix Inventory SystemEvent Creation** ⚠️ **BUG**
**File:** `inventory/views.py:95-101`
**Replace:**
```python
SystemEvent.objects.create(
    category='INVENTORY',
    event_type='STOCK_AUDIT',
    description=f"...",
    user=request.user,
    ip_address=request.META.get('REMOTE_ADDR', '')
)
```
**With:**
```python
SystemEvent.log(
    event_type='STOCK_AUDIT',
    category=SystemEvent.EventCategory.INVENTORY,
    actor=request.user,
    target=product,
    description=f"Stock adjusted for {product.name}: {old_quantity} -> {new_quantity} ({diff > 0 and '+' or ''}{diff}). Reason: {reason}",
    payload={
        'product': product.name,
        'old_quantity': old_quantity,
        'new_quantity': new_quantity,
        'difference': diff,
        'reason': reason
    },
    request=request
)
```
**Why:** Consistent with rest of codebase, proper field mapping.

---

### 4. **Fix user.full_name References** ⚠️ **BUG**
**File:** `inventory/serializers.py:27,50`
**Option 1:** Add property to User model (`core/models.py`):
```python
@property
def full_name(self):
    return self.get_full_name() or self.username
```

**Option 2:** Change serializer to use method:
```python
user_name = serializers.CharField(source='user.get_full_name', read_only=True)
```
**Why:** `full_name` property doesn't exist - will crash.

---

### 5. **Create .env.example** ⚠️ **SETUP**
**Create file:** `.env.example` in project root
```bash
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost:5432/mayor_k

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```
**Why:** New developers can't set up project without this.

---

### 6. **Fix CSRF_TRUSTED_ORIGINS** ⚠️ **PRODUCTION**
**File:** `config/settings.py:128`
**Change:**
```python
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']  # ❌ Hardcoded
```
**To:**
```python
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000',
    cast=Csv()
)
```
**Why:** Won't work in production without code changes.

---

## ⚠️ **FIX THIS WEEK** (High Priority)

### 7. **Add Rate Limiting**
**Install:** `pip install django-ratelimit`
**File:** `core/views.py:30`
**Add:**
```python
from django_ratelimit.decorators import ratelimit

class LoginView(APIView):
    @ratelimit(key='ip', rate='5/m', method='POST')
    def post(self, request):
        # ... existing code
```

### 8. **Register Inventory Models in Admin**
**File:** `inventory/admin.py`
**Add:**
```python
from django.contrib import admin
from .models import Category, Product, Vendor, Order, StockLog

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'quantity', 'is_low_stock')

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'phone')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('reference', 'user', 'total_amount', 'payment_method', 'status', 'created_at')

@admin.register(StockLog)
class StockLogAdmin(admin.ModelAdmin):
    list_display = ('product', 'action', 'quantity_change', 'user', 'created_at')
    readonly_fields = ('id', 'product', 'action', 'quantity_change', 'old_quantity', 'new_quantity', 'user', 'created_at')
```

### 9. **Replace alert()/confirm() with Toast**
**File:** `frontend/app/expenses/page.tsx:34,45`
**Replace:**
```typescript
if (!confirm(`Approve expense ${expense.expense_ref}?`)) return;
```
**With:**
```typescript
// Use a proper confirmation modal component
```

### 10. **Fix Empty views.py Files**
**Files:** `bookings/views.py`, `finance/views.py`
**Either:** Add views or remove if not needed.

---

## ✅ **VERIFIED AS CORRECT** (No Fix Needed)

- ✅ `getAvailableRooms()` - Accepts date parameters correctly
- ✅ `total_room_charges`, `total_bar_charges`, `grand_total` - Exist in model and serializer
- ✅ Toast provider - Properly set up in `layout.tsx`
- ✅ Booking detail modal fields - All exist

---

## 📊 **Summary**

**Critical Issues:** 6  
**High Priority:** 4  
**Total Must-Fix:** 10 issues

**Estimated Time:** 2-3 hours for critical fixes, 1 day for high priority.
