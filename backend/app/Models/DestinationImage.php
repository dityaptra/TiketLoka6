<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DestinationImage extends Model
{
    use HasFactory;

    protected $guarded = []; // Izinkan mass assignment

    // Relasi balik ke Destination (Opsional, tapi praktik bagus)
    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }
}