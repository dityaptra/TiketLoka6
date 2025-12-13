'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react'; // Tambah icon mata
import Image from 'next/image';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      login(data.access_token, data.user);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#DCDCDC] font-sans">
      
      {/* 1. NAVBAR HEADER (Mirip Shopee: Logo Kiri, Bantuan Kanan) */}
      <header className="bg-white w-full py-4 px-6 md:px-16 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
            <Link href="/">
                <Image 
                    src="/images/logonama2.png" // Pastikan logo ini berwarna (bukan putih)
                    alt="Logo TiketLoka" 
                    width={140} 
                    height={40} 
                    className="object-contain h-8 md:h-10 w-auto" 
                />
            </Link>
            <span className="text-xl text-gray-800 hidden md:block">Log In</span>
        </div>
      </header>

      {/* 2. MAIN CONTENT (Split Layout) */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-16 py-10">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* KOLOM KIRI: Branding (Hanya muncul di Desktop) */}
            <div className="hidden lg:flex flex-col justify-center items-center text-center text-white space-y-6">
                <div className="relative w-80 h-80">
                    {/* Ganti dengan gambar ilustrasi wisata/travel jika ada */}
                    <Image 
                       src="/images/logo-login.png" // Logo putih besar atau ilustrasi
                       alt="TiketLoka Illustration"
                       fill
                       className="object-contain drop-shadow-2xl"
                    />
                </div>
                <div>
                    <h2 className="text-3xl text-gray-800 font-bold mb-2">Jelajahi Wisata Impian</h2>
                    <p className="text-gray-800 text-lg">Platform pemesanan tiket termudah & terpercaya.</p>
                </div>
            </div>

            {/* KOLOM KANAN: Form Card (Putih) */}
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-2xl mx-auto lg:ml-auto p-8">
                
                <h3 className="text-xl font-medium text-gray-800 mb-6">Log In</h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded flex items-center gap-2">
                       <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                       {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Input Email (Clean Style ala Shopee) */}
                    <div className="space-y-1 text-gray-600">
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-gray-500 focus:outline-none transition-colors text-sm"
                            placeholder="Akun Email"
                        />
                    </div>

                    {/* Input Password */}
                    <div className="space-y-1 text-gray-600 relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-gray-500 focus:outline-none transition-colors text-sm"
                            placeholder="Password"
                        /> 
                    </div>

                    {/* Tombol Login (ORANYE) */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#005eff] hover:bg-[#0B2F5E] text-white font-medium py-3 rounded-sm shadow-sm uppercase tracking-wide text-sm transition-all disabled:opacity-70 mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'LOG IN'}
                    </button>

                </form>

                {/* Divider ATAU (Visual Saja) */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-400 uppercase">ATAU</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-400">Baru di TiketLoka? </span>
                    <Link href="/register" className="text-[#F57C00] font-medium hover:underline">
                        Daftar
                    </Link>
                </div>

            </div>
        </div>
      </div>

      {/* 3. FOOTER SIMPLE (Copyright) */}
      <footer className="w-full bg-white text-center py-6 text-xs text-gray-800 ">
         &copy; {new Date().getFullYear()} TiketLoka. All rights reserved.
      </footer>

    </div>
  );
}