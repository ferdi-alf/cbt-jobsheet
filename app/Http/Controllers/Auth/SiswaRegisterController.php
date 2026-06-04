<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SiswaProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SiswaRegisterController extends Controller
{
    public function verifyIdentity(Request $request)
    {
        $data = $request->validate([
            'nisn'      => ['required', 'string'],
            'full_name' => ['required', 'string'],
        ]);

        Log::info('Siswa register verify', ['nisn' => $data['nisn'], 'full_name' => $data['full_name']]);

        $profile = SiswaProfile::where('nisn', trim($data['nisn']))
            ->whereRaw('LOWER(full_name) = ?', [strtolower(trim($data['full_name']))])
            ->with('user:id,email')
            ->first();

        Log::info('Siswa register verify result', ['profile_found' => (bool) $profile, 'user_email' => $profile->user->email ?? null]);

        if (!$profile) {
            return response()->json([
                'success' => false,
                'error'   => 'Data tidak ditemukan. Pastikan NISN dan nama lengkap sesuai data yang didaftarkan sekolah.',
            ], 404);
        }

        $alreadyRegistered = $profile->user
            && !str_ends_with($profile->user->email, '@student.local');

        Log::info('Siswa register verify already registered', ['already_registered' => $alreadyRegistered]);

        // response log
        Log::info('Siswa register verify response', [
            'nisn' => $profile->nisn,
            'full_name' => $profile->full_name,
            'already_registered' => $alreadyRegistered,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'nisn'               => $profile->nisn,
                'full_name'          => $profile->full_name,
                'already_registered' => $alreadyRegistered,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nisn'                  => ['required', 'string', 'exists:siswa_profiles,nisn'],
            'full_name'             => ['required', 'string'],
            'username'              => ['required', 'string', 'max:100'],
            'email'                 => ['required', 'email', 'max:150', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'email.unique'          => 'Email sudah digunakan, coba email lain.',
            'password.confirmed'    => 'Konfirmasi password tidak cocok.',
        ]);

        $profile = SiswaProfile::where('nisn', $data['nisn'])
            ->whereRaw('LOWER(full_name) = ?', [strtolower(trim($data['full_name']))])
            ->with('user')
            ->first();

        abort_if(!$profile || !$profile->user, 422, 'Data tidak ditemukan.');

        $user = $profile->user;

        if (!str_ends_with($user->email, '@student.local')) {
            return back()->withErrors([
                'nisn' => 'Akun ini sudah terdaftar. Silakan login.',
            ]);
        }

        $user->name     = $data['username'];
        $user->email    = $data['email'];
        $user->password = Hash::make($data['password']);
        $user->save();

        return redirect()->route('login')
            ->with('status', 'Akun berhasil dibuat! Silakan login.');
    }
}