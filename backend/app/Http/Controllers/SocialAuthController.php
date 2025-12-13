<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SocialAuthController extends Controller
{
    // 1. Redirect ke Provider (Google / Facebook)
    // Parameter $provider akan otomatis terisi 'google' atau 'facebook' dari URL
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    // 2. Callback dari Provider
    public function callback($provider)
    {
        try {
            // Bypass SSL untuk Localhost (PENTING saat Development)
            // Hapus 'setHttpClient' jika sudah upload ke Hosting/Production!
            $socialUser = Socialite::driver($provider)
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->user();

            // Logika Mencari User
            // Kita cari berdasarkan email agar akun tidak ganda
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                // --- KASUS A: User Belum Ada (Register Baru) ---
                $user = User::create([
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'password' => null, // Password kosong
                    'phone_number' => '-', 
                    // Isi ID sesuai provider yang sedang dipakai
                    'google_id' => $provider === 'google' ? $socialUser->getId() : null,
                    'facebook_id' => $provider === 'facebook' ? $socialUser->getId() : null,
                ]);
            } else {
                // --- KASUS B: User Sudah Ada (Update ID) ---
                // Misalnya dulu login pakai Google, sekarang login pakai Facebook
                // Kita update kolom yang sesuai
                if ($provider === 'google') {
                    $user->update(['google_id' => $socialUser->getId()]);
                } elseif ($provider === 'facebook') {
                    $user->update(['facebook_id' => $socialUser->getId()]);
                }
            }

            // 3. Buat Token Akses (Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            // 4. Redirect ke Frontend Next.js
            // Kita gunakan halaman callback yang SAMA untuk Google maupun Facebook
            return redirect("http://localhost:3000/auth/google/callback?token={$token}&user=" . urlencode($user->name));

        } catch (\Exception $e) {
            // Kembalikan ke login page dengan error
            return redirect("http://localhost:3000/login?error=" . urlencode($e->getMessage()));
        }
    }
}