<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SiswaProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SiswaPasswordResetController extends Controller
{
    public function verifyIdentity(Request $request)
    {
        $data = $request->validate([
            'nisn'      => ['required', 'string'],
            'full_name' => ['required', 'string'],
            'email'     => ['required', 'email'],
        ]);

        $profile = SiswaProfile::where('nisn', trim($data['nisn']))
            ->whereRaw('LOWER(full_name) = ?', [strtolower(trim($data['full_name']))])
            ->with('user:id,email')
            ->first();

        if (!$profile || !$profile->user) {
            return response()->json([
                'success' => false,
                'error'   => 'Data tidak ditemukan. Periksa NISN dan nama lengkap.',
            ], 404);
        }

        if (strtolower($profile->user->email) !== strtolower(trim($data['email']))) {
            return response()->json([
                'success' => false,
                'error'   => 'Email tidak sesuai dengan akun yang terdaftar.',
            ], 404);
        }

        return response()->json(['success' => true, 'data' => ['verified' => true]]);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'nisn'                  => ['required', 'string'],
            'full_name'             => ['required', 'string'],
            'email'                 => ['required', 'email'],
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $profile = SiswaProfile::where('nisn', $data['nisn'])
            ->whereRaw('LOWER(full_name) = ?', [strtolower(trim($data['full_name']))])
            ->with('user')
            ->first();

        abort_if(!$profile || !$profile->user, 422, 'Data tidak ditemukan.');
        abort_if(
            strtolower($profile->user->email) !== strtolower(trim($data['email'])),
            422,
            'Email tidak sesuai.',
        );

        $profile->user->password = Hash::make($data['password']);
        $profile->user->save();

        return redirect()->route('login')
            ->with('status', 'Password berhasil diubah! Silakan login.');
    }
}