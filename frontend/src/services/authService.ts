// src/services/authService.ts
import axiosInstance from "@/src/lib/axios";
import { LoginResponse, User } from "@/src/types";

interface RegisterData {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  // Fungsi Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      return response.data;
    } catch (error: any) {
      // Lempar error agar bisa ditangkap di UI
      throw new Error(error.response?.data?.message || "Login gagal");
    }
  },

  // Fungsi Logout (Opsional, untuk dipanggil di AuthContext nanti)
  logout: async () => {
    return await axiosInstance.post('/logout');
  },

  // TAMBAHAN BARU: Ambil data user berdasarkan token
  getUserProfile: async (token: string): Promise<User> => {
    try {
      const response = await axiosInstance.get('/user', {
        headers: {
          // Kita tempel manual karena token belum ada di cookie/localstorage saat ini
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error("Gagal mengambil profil user.");
    }
  },

  // TAMBAHAN BARU: Fungsi Register
  register: async (data: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post('/register', data);
      return response.data;
    } catch (error: any) {
      // Tangkap pesan error dari validasi Laravel
      throw new Error(error.response?.data?.message || "Gagal melakukan pendaftaran");
    }
  },

  // ✅ TAMBAHAN BARU: Centralized Social Login URL
  getSocialLoginUrl: (provider: 'google' | 'facebook') => {
    // Ambil URL dari .env atau default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    
    // Hapus '/api' untuk mendapatkan base URL backend (sesuai route web.php Laravel)
    const baseURL = API_URL.replace('/api', '');
    
    return `${baseURL}/auth/${provider}`;
  }
};