export const getImageUrl = (url: string | null) => {
  if (!url) return "https://placehold.co/800x600?text=No+Image";
  if (url.startsWith("http")) return url;
  const path = url.startsWith("/") ? url.substring(1) : url;
  // Sesuaikan port backend Anda di sini
  return path.startsWith("storage/")
    ? `http://127.0.0.1:8000/${path}`
    : `http://127.0.0.1:8000/storage/${path}`;
};

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });