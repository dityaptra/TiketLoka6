'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Tipe data User (Ditambahkan avatar_url agar foto profil muncul)
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  avatar_url?: string; // Tambahan untuk foto profil
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void; // Fungsi baru untuk update state tanpa login ulang
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cek LocalStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Fungsi Login (Simpan data)
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect sesuai role
    if (userData.role === 'admin') {
       router.push('/admin/dashboard');
    } else {
       router.push('/');
    }
  };

  // Fungsi Logout (Hapus data)
  const logout = async () => {
    try {
        if(token) {
            // Panggil API logout backend
            await fetch('http://127.0.0.1:8000/api/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    } catch (error) {
        console.error("Logout error", error);
    }

    // Bersihkan state frontend
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // --- FUNGSI BARU: Update User (Real-time update untuk Navbar/Settings) ---
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      // Gabungkan data lama dengan data baru
      const updatedUser = { ...user, ...userData };
      
      // Update State
      setUser(updatedUser);
      
      // Update LocalStorage agar persist saat refresh
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook agar mudah dipanggil
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}