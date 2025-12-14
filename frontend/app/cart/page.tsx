'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
// Import SweetAlert2
import Swal from 'sweetalert2'; 

import { 
  Trash2, 
  Calendar, 
  Loader2, 
  ShoppingCart, 
  CheckSquare, 
  Square, 
  Ticket, 
  ShieldCheck, 
  ArrowLeft,
  QrCode,
  Landmark,
  Wallet,
  Tag
} from 'lucide-react';
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  
  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // --- CONFIG SWEETALERT TOAST (Notifikasi Kecil) ---
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  // --- HELPER IMAGE ---
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
  };

  // 1. Fetch Data
  useEffect(() => {
    if (authLoading) return;

    const fetchCart = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://127.0.0.1:8000/api/cart', {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setCarts(json.data);
        else if (res.status === 401) router.push('/login');
      } catch (error) {
        console.error(error);
        Toast.fire({ icon: 'error', title: 'Gagal memuat keranjang' });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token, authLoading, router]);

  // 2. Logic Selection
  const isAllSelected = carts.length > 0 && selectedIds.length === carts.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(carts.map(item => item.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 3. Logic Hapus dengan SweetAlert Confirm
  const handleDelete = async (id: number) => {
    // Tampilkan Dialog Konfirmasi
    const result = await Swal.fire({
      title: 'Hapus item?',
      text: "Item ini akan dihapus dari keranjang Anda.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/cart/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setCarts(prev => prev.filter(item => item.id !== id));
        setSelectedIds(prev => prev.filter(selId => selId !== id));
        
        // Notifikasi Sukses
        Toast.fire({
            icon: 'success',
            title: 'Item berhasil dihapus'
        });
      } else {
        throw new Error('Gagal menghapus');
      }
    } catch (error) {
      Swal.fire('Error', 'Terjadi kesalahan saat menghapus item.', 'error');
    }
  };

  // 4. Kalkulasi Total
  const { totalQty, subTotal, grandTotal } = useMemo(() => {
    const selectedItems = carts.filter(item => selectedIds.includes(item.id));
    const totalQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subTotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0);
    return { totalQty, subTotal, grandTotal: subTotal };
  }, [carts, selectedIds]);

  // 5. Checkout dengan SweetAlert
  const handleCheckout = async () => {
    // Validasi: Belum pilih item
    if (selectedIds.length === 0) {
        return Swal.fire({
            icon: 'warning',
            title: 'Belum ada item dipilih',
            text: 'Silakan centang minimal 1 tiket untuk melanjutkan pembayaran.',
            confirmButtonColor: '#F57C00',
            confirmButtonText: 'Oke, Mengerti'
        });
    }
    
    setIsCheckingOut(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/checkout', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart_ids: selectedIds, payment_method: paymentMethod })
      });

      const json = await res.json();

      if (res.ok) {
        // Sukses Checkout
        await Swal.fire({
            icon: 'success',
            title: 'Checkout Berhasil!',
            text: 'Mengalihkan ke halaman tiket...',
            timer: 1500,
            showConfirmButton: false,
            willClose: () => {
                router.push(`/tickets/${json.booking_code}`);
            }
        });
      } else {
        // Gagal Checkout (Response API Error)
        Swal.fire({
            icon: 'error',
            title: 'Checkout Gagal',
            text: json.message || 'Terjadi kesalahan pada sistem.',
            confirmButtonColor: '#0B2F5E'
        });
      }
    } catch (error) {
      // Error Koneksi
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Terputus',
        text: 'Gagal menghubungi server. Periksa koneksi internet Anda.',
        confirmButtonColor: '#0B2F5E'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#F57C00]"/>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-40">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-24 px-4 md:px-6">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#F57C00] transition-colors gap-1">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-[#0B2F5E]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B2F5E]">Keranjang Saya</h1>
        </div>

        {carts.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Ticket className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Keranjang Kosong</h3>
            <p className="text-gray-500 mb-8 text-center max-w-sm">Belum ada tiket wisata yang ditambahkan.</p>
            <Link href="/" className="px-8 py-3 bg-[#F57C00] hover:bg-[#E65100] text-white rounded-xl font-bold transition-all flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 relative">
            
            {/* --- LEFT SECTION: LIST ITEMS --- */}
            <div className="flex-1 space-y-4">
              
              {/* Select All Header */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm sticky top-20 z-10 lg:static">
                <div className="flex items-center gap-3 cursor-pointer select-none" onClick={toggleSelectAll}>
                    {isAllSelected ? <CheckSquare className="w-5 h-5 text-[#F57C00]" /> : <Square className="w-5 h-5 text-gray-300" />}
                    <span className="font-semibold text-gray-700 text-sm">Pilih Semua ({carts.length})</span>
                </div>
              </div>

              {/* Cart Items */}
              {carts.map((item) => (
                <div 
                    key={item.id} 
                    className={`group bg-white p-4 rounded-2xl border transition-all duration-200 flex gap-4
                    ${selectedIds.includes(item.id) 
                        ? 'border-[#F57C00] ring-1 ring-[#F57C00]/20' 
                        : 'border-gray-100 hover:border-gray-300'}`}
                >
                  {/* Checkbox */}
                  <div className="pt-8 cursor-pointer" onClick={() => toggleSelect(item.id)}>
                      {selectedIds.includes(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#F57C00]" />
                      ) : (
                          <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                      )}
                  </div>

                  {/* Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img 
                      src={getImageUrl(item.destination.image_url)} 
                      alt={item.destination.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800'; }}
                    />
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-[#0B2F5E] line-clamp-2 leading-snug">{item.destination.name}</h3>
                            <button 
                                onClick={() => handleDelete(item.id)} 
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                <Calendar className="w-3 h-3" /> {item.visit_date}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                <Ticket className="w-3 h-3" /> {item.quantity} Tiket
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                         <Tag className="w-3 h-3 text-[#F57C00]" />
                         <p className="text-[#F57C00] font-bold text-lg">Rp {item.total_price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- RIGHT SECTION: SUMMARY (Sticky) --- */}
            <div className="hidden lg:block lg:w-96">
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-28">
                    <h3 className="text-lg font-bold text-[#0B2F5E] mb-6 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#F57C00]"/> Ringkasan Belanja
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Total Item</span>
                            <span className="font-medium">{totalQty} Tiket</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">Rp {subTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Total Bayar</span>
                            <span className="font-bold text-xl text-[#F57C00]">Rp {grandTotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                             Metode Pembayaran
                        </p>
                        <div className="space-y-2">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="pay" value="qris" checked={paymentMethod === 'qris'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-[#F57C00] w-4 h-4"/>
                                <QrCode className={`w-5 h-5 ${paymentMethod === 'qris' ? 'text-[#F57C00]' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-gray-700">QRIS (Instant)</span>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'bca' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="pay" value="bca" checked={paymentMethod === 'bca'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-[#F57C00] w-4 h-4"/>
                                <Landmark className={`w-5 h-5 ${paymentMethod === 'bca' ? 'text-[#F57C00]' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-gray-700">Transfer Bank BCA</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={selectedIds.length === 0 || isCheckingOut}
                        className="w-full bg-[#0B2F5E] hover:bg-[#061A35] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-[0.98] transition-all"
                    >
                        {isCheckingOut ? <Loader2 className="animate-spin w-5 h-5"/> : (
                            <>
                                <ShieldCheck className="w-5 h-5" /> Bayar Sekarang
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- MOBILE STICKY BAR --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50">
                 <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <button onClick={() => setPaymentMethod('qris')} className={`flex-1 py-1.5 flex items-center justify-center gap-2 rounded-lg border text-xs font-bold ${paymentMethod === 'qris' ? 'bg-[#F57C00] text-white border-[#F57C00]' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <QrCode className="w-3 h-3" /> QRIS
                        </button>
                        <button onClick={() => setPaymentMethod('bca')} className={`flex-1 py-1.5 flex items-center justify-center gap-2 rounded-lg border text-xs font-bold ${paymentMethod === 'bca' ? 'bg-[#F57C00] text-white border-[#F57C00]' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <Landmark className="w-3 h-3" /> BCA
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500">Total Bayar</p>
                            <p className="font-bold text-lg text-[#F57C00]">Rp {grandTotal.toLocaleString('id-ID')}</p>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            disabled={selectedIds.length === 0 || isCheckingOut}
                            className="flex-1 bg-[#0B2F5E] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:bg-gray-300"
                        >
                            {isCheckingOut ? <Loader2 className="animate-spin w-5 h-5"/> : 'Checkout'}
                        </button>
                    </div>
                 </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}