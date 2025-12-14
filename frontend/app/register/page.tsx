"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext"; // Import Notifikasi
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";

// ICONS
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

export default function RegisterPage() {
  const { login } = useAuth();
  const { addNotification } = useNotification(); // Hook Notifikasi
  const [formData, setFormData] = useState({ name: "", email: "", phone_number: "", password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal");
      
      login(data.access_token, data.user);
      
      // TRIGGER NOTIFIKASI
      addNotification('system', 'Pendaftaran Berhasil', 'Akun Anda telah aktif. Selamat bergabung!');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = "http://localhost:8000/auth/google"; };
  const handleFacebookLogin = () => { window.location.href = "http://localhost:8000/auth/facebook"; };

  const inputClass = "w-full px-4 py-3 rounded-sm border border-gray-300 focus:border-gray-500 focus:outline-none transition-colors text-sm";

  return (
    <div className="min-h-screen flex flex-col bg-[#DCDCDC] font-sans">
      <header className="bg-white w-full py-4 px-6 md:px-16 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image src="/images/logonama2.png" alt="Logo" width={140} height={40} className="object-contain h-8 md:h-10 w-auto" />
          </Link>
          <span className="text-xl text-gray-800 hidden md:block">Daftar</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 md:px-16 py-10">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="hidden lg:flex flex-col justify-center items-center text-center text-white space-y-6">
            <div className="relative w-80 h-80">
              <Image src="/images/logo-login.png" alt="Ilustrasi" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>

          <div className="w-full max-w-[420px] bg-white rounded-lg shadow-2xl mx-auto lg:ml-auto p-8">
            <h3 className="text-xl font-medium text-gray-800 mb-6">Daftar Akun Baru</h3>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-gray-600"><input name="name" type="text" placeholder="Nama Lengkap" required onChange={handleChange} className={inputClass} /></div>
              <div className="space-y-1 text-gray-600"><input name="phone_number" type="text" placeholder="Nomor Telepon" required onChange={handleChange} className={inputClass} /></div>
              <div className="space-y-1 text-gray-600"><input name="email" type="email" placeholder="Akun Email" required onChange={handleChange} className={inputClass} /></div>
              <div className="space-y-1 text-gray-600 relative"><input name="password" type={showPassword ? "text" : "password"} placeholder="Password (Min. 8 Karakter)" required onChange={handleChange} className={inputClass} /></div>
              <div className="space-y-1 text-gray-600"><input name="password_confirmation" type={showPassword ? "text" : "password"} placeholder="Konfirmasi Password" required onChange={handleChange} className={inputClass} /></div>

              <button type="submit" disabled={isLoading} className="w-full bg-[#005eff] hover:bg-[#0B2F5E] text-white font-medium py-3 rounded-sm shadow-sm uppercase tracking-wide text-sm transition-all disabled:opacity-70 mt-4">
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "DAFTAR SEKARANG"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs text-gray-400 uppercase">ATAU</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-sm transition-all text-sm">
                <GoogleIcon /> Daftar dengan Google
              </button>
              <button type="button" onClick={handleFacebookLogin} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-sm transition-all text-sm">
                <FacebookIcon /> Daftar dengan Facebook
              </button>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-400">Sudah punya akun? </span>
              <Link href="/login" className="text-[#F57C00] font-medium hover:underline">Log In</Link>
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full bg-white text-center py-6 text-xs text-gray-800 ">&copy; {new Date().getFullYear()} TiketLoka. All rights reserved.</footer>
    </div>
  );
}