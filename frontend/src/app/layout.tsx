import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { CartProvider } from "@/src/context/CartContext";
import { NotificationProvider } from "@/src/context/NotificationContext"; // <--- Import Ini
import { Toaster } from "react-hot-toast";

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
      <body
        className={`${inter.className} bg-white overflow-x-hidden antialiased min-h-screen`}
      >
        <AuthProvider>
          <NotificationProvider>
            {" "}
            {/* Bungkus di sini */}
            <CartProvider>
              <div className="relative w-full">
                {children}
                <Toaster />
              </div>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
