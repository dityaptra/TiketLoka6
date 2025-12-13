"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Sesuaikan path context Anda
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth(); // Mengambil data user saat ini

  // --- STATE UNTUK PROFILE ---
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- STATE UNTUK PASSWORD ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mengisi data awal form saat user berhasil dimuat
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      // Asumsi user punya properti phone, jika tidak ada kosongkan
      setPhoneNumber(user.phone || ""); 
    }
  }, [user]);

  // --- HANDLER UPDATE PROFILE ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage(null);

    try {
      // TODO: PANGGIL API UPDATE PROFILE DI SINI
      // const response = await api.put('/user/profile', { name: fullName, phone: phoneNumber });
      
      // Simulasi delay API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Gagal memperbarui profil. Coba lagi.' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // --- HANDLER UPDATE PASSWORD ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordMessage(null);

    // Validasi Sederhana
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      setIsPasswordLoading(false);
      return;
    }
    if (newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
        setIsPasswordLoading(false);
        return;
    }

    try {
      // TODO: PANGGIL API GANTI PASSWORD DI SINI
      // await api.put('/user/password', { currentPassword, newPassword });

      // Simulasi delay API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Password lama salah atau terjadi kesalahan.' });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-[#0B2F5E]">Pengaturan Akun</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: FOTO PROFIL (Opsional/Statis dulu) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden border-2 border-white shadow-md">
                 <User size={40} className="text-[#0B2F5E]" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">{fullName || "User"}</h2>
              <p className="text-sm text-gray-500 mb-4">Member TiketLoka</p>
            </div>
          </div>

          {/* KOLOM KANAN: FORM SETTINGS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. CARD EDIT DATA DIRI */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <User className="w-5 h-5 text-[#0B2F5E]" />
                <h3 className="font-bold text-gray-800">Data Pribadi</h3>
              </div>

              {profileMessage && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0B2F5E] transition-all outline-none text-sm"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0B2F5E] transition-all outline-none text-sm"
                      placeholder="0812..."
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileLoading}
                    className="flex items-center gap-2 bg-[#0B2F5E] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProfileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* 2. CARD EDIT PASSWORD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Lock className="w-5 h-5 text-[#0B2F5E]" />
                <h3 className="font-bold text-gray-800">Keamanan & Password</h3>
              </div>

              {passwordMessage && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                   {passwordMessage.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                   {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0B2F5E] transition-all outline-none text-sm"
                    placeholder="Masukan password lama"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0B2F5E] transition-all outline-none text-sm"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0B2F5E] transition-all outline-none text-sm"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>

                {/* Toggle Show Password */}
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-gray-500 hover:text-[#0B2F5E] flex items-center gap-1"
                    >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showPassword ? "Sembunyikan Password" : "Lihat Password"}
                    </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                         <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                      </>
                    ) : (
                      "Ganti Password"
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}