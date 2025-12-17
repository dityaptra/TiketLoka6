// src/types/index.ts

// --- USER (UPDATED: Harus lengkap agar AuthContext tidak error) ---
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;          // Wajib untuk middleware admin
  phone_number: string;  // Wajib untuk kontak booking
  avatar_url?: string;   // Opsional untuk navbar
  email_verified_at?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// --- CATEGORY ---
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string; 
}

// --- SUB-INTERFACES ---
export interface DestinationImage {
  id: number;
  image_path: string;
}

export interface Inclusion {
  id: number;
  name: string;
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  image?: string | null;
  created_at: string;
  user: User; // Relasi ke User
}

// --- DESTINATION ---
export interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  
  // ✅ TAMBAHAN PENTING UNTUK ADMIN:
  category_id: number;          // Wajib untuk Edit Form
  is_active: boolean | number;  // Wajib untuk Toggle Status
  meta_title?: string;          // SEO
  meta_description?: string;    // SEO
  meta_keywords?: string;       // SEO

  // Relasi
  category?: { id: number; name: string };
  images?: { id: number; image_path: string }[];
  inclusions?: { id: number; name: string }[];
  addons?: { id: number; name: string; price: number }[];
  
  // Reviews (Opsional)
  reviews?: {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    image?: string;
    user?: {
      name: string;
      avatar_url?: string;
    };
  }[];
}

// --- BOOKING ---
export interface BookingDetail {
  id: number;
  destination: Destination;
  quantity: number;
  visit_date: string;
  subtotal: number;
  
  // Fitur Scan QR
  ticket_code?: string;
  redeemed_at?: string | null;
}

export interface Booking {
  id: number;
  booking_code: string;
  grand_total: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  payment_method: string;
  paid_at: string | null;
  qr_string: string;
  created_at: string;
  details: BookingDetail[];
  user?: User; 
}

// --- CART ---
export interface CartAddon {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  destination: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    location: string;
  };
  quantity: number;
  visit_date: string;
  addons?: CartAddon[];
}

export interface CheckoutRequest {
  cart_ids: number[];
  payment_method: string;
}

export interface CheckoutResponse {
  message: string;
  booking_code: string;
  snap_token?: string; // Opsional jika nanti pakai Midtrans Snap
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface AdminBooking {
  id: number;
  booking_code: string;
  grand_total: number;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  details: {
    destination: {
      name: string;
    };
    quantity: number;
  }[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

export interface AdminBookingResponse {
  data: AdminBooking[];
  meta: PaginationMeta; // Sesuaikan dengan struktur JSON backend Anda (bisa jadi meta terpisah atau langsung di root)
}

export interface CreateDestinationInput {
  name: string;
  category_id: string; // atau number, sesuaikan dengan form select value
  description: string;
  price: string;
  location: string;
  image: File | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface UpdateDestinationInput {
  name: string;
  category_id: string | number;
  description: string;
  price: string | number;
  location: string;
  is_active: boolean; // Tambahan status
  image?: File | null; // Opsional (boleh null jika tidak ganti gambar)
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface DashboardData {
  total_revenue: number;
  total_bookings: number;
  total_tickets_sold: number;
  total_users: number;
  chart_revenue: { date: string; total: number }[];
  chart_popular: { name: string; total: number }[];
}