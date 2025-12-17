<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\BookingDetail;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // Tambahkan ini untuk DB::raw

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        // 1. FILTER TANGGAL (Pastikan Timezone sesuai, misal WIB)
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfDay();
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : $endDate->copy()->subDays(6)->startOfDay();

        // Helper filter tanggal
        $applyDateFilter = function($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        };

        // --- KONFIGURASI STATUS ---
        // Jika pakai Midtrans, status sukses bisa 'capture', 'settlement', atau 'success'
        // Gunakan whereIn agar lebih aman menangkap berbagai jenis status sukses
        $successStatuses = ['success', 'paid', 'settlement']; 
        
        // 2. STATISTIK KARTU
        // Total Revenue (Hanya yang sukses)
        $revenueQuery = Booking::whereIn('status', $successStatuses);
        $applyDateFilter($revenueQuery);
        $totalRevenue = $revenueQuery->sum('grand_total');

        // Total Transaksi (Bisa sertakan pending jika ingin melihat traffic, tapi biasanya sukses saja)
        $bookingsQuery = Booking::whereIn('status', $successStatuses);
        $applyDateFilter($bookingsQuery);
        $totalBookings = $bookingsQuery->count();

        // Tiket Terjual
        $ticketsQuery = BookingDetail::whereHas('booking', function ($q) use ($startDate, $endDate, $successStatuses) {
            $q->whereIn('status', $successStatuses)
              ->whereBetween('created_at', [$startDate, $endDate]);
        });
        $totalTicketsSold = $ticketsQuery->sum('quantity');

        // Total User (Pelanggan)
        $totalUsers = User::where('role', 'customer')->count();

        // 3. GRAFIK 1: TREN PENDAPATAN
        $chartRevenue = [];
        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);

        $revenueData = Booking::whereIn('status', $successStatuses)
            ->whereBetween('created_at', [$startDate, $endDate])
            // PENTING: DATE() hanya jalan di MySQL. Jika pakai PostgreSQL gunakan Syntax lain.
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        foreach ($period as $date) {
            $dateKey = $date->format('Y-m-d');
            $chartRevenue[] = [
                'date' => $date->format('d M'),
                'total' => (int) ($revenueData[$dateKey] ?? 0) // Cast ke int
            ];
        }

        // 4. GRAFIK 2: WISATA TERPOPULER
        $popularRaw = BookingDetail::whereHas('booking', function ($q) use ($startDate, $endDate, $successStatuses) {
                $q->whereIn('status', $successStatuses)
                  ->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->join('destinations', 'booking_details.destination_id', '=', 'destinations.id')
            ->select('destinations.name', DB::raw('SUM(booking_details.quantity) as total_tickets'))
            ->groupBy('destinations.id', 'destinations.name') // Group by ID juga agar kompatibel mode Strict MySQL
            ->orderByDesc('total_tickets')
            ->limit(5)
            ->get();

        $chartPopular = $popularRaw->map(function($item) {
            return [
                'name' => $item->name,
                'total' => (int)$item->total_tickets
            ];
        });

        // 5. DATA TABEL TERBARU (Disini kita BISA tampilkan pending agar admin tau ada order baru)
        $recentQuery = Booking::with(['user', 'details.destination']);
        $applyDateFilter($recentQuery);
        // Hapus filter status sukses disini jika ingin melihat pesanan yang baru masuk (pending)
        $recentBookings = $recentQuery->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_bookings' => $totalBookings,
                'total_tickets_sold' => (int) $totalTicketsSold,
                'total_users' => $totalUsers,
                'recent_bookings' => $recentBookings,
                'chart_revenue' => $chartRevenue,
                'chart_popular' => $chartPopular 
            ]
        ]);
    }
}