'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext'; 
import { useNotification } from '@/context/NotificationContext'; 
import Navbar from '@/components/layout/Navbar'; 
import { 
    MapPin, Loader2, Calendar, ArrowLeft, 
    Minus, Plus, X, CheckCircle, Check, Tag, Star, 
    User as UserIcon, Camera, ChevronLeft, ChevronRight, Info, 
    ShoppingCart, ScanLine, Building2 // <--- Tambah Icon Payment
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

// --- 1. TIPE DATA & HELPER ---
interface Destination {
    id: number; 
    name: string; 
    slug: string; 
    description: string; 
    price: number; 
    location: string; 
    image_url: string; 
    category?: { name: string };
    images?: { id: number; image_path: string }[]; 
    inclusions?: { id: number; name: string }[]; 
    addons?: { id: number; name: string; price: number }[]; 
    reviews?: {
        id: number;
        rating: number;
        comment: string;
        created_at: string;
        image?: string;
        user?: {
            name: string;
            avatar_url?: string; 
        };
    }[];
}

const getImageUrl = (url: string | null) => {
    if (!url) return 'https://placehold.co/800x600?text=No+Image';
    if (url.startsWith('http')) return url;
    const path = url.startsWith('/') ? url.substring(1) : url;
    return path.startsWith('storage/') 
        ? `http://127.0.0.1:8000/${path}` 
        : `http://127.0.0.1:8000/storage/${path}`;
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// --- 2. KOMPONEN UTAMA ---
export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/destinations/${params.slug}`);
            const json = await res.json();
            if (res.ok) {
                setDestination(json.data);
            } else {
                toast.error("Gagal memuat data");
            }
        } catch (err) { 
            console.error(err); 
            toast.error("Terjadi kesalahan koneksi");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { if (params.slug) fetchDetail(); }, [params.slug]);

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-white"><Loader2 className="animate-spin text-[#0B2F5E] w-10 h-10"/></div>;
    if (!destination) return null;

    return (
        <main className="min-h-screen bg-white text-gray-800 pb-20 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
                <HeaderSection destination={destination} onBack={() => router.back()} />
                <GallerySection destination={destination} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                        <DescriptionSection destination={destination} />
                        <ReviewSection destination={destination} onRefresh={fetchDetail} />
                    </div>
                    <div className="relative h-full">
                        <BookingCard destination={destination} />
                    </div>
                </div>
            </div>
        </main>
    );
}

// --- 3. SUB-KOMPONEN ---

function HeaderSection({ destination, onBack }: { destination: Destination, onBack: () => void }) {
    const avgRating = destination.reviews?.length ? (destination.reviews.reduce((a, b) => a + b.rating, 0) / destination.reviews.length).toFixed(1) : null;
    return (
        <div className="mb-6">
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-[#0B2F5E] flex items-center gap-1 mb-3 transition"><ArrowLeft className="w-4 h-4"/> Kembali</button>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2F5E] mb-2">{destination.name}</h1>
            <div className="flex flex-wrap items-center text-gray-600 text-sm gap-4">
                <div className="flex items-center gap-1 text-[#F57C00] font-medium"><MapPin className="w-4 h-4" /><span>{destination.location}</span></div>
                {destination.category && <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">{destination.category.name}</span>}
                {avgRating && <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md border border-yellow-100 font-bold text-sm"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{avgRating} ({destination.reviews?.length} Ulasan)</div>}
            </div>
        </div>
    );
}

function GallerySection({ destination }: { destination: Destination }) {
    const [isOpen, setIsOpen] = useState(false);
    const [idx, setIdx] = useState(0);
    const allImages = [{ id: 0, image_path: destination.image_url }, ...(destination.images || [])].filter(img => img.image_path);
    const displayImages = allImages.slice(0, 5);
    const remainingCount = allImages.length - 5;

    return (
        <>
            <div className="h-[300px] md:h-[480px] w-full mb-10 grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden shadow-sm">
                {displayImages.map((img, i) => {
                     const isLastItem = i === 4; 
                     return (
                        <div key={i} onClick={() => { setIdx(i); setIsOpen(true); }} className={`relative bg-gray-100 cursor-pointer overflow-hidden group ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                            <Image src={getImageUrl(img.image_path)} alt="Gallery" fill className="object-cover transition duration-700 group-hover:scale-110" unoptimized />
                            {isLastItem && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 transition hover:bg-black/70 backdrop-blur-[2px] flex flex-col justify-end items-end p-4">
                                    <div className="text-white text-right">
                                        <span className="block text-2xl font-bold">+{remainingCount}</span>
                                        <span className="text-xs font-medium uppercase tracking-wider opacity-90">Foto Lainnya</span>
                                    </div>
                                </div>
                            )}
                        </div>
                     )
                })}
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in" onClick={() => setIsOpen(false)}>
                    <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white p-2 z-10"><X className="w-8 h-8"/></button>
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + allImages.length) % allImages.length); }} className="absolute left-4 text-white p-3 z-10"><ChevronLeft className="w-8 h-8"/></button>
                    <div className="relative w-full max-w-5xl h-[80vh] p-4" onClick={e => e.stopPropagation()}>
                        <Image src={getImageUrl(allImages[idx].image_path)} alt="Full" fill className="object-contain" unoptimized />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % allImages.length); }} className="absolute right-4 text-white p-3 z-10"><ChevronRight className="w-8 h-8"/></button>
                </div>
            )}
        </>
    );
}

