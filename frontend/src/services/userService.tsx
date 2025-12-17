// src/services/userService.ts
import axiosInstance from "@/src/lib/axios";
import { User, PasswordUpdateData } from "@/src/types";

export const userService = {
  // 1. Update Profil (Support Upload Gambar)
  updateProfile: async (name: string, phoneNumber: string, avatarFile: File | null): Promise<User> => {
    const formData = new FormData();
    
    // ✅ PERBAIKAN 1: Murni POST. Jangan pakai _method: PUT.
    // formData.append("_method", "PUT"); <--- HAPUS INI
    
    formData.append("name", name);
    if (phoneNumber) formData.append("phone_number", phoneNumber);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      // ✅ PERBAIKAN 2: Kita WAJIB pasang header ini lagi.
      // Kemarin error karena method-nya salah (PUT), bukan karena headernya.
      // Karena method sekarang sudah POST, header ini aman dan wajib ada.
      const response = await axiosInstance.post('/profile', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data || response.data; 
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memperbarui profil");
    }
  },

  // 2. Ganti Password
  updatePassword: async (data: PasswordUpdateData) => {
    try {
      const response = await axiosInstance.put('/password', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.errors 
        ? Object.values(error.response.data.errors)[0] 
        : (error.response?.data?.message || "Gagal mengubah password");
        
      throw new Error(String(message)); 
    }
  }
};