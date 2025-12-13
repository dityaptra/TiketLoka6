'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          throw new Error(firstError[0]);
        }
        throw new Error(data.message || 'Registrasi gagal');
      }

      login(data.access_token, data.user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Style input konsisten dengan Login Page
  const inputClass = "w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-gray-500 focus:outline-none transition-colors text-sm";

  return (
    <div className="min-h-screen flex flex-col bg-[#DCDCDC] font-sans">
      
      {/* 1. NAVBAR HEADER */}
      <header className="bg-white w-full py-4 px-6 md:px-16 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
            <Link href="/">
                <Image 
                    src="/images/logonama2.png" 
                    alt="Logo TiketLoka" 
                    width={140} 
                    height={40} 
                    className="object-contain h-8 md:h-10 w-auto" 
                />
            </Link>
            <span className="text-xl text-gray-800 hidden md:block">Daftar</span>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-16 py-10">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* KOLOM KIRI: Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center text-center text-white space-y-6">
                <div className="relative w-80 h-80">
                    <Image 
                       src="/images/logo-login.png" // Ilustrasi sama dengan login
                       alt="TiketLoka Illustration"
                       fill
                       className="object-contain drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* KOLOM KANAN: Form Register */}
            <div className="w-full max-w-[420px] bg-white rounded-lg shadow-2xl mx-auto lg:ml-auto p-8">
                
                <h3 className="text-xl font-medium text-gray-800 mb-6">Daftar Akun Baru</h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded flex items-center gap-2">
                       <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                       {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Nama Lengkap */}
                    <div className="space-y-1 text-gray-600">
                        <input 
                            name="name"
                            type="text"
                            placeholder="Nama Lengkap"
                            required
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Nomor HP */}
                    <div className="space-y-1 text-gray-600">
                        <input 
                            name="phone_number"
                            type="text"
                            placeholder="Nomor Telepon"
                            required
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1 text-gray-600">
                        <input 
                            name="email"
                            type="email"
                            placeholder="Akun Email"
                            required
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1 text-gray-600 relative">
                        <input 
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (Min. 8 Karakter)"
                            required
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1 text-gray-600">
                        <input 
                            name="password_confirmation"
                            type={showPassword ? "text" : "password"}
                            placeholder="Konfirmasi Password"
                            required
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Tombol Daftar */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#005eff] hover:bg-[#0B2F5E] text-white font-medium py-3 rounded-sm shadow-sm uppercase tracking-wide text-sm transition-all disabled:opacity-70 mt-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'DAFTAR SEKARANG'}
                    </button>

                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-400">Sudah punya akun? </span>
                    <Link href="/login" className="text-[#F57C00] font-medium hover:underline">
                        Log In
                    </Link>
                </div>

                <div className="mt-6 text-center text-[10px] text-gray-400 leading-tight px-4">
                    Dengan mendaftar, Anda menyetujui <span className="text-[#F57C00] cursor-pointer">Syarat & Ketentuan</span> serta <span className="text-[#F57C00] cursor-pointer">Kebijakan Privasi</span> TiketLoka.
                </div>

            </div>
        </div>
      </div>

      <footer className="w-full bg-white text-center py-6 text-xs text-gray-800 ">
         &copy; {new Date().getFullYear()} TiketLoka. All rights reserved.
      </footer>

    </div>
  );
}