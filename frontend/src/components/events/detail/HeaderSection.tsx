import { ArrowLeft, MapPin, Star } from "lucide-react";
import { Destination } from "@/src/types/destination";

export default function HeaderSection({
  destination,
  onBack,
}: {
  destination: Destination;
  onBack: () => void;
}) {
  const avgRating = destination.reviews?.length
    ? (
        destination.reviews.reduce((a, b) => a + b.rating, 0) /
        destination.reviews.length
      ).toFixed(1)
    : null;

  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-[#0B2F5E] flex items-center gap-1 mb-3 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>
      <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2F5E] mb-2">
        {destination.name}
      </h1>
      <div className="flex flex-wrap items-center text-gray-600 text-sm gap-4">
        <div className="flex items-center gap-1 text-[#F57C00] font-medium">
          <MapPin className="w-4 h-4" />
          <span>{destination.location}</span>
        </div>
        {destination.category && (
          <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
            {destination.category.name}
          </span>
        )}
        {avgRating && (
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md border border-yellow-100 font-bold text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {avgRating} ({destination.reviews?.length} Ulasan)
          </div>
        )}
      </div>
    </div>
  );
}