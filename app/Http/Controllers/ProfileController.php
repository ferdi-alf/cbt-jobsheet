<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateAccountRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileDetailRequest;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'guruProfile.kelas:id,name',
            'guruProfile.mapel:id,name',
            'siswaProfile.kelas:id,name',
        ]);

        $profile = null;

        if ($user->isGuru()) {
            $gp = $user->guruProfile;
            $profile = [
                'type' => 'guru',
                'full_name' => $gp?->full_name,
                'nip' => $gp?->nip,
                'gender' => $gp?->gender,
                'phone' => $gp?->phone,
                'kelas_id' => $gp?->kelas_id,
                'kelas_name' => $gp?->kelas?->name,
                'mapel_id' => $gp?->mapel_id,
                'mapel_name' => $gp?->mapel?->name,
            ];
        } elseif ($user->isSiswa()) {
            $sp = $user->siswaProfile;
            $profile = [
                'type' => 'siswa',
                'full_name' => $sp?->full_name,
                'nisn' => $sp?->nisn,
                'gender' => $sp?->gender,
                'phone' => $sp?->phone,
                'kelas_id' => $sp?->kelas_id,
                'kelas_name' => $sp?->kelas?->name,
            ];
        } else {
            $profile = [
                'type' => 'admin',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'profile' => $profile,
            ],
            'error' => null,
        ]);
    }

    public function updateAccount(UpdateAccountRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update([
            'password' => $data['password'],
        ]);

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }

    public function updateDetail(UpdateProfileDetailRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->isGuru()) {
            $user->guruProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $data['full_name'] ?? null,
                    'nip' => $data['nip'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'kelas_id' => $data['kelas_id'] ?? null,
                    'mapel_id' => $data['mapel_id'] ?? null,
                ]
            );
        } elseif ($user->isSiswa()) {
            $user->siswaProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $data['full_name'] ?? null,
                    'phone' => $data['phone'] ?? null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }
}