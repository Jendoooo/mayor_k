# Mayor K. Guest Palace - System Status & Technical Reference

**Last Updated:** January 15, 2026 (Evening Update)
**Version:** 1.1.0 (UI Redesign + Bar POS Fixes)

## 1. System Overview (Non-Technical)
The **Mayor K. Guest Palace Hotel Management System (HMS)** is a hybrid web application designed to manage hotel operations, bookings, and finances. It is tailored for the Nigerian context, handling specific scenarios like "Short Rest", "Overnight", and "Lodge" stays, as well as distinct "Stakeholder" views for owners.

### Key Business Rules
*   **Roles:**
    *   **Receptionist:** Front desk operations, Check-in/out, Quick Booking.
    *   **Manager:** All Receptionist duties + Expense Approval (up to ₦100k), Reports.
    *   **Stakeholder:** Read-only access to high-level financial data (Revenue, Expenses, Net Income).
    *   **Admin:** Full access + Audit Logs + Analytics + Unlimited Approvals.
*   **Finance:**
    *   **Expense Limits:** Managers cannot approve expenses > ₦100,000. These require Admin/Stakeholder action.
    *   **Immutable Ledger:** Financial transactions cannot be deleted, only corrected via contra-entries.
*   **Room States:** Rooms cycle through `Available` -> `Occupied` -> `Dirty` -> `Available` (after cleaning).

---

## 2. Technical Stack
*   **Frontend:** Next.js 15 (App Router), React 19, TypeScript.
    *   **Styling:** Tailwind CSS + Custom "Midnight Blue" premium theme.
    *   **Icons:** Lucide React (Standardized professional icon set).
    *   **Notifications:** `react-hot-toast` (Professional toast popups).
    *   **Charts:** `recharts` for financial and operational analytics.
    *   **Animations:** Framer Motion for smooth transitions.
*   **Backend:** Python Django 5, Django REST Framework (DRF).
    *   **Database:** SQLite (Development) / PostgreSQL (Production ready).
    *   **Authentication:** Session-based (HttpOnly cookies) with CSRF protection.
    *   **API:** RESTful endpoints at `/api/v1/`.

---

## 3. Current Implementation Status

### Module: Authentication & Permissions
*   [x] **Login/Logout**: Secure HTTP-only session management.
*   [x] **RBAC (Role-Based Access Control)**: Enforced at both Frontend (middleware/context) and Backend (Permission Classes).
*   [x] **Audit Logging**: `SystemEvent` tracks Login, Logout, and sensitive actions.

### Module: Dashboard & UI ✨ UPDATED
*   [x] **Premium Dark Theme**: "Midnight Blue" with glassmorphism, champagne gold accents.
*   [x] **All Staff Layouts Fixed**: Rooms, Bookings, Guests, Expenses, Transactions now use `ProtectedLayout`.
*   [x] **Receptionist View**: Focus on "Quick Actions" and "Room Grid".
*   [x] **Stakeholder View**: Specialized "Financial Dashboard" (Revenue vs Expenses, Anomalies).
*   [x] **Admin View**: Access to System Audit Logs and Operational Analytics.
*   [x] **Components Redesigned**:
    *   `StatCard`: Premium gradient backgrounds with ambient glow effects.
    *   `RoomCard`: State-based styling (green=available, blue=occupied, amber=dirty, red=maintenance).
    *   `Sidebar`: Collapsible, role-aware navigation using Lucide icons.
    *   `QuickBookModal`: ✨ **Completely Redesigned** - Premium centered modal with dynamic pricing.

### Module: Rooms & Bookings ✨ UPDATED
*   [x] **Quick Book Modal**: Now shows real-time Total Due based on room type rates.
*   [x] **Auto-fill Amount**: Automatically fills expected payment when room is selected.
*   [x] **Smart Stay Type Logic**: "Nights" field only shows for Lodge stays.
*   [x] **Balance Calculator**: Shows change due or remaining balance.
*   [x] **Returning Guest Detection**: Shows badge for repeat customers.
*   [x] **Room Serializer**: Now includes `overnight_rate` and `short_rest_rate` from RoomType.

### Module: Bar POS ✨ FIXED
*   [x] **Order Processing**: CASH, TRANSFER, POS, and ROOM CHARGE all working.
*   [x] **Fixed duplicate user error**: `OrderSerializer` now properly handles user argument.
*   [x] **Active Bookings**: Properly fetches checked-in guests for Room Charge feature.
*   [x] **Transaction Recording**: All bar sales recorded in master transaction ledger.

### Module: Finance
*   [x] **Expense Workflow**:
    *   Staff logs expense -> Manager approves (if < 100k) -> Validated.
    *   **Constraint**: Manager approval rejected if amount > 100k.
*   [x] **Revenue Tracking**: Aggregated by Day/Week/Month for Stakeholders.

---

## 4. Directory Structure & Key Files

### Frontend (`/frontend`)
*   `app/components/`: Reusable UI (Sidebar, StatCard, RoomCard, QuickBookModal).
*   `app/context/AuthContext.tsx`: Manages user session and role state.
*   `app/lib/api.ts`: Centralized API client. **All backend calls go through here.**
*   `app/dashboard/`: Main operational dashboard (conditional rendering based on role).
*   `app/bar/`: Bar Point of Sale system.
*   `app/audit-log/`: Admin-only system event viewer.

### Backend (`/`)
*   `core/`: User models, Authentication logic, System Events, Room Serializers.
*   `bookings/`: Room and Booking models.
*   `finance/`: Transaction ledger and Expense models.
*   `inventory/`: Bar products, Orders, Stock management.
*   `config/`: Django settings (CORS, CSRF, Installed Apps).

---

## 5. Recent Fixes (Today)

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| Blank staff pages | ✅ Fixed | Updated all layouts to use `ProtectedLayout` |
| StatCard missing imports | ✅ Fixed | Added `ReactNode`, `ArrowUpRight`, `ArrowDownRight` imports |
| Bar POS "activeBookings.map" error | ✅ Fixed | Handle paginated API response |
| Bar POS "API Error: Bad Request" | ✅ Fixed | Resolved duplicate `user` argument in OrderSerializer |
| QuickBook Total shows ₦0 | ✅ Fixed | Added rate fields to RoomSerializer |
| QuickBook modal not centered | ✅ Fixed | Redesigned with Framer Motion centering |

---

## 6. Known Issues / Next Steps (Phase 2 & 3)
*   **Date Filtering**: Analytics currently has backend support for date ranges but needs a Frontend UI date picker.
*   **Mobile Responsiveness**: Sidebar is currently fixed; needs a mobile toggle.
*   **Production Deployment**: Needs `gunicorn` setup and environment variable injection for production secrets.
*   **Room Rate Management**: Consider adding an admin UI to edit room type rates (currently via Django Admin).
