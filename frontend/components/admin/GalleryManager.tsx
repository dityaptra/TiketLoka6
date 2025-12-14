'use client';

import { useState } from 'react';
import { DestinationImage } from '@/types';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Props {
    destinationId: number;
    existingImages: DestinationImage[];
    onUpdate: () => void;
}

export default function GalleryManager({ destinationId, existingImages, onUpdate }: Props) {
    const { token } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const getImageUrl = (url: string | null) => {
        if (!url) return 'https://placehold.co/600x400?text=No+Image';
        if (url.startsWith('http')) return url;
        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
        if (cleanPath.startsWith('storage/')) {
            return `http://127.0.0.1:8000/${cleanPath}`;
        }
        return `http://127.0.0.1:8000/storage/${cleanPath}`;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => {
            formData.append('images[]', file);
        });

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${destinationId}/upload-gallery`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                toast.success('Foto berhasil diupload!');
                setSelectedFiles(null); 
                (document.getElementById('fileInput') as HTMLInputElement).value = '';
                onUpdate(); 
            } else {
                toast.error('Gagal upload gambar.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan server.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId: number) => {
        if(!confirm('Hapus foto ini?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/gallery/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Foto dihapus.');
                onUpdate();
            }
        } catch (error) {
            toast.error('Gagal menghapus.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600"/> Manajemen Galeri Foto
            </h3>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-center">
                    <input 
                        id="fileInput"
                        type="file" multiple accept="image/*"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button 
                        type="submit" disabled={!selectedFiles || uploading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                        {uploading ? <Loader2 className="animate-spin w-4 h-4"/> : <Upload className="w-4 h-4"/>}
                        Upload Foto
                    </button>
                </form>
                <p className="text-xs text-gray-400 mt-2">* Bisa pilih banyak foto sekaligus. Max 2MB per foto.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                        <Image 
                            src={getImageUrl(img.image_path)} 
                            alt="Gallery" 
                            fill 
                            className="object-cover"
                            unoptimized // <--- TAMBAHKAN INI (PENTING)
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button 
                                onClick={() => handleDelete(img.id)}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                                title="Hapus Foto"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {existingImages.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400 italic">
                        Belum ada foto tambahan di galeri.
                    </div>
                )}
            </div>
        </div>
    );
}