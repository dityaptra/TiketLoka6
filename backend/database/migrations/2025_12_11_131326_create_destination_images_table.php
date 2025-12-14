<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'location',
        'image_url',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_active',
    ];

    // Tambahkan ke $appends agar muncul di JSON response
    protected $appends = ['average_rating', 'total_reviews'];

    // --- RELASI (RELATIONSHIPS) ---

    // 1. Satu Destinasi milik satu Kategori
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // 2. Relasi ke Review
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // 3. Relasi ke Galeri Foto (WAJIB DITAMBAHKAN)
    public function images()
    {
        return $this->hasMany(DestinationImage::class);
    }

    // 4. Relasi ke Inclusions / Fasilitas (WAJIB DITAMBAHKAN)
    // Agar Controller bisa memanggil ->with('inclusions')
    public function inclusions()
    {
        return $this->hasMany(Inclusion::class);
    }

    // 5. Relasi ke Addons / Tambahan Berbayar (WAJIB DITAMBAHKAN)
    // Agar Controller bisa memanggil ->with('addons')
    public function addons()
    {
        return $this->hasMany(Addon::class);
    }

    // --- ACCESSORS (DATA TAMBAHAN OTOMATIS) ---

    // Accessor: Menghitung rata-rata rating secara otomatis
    public function getAverageRatingAttribute()
    {
        // Cek dulu apakah ada review, kalau tidak return 0
        if ($this->reviews()->count() == 0) return 0;
        return round($this->reviews()->avg('rating'), 1);
    }

    // Accessor: Menghitung jumlah review
    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->count();
    }
}