"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState("Memproses login Google...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Ambil data user lengkap dari Laravel menggunakan token baru
      fetch("http://127.0.0.1:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          // 2. Simpan ke Context / LocalStorage lewat fungsi login() Anda
          login(token, userData);

          setStatus("Login berhasil! Mengalihkan...");

          // 3. Redirect ke Home atau Dashboard
          setTimeout(() => router.push("/"), 1000);
        })
        .catch((err) => {
          console.error(err);
          setStatus("Gagal mengambil data user.");
          setTimeout(() => router.push("/login"), 2000);
        });
    } else {
      setStatus("Gagal login. Token tidak ditemukan.");
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [searchParams, login, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-gray-600 font-medium">{status}</p>
    </div>
  );
}
