import { MetadataRoute } from 'next';
import axiosInstance from '@/src/lib/axios'; // Gunakan axios yang sudah ada
import { Destination } from '@/src/types';

// Fungsi helper untuk ambil data (bisa dipindah ke service)
async function getAllDestinations(): Promise<Destination[]> {
  try {
    // Pastikan endpoint ini mengembalikan SEMUA wisata (tanpa paginasi jika memungkinkan, atau limit besar)
    const res = await axiosInstance.get('/destinations?limit=1000'); 
    return res.data.data;
  } catch (error) {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tiketloka.com'; // Ganti domain asli

  // 1. Halaman Statis (Halaman yang selalu ada)
  const staticRoutes = [
    '',          // Homepage
    '/about',    // Jika ada
    '/contact',  // Jika ada
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8, // Homepage prioritas tertinggi
  }));

  // 2. Halaman Dinamis (Detail Wisata dari Database)
  const destinations = await getAllDestinations();
  
  const dynamicRoutes = destinations.map((item) => ({
    url: `${baseUrl}/destination/${item.slug}`, // URL Detail Wisata
    lastModified: new Date(item.updated_at || new Date()), // Kapan terakhir diedit admin
    changeFrequency: 'weekly' as const,
    priority: 0.9, // Prioritas tinggi karena ini jualan utama
  }));

  // Gabungkan keduanya
  return [...staticRoutes, ...dynamicRoutes];
}