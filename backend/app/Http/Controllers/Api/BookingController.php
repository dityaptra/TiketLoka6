<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    // Beli dari keranjang
    public function checkout(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'cart_ids' => 'required|array|min:1',
            'cart_ids.*' => 'integer|exists:carts,id',
        ]);

        $userId = $request->user()->id;

        // Ambil item keranjang SESUAI YANG DIPILIH user & MILIK user tersebut
        $carts = Cart::with('destination')
            ->where('user_id', $userId)
            ->whereIn('id', $request->cart_ids)
            ->get();

        // Validasi: Jika user mencoba checkout ID cart orang lain / cart kosong
        if ($carts->isEmpty()) {
            return response()->json(['message' => 'Tidak ada item valid yang dipilih'], 400);
        }

        return DB::transaction(function () use ($request, $carts, $userId) {

            // Hitung Total
            $total = 0;
            foreach ($carts as $cart) {
                $total += $cart->destination->price * $cart->quantity;
            }

            // Generate kode booking unique
            // Using a loop inside transaction to ensure uniqueness even under heavy load
            do {
                $bookingCode = Str::upper(Str::random(8));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            // Buat Transaksi
            $booking = Booking::create([
                'user_id' => $userId,
                'booking_code' => $bookingCode,
                'grand_total' => $total,
                'status' => 'success', // Simulasi langsung sukses
                'paid_at' => now(),
                'payment_method' => $request->payment_method,
                'qr_string' => $bookingCode,
            ]);

            // Kumpulkan ID cart yang berhasil diproses untuk dihapus nanti
            $processedCartIds = [];

            foreach ($carts as $cart) {
                $uniqueTicketCode = 'TKT-' . $cart->destination_id . '-' . Str::upper(Str::random(6));
                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'destination_id' => $cart->destination_id,
                    'quantity' => $cart->quantity,
                    'price_per_unit' => $cart->destination->price,
                    'subtotal' => $cart->destination->price * $cart->quantity,
                    'visit_date' => $cart->visit_date,
                    'ticket_code' => $uniqueTicketCode,
                ]);

                $processedCartIds[] = $cart->id;
            }

            // Hapus item yang dipilih dari keranjang
            Cart::whereIn('id', $processedCartIds)->delete();

            return response()->json([
                'message' => 'Transaksi berhasil',
                'booking_code' => $booking->booking_code,
                'data' => $booking
            ], 201);
        });
    }

    // Beli langsung (tanpa keranjang)
    public function buyNow(Request $request)
    {
        
        // Add validation for direct buy
        $request->validate([
            'destination_id' => 'required|exists:destinations,id',
            'quantity' => 'required|integer|min:1',
            'visit_date' => 'required|date',
            'payment_method' => 'required|string',
        ]);

        $userId = $request->user()->id;
        $destination = Destination::findOrFail($request->destination_id);
        return DB::transaction(function () use ($request, $userId, $destination) {

            $totalAmount = $destination->price * $request->quantity;
            
            // Generate kode booking unique
            do {
                $bookingCode = Str::upper(Str::random(8));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            $booking = Booking::create([
                'user_id' => $userId,
                'booking_code' => $bookingCode,
                'grand_total' => $totalAmount,
                'status' => 'success',
                'paid_at' => now(),
                'payment_method' => $request->payment_method,
                'qr_string' => $bookingCode,
            ]);

            $uniqueTicketCode = 'TKT-' . $destination->id . '-' . Str::upper(Str::random(6));

            // Booking detail
            BookingDetail::create([
                'booking_id' => $booking->id,
                'destination_id' => $destination->id,
                'quantity' => $request->quantity,
                'price_per_unit' => $destination->price,
                'subtotal' => $totalAmount,
                'visit_date' => $request->visit_date,
                'ticket_code' => $uniqueTicketCode,
            ]);

            return response()->json([
                'message' => 'Transaksi berhasil & Pembayaran terkonfirmasi otomatis',
                'booking_code' => $booking->booking_code,
                'data' => $booking
            ], 201);
        });
    }

    // Riwayat Transaksi User
    public function myBookings()
    {
        $bookings = Booking::with(['details.destination'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $bookings]);
    }

    // Detail Satu Transaksi (Untuk User melihat Booking ID)
    public function show($booking_code)
    {
        $booking = Booking::with(['details.destination', 'user'])
            ->where('booking_code', $booking_code)
            ->firstOrFail();

        // Keamanan: Pastikan yang lihat adalah pemilik atau admin
        // Check if user is authenticated before accessing role
        $user = Auth::user();
        if ($booking->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $booking]);
    }

    // Lihat Semua Transaksi (Bisa Filter Status)
    public function adminIndex(Request $request)
    {
        // Eager load details.destination is often useful for admin views
        $query = Booking::with('user');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter tanggal
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }
        
        // Search functionality if needed
        if ($request->has('search')) {
             $search = $request->search;
             $query->where(function($q) use ($search) {
                 $q->where('booking_code', 'like', "%{$search}%")
                   ->orWhereHas('user', function($u) use ($search) {
                       $u->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                   });
             });
        }

        // Pagination is usually better for admin lists
        $perPage = $request->input('per_page', 5);
        $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($bookings); // Returns pagination meta data too
    }
}