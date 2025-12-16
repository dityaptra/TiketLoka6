"use client";

import { useState, useEffect } from "react";
import { Destination } from "@/src/types/destination";
import { getDestinationBySlug } from "@/src/services/destinationService";
import toast from "react-hot-toast";

export const useDestinationDetail = (slug: string) => {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi fetch kita pisah agar bisa dipanggil ulang (misal untuk refresh data setelah review)
  const fetchData = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const data = await getDestinationBySlug(slug);
      setDestination(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  return { 
    destination, 
    loading, 
    error, 
    refetch: fetchData // Kita export fungsi ini agar bisa dipakai tombol refresh
  };
};