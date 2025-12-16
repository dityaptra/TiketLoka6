// src/services/authService.ts
import axiosInstance from "@/src/lib/axios";
import { LoginResponse, User } from "@/src/types";

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
  }
};