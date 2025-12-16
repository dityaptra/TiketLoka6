"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Camera, Info, X, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

// --- PERUBAHAN: Import ---
import { useAuth } from "@/src/context/AuthContext";
import axiosInstance from "@/src/lib/axios"; 
import { Destination } from "@/src/types/destination";
import { getImageUrl, formatDate } from "@/src/lib/utlis";

export default function ReviewSection({
  destination,
  onRefresh,
}: {
  destination: Destination;
  onRefresh: () => void;
}) {
  const { token } = useAuth();
  const router = useRouter();
  
  // State (Sama)
  const [form, setForm] = useState({ rating: 0, comment: "", image: null as File | null });
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- PERUBAHAN: Submit pakai Axios (FormData) ---
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        toast.error("Silakan login dulu");
        return router.push("/login");
    }
    if (form.rating === 0) return toast.error("Pilih bintang rating!");
    if (!form.comment) return toast.error("Isi komentar Anda!");

    setSubmitting(true);
    const data = new FormData();
    data.append("destination_id", String(destination.id));
    data.append("rating", String(form.rating));
    data.append("comment", form.comment);
    if (form.image) data.append("image", form.image);

    try {
      // Axios otomatis mengenali Content-Type: multipart/form-data
      await axiosInstance.post("/reviews", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Ulasan terkirim!");
      setForm({ rating: 0, comment: "", image: null });
      setPreview(null);
      onRefresh(); // Memanggil refetch dari Hook di halaman utama
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim ulasan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="border-t border-gray-100 pt-8">
        <h2 className="text-2xl font-bold mb-6 text-[#0B2F5E]">
          Ulasan ({destination.reviews?.length || 0})
        </h2>
  
        {token ? (
          <form
            onSubmit={submit}
            className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm"
          >
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, rating: s })}
                  className="transition hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 ${
                      s <= form.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-[#0B2F5E] outline-none"
              placeholder="Ceritakan pengalamanmu..."
              rows={3}
            ></textarea>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-50">
                <Camera className="w-4 h-4" /> Foto{" "}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setForm({ ...form, image: e.target.files[0] });
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
              {preview && (
                <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200">
                  <Image
                    src={preview}
                    alt="Prev"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPreview(null);
                      setForm({ ...form, image: null });
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                disabled={submitting}
                className="bg-[#0B2F5E] text-white px-6 py-2 rounded-xl font-bold ml-auto disabled:opacity-50 hover:bg-[#09254A] shadow-md"
              >
                {submitting ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-8 border border-blue-100 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Silakan{" "}
            <span
              className="font-bold underline cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Login
            </span>{" "}
            untuk mereview.
          </div>
        )}
  
        <div className="space-y-6">
          {destination.reviews?.length ? (
            destination.reviews.map((r: any) => (
              <div
                key={r.id}
                className="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
              >
                {/* --- AVATAR USER --- */}
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200 shrink-0 relative overflow-hidden">
                  {r.user?.avatar_url ? (
                    <Image
                      src={getImageUrl(r.user.avatar_url)}
                      alt={r.user.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                </div>
                {/* ------------------- */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">
                      {r.user?.name || "Pengunjung"}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < r.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-xl rounded-tl-none">
                    "{r.comment}"
                  </p>
                  {r.image && (
                    <div className="mt-3 w-32 h-24 relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90">
                      <Image
                        src={getImageUrl(r.image)}
                        alt="Review"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic py-4">
              Belum ada ulasan.
            </p>
          )}
        </div>
      </div>
    );
}