import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Logo */}
        <div className="relative h-14 w-52 transition-transform mx-auto mb-8">
          <Image
            src="/images/logonama3.png"
            alt="TiketLoka Logo"
            fill
            className="object-contain object-center"
            priority
          />
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-8 text-gray-600 mb-8 font-semibold">
          <Link href="#" className="hover:text-[#F57C00] transition-colors">
            Instagram
          </Link>
          <Link href="#" className="hover:text-[#F57C00] transition-colors">
            Twitter
          </Link>
          <Link href="#" className="hover:text-[#F57C00] transition-colors">
            Facebook
          </Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} TiketLoka. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}