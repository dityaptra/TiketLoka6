// src/services/bookingService.ts
import axiosInstance from "@/src/lib/axios";
import { Booking } from "@/src/types";

export const bookingService = {
  // 1. Ambil Semua Booking User (List Tiket)
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await axiosInstance.get('/my-bookings');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat tiket saya");
    }
  },

  // 2. Ambil Detail Booking (E-Ticket)
  getBookingDetail: async (bookingCode: string): Promise<Booking> => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingCode}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat detail tiket");
    }
  }
};