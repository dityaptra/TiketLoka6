"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Minus, Plus, Tag, Check, Loader2, ShoppingCart, ScanLine, Building2, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/src/context/AuthContext";
import { useCartContext } from "@/src/context/CartContext";
import { useNotification } from "@/src/context/NotificationContext";
import axiosInstance from "@/src/lib/axios"; // Gunakan axios yg sudah kita buat
import { Destination } from "@/src/types/destination";

export default function BookingCard({ destination }: { destination: Destination }) {
  const { token } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState<number[]>([]);

  // STATE MODAL & PAYMENT
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris"); // Default QRIS
  const [processing, setProcessing] = useState(false);

  // CONTEXT HOOKS
  const { refreshCart } = useCartContext();
  const { addNotification } = useNotification();

  const [addingToCart, setAddingToCart] = useState(false);

  const total =
  Number(destination.price) * qty + // Pastikan harga dasar jadi Number
  addons.reduce(
    (acc, id) =>
      acc + Number(destination.addons?.find((a) => a.id === id)?.price || 0), // <--- Tambahkan Number()
    0
  ) *
    qty;

  const toggleAddon = (id: number) =>
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // LOGIKA ADD TO CART
const handleAddToCart = async () => {
    if (!token) {
      toast.error("Silakan login dulu");
      return router.push("/login");
    }
    if (!date) return toast.error("Pilih tanggal kunjungan!");

    setAddingToCart(true);
    try {
      // Lebih pendek & rapi pakai axios
      await axiosInstance.post("/cart", {
        destination_id: destination.id,
        quantity: qty,
        visit_date: date,
        addons: addons,
      });

      toast.success("Berhasil masuk keranjang!");
      await refreshCart();
    } catch (error: any) {
      // Axios menyimpan pesan error di error.response.data.message
      toast.error(error.response?.data?.message || "Gagal menambahkan ke keranjang");
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
        visit_date: date,
        addons: addons,
        payment_method: paymentMethod,
      });

      toast.success("Pesanan dibuat!");
      addNotification("transaction", "Menunggu Pembayaran", `Pesanan ${destination.name} dibuat.`);
      
      // Redirect ke halaman payment
      router.push(`/payment/${response.data.booking_code}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses pesanan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div className="text-3xl font-extrabold text-[#F57C00]">
          Rp {destination.price.toLocaleString("id-ID")}
        </div>
        <span className="text-sm text-gray-400 font-medium">/ pax</span>
      </div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-700 uppercase">
            Tanggal
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B2F5E] cursor-pointer"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 uppercase">
            Jumlah
          </label>
          <div className="flex justify-between items-center p-1 bg-gray-50 rounded-xl border border-gray-200">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-2 hover:text-[#F57C00]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-800">{qty} Orang</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="p-2 bg-[#0B2F5E] text-white rounded-lg hover:bg-[#09254A]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        {destination.addons?.length! > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex gap-1 items-center">
              <Tag className="w-3 h-3" /> Add-ons
            </label>
            {destination.addons?.map((a) => (
              <div
                key={a.id}
                onClick={() => toggleAddon(a.id)}
                className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition select-none ${
                  addons.includes(a.id)
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-300"
                }`}
              >
                <div className="flex gap-2 items-center">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      addons.includes(a.id) ? "bg-blue-500 border-blue-500" : ""
                    }`}
                  >
                    {addons.includes(a.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {a.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#F57C00]">
                  +Rp {Number(a.price).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <span className="font-medium text-gray-500">Total</span>
          <span className="font-extrabold text-xl text-gray-900">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-[#F57C00] text-[#F57C00] py-3.5 rounded-xl font-bold hover:bg-[#F57C00] hover:text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {addingToCart ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5 group-hover:text-white transition-colors" />
          )}
          <span className="text-sm md:text-base">Keranjang</span>
        </button>

        <button
          onClick={() => {
            if (!token) {
              toast.error("Login dulu");
              return router.push("/login");
            }
            if (!date) return toast.error("Pilih tanggal!");
            setModalOpen(true);
          }}
          className="flex-[1.5] bg-[#0B2F5E] text-white py-3.5 rounded-xl font-bold hover:bg-[#09254A] shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all duration-300 text-sm md:text-base"
        >
          Pesan Sekarang
        </button>
      </div>

      {/* MODAL KONFIRMASI PEMESANAN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 shadow-2xl">
            <div className="bg-[#0B2F5E] px-6 py-4 flex justify-between text-white font-bold items-center">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" /> Konfirmasi
              </span>
              <button onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Rincian Harga */}
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Tiket ({qty}x)</span>
                  <span className="font-medium">
                    Rp {(destination.price * qty).toLocaleString("id-ID")}
                  </span>
                </div>
                {addons.length > 0 && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Add-ons</span>
                    <span className="font-medium">
                      Rp{" "}
                      {(total - destination.price * qty).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* PILIH METODE BAYAR */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Metode Pembayaran
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "qris"
                        ? "border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]/30"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === "qris"
                          ? "border-[#F57C00]"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "qris" && (
                        <div className="w-3 h-3 bg-[#F57C00] rounded-full" />
                      )}
                    </div>
                    <ScanLine className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">
                      QRIS (Instant)
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("bca")}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "bca"
                        ? "border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]/30"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === "bca"
                          ? "border-[#F57C00]"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "bca" && (
                        <div className="w-3 h-3 bg-[#F57C00] rounded-full" />
                      )}
                    </div>
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">
                      Bank Transfer (BCA)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                <span>Total Bayar</span>
                <span className="text-[#F57C00]">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-[#0B2F5E] text-white py-3 rounded-xl font-bold hover:bg-[#09254A] transition active:scale-[0.98]"
              >
                {processing ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
