'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authService } from '@/src/services/authService'; // Import Service
import { User } from '@/src/types'; // Import Type Global

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>; // Ubah jadi Promise karena async
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = Cookies.get('token');
    const storedUser = Cookies.get('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);

    const options = { expires: 7 }; // Bisa tambah secure: true jika production
    Cookies.set('token', newToken, options); 
    Cookies.set('user', JSON.stringify(userData), options);

    if (userData.role === 'admin') {
       router.push('/admin/dashboard');
    } else {
       router.push('/');
    }
  };

  const logout = async () => {
    // 1. Panggil API Logout via Service (Best Practice)
    if(token) {
        await authService.logout();
    }

    // 2. Bersihkan State & Cookies (Wajib jalan walaupun API error)
    setToken(null);
    setUser(null);
    Cookies.remove('token');
    Cookies.remove('user');
    
    router.push('/login');
    router.refresh(); // Refresh agar navbar update
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}