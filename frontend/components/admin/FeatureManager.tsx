'use client';

import { useState } from 'react';
import { Inclusion, Addon } from '@/types';
import { Plus, Trash2, CheckCircle, Tag, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Props {
    destinationId: number;
    inclusions: Inclusion[];
    addons: Addon[];
    onUpdate: () => void;
}

export default function FeatureManager({ destinationId, inclusions, addons, onUpdate }: Props) {
    const { token } = useAuth();
    
    // State Input
    const [incName, setIncName] = useState('');
    const [addonName, setAddonName] = useState('');
    const [addonPrice, setAddonPrice] = useState('');
    
    // State Loading
    const [loadingInc, setLoadingInc] = useState(false);
    const [loadingAddon, setLoadingAddon] = useState(false);

    // --- LOGIC INCLUSION (Fasilitas) ---
    const addInclusion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!incName) return;
        setLoadingInc(true);
        try {
            // Sesuai route: Route::post('/destinations/{id}/inclusions', ...)
            const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${destinationId}/inclusions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: incName })
            });
            if (res.ok) {
                toast.success('Fasilitas ditambahkan');
                setIncName('');
                onUpdate();
            } else {
                toast.error('Gagal menambah data');
            }
        } catch (err) {
            toast.error('Error koneksi');
        } finally { setLoadingInc(false); }
    };

    const deleteInclusion = async (id: number) => {
        if(!confirm('Hapus fasilitas ini?')) return;
        try {
            // Sesuai route: Route::delete('/inclusions/{id}', ...)
            await fetch(`http://127.0.0.1:8000/api/admin/inclusions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onUpdate();
        } catch (err) { toast.error('Gagal menghapus'); }
    };

    // --- LOGIC ADDON (Tambahan Berbayar) ---
    const addAddon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addonName || !addonPrice) return;
        setLoadingAddon(true);
        try {
            // Sesuai route: Route::post('/destinations/{id}/addons', ...)
            const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${destinationId}/addons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: addonName, price: parseInt(addonPrice) })
            });
            if (res.ok) {
                toast.success('Add-on ditambahkan');
                setAddonName('');
                setAddonPrice('');
                onUpdate();
            } else {
                toast.error('Gagal menambah data');
            }
        } catch (err) {
            toast.error('Error koneksi');
        } finally { setLoadingAddon(false); }
    };

    const deleteAddon = async (id: number) => {
        if(!confirm('Hapus add-on ini?')) return;
        try {
            // Sesuai route: Route::delete('/addons/{id}', ...)
            await fetch(`http://127.0.0.1:8000/api/admin/addons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onUpdate();
        } catch (err) { toast.error('Gagal menghapus'); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            
            {/* --- BOX KIRI: INCLUSIONS --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5"/> Paket Termasuk (Inclusion)
                </h3>
                
                <form onSubmit={addInclusion} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={incName}
                        onChange={(e) => setIncName(e.target.value)}
                        placeholder="Contoh: Makan Siang"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-green-500"
                        required
                    />
                    <button disabled={loadingInc} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {loadingInc ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>}
                    </button>
                </form>

                <ul className="space-y-2">
                    {inclusions.map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                            <button type="button" onClick={() => deleteInclusion(item.id)} className="text-red-400 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </li>
                    ))}
                    {inclusions.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada data.</p>}
                </ul>
            </div>

            {/* --- BOX KANAN: ADDONS --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-700">
                    <Tag className="w-5 h-5"/> Tambahan Berbayar (Add-on)
                </h3>

                <form onSubmit={addAddon} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={addonName}
                        onChange={(e) => setAddonName(e.target.value)}
                        placeholder="Nama (Misal: GoPro)"
                        className="flex-[2] px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                    <input 
                        type="number" 
                        value={addonPrice}
                        onChange={(e) => setAddonPrice(e.target.value)}
                        placeholder="Harga"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                    <button disabled={loadingAddon} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {loadingAddon ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>}
                    </button>
                </form>

                <ul className="space-y-2">
                    {addons.map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                                <span className="text-xs text-blue-600 font-bold">+Rp {item.price.toLocaleString('id-ID')}</span>
                            </div>
                            <button type="button" onClick={() => deleteAddon(item.id)} className="text-red-400 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </li>
                    ))}
                    {addons.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada data.</p>}
                </ul>
            </div>

        </div>
    );
}