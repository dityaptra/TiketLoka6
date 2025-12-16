"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Import Components UI (yang sudah dipisah sebelumnya)
import Navbar from "@/src/components/layout/Navbar";
import HeaderSection from "@/src/components/events/detail/HeaderSection";
import GallerySection from "@/src/components/events/detail/GallerySection";
import DescriptionSection from "@/src/components/events/detail/DescriptionSection";
import ReviewSection from "@/src/components/events/detail/ReviewSection";
import BookingCard from "@/src/components/events/detail/BookingCard";

// Import Custom Hook Baru
import { useDestinationDetail } from "@/src/hooks/useDestinationDetail";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // PANGGIL HOOK DI SINI (1 baris menggantikan puluhan baris logika fetch!)
  // Kita ambil 'refetch' juga untuk pass ke ReviewSection
  const { destination, loading, refetch } = useDestinationDetail(params.slug as string);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <Loader2 className="animate-spin text-[#0B2F5E] w-10 h-10" />
      </div>
    );
  
  if (!destination) return null; // Atau tampilkan komponen 404 Not Found

  return (
    <main className="min-h-screen bg-white text-gray-800 pb-20 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        
        <HeaderSection 
            destination={destination} 
            onBack={() => router.back()} 
        />
        
        <GallerySection destination={destination} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <DescriptionSection destination={destination} />
            
            {/* Kirim fungsi 'refetch' ke sini agar setelah komen, data reload otomatis */}
            <ReviewSection 
                destination={destination} 
                onRefresh={refetch} 
            />
          </div>
          
          <div className="relative h-full">
            <BookingCard destination={destination} />
          </div>
        </div>
      </div>
    </main>
  );
}