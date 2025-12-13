import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TiketLoka",
  description: "Booking Wisata Mudah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* PERBAIKAN DISINI: Tambahkan class Tailwind */}
      <body
        className={`${inter.className} bg-white overflow-x-hidden antialiased min-h-screen`}
      >
        <AuthProvider>
          {/* Tambahkan div wrapper utama agar konten tertata */}
          <div className="relative w-full">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
