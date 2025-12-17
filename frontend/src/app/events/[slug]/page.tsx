import { Metadata, ResolvingMetadata } from "next";
import EventDetailView from "@/src/components/views/EventDetailView"; 
import axiosInstance from "@/src/lib/axios"; 
import { getImageUrl } from "@/src/lib/utlis";

// ✅ UPDATE NEXT.JS 15: params harus Promise
type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Fungsi Fetch Data Khusus Server
async function getDestinationSEO(slug: string) {
  try {
    const res = await axiosInstance.get(`/destinations/${slug}`);
    return res.data.data;
  } catch (error) {
    return null;
  }
}

// 2. GENERATE METADATA
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // ✅ UPDATE NEXT.JS 15: Await params dulu!
  const { slug } = await params;
  
  const destination = await getDestinationSEO(slug);

  if (!destination) {
    return { title: "Event Tidak Ditemukan" };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${destination.name} - Tiket & Info`,
    description: destination.description ? destination.description.substring(0, 160) : "Detail event di TiketLoka",
    openGraph: {
      title: destination.name,
      description: destination.description?.substring(0, 150),
      url: `https://tiketloka.com/events/${slug}`,
      images: [
        {
          url: getImageUrl(destination.image_url),
          width: 800,
          height: 600,
          alt: destination.name,
        },
        ...previousImages,
      ],
    },
  };
}

// 3. MAIN PAGE (Server Component)
export default async function Page({ params }: Props) {
  // ✅ UPDATE NEXT.JS 15: Await params dulu!
  const { slug } = await params;

  // Kirim slug yang sudah di-await ke Client Component
  return <EventDetailView slug={slug} />;
}