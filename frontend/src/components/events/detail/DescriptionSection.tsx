"use client";

import { CheckCircle, Check } from "lucide-react";
import { Destination } from "@/src/types/destination";

export default function DescriptionSection({ destination }: { destination: Destination }) {
  return (
    <>
      {/* Bagian Deskripsi Utama */}
      <div className="border-b border-gray-100 pb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#0B2F5E]">
          Tentang Aktivitas Ini
        </h2>
        
        {/* Render HTML dari backend (CKEditor/Rich Text) */}
        <div
          className="prose prose-lg text-gray-600 text-justify max-w-none"
          dangerouslySetInnerHTML={{ __html: destination.description }}
        />
      </div>

      {/* Bagian Inclusions (Apa yang termasuk) */}
      {destination.inclusions && destination.inclusions.length > 0 && (
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100 mt-8">
          <h3 className="font-bold text-green-800 mb-4 flex gap-2 items-center">
            <CheckCircle className="w-5 h-5" /> Termasuk:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {destination.inclusions.map((inc) => (
              <div
                key={inc.id}
                className="flex gap-2 text-sm text-gray-700 font-medium items-center"
              >
                <div className="min-w-[16px]">
                    <Check className="w-4 h-4 text-green-600" /> 
                </div>
                {inc.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}