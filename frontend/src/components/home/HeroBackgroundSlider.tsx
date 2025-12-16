'use client';

import { useState, useEffect, useRef } from 'react';

const HeroBackgroundSlider = () => {
  const originalImages = [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?auto=format&fit=crop&w=1920',
    'https://plus.unsplash.com/premium_photo-1661876927993-bedb3ab87208?auto=format&fit=crop&w=1920'
  ];

  // 1. Teknik Clone: Tambahkan gambar pertama ke akhir array
  const images = [...originalImages, originalImages[0]];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timeoutRef = useRef(null);

  // Durasi animasi transisi dalam milidetik (sama dengan class duration-1000)
  const ANIMATION_DURATION = 1000; 
  const SLIDE_INTERVAL = 5000;

  useEffect(() => {
    const interval = setInterval(() => {
      // Selalu maju ke depan
      setCurrentIndex((prev) => prev + 1);
      // Pastikan transisi aktif saat bergerak maju
      setIsTransitioning(true);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // 2. Logic Reset "Diam-diam"
  useEffect(() => {
    // Jika kita sampai di gambar Clone (index terakhir)
    if (currentIndex === images.length - 1) {
      
      // Tunggu animasi selesai dulu (1000ms), baru reset
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false); // Matikan animasi
        setCurrentIndex(0);        // Pindah instan ke gambar awal asli
      }, ANIMATION_DURATION);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      <div 
        className="flex w-full h-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          // 3. Toggle transisi: Aktif saat geser biasa, Mati saat reset
          transition: isTransitioning ? `transform ${ANIMATION_DURATION}ms ease-in-out` : 'none'
        }}
      >
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="w-full h-full flex-shrink-0 relative"
          >
            <img 
              src={img} 
              // alt perlu dinamis agar tidak bingung
              alt={`Slide ${idx === images.length - 1 ? 1 : idx + 1}`} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroBackgroundSlider;