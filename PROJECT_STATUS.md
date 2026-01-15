# Mayor K. Guest Palace - System Status & Technical Reference

**Last Updated:** January 15, 2026
**Version:** 1.0.0 (Phase 1 Complete)

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
    *   **Styling:** Tailwind CSS + CSS Variables (`globals.css`) for theming.
    *   **Icons:** Lucide React (Standardized professional icon set).
    *   **Notifications:** `react-hot-toast` (Professional toast popups).
    *   **Charts:** `recharts` for financial and operational analytics.
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

### Module: Dashboard & UI
*   [x] **Design System**: "Premium Dark" theme with `var(--color-bg-elevated)` and glassmorphism touches.
*   [x] **Receptionist View**: Focus on "Quick Actions" and "Room Grid".
*   [x] **Stakeholder View**: Specialized "Financial Dashboard" (Revenue vs Expenses, Anomalies).
*   [x] **Admin View**: access to System Audit Logs and Operational Analytics.
*   [x] **Components**:
    *   `StatCard`: Supports trend indicators (e.g., "up 12% vs last week").
    *   `RoomCard`: Visualizes room state (Occupied/Dirty/Available) with status dots and icons.
    *   `Sidebar`: Collapsible, role-aware navigation using Lucide icons.

### Module: Rooms & Bookings
*   [x] **Quick Book Modal**: Streamlined walk-in process.
*   [x] **Room Action Modal**: Interface for Housekeeping (Mark Clean) and Maintenance.
*   [x] **Analytics**: Room Turnaround Time tracking (Dirty -> Available duration).

### Module: Finance
*   [x] **Expense Workflow**:
    *   Staff logs expense -> Manager approves (if < 100k) -> Validated.
    *   **Constraint**: Manager approval rejected if amount > 100k.
*   [x] **Revenue Tracking**: Aggregated by Day/Week/Month for Stakeholders.

---

## 4. Directory Structure & Key Files

### Frontend (`/frontend`)
*   `app/components/`: Reusable UI (Sidebar, StatCard, RoomCard).
*   `app/context/AuthContext.tsx`: Manages user session and role state.
*   `app/lib/api.ts`: Centralized API client. **All backend calls go through here.**
*   `app/dashboard/`: Main operational dashboard (conditional rendering based on role).
*   `app/audit-log/`: Admin-only system event viewer.

### Backend (`/`)
*   `core/`: User models, Authentication logic, System Events.
*   `bookings/`: Room and Booking models.
*   `finance/`: Transaction ledger and Expense models.
*   `config/`: Django settings (CORS, CSRF, Installed Apps).

---

## 5. Known Issues / Next Steps (Phase 2 & 3)
*   **Date Filtering**: Analytics currently has backend support for date ranges but needs a Frontend UI date picker.
*   **Mobile Responsiveness**: Sidebar is currently fixed; needs a mobile toggle.
*   **Production Deployment**: Needs `gunicorn` setup and environment variable injection for production secrets.
