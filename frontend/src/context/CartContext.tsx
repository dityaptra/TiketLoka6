'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
// 1. Import Service yang sudah Anda buat
import { cartService } from '@/src/services/cartService'; 

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
    const { token } = useAuth(); // Kita butuh token untuk trigger useEffect

    // Fungsi update cart
    const refreshCart = async () => {
        // Jika user tidak login (token kosong), set keranjang jadi 0
        if (!token) {
            setCartCount(0);
            return;
        }

        try {
            // 2. ✅ CLEAN CODE: Pakai cartService
            // Tidak perlu lagi tulis header Authorization manual, 
            // karena sudah diurus oleh axiosInstance di dalam service.
            const items = await cartService.getCart();
            
            // Update jumlah item (pastikan items adalah array)
            if (Array.isArray(items)) {
                setCartCount(items.length); 
            }
        } catch (error) {
            console.error("Gagal sinkronisasi keranjang", error);
            // Opsional: setCartCount(0) jika error
        }
    };

    // 3. Load data otomatis saat token berubah (Login/Logout)
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