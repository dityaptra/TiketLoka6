"use client";
import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Destination } from "@/src/types/destination";
import { getImageUrl } from "@/src/lib/utlis";

export default function GallerySection({ destination }: { destination: Destination }) {
  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const allImages = [
    { id: 0, image_path: destination.image_url },
    ...(destination.images || []),
  ].filter((img) => img.image_path);
  const displayImages = allImages.slice(0, 5);
  const remainingCount = allImages.length - 5;

  return (
    <>
      <div className="h-[300px] md:h-[480px] w-full mb-10 grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden shadow-sm">
        {displayImages.map((img, i) => {
          const isLastItem = i === 4;
          return (
            <div
              key={i}
              onClick={() => {
                setIdx(i);
                setIsOpen(true);
              }}
              className={`relative bg-gray-100 cursor-pointer overflow-hidden group ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <Image
                src={getImageUrl(img.image_path)}
                alt="Gallery"
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
                unoptimized
              />
              {isLastItem && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 transition hover:bg-black/70 backdrop-blur-[2px] flex flex-col justify-end items-end p-4">
                  <div className="text-white text-right">
                    <span className="block text-2xl font-bold">
                      +{remainingCount}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                      Foto Lainnya
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white p-2 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((idx - 1 + allImages.length) % allImages.length);
            }}
            className="absolute left-4 text-white p-3 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div
            className="relative w-full max-w-5xl h-[80vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(allImages[idx].image_path)}
              alt="Full"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((idx + 1) % allImages.length);
            }}
            className="absolute right-4 text-white p-3 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
}
