"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Loader2, RefreshCcw, Clock, X } from "lucide-react";
import { adminService } from "@/src/services/adminService"; // <--- Service Baru
import { AdminBooking, PaginationMeta } from "@/src/types";

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // STATE FILTER
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // --- FETCH DATA ---
  async function fetchBookings() {
    if (!token) return;

    setLoading(true);
    try {
      // ✅ CLEAN CODE: Panggil Service
      const result = await adminService.getBookings({
        page,
        per_page: 5,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      setBookings(result.data);
      setMeta(result.meta);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- EFFECTS ---
  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [page, startDate, endDate, token]);

  // --- HANDLERS ---
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // --- RENDER ---
  return (
    <div className="space-y-8">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <p className="text-sm text-gray-500 mt-1">Pantau semua data pemesanan tiket.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-2 border-r border-gray-200">
            <Clock size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase">Periode</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="text-sm border-none outline-none text-gray-600 cursor-pointer bg-transparent"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="text-sm border-none outline-none text-gray-600 cursor-pointer bg-transparent"
          />
          {(startDate || endDate) && (
            <button onClick={handleReset} className="p-1 hover:bg-gray-100 rounded-full text-red-500 transition">
              <X size={16} />
            </button>
          )}
          <button onClick={fetchBookings} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 ml-1 border-l border-gray-100 pl-2" title="Refresh Data">
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="animate-spin text-[#0B2F5E]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-center">No</th>
                  <th className="px-6 py-3">Kode Booking</th>
                  <th className="px-6 py-3">Destinasi</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3 text-center">Kapasitas</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length > 0 ? (
                  bookings.map((item, index) => {
                    const itemsPerPage = meta?.per_page || 5;
                    const rowNumber = meta ? (meta.current_page - 1) * itemsPerPage + (index + 1) : index + 1;
                    const destName = item.details?.[0]?.destination?.name || "Unknown";
                    const pax = item.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/50 transition">
                        <td className="px-6 py-4 text-center font-bold text-gray-600">{rowNumber}</td>
                        <td className="px-6 py-4 font-mono font-medium text-[#0B2F5E]">{item.booking_code}</td>
                        <td className="px-6 py-4"><span className="font-bold text-gray-800">{destName}</span></td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.user.name}</div>
                          <div className="text-xs text-gray-400">{item.user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{pax} Orang</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          Rp {Number(item.grand_total).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      Tidak ada data transaksi pada periode ini.<br />
                      <button onClick={handleReset} className="text-[#0B2F5E] font-bold text-xs mt-2 hover:underline">Reset Filter</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-bold">{meta.from}-{meta.to}</span> dari {meta.total} data
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition text-gray-600 text-xs font-bold"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1.5 bg-[#0B2F5E] text-white border border-[#0B2F5E] rounded-lg text-xs font-bold shadow-sm">
              {page}
            </span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition text-gray-600 text-xs font-bold"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-komponen Status Badge
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-100 text-green-700 border-green-200",
    paid: "bg-green-100 text-green-700 border-green-200", // Handle paid juga
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const labels: Record<string, string> = {
    success: "Lunas",
    paid: "Lunas",
    pending: "Menunggu",
    failed: "Gagal",
    cancelled: "Batal",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}