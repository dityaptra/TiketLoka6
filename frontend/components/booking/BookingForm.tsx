'use client';

import { useState, useEffect } from 'react';
import { Ticket, Minus, Plus, ShoppingCart, Calendar } from 'lucide-react';
import BookingModal from './BookingModal';
import { Destination } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BookingForm({ destination }: { destination: Destination }) {
  const router = useRouter();
  const { token } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [visitDate, setVisitDate] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // --- LOGIKA DATE PICKER BARU ---
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate 14 hari ke depan dari hari ini
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) { // Ubah angka 14 jika ingin lebih banyak hari
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    setAvailableDates(dates);
  }, []);

  // Helper: Format tanggal untuk UI (Contoh: "Sen", "8 Des")
  const formatDateUI = (date: Date) => {
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
    return { dayName, dayNum, monthName };
  };

  // Helper: Format tanggal untuk Value Database (YYYY-MM-DD)
  const formatDateValue = (date: Date) => {
    // Mengatasi masalah timezone offset agar tidak mundur sehari
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };
  // --------------------------------

  const totalPrice = destination.price * quantity;

  const handleBook = () => {
    if (!token) {
        alert("Silakan login terlebih dahulu untuk memesan!");
        router.push('/login');
        return;
    }
    if (!visitDate) {
      alert('Silakan pilih tanggal kunjungan dulu!');
      return;
    }
    setIsOpen(true);
  };

  const handleAddToCart = async () => {
    if (!token) {
        if(confirm("Anda harus login untuk menambah ke keranjang. Login sekarang?")) {
            router.push('/login');
        }
        return;
    }
    if (!visitDate) {
      alert('Silakan pilih tanggal kunjungan dulu!');
      return;
    }

    setIsAddingToCart(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination_id: destination.id,
          quantity: quantity,
          visit_date: visitDate,
        }),
      });

      if (res.ok) {
        alert('Berhasil masuk keranjang!');
        router.refresh(); 
      } else {
        const json = await res.json();
        if (res.status === 401) {
            alert("Sesi habis, silakan login ulang.");
            router.push('/login');
            return;
        }
        alert('Gagal: ' + (json.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menghubungi server');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <div className="sticky top-24 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-6">
        
        {/* Header Harga */}
        <div className="text-center border-b border-dashed border-gray-200 pb-6 mb-6">
          <p className="text-gray-500 text-sm mb-1 font-medium">Harga Tiket Masuk</p>
          <p className="text-4xl font-extrabold text-[#F57C00]">
            Rp {Number(destination.price).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 mt-1">per orang</p>
        </div>

        <div className="space-y-6">
           
           {/* --- DATE PICKER CARD STYLE --- */}
           <div>
             <label className="text-sm font-bold text-[#0B2F5E] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Pilih Tanggal Kunjungan
             </label>
             
             <div className="grid grid-cols-4 gap-2">
                {availableDates.map((date, idx) => {
                    const { dayName, dayNum, monthName } = formatDateUI(date);
                    const value = formatDateValue(date);
                    const isSelected = visitDate === value;
                    
                    // Style khusus hari Minggu (opsional)
                    const isSunday = date.getDay() === 0;

                    return (
                        <button
                            key={idx}
                            onClick={() => setVisitDate(value)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
                                isSelected 
                                ? 'bg-[#0B2F5E] border-[#0B2F5E] text-white shadow-md scale-105' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#F57C00] hover:shadow-sm'
                            }`}
                        >
                            <span className={`text-[10px] font-medium uppercase ${!isSelected && isSunday ? 'text-red-500' : ''}`}>
                                {dayName}
                            </span>
                            <span className="text-sm font-bold mt-0.5">
                                {dayNum} {monthName}
                            </span>
                        </button>
                    )
                })}
             </div>
           </div>
           {/* ----------------------------- */}

          {/* Input Jumlah Tiket */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
             <span className="text-sm font-bold text-gray-600">Jumlah Tiket</span>
             <div className="flex items-center gap-3">
                <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
                >
                    <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-[#0B2F5E] shadow-sm flex items-center justify-center hover:bg-blue-900 transition"
                >
                    <Plus className="w-4 h-4 text-white" />
                </button>
             </div>
          </div>

          <div className="flex justify-between items-center text-sm font-medium text-gray-600 px-1 pt-2">
             <span>Total Pembayaran:</span>
             <span className="text-xl font-extrabold text-[#F57C00]">
                Rp {totalPrice.toLocaleString('id-ID')}
             </span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
                onClick={handleBook}
                className="w-full bg-[#F57C00] hover:bg-[#E65100] text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <Ticket className="w-5 h-5" /> Pesan Sekarang
            </button>
            
            <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-white border-2 border-[#0B2F5E] text-[#0B2F5E] hover:bg-blue-50 font-bold text-lg py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
                {isAddingToCart ? 'Menambahkan...' : (
                    <>
                        <ShoppingCart className="w-5 h-5" /> + Keranjang
                    </>
                )}
            </button>
          </div>

        </div>
      </div>

      <BookingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        destination={destination}
        selectedDate={visitDate}
        quantity={quantity}
      />
    </>
  );
}