# Mayor K. Guest Palace - Hotel Management System

A premium, role-based hotel management system tailored for the Nigerian hospitality market. Features specialized billing for "Short Rest" vs Overnight stays, operational expense tracking, immutable financial ledgers, and extensive audit logging.

## 🌟 Key Features

### 🏨 Operational & Bookings
*   **Dynamic Room States:** `Available` → `Occupied` → `Dirty` (Housekeeping) → `Available`.
*   **Flexible Billing:**
    *   **Short Rest:** 2-4 hour stays with specific rates.
    *   **Overnight:** Standard nightly billing.
    *   **Lodge:** Long-term stay tracking.
*   **QuickBook Modal:** Fast check-in for walk-in guests with auto-calculated totals.

### 💰 Finance & Inventory
*   **Immutable Ledger:** Transactions cannot be deleted; full audit trail for all financial movements.
*   **Expense Workflow:**
    *   Staff submit expenses (Maintenance, Fuel, Supplies).
    *   Managers approve/reject requests > ₦100k or strictly monitored categories.
*   **Inventory Management:** Track bar items, stock levels, and vendor supplies.
*   **Settings Hub:** Managers can update Room Rates and Product Prices directly from the dashboard.

### 🛡️ Security & Access
*   **Role-Based Access Control (RBAC):** 7 distinct roles with granular permissions:
    *   `ADMIN` / `MANAGER`: Full control, approvals, settings.
    *   `RECEPTIONIST`: Bookings, Guest Check-in/out.
    *   `ACCOUNTANT`: Read-only financial data.
    *   `HOUSEKEEPING`: View dirty rooms, mark as clean.
    *   `BAR_STAFF`: POS access only.
    *   `STAKEHOLDER`: Executive dashboard (Net Profit/Occupancy).
*   **Comprehensive Audit Log:** Tracks logins, price changes, and critical actions.

## 🏗️ Technical Stack

*   **Backend:** Django 5.2 (Python), Django REST Framework
*   **Frontend:** Next.js 14+ (React), TypeScript, Tailwind CSS
*   **Database:** SQLite (Dev) / PostgreSQL (Prod ready)
*   **Authentication:** JWT with Session handling
*   **State Management:** React Context + React Hot Toast

## 🚀 Getting Started

### 1. Backend Setup
```bash
# Clone and enter directory
git clone https://github.com/YourRepo/mayor_k.git
cd mayor_k

# Activate Virtual Env
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install Requirements
pip install -r requirements.txt

# Run Migrations
python manage.py migrate

# Start Server
python manage.py runserver
```
*API available at:* `http://localhost:8000/api/v1/`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Dashboard available at:* `http://localhost:3000`

## 🔑 Default Test Users

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `test123` |
| **Manager** | `manager1` | `test123` |
| **Reception** | `reception1` | `test123` |
| **Accountant** | `accountant1` | `test123` |
| **Housekeeping** | `housekeeper1` | `test123` |
| **Bar Staff** | `barstaff1` | `test123` |
| **Stakeholder** | `stakeholder1` | `test123` |

## 📂 Project Structure
*   **`/bookings`**: Room & Reservation logic
*   **`/core`**: Users, Auth, Audit Logs
*   **`/finance`**: Transactions & Expenses
*   **`/inventory`**: Products, Stock, Orders
*   **`/frontend`**: Next.js App Router Application

---
*Last Updated: January 2026*
