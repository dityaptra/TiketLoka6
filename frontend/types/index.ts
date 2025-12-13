// Tambahkan interface Category jika belum ada
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Destination {
  id: number;
  name: string;
  slug: string; // <--- WAJIB DITAMBAHKAN
  location: string;
  image_url: string | null;
  price: number;
  description?: string;
  category_id?: number;
  category?: Category; // Opsional, karena kadang data API mengembalikan relasi kategori
  is_active?: boolean | number;
}

export interface BookingDetail {
  id: number;
  destination: Destination;
  quantity: number;
  visit_date: string;
  subtotal: number;
}

export interface Booking {
  id: number;
  booking_code: string;
  grand_total: number;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  paid_at: string;
  qr_string: string;
  created_at: string;
  details: BookingDetail[];
}

export interface CartItem {
  id: number;
  user_id: number;
  destination_id: number;
  quantity: number;
  visit_date: string;
  total_price: number;
  destination: Destination;
}