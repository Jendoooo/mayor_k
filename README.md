# Mayor K. Guest Palace - Hotel Management System

A comprehensive hotel management system built for the Nigerian hospitality market, featuring role-based access, room state management, operational expense tracking, and immutable financial ledgers.

## 🏗️ Tech Stack

*   **Backend:** Django 5.2 (Python), Django REST Framework
*   **Database:** PostgreSQL (Production) / SQLite (Dev)
*   **Frontend:** Next.js 14+ (React), TypeScript, Vanilla CSS (Premium Dark Theme)
*   **Infrastructure:** Whitenoise (Static), Gunicorn

## 🚀 Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 18+

### 1. Backend Setup (API)

```bash
# Clone repository
git clone https://github.com/Jendoooo/mayor_k.git
cd mayor_k

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load initial demo data (Rooms, Categories, Users)
python manage.py setup_initial_data

# Create Superuser (admin / admin123)
python manage.py create_admin

# Run Server
python manage.py runserver 8000
```
API is available at: `http://localhost:8000/api/v1/`
Admin Panel: `http://localhost:8000/admin/`

### 2. Frontend Setup (Dashboard)

```bash
cd frontend

# Install dependencies
npm install

# Run Development Server
npm run dev
```
Dashboard available at: `http://localhost:3000`

## 🔑 Default Users

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `admin123` | Full Access (Django Admin + Dashboard) |
| **Manager** | `manager` | `manager123` | Approvals, Finances, Reports |
| **Receptionist** | `receptionist` | `recept123` | Bookings, Guest Check-in/out |
| **Stakeholder** | `stakeholder` | `stake123` | Read-only Financial Dashboard |

## 🌟 Key Features

### 1. Operational Realities (Nigerian Context)
*   **"Short Rest" vs Overnight:** Specific pricing logic for 2-4 hour stays vs nightly bookings.
*   **Room State Machine:** `Available` -> `Occupied` -> `Dirty` -> `Cleaning` -> `Available`.
*   **Maintenance Mode:** Track rooms down for AC/Plumbing repairs separately from "Dirty".

### 2. Financial Integrity
*   **Immutable Ledger:** Transactions cannot be deleted, only corrected via reversing entries.
*   **Expense Workflow:** Receptionists log expenses (e.g., Diesel); Managers must approve them.
*   **Audit Trail:** `SystemEvents` table logs who did what, when, and from which IP.

### 3. Analytics & Trust
*   **Stakeholder Dashboard:** Read-only view for owners to see Net Profit and Occupancy without operational clutter.
*   **Anomaly Detection:** System flags suspicious patterns (e.g., high diesel consumption, excessive discounts).

## 📂 Project Structure

```
mayor_k/
├── bookings/       # Room & Reservation logic
├── core/           # Users, Auth, Systems Events
├── finance/        # Transactions & Expenses
├── frontend/       # Next.js Dashboard App
├── config/         # Django Settings
└── manage.py
```
