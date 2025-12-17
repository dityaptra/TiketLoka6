"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Tag,
  Check,
  Loader2,
  ShoppingCart,
  ScanLine,
  Building2,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import toast from "react-hot-toast";

// --- IMPORTS ---
import { useAuth } from "@/src/context/AuthContext";
import { useCartContext } from "@/src/context/CartContext";
import { useNotification } from "@/src/context/NotificationContext";
import axiosInstance from "@/src/lib/axios";
import { Destination } from "@/src/types/destination";

// Import Utils dari file yang sudah Anda update
import {
  formatIDR,
  formatDayName,
  formatDayNumber,
  formatMonthYear,
  isSameDate,
  formatDateISO,
  isHoliday,
  getDaysInMonth, // Pastikan ini ada di utils.ts
} from "@/src/lib/utlis";

interface BookingCardProps {
  destination: Destination;
}

export default function BookingCard({ destination }: BookingCardProps) {
  const { token } = useAuth();
  const router = useRouter();
  const { refreshCart } = useCartContext();
  const { addNotification } = useNotification();

  // --- STATE ---
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState<number[]>([]);
  
  // State untuk Navigasi Bulan (Default: Bulan Sekarang)
  const [viewDate, setViewDate] = useState(new Date());

  // UI States
  const [addingToCart, setAddingToCart] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris");

  // --- CALENDAR LOGIC (GRID VIEW) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset jam agar komparasi tanggal akurat

  // 1. Ambil semua hari dalam bulan yang sedang dilihat
  const daysInView = useMemo(() => {
    return getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  // 2. Fungsi Ganti Bulan (Next/Prev)
  const handleChangeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  // 3. Cek apakah bulan yang dilihat adalah bulan sekarang (untuk disable tombol prev)
  const isCurrentMonth = 
    viewDate.getMonth() === today.getMonth() && 
    viewDate.getFullYear() === today.getFullYear();

  // --- PRICING LOGIC ---
  const total = useMemo(() => {
    const basePrice = Number(destination.price) * qty;
    const addonPrice = addons.reduce((acc, id) => {
      const item = destination.addons?.find((a) => a.id === id);
      return acc + Number(item?.price || 0);
    }, 0) * qty;
    return basePrice + addonPrice;
  }, [destination.price, qty, addons, destination.addons]);

  // --- HANDLERS ---
  const toggleAddon = (id: number) => {
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Silakan login dulu");
      return router.push("/login");
    }
    if (!selectedDate) return toast.error("Pilih tanggal kunjungan!");

    setAddingToCart(true);
    try {
      await axiosInstance.post("/cart", {
        destination_id: destination.id,
        quantity: qty,
        visit_date: formatDateISO(selectedDate),
        addons: addons,
      });
      toast.success("Berhasil masuk keranjang!");
      await refreshCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal masuk keranjang");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const response = await axiosInstance.post("/buy-now", {
        destination_id: destination.id,
        quantity: qty,
        visit_date: selectedDate ? formatDateISO(selectedDate) : "",
        addons: addons,
        payment_method: paymentMethod,
      });
      toast.success("Pesanan dibuat!");
      addNotification("transaction", "Menunggu Pembayaran", `Pesanan ${destination.name} dibuat.`);
      router.push(`/payment/${response.data.booking_code}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses pesanan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="sticky top-28 bg-white border border-gray-200 rounded-3xl p-6 shadow-xl shadow-gray-200/50">
      
      {/* 1. Header Harga */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Mulai Dari</p>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-extrabold text-[#F57C00]">
            {formatIDR(Number(destination.price))}
          </div>
          <span className="text-sm text-gray-400 font-medium mb-1.5">/ orang</span>
        </div>
      </div>

      {/* 2. Calendar UI (Grid View dengan Navigasi Bulan) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-4 h-4 text-[#F57C00]" />
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Pilih Tanggal Kunjungan
          </label>
        </div>

        {/* Navigasi Bulan */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 mb-3 border border-gray-100">
          <button 
            onClick={() => handleChangeMonth(-1)} 
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-[#0B2F5E] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-extrabold text-[#0B2F5E] tracking-wide uppercase">
            {formatMonthYear(viewDate)}
          </span>
          
          <button 
            onClick={() => handleChangeMonth(1)} 
            className="p-1.5 rounded-lg hover:bg-white text-gray-500 hover:text-[#0B2F5E] transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid Kalender (4 Kolom sesuai request) */}
        <div className="grid grid-cols-4 gap-2">
          {daysInView.map((date, index) => {
            const isSelected = selectedDate ? isSameDate(date, selectedDate) : false;
            const isRedDate = isHoliday(date); // Cek tanggal merah dari utils
            const isPast = date < today; // Cek tanggal lewat

            return (
              <button
                key={index}
                onClick={() => !isPast && setSelectedDate(date)}
                disabled={isPast}
                className={`
                  flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-200 select-none
                  ${isPast 
                    ? "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed grayscale" // Disabled
                    : isSelected
                      ? "bg-[#0B2F5E] border-[#0B2F5E] text-white shadow-md ring-2 ring-blue-100 transform scale-105 z-10" // Selected
                      : isRedDate
                        ? "bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm" // Holiday
                        : "bg-white border-gray-200 hover:border-[#F57C00] hover:bg-orange-50" // Normal
                  }
                `}
              >
                <span className={`text-[10px] font-bold uppercase mb-0.5 ${
                  isSelected ? "text-blue-200" : isRedDate && !isPast ? "text-red-400" : "text-gray-400"
                }`}>
                  {formatDayName(date)}
                </span>
                <span className={`text-lg font-extrabold leading-none ${
                  isSelected ? "text-white" : isRedDate && !isPast ? "text-red-500" : "text-gray-700"
                }`}>
                  {formatDayNumber(date)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Jumlah Peserta */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-700 uppercase mb-3 block">Jumlah Peserta</label>
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-xl border border-gray-200">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-gray-600 shadow-sm border border-gray-100 hover:text-[#F57C00] transition" disabled={qty <= 1}>
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-gray-800 text-lg">{qty} Orang</span>
          <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center bg-[#0B2F5E] rounded-lg text-white shadow-sm hover:bg-[#09254A] transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Addons */}
      {destination.addons && destination.addons.length > 0 && (
        <div className="mb-8 space-y-3">
          <label className="text-xs font-bold text-gray-700 flex gap-1 items-center uppercase"><Tag className="w-3 h-3"/> Tambahan</label>
          <div className="space-y-2">
            {destination.addons.map((a) => {
              const active = addons.includes(a.id);
              return (
                <div key={a.id} onClick={() => toggleAddon(a.id)} className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition select-none ${active ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex gap-3 items-center">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${active ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}>
                      {active && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{a.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[#F57C00] bg-orange-50 px-2 py-1 rounded-md">+{formatIDR(Number(a.price))}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Total & Buttons */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex justify-between items-end mb-6">
          <span className="font-medium text-gray-500 text-sm mb-1">Total Pembayaran</span>
          <span className="font-extrabold text-2xl text-[#0B2F5E]">{formatIDR(total)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAddToCart} disabled={addingToCart} className="flex-1 flex flex-col items-center justify-center gap-1 border-2 border-[#F57C00] text-[#F57C00] py-3 rounded-xl font-bold hover:bg-orange-50 transition active:scale-[0.98] disabled:opacity-50">
            {addingToCart ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShoppingCart className="w-5 h-5"/>}
            <span className="text-[10px] font-extrabold uppercase tracking-wide">Keranjang</span>
          </button>
          <button onClick={() => { if(!token) { toast.error("Login dulu"); return router.push('/login'); } if(!selectedDate) return toast.error('Pilih tanggal!'); setModalOpen(true); }} className="flex-[2.5] bg-[#0B2F5E] text-white py-3 rounded-xl font-bold hover:bg-[#09254A] shadow-lg shadow-blue-900/20 active:scale-[0.98] transition flex flex-col items-center justify-center gap-1">
            <span className="text-base">Pesan Sekarang</span>
            <span className="text-[10px] font-medium opacity-80">Proses Cepat & Aman</span>
          </button>
        </div>
      </div>

      {/* Modal Payment */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#0B2F5E] px-6 py-5 flex justify-between text-white font-bold items-center shrink-0">
              <span className="flex items-center gap-2 text-lg"><CheckCircle className="w-6 h-6 text-green-400"/> Konfirmasi</span>
              <button onClick={() => setModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Rincian Pesanan */}
              <div className="bg-gray-50 p-5 rounded-2xl mb-6 space-y-3 border border-gray-200">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tanggal</span><span className="font-bold text-gray-800">{selectedDate ? formatDateISO(selectedDate) : "-"}</span></div>
                <div className="border-b border-gray-200 border-dashed"></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tiket ({qty}x)</span><span className="font-medium text-gray-800">{formatIDR(Number(destination.price) * qty)}</span></div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center"><span className="font-bold text-gray-700">Total</span><span className="font-extrabold text-xl text-[#F57C00]">{formatIDR(total)}</span></div>
              </div>
              
              {/* Payment Methods */}
              <div className="space-y-3 mb-8">
                 <div onClick={() => setPaymentMethod('qris')} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${paymentMethod === 'qris' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]' : 'border-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'qris' ? 'border-[#F57C00]' : 'border-gray-300'}`}>{paymentMethod === 'qris' && <div className="w-2.5 h-2.5 bg-[#F57C00] rounded-full"/>}</div>
                    <div><div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><ScanLine size={18}/> QRIS</div><p className="text-[10px] text-gray-500">Gopay, OVO, Dana</p></div>
                 </div>
                 <div onClick={() => setPaymentMethod('bca')} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${paymentMethod === 'bca' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]' : 'border-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'bca' ? 'border-[#F57C00]' : 'border-gray-300'}`}>{paymentMethod === 'bca' && <div className="w-2.5 h-2.5 bg-[#F57C00] rounded-full"/>}</div>
                    <div><div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><Building2 size={18}/> Transfer Bank</div><p className="text-[10px] text-gray-500">Cek Manual</p></div>
                 </div>
              </div>

              <button onClick={handleCheckout} disabled={processing} className="w-full bg-[#0B2F5E] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#09254A] transition active:scale-[0.98] flex justify-center items-center gap-2">
                {processing ? <><Loader2 className="animate-spin"/> Memproses...</> : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}