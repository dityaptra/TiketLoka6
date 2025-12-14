"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation"; // Tambahkan usePathname
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  User,
  ShoppingCart,
  Ticket,
  Bell,
  CircleHelp,
  ChevronDown,
  Settings,
  Home, // Tambahkan Icon Home
  LucideIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Definisi tipe untuk item menu agar type-safe
interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const useCart = () => {
  const cartItemCount = 5;
  return { cartItemCount };
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Hook untuk cek URL aktif
  const { cartItemCount } = useCart();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const notificationCount = 3;

  const handleCartClick = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/cart");
    }
  };

  const handleTicketsClick = () => {
    router.push("/tickets");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Style dasar tombol navigasi
  const baseNavStyle = "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group";
  
  // Helper function untuk menentukan style aktif/tidak aktif
  const getNavStyle = (path: string) => {
    const isActive = pathname === path;
    return `${baseNavStyle} ${
      isActive 
        ? "bg-blue-50 text-[#0B2F5E] font-bold" 
        : "text-gray-600 hover:bg-blue-50 hover:text-[#0B2F5E]"
    }`;
  };

  // Array menu profile
  const profileMenuItems: MenuItem[] = [
    { label: "Pengaturan", icon: Settings, href: "/settings" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* --- BAGIAN LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-14 w-52 transition-transform">
            <Image
              src="/images/logonama3.png"
              alt="TiketLoka Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* --- BAGIAN KANAN --- */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* MENU BERANDA (DITAMBAHKAN) */}
          <Link href="/" className={getNavStyle("/")}>
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Beranda</span>
          </Link>

          {/* TOMBOL BANTUAN */}
          <Link href="/help" className={getNavStyle("/help")}>
            <CircleHelp className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Bantuan</span>
          </Link>

          {/* KERANJANG */}
          <button onClick={handleCartClick} className={`${getNavStyle("/cart")} relative`}>
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block">Keranjang</span>
          </button>

          {/* TIKET SAYA */}
          {user && (
            <button onClick={handleTicketsClick} className={getNavStyle("/tickets")}>
              <Ticket className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Tiket Saya</span>
            </button>
          )}

          {/* NOTIFIKASI */}
          {user && (
            <button className={getNavStyle("/notifications")}>
              <div className="relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium hidden sm:block">Notifikasi</span>
            </button>
          )}

          {/* --- USER PROFILE --- */}
          {user ? (
            <div
              className="relative ml-2 pl-2 border-l border-blue-200"
              ref={menuRef}
            >
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-blue-50 transition-colors"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {/* Avatar Icon */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 overflow-hidden border border-blue-200">
                   <User size={20} />
                </div>
                
                {/* Chevron Arrow */}
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform duration-300 ${
                    isProfileMenuOpen ? "rotate-180" : "rotate-0"
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-[60] ${
                  isProfileMenuOpen ? "block" : "hidden"
                }`}
              >
                {/* Header Profil */}
                <div className="px-5 py-3 border-b border-gray-100 mb-2">
                    <p className="font-bold text-[#0B2F5E] truncate text-base">
                        {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Member TiketLoka</p>
                </div>

                {/* Looping Menu Item */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {profileMenuItems.map((item, index) => (
                        <Link 
                            href={item.href} 
                            key={index}
                            className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B2F5E] flex items-center gap-3 transition-colors"
                        >
                            <item.icon className="w-4 h-4" /> 
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    <div className="my-2 border-t border-gray-100"></div>

                    {/* Tombol Logout */}
                    <button
                        onClick={logout}
                        className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> 
                        <span>Log Out</span>
                    </button>
                </div>
              </div>
            </div>
          ) : (
            // === BELUM LOGIN ===
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <Link href="/login">
                <button className="px-5 py-2 text-sm text-[#0B2F5E] font-bold border border-[#0B2F5E] rounded-full hover:bg-blue-50 transition-colors">
                  Masuk
                </button>
              </Link>
              <Link href="/register">
                <button className="px-5 py-2 text-sm bg-[#F57C00] text-white font-bold rounded-full hover:bg-[#E65100] transition-colors shadow-md">
                  Daftar
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;