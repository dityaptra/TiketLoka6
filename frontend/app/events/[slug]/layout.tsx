import { ReactNode } from 'react';
import { Metadata } from 'next';

// Helper URL Gambar
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
};

// 1. Definisikan tipe Props untuk Params sebagai Promise (Wajib di Next.js 15)
type Props = {
    params: Promise<{ slug: string }>
}

// --- FUNGSI GENERATE METADATA (SERVER SIDE) ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // 2. Lakukan AWAIT di sini agar slug bisa dibaca
    const { slug } = await params;
    
    const fallbackTitle = 'TiketLoka - Pesan Tiket Wisata';

    try {
        // Sekarang slug sudah berisi string (misal: "pantai-kuta"), bukan undefined lagi
        const res = await fetch(`http://127.0.0.1:8000/api/destinations/${slug}`, {
            cache: 'force-cache',
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
             console.warn(`API returned status ${res.status} for slug: ${slug}.`);
             return { title: fallbackTitle };
        }
        
        const json = await res.json();
        const seo = json.seo;
        
        const ogImage = seo.og_image ? getImageUrl(seo.og_image) : null;

        return {
            title: seo.title || json.data.name,
            description: seo.description,
            openGraph: {
                title: seo.title || json.data.name,
                description: seo.description,
                images: ogImage ? [ogImage] : [],
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${slug}`
            }
        };

    } catch (error) {
        console.error(`[METADATA ERROR]: Could not fetch SEO for ${slug}. Falling back.`);
        return {
            title: fallbackTitle,
            description: 'Platform pemesanan tiket wisata termudah.'
        };
    }
}

// Layout ini hanya membungkus child components
export default function EventDetailLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}