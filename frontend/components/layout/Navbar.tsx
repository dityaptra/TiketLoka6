"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCartContext } from "@/context/CartContext"; 
import { useNotification } from "@/context/NotificationContext"; 
import {
  LogOut,
  User,
  ShoppingCart,
  Ticket,
  Bell,
  CircleHelp,
  ChevronDown,
  Settings,
  Home,
  LucideIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Helper untuk URL Gambar
const getAvatarUrl = (url: string | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://127.0.0.1:8000/storage/${url}`;
};

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Context Global
  const { cartCount } = useCartContext(); 
  const { unreadCount } = useNotification();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const baseNavStyle = "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group";
  
  const getNavStyle = (path: string) => {
    const isActive = pathname === path;
    return `${baseNavStyle} ${
      isActive 
        ? "bg-blue-50 text-[#0B2F5E] font-bold" 
        : "text-gray-600 hover:bg-blue-50 hover:text-[#0B2F5E]"
    }`;
  };

  const profileMenuItems: MenuItem[] = [
    { label: "Pengaturan", icon: Settings, href: "/settings" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* LOGO */}
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

        {/* MENU KANAN */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          <Link href="/" className={getNavStyle("/")}>
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Beranda</span>
          </Link>

          <Link href="/help" className={getNavStyle("/help")}>
            <CircleHelp className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Bantuan</span>
          </Link>

          {/* KERANJANG */}
          <button onClick={handleCartClick} className={`${getNavStyle("/cart")} relative`}>
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block">Keranjang</span>
          </button>

          {user && (
            <>
              {/* TIKET SAYA */}
              <button onClick={handleTicketsClick} className={getNavStyle("/tickets")}>
                <Ticket className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Tiket Saya</span>
              </button>

              {/* NOTIFIKASI */}
              <Link href="/notifications" className={getNavStyle("/notifications")}>
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">Notifikasi</span>
              </Link>
            </>
          )}

          {/* PROFILE DROPDOWN */}
          {user ? (
            <div className="relative ml-2 pl-2 border-l border-blue-200" ref={menuRef}>
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-blue-50 transition-colors"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {/* Logic Avatar: Gambar atau Icon */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 overflow-hidden border border-blue-200 relative">
                   {user.avatar_url ? (
                     <Image 
                       src={getAvatarUrl(user.avatar_url) || ""} 
                       alt={user.name}
                       fill
                       className="object-cover"
                       unoptimized // Gunakan unoptimized jika load dari localhost/storage laravel
                     />
                   ) : (
                     <User size={20} />
                   )}
                </div>
                
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform duration-300 ${
                    isProfileMenuOpen ? "rotate-180" : "rotate-0"
                  }`} 
                />
              </button>

              <div className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-[60] ${isProfileMenuOpen ? "block" : "hidden"}`}>
                <div className="px-5 py-3 border-b border-gray-100 mb-2">
                    <p className="font-bold text-[#0B2F5E] truncate text-base">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">Member TiketLoka</p>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {profileMenuItems.map((item, index) => (
                        <Link href={item.href} key={index} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B2F5E] flex items-center gap-3 transition-colors">
                            <item.icon className="w-4 h-4" /> <span>{item.label}</span>
                        </Link>
                    ))}
                    <div className="my-2 border-t border-gray-100"></div>
                    <button onClick={logout} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors">
                        <LogOut className="w-4 h-4" /> <span>Log Out</span>
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <Link href="/login">
                <button className="px-5 py-2 text-sm text-[#0B2F5E] font-bold border border-[#0B2F5E] rounded-full hover:bg-blue-50 transition-colors">Masuk</button>
              </Link>
              <Link href="/register">
                <button className="px-5 py-2 text-sm bg-[#F57C00] text-white font-bold rounded-full hover:bg-[#E65100] transition-colors shadow-md">Daftar</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;