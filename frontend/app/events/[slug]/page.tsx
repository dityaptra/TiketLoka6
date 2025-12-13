'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BookingForm from '@/components/booking/BookingForm'; 
import ReviewSection from '@/components/reviews/ReviewSection'; // <--- IMPORT KOMPONEN REVIEW
import { Destination } from '@/types';
import toast from 'react-hot-toast';

// Helper URL Gambar
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
};

export default function EventDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetail() {
            try {
                // Endpoint public: /api/destinations/{slug}
                const res = await fetch(`http://127.0.0.1:8000/api/destinations/${slug}`);
                if (!res.ok) throw new Error('Data tidak ditemukan');
                
                const json = await res.json();
                
                // Format URL gambar sebelum disimpan ke state
                const data = json.data;
                data.image_url = getImageUrl(data.image_url);
                
                setDestination(data);
                
            } catch (err) {
                console.error(err);
                toast.error("Gagal memuat detail wisata.");
            } finally {
                setLoading(false);
            }
        }
        
        if (slug) fetchDetail();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#F57C00]"/></div>;
    if (!destination) return <div className="min-h-screen text-center pt-32">Destinasi tidak ditemukan.</div>;

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            
            <div className="max-w-7xl mx-auto pt-24 px-4">
                
                {/* Tombol Kembali */}
                <Link href="/" className="flex items-center text-[#0B2F5E] font-medium mb-6 hover:text-[#F57C00] transition w-fit">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Kembali ke Daftar Wisata
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* --- KOLOM KIRI: DETAIL, DESKRIPSI & REVIEW --- */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Gambar Utama */}
                        <div className="relative h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                            <Image 
                                src={destination.image_url!} 
                                alt={destination.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                unoptimized={true}
                                priority
                            />
                        </div>

                        {/* Detail Info Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{destination.name}</h1>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 font-medium mb-6 border-b border-gray-100 pb-4">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#0B2F5E]" /> {destination.location}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#0B2F5E]" /> Buka Setiap Hari</span>
                                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-[#0B2F5E]" /> {destination.price.toLocaleString('id-ID')} IDR</span>
                            </div>

                            <h2 className="text-xl font-bold text-[#0B2F5E] mb-3">Deskripsi Wisata</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">{destination.description}</p>
                            
                            {/* Fitur Tambahan (Simulasi) */}
                            <div className="mt-8 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-[#0B2F5E] mb-3">Fasilitas Termasuk</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <span className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Asuransi Perjalanan</span>
                                    <span className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Pemandu Lokal</span>
                                    <span className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> QR Code Akses Cepat</span>
                                    <span className="flex items-center gap-2 text-gray-700 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Parkir Luas</span>
                                </div>
                            </div>
                        </div>

                        {/* --- BAGIAN REVIEW (KOMPONEN BARU) --- */}
                        <ReviewSection destinationId={destination.id} />
                        
                    </div>
                    
                    {/* --- KOLOM KANAN: FORM PEMESANAN (Sticky) --- */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BookingForm destination={destination} />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}