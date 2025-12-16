import Image from "next/image";
import Link from "next/link";

import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* --- BAGIAN ATAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          <div className="space-y-6">
            <div className="relative h-14 w-52 transition-transform">
              <Image
                src="/images/logonama3.png"
                alt="TiketLoka Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Platform pemesanan tiket wisata termudah dan terpercaya. Temukan
              destinasi impianmu bersama TiketLoka.
            </p>

            <div className="flex gap-4">
              <SocialLink href="#" icon={<FaInstagram size={22} />} />
              <SocialLink href="#" icon={<FaFacebookF size={20} />} />
              <SocialLink href="#" icon={<FaYoutube size={22} />} />
            </div>
          </div>

          {/* Kolom 2: Perusahaan */}
          <div>
            <h3 className="text-[#0B2F5E] font-bold text-lg mb-6">
              Perusahaan
            </h3>
            <ul className="space-y-4">
              <FooterLink href="/about">Tentang Kami</FooterLink>
              <FooterLink href="/blog">Blog Wisata</FooterLink>
              <FooterLink href="/careers">Karir</FooterLink>
              <FooterLink href="/partners">Mitra Wisata</FooterLink>
            </ul>
          </div>

          {/* Kolom 3: Dukungan */}
          <div>
            <h3 className="text-[#0B2F5E] font-bold text-lg mb-6">Dukungan</h3>
            <ul className="space-y-4">
              <FooterLink href="/help">Pusat Bantuan</FooterLink>
              <FooterLink href="/terms">Syarat & Ketentuan</FooterLink>
              <FooterLink href="/privacy">Kebijakan Privasi</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </ul>
          </div>

          {/* Kolom 4: Kontak */}
          <div>
            <h3 className="text-[#0B2F5E] font-bold text-lg mb-6">
              Hubungi Kami
            </h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
                <span>
                  Jl. Udayana No.11,
                  <br />
                  Kabupaten Buleleng, Bali, 81116
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#F57C00] shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- BAGIAN BAWAH --- */}
        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {currentYear} TiketLoka. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-[#F57C00] transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-[#F57C00] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-500 hover:text-[#F57C00] transition-colors text-sm flex items-center gap-1 group"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-[#0B2F5E] hover:bg-[#F57C00] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
    >
      {icon}
    </Link>
  );
}
