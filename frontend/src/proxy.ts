import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Ambil token dari cookies
  const token = request.cookies.get('token')?.value;

  // 1. Cek Apakah User mau masuk ke halaman Admin / Cart / Tickets?
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/cart') ||
    request.nextUrl.pathname.startsWith('/tickets')
  ) {
    // Jika TIDAK ADA token, tendang ke Login
    if (!token) {
      // Redirect ke login, dan simpan URL tujuan agar nanti bisa balik lagi (opsional)
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Cek Apakah User yang SUDAH LOGIN mau masuk ke halaman Login/Register?
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')
  ) {
    // Jika ADA token, tendang balik ke Dashboard/Home
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi URL mana saja yang dicek
export const config = {
  matcher: [
    '/admin/:path*', 
    '/cart/:path*', 
    '/tickets/:path*',
    '/login', 
    '/register'
  ],
};