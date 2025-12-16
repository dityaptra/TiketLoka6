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
  category?: { name: string };
  images?: { id: number; image_path: string }[];
  inclusions?: { id: number; name: string }[];
  addons?: { id: number; name: string; price: number }[];
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
export interface CartItem {
  id: number;
  user_id: number;
  destination_id: number;
  quantity: number;
  visit_date: string;
  total_price: number;
  destination: Destination;
  // Opsional: Jika cart menyimpan addons yang dipilih
  addons?: number[]; 
}