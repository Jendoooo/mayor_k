/**
 * API Client for Mayor K. Guest Palace
 * Handles all communication with Django backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private credentials: RequestCredentials = 'include';

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add CSRF token if available
    const csrfToken = this.getCookie('csrftoken');
    if (csrfToken) {
      (defaultHeaders as any)['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: this.credentials,
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error || errorData.detail) {
          errorMessage = errorData.error || errorData.detail;
        }
      } catch (e) {
        // Ignore JSON parse error
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Auth
  async login(username: string, password: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const csrfToken = this.getCookie('csrftoken');
    if (csrfToken) {
      (headers as any)['X-CSRFToken'] = csrfToken;
    }

    // For session-based auth, POST JSON to login endpoint
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  }

  async logout() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const csrfToken = this.getCookie('csrftoken');
    if (csrfToken) {
      (headers as any)['X-CSRFToken'] = csrfToken;
    }

    await fetch(`${this.baseUrl}/auth/logout/`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
  }

  async getCurrentUser() {
    return this.request<User>('/users/me/');
  }

  // User Management
  async getUsers() {
    return this.request<User[]>('/users/');
  }

  async createUser(data: any) {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request<User>(`/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async activateUser(id: string, isActive: boolean) {
    return this.request<{ status: string; is_active: boolean }>(`/users/${id}/activate/`, {
      method: 'POST',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async resetPassword(id: string, password: string) {
    return this.request<{ status: string }>(`/users/${id}/reset_password/`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/dashboard/');
  }

  async getStakeholderDashboard() {
    return this.request<StakeholderDashboard>('/dashboard/stakeholder/');
  }

  // Rooms
  async getRooms() {
    return this.request<PaginatedResponse<Room>>('/rooms/');
  }

  async getRoom(id: string) {
    return this.request<Room>(`/rooms/${id}/`);
  }

  async getAvailableRooms(startDate?: string, endDate?: string) {
    const query = startDate && endDate ? `?start_date=${startDate}&end_date=${endDate}` : '';
    return this.request<Room[]>(`/rooms/available/${query}`);
  }

  async markRoomClean(roomId: string) {
    return this.request<Room>(`/rooms/${roomId}/mark_clean/`, { method: 'POST' });
  }

  async markRoomDirty(roomId: string) {
    return this.request<Room>(`/rooms/${roomId}/mark_dirty/`, { method: 'POST' });
  }

  async markRoomMaintenance(roomId: string, notes: string) {
    return this.request<Room>(`/rooms/${roomId}/mark_maintenance/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // Room Types
  async getRoomTypes() {
    return this.request<PaginatedResponse<RoomType>>('/room-types/');
  }

  async updateRoomType(id: string, data: Partial<RoomType>) {
    return this.request<RoomType>(`/room-types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Guests
  async getGuests() {
    return this.request<PaginatedResponse<Guest>>('/guests/');
  }

  async lookupGuest(phone: string) {
    return this.request<Guest | { found: false }>(`/guests/lookup/?phone=${phone}`);
  }

  async createGuest(data: CreateGuestData) {
    return this.request<Guest>('/guests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bookings
  async getBookings() {
    return this.request<PaginatedResponse<Booking>>('/bookings/');
  }

  async getTodayBookings() {
    return this.request<Booking[]>('/bookings/today/');
  }

  async quickBook(data: QuickBookData) {
    return this.request<Booking>('/bookings/quick_book/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkIn(bookingId: string) {
    return this.request<Booking>(`/bookings/${bookingId}/check_in/`, { method: 'POST' });
  }

  async checkOut(bookingId: string) {
    return this.request<Booking>(`/bookings/${bookingId}/check_out/`, { method: 'POST' });
  }

  async extendBooking(bookingId: string, type: 'NIGHTS' | 'SHORT_TO_OVERNIGHT', units: number = 1) {
    return this.request<Booking>(`/bookings/${bookingId}/extend/`, {
      method: 'POST',
      body: JSON.stringify({ type, units }),
    });
  }

  // Transactions
  async getTransactions() {
    return this.request<PaginatedResponse<Transaction>>('/transactions/');
  }

  // Expenses
  async getExpenses() {
    return this.request<PaginatedResponse<Expense>>('/expenses/');
  }

  async getExpenseCategories() {
    return this.request<PaginatedResponse<ExpenseCategory>>('/expense-categories/');
  }

  async createExpense(data: CreateExpenseData) {
    return this.request<Expense>('/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveExpense(expenseId: string) {
    return this.request<Expense>(`/expenses/${expenseId}/approve/`, { method: 'POST' });
  }

  async rejectExpense(expenseId: string, reason: string) {
    return this.request<Expense>(`/expenses/${expenseId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Analytics
  async getRoomAnalytics() {
    return this.request<RoomAnalytics>('/analytics/rooms/');
  }

  // System Events (Audit Log)
  async getSystemEvents() {
    return this.request<PaginatedResponse<SystemEvent>>('/events/');
  }

  // Inventory & Bar
  async getVendors() {
    return this.request<PaginatedResponse<Vendor>>('/inventory/vendors/');
  }

  async createVendor(data: Partial<Vendor>) {
    return this.request<Vendor>('/inventory/vendors/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getActiveBookings() {
    return this.request<ActiveBooking[]>('/inventory/active-bookings/');
  }

  async updateVendor(id: string, data: Partial<Vendor>) {
    return this.request<Vendor>(`/inventory/vendors/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getProducts() {
    return this.request<PaginatedResponse<Product>>('/inventory/products/');
  }

  async createProduct(data: Partial<Product>) {
    return this.request<Product>('/inventory/products/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/inventory/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async auditStock(productId: string, newQuantity: number, reason: string) {
    return this.request<{ status: string, new_quantity: number }>(`/inventory/products/${productId}/audit_stock/`, {
      method: 'POST',
      body: JSON.stringify({ new_quantity: newQuantity, reason })
    });
  }

  async getOrders() {
    return this.request<PaginatedResponse<Order>>('/inventory/orders/');
  }

  async createOrder(data: CreateOrderData) {
    return this.request<Order>('/inventory/orders/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getStockLogs() {
    return this.request<PaginatedResponse<StockLog>>('/inventory/stock-logs/');
  }

  // Shift Management
  async getCurrentShift() {
    return this.request<WorkShift>('/shifts/current/');
  }

  async startShift(data: { opening_balance: number }) {
    return this.request<WorkShift>('/shifts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async endShift(id: number, data: { closing_balance: number; notes?: string }) {
    return this.request<WorkShift>(`/shifts/${id}/end_shift/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Types
export interface SystemEvent {
  id: string;
  category: string;
  event_type: string;
  description: string;
  user_name: string;
  ip_address: string;
  created_at: string;
  formatted_date: string; // Assuming backend sends this or we format it
}

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'RECEPTIONIST' | 'HOUSEKEEPING' | 'BAR_STAFF' | 'ACCOUNTANT' | 'MANAGER' | 'STAKEHOLDER' | 'ADMIN';
  role_display: string;
  phone: string;
  is_active: boolean;
  last_login?: string;
}

export interface DashboardStats {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  dirty_rooms: number;
  today_bookings: number;
  today_revenue: string;
  today_checkouts: number;
  pending_expenses: number;
  occupancy_rate: number;
  alerts?: Alert[];
}

export interface Alert {
  type: string;
  severity: 'high' | 'medium' | 'info';
  message: string;
  link?: string;
  action_type?: string;
  resource_id?: string;
}

export interface StakeholderDashboard {
  total_revenue_today: string;
  total_revenue_week: string;
  total_revenue_month: string;
  total_expenses_today: string;
  total_expenses_week: string;
  total_expenses_month: string;
  net_revenue_today: string;
  net_revenue_week: string;
  net_revenue_month: string;
  occupancy_rate_today: number;
  avg_occupancy_week: number;
  anomalies: Anomaly[];
}

export interface Anomaly {
  type: string;
  message: string;
  date: string;
  ref?: string;
}

export type RoomState = 'AVAILABLE' | 'OCCUPIED' | 'DIRTY' | 'CLEANING' | 'MAINTENANCE';

export interface Room {
  id: string;
  room_number: string;
  room_type: string; // ID
  room_type_name?: string;
  floor: number;
  current_state: RoomState;
  state_display: string;
  notes: string;
  is_active: boolean;
  is_available: boolean;
  overnight_rate?: string | number;
  short_rest_rate?: string | number;
  price?: string | number;
  booking_stay_info?: {
    stay_type: 'SHORT_REST' | 'OVERNIGHT' | 'LODGE';
    guest_name: string;
  } | null;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  base_rate_short_rest: string;
  base_rate_overnight: string;
  base_rate_lodge: string | null;
  capacity: number;
  amenities: string[];
  is_active: boolean;
  room_count: number;
}

export interface Guest {
  id: string;
  guest_code: string | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
  is_blocked: boolean;
  total_stays: number;
  total_spent: string;
  last_visit?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_ref: string;
  guest: string;
  guest_name: string;
  guest_phone: string;
  room: string;
  room_number: string;
  room_type: string;
  stay_type: 'SHORT_REST' | 'OVERNIGHT' | 'LODGE';
  stay_type_display: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  status_display: string;
  source: string;
  check_in_date: string;
  check_in_time: string | null;
  expected_checkout: string;
  actual_checkout: string | null;
  num_nights: number;
  num_guests: number;
  room_rate: string;
  total_amount: string;
  amount_paid: string;
  balance_due: string;
  total_room_charges: string;
  total_bar_charges: string;
  grand_total: string;
  is_fully_paid: boolean;
  discount_amount: string;
  discount_reason: string;
  notes: string;
  created_by_name: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_ref: string;
  booking: string | null;
  booking_ref: string | null;
  transaction_type: string;
  type_display: string;
  payment_method: string;
  method_display: string;
  status: string;
  status_display: string;
  amount: string;
  processed_by_name: string;
  created_at: string;
}

export interface Expense {
  id: string;
  expense_ref: string;
  category: string;
  category_name: string;
  description: string;
  amount: string;
  vendor_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  status_display: string;
  logged_by_name: string;
  approved_by_name: string | null;
  expense_date: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  description: string;
  vendor_name?: string;
  expense_date: string;
  notes?: string;
}

export interface RoomAnalytics {
  room_dirty_durations: {
    room_number: string;
    avg_dirty_minutes: number;
    total_cleanings: number;
  }[];
  overall_avg_dirty_minutes: number;
  revenue_chart?: {
    date: string;
    revenue: number;
  }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateGuestData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface QuickBookData {
  guest_name: string;
  guest_phone: string;
  room_id: string;
  stay_type: 'SHORT_REST' | 'OVERNIGHT' | 'LODGE';
  num_nights: number;
  num_guests: number;
  payment_method: 'CASH' | 'TRANSFER' | 'POS' | 'PAYSTACK' | 'SPLIT';
  amount_paid: number;
  discount_amount?: number;
  discount_reason?: string;
  notes?: string;
}

export interface CreateExpenseData {
  category: string;
  description: string;
  amount: number;
  vendor_name?: string;
  expense_date: string;
}

// Inventory Types
export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category_name: string;
  vendor_name?: string;
  preferred_vendor?: string; // ID
  price: string;
  quantity: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  is_active: boolean;
}

export interface StockLog {
  id: string;
  product_name: string;
  action: 'RESTOCK' | 'SALE' | 'AUDIT' | 'LOSS' | 'RETURN';
  quantity_change: number;
  old_quantity: number;
  new_quantity: number;
  user_name: string;
  notes: string;
  created_at: string;
}

export interface ActiveBooking {
  id: string;
  booking_ref: string;
  room_number: string;
  guest_name: string;
}

export interface Order {
  id: string;
  reference: string;
  user_name: string;
  guest_name: string;
  total_amount: string;
  payment_method: string;
  status: string;
  notes: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface CreateOrderData {
  guest_name?: string;
  booking?: string; // Booking ID for room charges
  payment_method: string;
  notes?: string;
  items_data: { product_id: string; quantity: number }[];
}

// Shift Interface
export interface WorkShift {
  id: number;
  user: string; // ID
  user_name: string;
  status: 'OPEN' | 'CLOSED';
  start_time: string;
  end_time?: string;
  opening_balance: string;
  closing_balance?: string;
  system_cash_total: string;
  discrepancy?: string;
  notes: string;
}

// Export singleton instance
export const api = new ApiClient();
export default api;
