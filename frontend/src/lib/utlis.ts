// src/lib/utils.ts

// 1. Helper Gambar
export const getImageUrl = (url: string | null) => {
  if (!url) return "https://placehold.co/800x600?text=No+Image";
  if (url.startsWith("http")) return url;
  
  // Hapus slash di depan jika ada untuk menghindari double slash
  const path = url.startsWith("/") ? url.substring(1) : url;
  
  // Sesuaikan URL backend Laravel Anda
  return path.startsWith("storage/")
    ? `http://127.0.0.1:8000/${path}`
    : `http://127.0.0.1:8000/storage/${path}`;
};

// 2. Helper Format Rupiah
export const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

// 3. Helper Format Tanggal Panjang (contoh: 20 Desember 2025)
export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// --- DATE HELPERS (UNTUK BOOKING CARD) ---

// Daftar Libur Nasional (Sesuaikan dengan kalender tahun berjalan)
const HOLIDAYS = [
  "2025-12-25", // Natal
  "2025-12-26", // Cuti Bersama
  "2026-01-01", // Tahun Baru
  "2026-01-16", // Isra Mikraj
  "2026-02-16", // Cuti Imlek
  "2026-02-17", // Imlek
  "2026-03-03", // Nyepi (contoh)
  "2026-03-31", // Idul Fitri (contoh estimasi)
];

// 4. Generate Semua Tanggal dalam Bulan Tertentu (PENTING untuk Grid View)
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// 5. Format ISO untuk API (YYYY-MM-DD)
// Menggunakan offset timezone agar tanggal tidak mundur karena UTC
export const formatDateISO = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
};

// 6. Cek Apakah Tanggal Merah (Minggu atau Libur Nasional)
export const isHoliday = (date: Date): boolean => {
  const isoDate = formatDateISO(date);
  const isSunday = date.getDay() === 0; // 0 = Minggu
  return isSunday || HOLIDAYS.includes(isoDate);
};

// 7. Format Nama Hari (SEN, SEL, RAB)
export const formatDayName = (date: Date): string => {
  return new Intl.DateTimeFormat("id-ID", { weekday: "short" })
    .format(date)
    .toUpperCase()
    .replace(".", "");
};

// 8. Format Angka Tanggal (01, 02, ... 31)
export const formatDayNumber = (date: Date): string => {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric" }).format(date);
};

// 9. Format Header Bulan (DESEMBER 2025)
export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
    .format(date)
    .toUpperCase();
};

// 10. Cek Kesamaan Dua Tanggal (untuk state active)
export const isSameDate = (date1: Date, date2: Date | null): boolean => {
  if (!date2) return false;
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};