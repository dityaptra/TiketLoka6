<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user login DAN role-nya admin
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access Denied. Admin Only.'], 403);
        }

        return $next($request);
    }
}