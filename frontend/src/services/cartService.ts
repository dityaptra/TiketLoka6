// src/services/cartService.ts
import axiosInstance from "@/src/lib/axios";
import { CartItem, CheckoutRequest, CheckoutResponse } from "@/src/types";

export const cartService = {
  // 1. Ambil Data Cart
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data.data; // Sesuaikan dengan struktur JSON response backend Anda
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat keranjang");
    }
  },

  // 2. Hapus Item Cart
  deleteItem: async (id: number) => {
    try {
      await axiosInstance.delete(`/cart/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menghapus item");
    }
  },

  // 3. Proses Checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      const response = await axiosInstance.post('/checkout', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memproses checkout");
    }
  }
};