function DescriptionSection({ destination }: { destination: Destination }) {
    return (
        <>
            <div className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#0B2F5E]">Tentang Aktivitas Ini</h2>
                <div className="prose prose-lg text-gray-600 text-justify" dangerouslySetInnerHTML={{ __html: destination.description }} />
            </div>
            {destination.inclusions && destination.inclusions.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="font-bold text-green-800 mb-4 flex gap-2"><CheckCircle className="w-5 h-5"/> Termasuk:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {destination.inclusions.map(inc => (
                            <div key={inc.id} className="flex gap-2 text-sm text-gray-700 font-medium"><Check className="w-4 h-4 text-green-600"/> {inc.name}</div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function ReviewSection({ destination, onRefresh }: { destination: Destination, onRefresh: () => void }) {
    const { token } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ rating: 0, comment: '', image: null as File | null });
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) { toast.error("Silakan login dulu"); return router.push('/login'); }
        if (form.rating === 0) return toast.error('Pilih bintang rating!');
        if (!form.comment) return toast.error('Isi komentar Anda!');

        setSubmitting(true);
        const data = new FormData();
        data.append('destination_id', String(destination.id));
        data.append('rating', String(form.rating));
        data.append('comment', form.comment);
        if (form.image) data.append('image', form.image);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/reviews', { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${token}` }, 
                body: data 
            });
            const json = await res.json();
            
            if (res.ok) { 
                toast.success('Ulasan terkirim!'); 
                setForm({ rating: 0, comment: '', image: null }); 
                setPreview(null); 
                onRefresh(); 
            } else { 
                toast.error(json.message || 'Gagal mengirim ulasan'); 
            }
        } catch { 
            toast.error('Error koneksi server'); 
        } finally { 
            setSubmitting(false); 
        }
    };

    return (
        <div className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold mb-6 text-[#0B2F5E]">Ulasan ({destination.reviews?.length || 0})</h2>
            
            {token ? (
                <form onSubmit={submit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm">
                    <div className="flex gap-2 mb-4">{[1,2,3,4,5].map(s => (<button key={s} type="button" onClick={() => setForm({...form, rating: s})} className="transition hover:scale-110 active:scale-95"><Star className={`w-8 h-8 ${s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}/></button>))}</div>
                    <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-[#0B2F5E] outline-none" placeholder="Ceritakan pengalamanmu..." rows={3}></textarea>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-50"><Camera className="w-4 h-4"/> Foto <input type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files?.[0]) { setForm({...form, image: e.target.files[0]}); setPreview(URL.createObjectURL(e.target.files[0])); }}} /></label>
                        {preview && <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200"><Image src={preview} alt="Prev" fill className="object-cover" unoptimized /><button onClick={(e) => {e.preventDefault(); setPreview(null); setForm({...form, image: null})}} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="w-3 h-3"/></button></div>}
                        <button disabled={submitting} className="bg-[#0B2F5E] text-white px-6 py-2 rounded-xl font-bold ml-auto disabled:opacity-50 hover:bg-[#09254A] shadow-md">{submitting ? 'Mengirim...' : 'Kirim'}</button>
                    </div>
                </form>
            ) : <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-8 border border-blue-100 flex items-center gap-2"><Info className="w-5 h-5"/>Silakan <span className="font-bold underline cursor-pointer" onClick={() => router.push('/login')}>Login</span> untuk mereview.</div>}

            <div className="space-y-6">
                {destination.reviews?.length ? destination.reviews.map((r: any) => (
                    <div key={r.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                        {/* --- AVATAR USER --- */}
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200 shrink-0 relative overflow-hidden">
                            {r.user?.avatar_url ? (
                                <Image 
                                    src={getImageUrl(r.user.avatar_url)} 
                                    alt={r.user.name} 
                                    fill 
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <UserIcon className="w-6 h-6"/>
                            )}
                        </div>
                        {/* ------------------- */}
                        <div>
                            <div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-gray-900">{r.user?.name || 'Pengunjung'}</h4><span className="text-xs text-gray-400">{formatDate(r.created_at)}</span></div>
                            <div className="flex mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}/>)}</div>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-xl rounded-tl-none">"{r.comment}"</p>
                            {r.image && <div className="mt-3 w-32 h-24 relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90"><Image src={getImageUrl(r.image)} alt="Review" fill className="object-cover" unoptimized /></div>}
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 italic py-4">Belum ada ulasan.</p>}
            </div>
        </div>
    );
}

// --- 4. BOOKING CARD (DENGAN PEMILIHAN METODE BAYAR DI MODAL) ---
function BookingCard({ destination }: { destination: Destination }) {
    const { token } = useAuth();
    const router = useRouter();
    
    const [date, setDate] = useState('');
    const [qty, setQty] = useState(1);
    const [addons, setAddons] = useState<number[]>([]);
    
    // STATE MODAL & PAYMENT
    const [modalOpen, setModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('qris'); // Default QRIS
    const [processing, setProcessing] = useState(false);
    
    // CONTEXT HOOKS
    const { refreshCart } = useCartContext(); 
    const { addNotification } = useNotification(); 

    const [addingToCart, setAddingToCart] = useState(false); 

    const total = (destination.price * qty) + (addons.reduce((acc, id) => acc + (destination.addons?.find(a => a.id === id)?.price || 0), 0) * qty);

    const toggleAddon = (id: number) => setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // LOGIKA ADD TO CART
    const handleAddToCart = async () => {
        if (!token) {
            toast.error("Silakan login dulu");
            return router.push('/login');
        }
        if (!date) {
            return toast.error('Pilih tanggal kunjungan!');
        }

        setAddingToCart(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/cart', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    destination_id: destination.id, 
                    quantity: qty, 
                    visit_date: date, 
                    addons: addons 
                })
            });
            const json = await res.json();
            
            if (res.ok) {
                toast.success('Berhasil masuk keranjang!');
                await refreshCart(); 
            } else {
                toast.error(json.message || 'Gagal menambahkan ke keranjang');
            }
        } catch (error) {
            toast.error('Gagal menghubungi server');
        } finally {
            setAddingToCart(false);
        }
    };

    // LOGIKA CHECKOUT (BELI LANGSUNG)
    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/buy-now', {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    destination_id: destination.id, 
                    quantity: qty, 
                    visit_date: date, 
                    addons: addons, 
                    payment_method: paymentMethod // <--- Kirim metode yang dipilih user
                })
            });
            const json = await res.json();
            
            if (res.ok) { 
                toast.success('Pesanan dibuat!'); 
                
                // NOTIFIKASI PEMESANAN
                addNotification(
                    'transaction',
                    'Menunggu Pembayaran',
                    `Pesanan ${destination.name} berhasil dibuat. Silakan selesaikan pembayaran.`
                );

                // REDIRECT KE HALAMAN PEMBAYARAN
                router.push(`/payment/${json.booking_code}`); 
            } else {
                toast.error(json.message || 'Gagal');
            }
        } catch { 
            toast.error('Error server'); 
        } finally { 
            setProcessing(false); 
        }
    };

    return (
        <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4"><div className="text-3xl font-extrabold text-[#F57C00]">Rp {destination.price.toLocaleString('id-ID')}</div><span className="text-sm text-gray-400 font-medium">/ pax</span></div>
            <div className="space-y-4 mb-6">
                <div><label className="text-xs font-bold text-gray-700 uppercase">Tanggal</label><div className="relative"><input type="date" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B2F5E] cursor-pointer" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} /><Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none"/></div></div>
                <div><label className="text-xs font-bold text-gray-700 uppercase">Jumlah</label><div className="flex justify-between items-center p-1 bg-gray-50 rounded-xl border border-gray-200"><button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:text-[#F57C00]"><Minus className="w-4 h-4"/></button><span className="font-bold text-gray-800">{qty} Orang</span><button onClick={() => setQty(q => q + 1)} className="p-2 bg-[#0B2F5E] text-white rounded-lg hover:bg-[#09254A]"><Plus className="w-4 h-4"/></button></div></div>
                {destination.addons?.length! > 0 && <div className="space-y-2"><label className="text-xs font-bold text-gray-700 flex gap-1 items-center"><Tag className="w-3 h-3"/> Add-ons</label>{destination.addons?.map(a => (<div key={a.id} onClick={() => toggleAddon(a.id)} className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition select-none ${addons.includes(a.id) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}><div className="flex gap-2 items-center"><div className={`w-4 h-4 rounded border flex items-center justify-center ${addons.includes(a.id) ? 'bg-blue-500 border-blue-500' : ''}`}>{addons.includes(a.id) && <Check className="w-3 h-3 text-white"/>}</div><span className="text-sm font-medium text-gray-700">{a.name}</span></div><span className="text-sm font-bold text-[#F57C00]">+Rp {Number(a.price).toLocaleString('id-ID')}</span></div>))}</div>}
                <div className="flex justify-between pt-4 border-t border-gray-100"><span className="font-medium text-gray-500">Total</span><span className="font-extrabold text-xl text-gray-900">Rp {total.toLocaleString('id-ID')}</span></div>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-[#F57C00] text-[#F57C00] py-3.5 rounded-xl font-bold hover:bg-[#F57C00] hover:text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {addingToCart ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShoppingCart className="w-5 h-5 group-hover:text-white transition-colors"/>}
                    <span className="text-sm md:text-base">Keranjang</span>
                </button>

                <button 
                    onClick={() => { 
                        if(!token) { toast.error("Login dulu"); return router.push('/login'); } 
                        if(!date) return toast.error('Pilih tanggal!'); 
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
                        <div className="bg-[#0B2F5E] px-6 py-4 flex justify-between text-white font-bold items-center"><span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400"/> Konfirmasi</span><button onClick={() => setModalOpen(false)}><X/></button></div>
                        <div className="p-6 space-y-5">
                            {/* Rincian Harga */}
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tiket ({qty}x)</span><span className="font-medium">Rp {(destination.price * qty).toLocaleString('id-ID')}</span></div>
                                {addons.length > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Add-ons</span><span className="font-medium">Rp {(total - (destination.price * qty)).toLocaleString('id-ID')}</span></div>}
                            </div>

                            {/* PILIH METODE BAYAR */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Metode Pembayaran</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <div 
                                        onClick={() => setPaymentMethod('qris')}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]/30' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'qris' ? 'border-[#F57C00]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'qris' && <div className="w-3 h-3 bg-[#F57C00] rounded-full" />}
                                        </div>
                                        <ScanLine className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-bold text-gray-700">QRIS (Instant)</span>
                                    </div>

                                    <div 
                                        onClick={() => setPaymentMethod('bca')}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'bca' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]/30' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'bca' ? 'border-[#F57C00]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'bca' && <div className="w-3 h-3 bg-[#F57C00] rounded-full" />}
                                        </div>
                                        <Building2 className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-bold text-gray-700">Bank Transfer (BCA)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100"><span>Total Bayar</span><span className="text-[#F57C00]">Rp {total.toLocaleString('id-ID')}</span></div>
                            <button onClick={handleCheckout} disabled={processing} className="w-full bg-[#0B2F5E] text-white py-3 rounded-xl font-bold hover:bg-[#09254A] transition active:scale-[0.98]">{processing ? 'Memproses...' : 'Bayar Sekarang'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}