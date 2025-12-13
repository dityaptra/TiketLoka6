'use client';

import Navbar from '@/components/layout/Navbar';
import DestinationGridSection from '@/components/home/DestinationGridSection';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function EventsPage() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('search') || ''; // Baca parameter 'search'

    // Konstruksi URL API berdasarkan search term
    const apiEndpoint = useMemo(() => {
        let url = 'http://127.0.0.1:8000/api/destinations';
        
        // Cek apakah ada search term yang valid
        if (searchTerm) {
            // Jika ada, tambahkan query parameter 'search' yang sudah di-encode
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        // Jika tidak ada search term, API akan mengembalikan semua destinasi terbaru
        return url;
    }, [searchTerm]);

    const title = searchTerm 
        ? `Hasil Pencarian untuk: "${searchTerm}"`
        : "Semua Destinasi Wisata";

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24">
                
                {/* Menggunakan kembali komponen Grid untuk menampilkan hasil */}
                <DestinationGridSection 
                    title={title}
                    endpoint={apiEndpoint}
                    // Tidak perlu limit disini, karena ini halaman hasil
                    limit={null} 
                />
            </div>
            
            <footer className="bg-[#0B2F5E] text-white py-10 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} TiketLoka. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}