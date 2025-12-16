'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface CartContextType {
    cartCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const { token } = useAuth();

    // Fungsi untuk cek ulang jumlah keranjang ke API Backend
    const refreshCart = async () => {
        if (!token) {
            setCartCount(0);
            return;
        }

        try {
            // Asumsi endpoint GET /api/cart mengembalikan daftar item
            // Pastikan Anda sudah membuat Route GET di Laravel: Route::get('/cart', ...)
            const res = await fetch('http://127.0.0.1:8000/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (res.ok && json.data) {
                // Hitung jumlah item
                setCartCount(json.data.length);
            }
        } catch (error) {
            console.error("Gagal memuat keranjang", error);
        }
    };

    // Load data cart saat pertama kali login/buka web
    useEffect(() => {
        refreshCart();
    }, [token]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => useContext(CartContext);