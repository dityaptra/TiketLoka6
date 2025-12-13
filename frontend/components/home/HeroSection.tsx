"use client";

import { Search, Sparkles } from "lucide-react";
import HeroBackgroundSlider from "./HeroBackgroundSlider"; // Asumsi file ini satu folder dengan HeroSection

const HeroSection = () => {
  return (
    <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <HeroBackgroundSlider />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-[#0B2F5E]/30"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto -mt-25">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-widest uppercase mb-8 shadow-xl">
          <Sparkles size={16} className="text-[#F57C00]" />
          Jelajahi Indonesia Bersama Kami
        </div>

        {/* Heading */}
        <h1
          className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight"
          style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
        >
          Telusuri
          <br />
          <span className="text-[#F57C00]">Wisata Dunia</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-white text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
        >
          Nikmati kemudahan pesan tiket wisata tanpa antre. Ribuan destinasi
          indah menunggu petualanganmu selanjutnya.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-2.5 rounded-2xl shadow-2xl max-w-3xl mx-auto flex items-center border-2 border-white/50">
          <div className="pl-6 text-[#F57C00]">
            <Search size={28} />
          </div>
          <input
            type="text"
            placeholder="Mau liburan ke mana?"
            className="flex-1 p-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-lg font-medium"
          />
          <button className="bg-[#F57C00] hover:bg-[#E65100] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
            <span className="hidden md:inline">Cari</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;