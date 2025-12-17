"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; 

// Import Service & Types
import { adminService } from "@/src/services/adminService"; // <--- Service
import { Category } from "@/src/types";

export default function AdminCategories() {
  const { token } = useAuth(); // Token otomatis dihandle axios, tapi kita butuh validasi login
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- FETCH DATA ---
  async function fetchCategories() {
    try {
      const data = await adminService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      // Opsional: Toast error saat load
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // --- HANDLER: ADD ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      // Panggil Service
      await adminService.createCategory(newName);
      
      setNewName("");
      fetchCategories(); // Refresh data

      // SweetAlert Sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kategori baru telah ditambahkan.",
        showConfirmButton: false,
        timer: 1500,
      });

    } catch (error: any) {
      // SweetAlert Gagal
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: DELETE ---
  const handleDelete = async (id: number) => {
    // Konfirmasi Hapus
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: "Kategori yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      // Panggil Service
      await adminService.deleteCategory(id);
      
      // Update State Lokal (Optimistic UI)
      setCategories((prev) => prev.filter((c) => c.id !== id));

      // SweetAlert Sukses
      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Kategori berhasil dihapus.",
        showConfirmButton: false,
        timer: 1500,
      });

    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // --- RENDER ---
  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#0B2F5E]" />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0B2F5E] mb-6">Kelola Kategori</h1>

      {/* Form Tambah */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-2xl">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-[#F57C00]" /> Tambah Provinsi Baru
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            placeholder="Contoh: Jawa Timur"
            className="flex-1 px-4 py-2.5 rounded-lg text-gray-700 border border-gray-300 focus:border-[#0B2F5E] focus:ring-1 focus:ring-[#0B2F5E] outline-none text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !newName}
            className="bg-[#0B2F5E] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#09254A] transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan
          </button>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4 w-16 text-center">No</th>
              <th className="px-6 py-4">Nama Provinsi</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, index) => (
              <tr key={cat.id} className="hover:bg-blue-50/50">
                <td className="px-6 py-4 text-center font-bold text-gray-600">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-[#0B2F5E]">{cat.name}</td>
                <td className="px-6 py-4 text-gray-600 font-mono text-xs">{cat.slug}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-2 border border-gray-200 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deletingId === cat.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}