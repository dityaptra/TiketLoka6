/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tetap pertahankan ini agar API fetching lancar
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*', // Proxy ke Laravel
      },
    ];
  },

  // Bagian 'images' sudah dihapus karena pakai tag <img>
};

module.exports = nextConfig;