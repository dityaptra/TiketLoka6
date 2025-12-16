import axios from 'axios';
import Cookies from 'js-cookie'; // <--- Import ini

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // UBAH: Ambil token dari Cookies
    const token = Cookies.get('token'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
        if (!window.location.pathname.startsWith('/login')) {
            // UBAH: Bersihkan Cookies saat session habis
            Cookies.remove('token');
            Cookies.remove('user');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;