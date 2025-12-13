'use client';

import { useState, useEffect } from 'react';

const HeroBackgroundSlider = () => {
  const images = [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?auto=format&fit=crop&w=1920',
    'https://plus.unsplash.com/premium_photo-1661876927993-bedb3ab87208?auto=format&fit=crop&w=1920'
  ];
  
  // Catatan: Saat ini logika auto-slide belum ditambahkan, 
  // hanya menampilkan gambar index ke-0 sesuai kode asli Anda.
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Mengubah state ke index berikutnya. 
      // Operator modulus (%) memastikan index kembali ke 0 setelah gambar terakhir.
      setCurrent((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Gambar berganti setiap 5000ms (5 detik)

    // Membersihkan interval saat komponen di-unmount agar tidak memori leak
    return () => clearInterval(interval);
  }, [images.length]);
  
  return (
    <div className="relative w-full h-full">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={img} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

export default HeroBackgroundSlider;