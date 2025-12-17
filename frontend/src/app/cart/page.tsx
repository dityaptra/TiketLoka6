"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Trash2, MapPin, Calendar, Loader2, ShoppingCart, 
  CheckCircle2, AlertCircle, Tag, ScanLine, Building2 
} from "lucide-react";

// Import Service, Context, & Utils
import { useAuth } from "@/src/context/AuthContext";
import { useCartContext } from "@/src/context/CartContext"; 
import { cartService } from "@/src/services/cartService"; // <--- Service Baru
import { CartItem } from "@/src/types"; // <--- Type Global
import { formatIDR, getImageUrl, formatDate } from "@/src/lib/utlis"; // Pastikan utils ini ada

export default function CartPage() {
  const { token, isLoading: authLoading } = useAuth();
  const { refreshCart } = useCartContext(); 
  const router = useRouter();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); 
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris"); 

  // --- 1. FETCH DATA (Pakai Service) ---
  const loadCartData = async () => {
    try {
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      console.error(error);
      // toast.error("Gagal memuat keranjang"); // Optional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (token) {
      loadCartData();
    } else {
      setLoading(false);
    }
  }, [token, authLoading]);

  // --- 2. CALCULATIONS (Memoized) ---
  const { totalAmount, totalItems } = useMemo(() => {
    let amount = 0;
    let count = 0;

    cartItems.forEach((item) => {
      if (selectedIds.includes(item.id)) {
        const itemPrice = item.destination.price * item.quantity;
        
        let addonsPrice = 0;
        if (item.addons && item.addons.length > 0) {
           const singleAddonTotal = item.addons.reduce((sum, ad) => sum + Number(ad.price), 0);
           addonsPrice = singleAddonTotal * item.quantity; 
        }

        amount += (itemPrice + addonsPrice);
        count += item.quantity;
      }
    });

    return { totalAmount: amount, totalItems: count };
  }, [cartItems, selectedIds]);

  // --- 3. HANDLERS ---

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((i) => i.id));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus item ini dari keranjang?")) return;
    
    try {
      // Panggil Service Delete
      await cartService.deleteItem(id);
      
      toast.success("Item dihapus");
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      refreshCart(); 
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCheckout = async () => {
    if (selectedIds.length === 0) return toast.error("Pilih item dulu!");
    
    setProcessing(true);
    try {
      // Panggil Service Checkout
      const res = await cartService.checkout({
        cart_ids: selectedIds,
        payment_method: paymentMethod
      });

      toast.success("Pesanan dibuat!");
      await refreshCart(); 
      router.push(`/payment/${res.booking_code}`); // Redirect ke halaman payment
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // --- RENDER UI (Sama persis, hanya cleaning sedikit) ---

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#0B2F5E]" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 text-center">
        <AlertCircle className="w-16 h-16 text-[#F57C00] mb-4" />
        <h2 className="text-xl font-bold mb-2">Anda belum login</h2>
        <Link href="/login" className="text-[#0B2F5E] underline font-bold">Login Sekarang</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] pb-20 font-sans text-gray-800">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-28">
        <h1 className="text-3xl font-bold text-[#0B2F5E] mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" /> Keranjang Saya
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Image src="https://placehold.co/400x300?text=Empty+Cart" width={300} height={200} alt="Empty" className="mx-auto mb-6 opacity-50" unoptimized />
            <h3 className="text-xl font-bold text-gray-400">Keranjang masih kosong</h3>
            <Link href="/" className="mt-6 inline-block bg-[#F57C00] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">
              Cari Wisata
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: ITEM LIST */}
            <div className="flex-1 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === cartItems.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 accent-[#0B2F5E] cursor-pointer"
                />
                <span className="font-bold text-gray-700">Pilih Semua ({cartItems.length})</span>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className={`bg-white p-4 md:p-6 rounded-2xl shadow-sm border transition-all ${selectedIds.includes(item.id) ? 'border-[#0B2F5E] ring-1 ring-[#0B2F5E]/10' : 'border-gray-100'}`}>
                  <div className="flex gap-4 items-start">
                    <div className="pt-8">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-5 h-5 accent-[#0B2F5E] cursor-pointer"
                        />
                    </div>

                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                        <Image 
                          src={getImageUrl(item.destination.image_url)} 
                          alt={item.destination.name} 
                          fill 
                          className="object-cover" 
                          unoptimized
                        />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-[#0B2F5E] line-clamp-1">{item.destination.name}</h3>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1 mb-3">
                            <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {formatDate(item.visit_date)}</div>
                            <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {item.destination.location}</div>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 text-sm">Tiket ({item.quantity}x)</span>
                            <span className="font-medium">{formatIDR(item.destination.price * item.quantity)}</span>
                        </div>

                        {item.addons && item.addons.length > 0 && (
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-3">
                                <p className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1"><Tag className="w-3 h-3"/> Add-ons:</p>
                                {item.addons.map((addon, idx) => (
                                    <div key={idx} className="flex justify-between text-xs text-gray-700 mb-1 last:mb-0">
                                        <span>+ {addon.name}</span>
                                        <span className="font-medium text-orange-600">{formatIDR(addon.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <p className="font-bold text-[#F57C00] text-lg">
                                {formatIDR(
                                    (item.destination.price * item.quantity) + 
                                    ((item.addons?.reduce((s, a) => s + Number(a.price), 0) || 0) * item.quantity)
                                )}
                            </p>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: SUMMARY */}
            <div className="lg:w-96 shrink-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-28">
                    <h3 className="font-bold text-xl text-[#0B2F5E] mb-6">Rincian Pembayaran</h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Total Item</span>
                            <span className="font-bold">{totalItems} Tiket</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-bold">{formatIDR(totalAmount)}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-2"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-[#0B2F5E]">Total Tagihan</span>
                            <span className="font-extrabold text-[#F57C00]">{formatIDR(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Metode Pembayaran</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div onClick={() => setPaymentMethod('qris')} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition ${paymentMethod === 'qris' ? 'border-[#F57C00] bg-orange-50 text-[#F57C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <ScanLine className="w-6 h-6"/>
                                <span className="text-xs font-bold">QRIS</span>
                            </div>
                            <div onClick={() => setPaymentMethod('bca')} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition ${paymentMethod === 'bca' ? 'border-[#F57C00] bg-orange-50 text-[#F57C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <Building2 className="w-6 h-6"/>
                                <span className="text-xs font-bold">BCA</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={processing || selectedIds.length === 0}
                        className="w-full bg-[#0B2F5E] text-white py-4 rounded-xl font-bold hover:bg-[#09254A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle2 className="w-5 h-5"/>}
                        {processing ? "Memproses..." : "Checkout Sekarang"}
                    </button>
                </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}