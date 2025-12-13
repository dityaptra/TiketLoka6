<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class DestinationController extends Controller
{
    /**
     * Helper Private: Format Image URL
     * Agar tidak mengulang kodingan di index dan show
     */
    private function formatImageUrl($url)
    {
        if (!$url) return null;

        // Cek apakah ini URL online (http/https) seperti Unsplash
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }

        // Jika bukan, berarti file lokal di storage
        return asset('storage/' . $url);
    }

    /**
     * PUBLIC: Menampilkan daftar wisata (List & Search)
     */
    public function index(Request $request)
    {
        // 1. Mulai Query
        $query = Destination::query();
        
        // 2. Load Relasi (Eager Loading)
        // Tambahkan 'reviews' jika ingin detail, atau cukup withAvg untuk rating
        $query->with(['category']); 
        
        // Hitung rata-rata rating langsung dari database (Efisien)
        // Ini akan membuat field bernama 'reviews_avg_rating' di JSON response
        $query->withAvg('reviews', 'rating');

        // 3. LOGIKA FILTER USER vs ADMIN
        if (!$request->has('all') || $request->all !== 'true') {
            $query->where('is_active', true);
        }

        // 4. Fitur Search (Berdasarkan Nama)
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 5. Fitur Filter Kategori (PERBAIKAN DISINI)
        // Ubah 'category_slug' menjadi 'category' sesuai request Frontend Next.js
        if ($request->has('category') && $request->category != '') {
            $slug = $request->category;
            
            $query->whereHas('category', function ($q) use ($slug) {
                $q->where('slug', $slug);
            });
        }

        // 6. Sorting (Opsional: bisa sort by rating juga nantinya)
        $query->latest(); 

        // 7. Eksekusi Query
        $destinations = $query->get();

        // 8. Transform Data (Format Image URL)
        $data = $destinations->map(function ($item) {
            $item->image_url = $this->formatImageUrl($item->image_url);
            
            // Opsional: Standarisasi nama field rating untuk Frontend
            // Ambil dari withAvg (reviews_avg_rating) atau accessor model (average_rating)
            $item->rating = $item->reviews_avg_rating ?? $item->average_rating ?? 0;
            
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * PUBLIC: Detail Wisata Single Page
     */
    public function show($slug)
    {
        $destination = Destination::with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        // Format URL gambar menggunakan helper
        $imageUrl = $this->formatImageUrl($destination->image_url);

        return response()->json([
            'data' => [
                'id' => $destination->id,
                'name' => $destination->name,
                'slug' => $destination->slug,
                'category' => $destination->category->name,
                'description' => $destination->description,
                'price' => $destination->price,
                'location' => $destination->location,
                'image_url' => $imageUrl,
                'is_active' => $destination->is_active,
            ],
            'seo' => [
                'title' => $destination->meta_title ?? $destination->name,
                'description' => $destination->meta_description ?? Str::limit(strip_tags($destination->description), 150),
                'keywords' => $destination->meta_keywords,
                'og_image' => $imageUrl,
            ]
        ]);
    }

    /**
     * ADMIN: Simpan Wisata Baru
     */
    public function store(Request $request)
    {
        // Validasi
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB
            'meta_title' => 'nullable|string|max:100',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string',
        ]);

        // Generate Slug Otomatis
        $validated['slug'] = Str::slug($validated['name']);

        // Upload Gambar
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('destinations', 'public');
            $validated['image_url'] = $path;
            
            // Hapus key 'image' agar tidak error saat create (karena kolom db namanya image_url)
            unset($validated['image']);
        }

        // Simpan ke Database
        $destination = Destination::create($validated);

        return response()->json([
            'message' => 'Destinasi wisata berhasil ditambahkan',
            'data' => $destination
        ], 201);
    }

    /**
     * ADMIN: Update Wisata
     */
    public function update(Request $request, $id)
    {
        $destination = Destination::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'location' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        // Cek jika nama berubah, update slug juga
        if ($request->has('name')) {
            $validated['slug'] = Str::slug($request->name);
        }

        // Cek jika ada upload gambar baru
        if ($request->hasFile('image')) {
            // Hapus gambar lama (Hanya jika file lokal, bukan URL online)
            if ($destination->image_url && 
                !filter_var($destination->image_url, FILTER_VALIDATE_URL) && 
                Storage::disk('public')->exists($destination->image_url)) {
                Storage::disk('public')->delete($destination->image_url);
            }

            // Upload yang baru
            $path = $request->file('image')->store('destinations', 'public');
            $validated['image_url'] = $path;
            
            // Hapus key 'image'
            unset($validated['image']);
        }

        $destination->update($validated);

        return response()->json([
            'message' => 'Data wisata berhasil diperbarui',
            'data' => $destination
        ]);
    }

    /**
     * ADMIN: Hapus Wisata
     */
    public function destroy($id)
    {
        $destination = Destination::findOrFail($id);

        // Hapus file gambar fisik dari storage
        if ($destination->image_url && 
            !filter_var($destination->image_url, FILTER_VALIDATE_URL) && 
            Storage::disk('public')->exists($destination->image_url)) {
            Storage::disk('public')->delete($destination->image_url);
        }

        $destination->delete();

        return response()->json(['message' => 'Destinasi wisata berhasil dihapus']);
    }
}