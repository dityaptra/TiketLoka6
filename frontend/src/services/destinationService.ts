import { Destination } from "@/src/types/destination";

// URL API kita simpan di env atau konstanta agar mudah diganti
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const getDestinationBySlug = async (slug: string): Promise<Destination> => {
  const res = await fetch(`${API_URL}/destinations/${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    // cache: "no-store", // Aktifkan ini jika ingin data selalu fresh (SSR)
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Gagal mengambil data destinasi");
  }

  return json.data;
};