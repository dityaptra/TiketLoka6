import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tiketloka.com'; // Ganti dengan domain asli Anda nanti

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // ⛔ BLOKIR halaman privat agar tidak bocor ke Google
      disallow: [
        '/admin/',
        '/tickets/', // Detail tiket user
        '/payment/', // Halaman pembayaran
        '/profile/', // Profil user
        '/login/',
        '/register/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}