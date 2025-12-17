import axiosInstance from "@/src/lib/axios";
import { 
  AdminBooking, 
  PaginationMeta, 
  Category, 
  CreateDestinationInput, 
  UpdateDestinationInput,
  Destination,
  DashboardData
} from "@/src/types";

interface GetBookingsParams {
  page: number;
  per_page: number;
  start_date?: string;
  end_date?: string;
}

export const adminService = {
  // === BOOKINGS ===
  getBookings: async (params: GetBookingsParams) => {
    try {
      const response = await axiosInstance.get('/admin/bookings', {
        params: {
          page: params.page,
          per_page: params.per_page,
          start_date: params.start_date,
          end_date: params.end_date,
        }
      });

      const json = response.data;
      
      return {
        data: json.data as AdminBooking[],
        meta: {
          current_page: json.current_page,
          last_page: json.last_page,
          total: json.total,
          from: json.from,
          to: json.to,
          per_page: json.per_page
        } as PaginationMeta
      };

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat data transaksi admin");
    }
  },

  // === CATEGORIES ===

  // 1. Ambil Semua Kategori
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await axiosInstance.get('/categories'); 
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat kategori");
    }
  },

  // 2. Tambah Kategori Baru
  createCategory: async (name: string) => {
    try {
      const response = await axiosInstance.post('/admin/categories', { name });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menambahkan kategori");
    }
  },

  // 3. Hapus Kategori
  deleteCategory: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menghapus kategori");
    }
  }, 

  // === DESTINATIONS ===

  // 1. Get All Destinations (List Page)
  getAllDestinations: async (): Promise<Destination[]> => {
    try {
      const response = await axiosInstance.get('/destinations?all=true'); 
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat data wisata");
    }
  },

  // 2. Get Detail Destination (Edit Page)
  getDestinationDetail: async (id: string | number): Promise<Destination> => {
    try {
      const response = await axiosInstance.get(`/admin/destinations/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat detail wisata");
    }
  },

  // 3. Create Destination
  createDestination: async (data: CreateDestinationInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category_id", String(data.category_id));
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("location", data.location);
    formData.append("meta_title", data.meta_title);
    formData.append("meta_description", data.meta_description);
    formData.append("meta_keywords", data.meta_keywords);

    if (data.image) {
      formData.append("image", data.image);
    }

    try {
      // ✅ TAMBAHKAN HEADER MULTIPART DI SINI
      const response = await axiosInstance.post('/admin/destinations', formData, {
        headers: { "Content-Type": "multipart/form-data" } 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal membuat destinasi baru");
    }
  },

  // 4. Update Destination (FIXED)
  updateDestination: async (id: string | number, data: UpdateDestinationInput) => {
    const formData = new FormData();
    
    // ❌ HAPUS INI: formData.append("_method", "PUT"); 
    // Backend Anda meminta POST murni, jadi jangan di-spoofing jadi PUT.

    formData.append("name", data.name);
    formData.append("category_id", String(data.category_id));
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("location", data.location);
    
    // Konversi boolean ke string "1" atau "0"
    formData.append("is_active", data.is_active ? "1" : "0");
    
    formData.append("meta_title", data.meta_title);
    formData.append("meta_description", data.meta_description);
    formData.append("meta_keywords", data.meta_keywords);

    if (data.image) {
      formData.append("image", data.image);
    }

    try {
      // ✅ POST Request + Multipart Header
      const response = await axiosInstance.post(`/admin/destinations/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memperbarui wisata");
    }
  },

  // 5. Delete Destination
  deleteDestination: async (id: number) => {
    try {
      await axiosInstance.delete(`/admin/destinations/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menghapus wisata");
    }
  },

  // === DASHBOARD ===
  getDashboardStats: async (startDate?: string, endDate?: string): Promise<DashboardData> => {
    try {
      const response = await axiosInstance.get('/admin/dashboard', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memuat data dashboard");
    }
  },
};