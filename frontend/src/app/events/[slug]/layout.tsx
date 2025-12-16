import { ReactNode } from 'react';
import { Metadata } from 'next';
import { getImageUrl } from '@/src/lib/utlis';

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const fallbackTitle = 'TiketLoka - Pesan Tiket Wisata';

    try {
        // Gunakan env variable untuk URL API backend agar dinamis
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${apiUrl}/destinations/${slug}`, {
            cache: 'force-cache',
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) return { title: fallbackTitle };
        
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
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${slug}`
            }
        };
    } catch (error) {
        return { title: fallbackTitle };
    }
}

export default function EventDetailLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}