<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StudentBulkStoreRequest;
use App\Models\SiswaProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentBulkController extends Controller
{
    public function store(StudentBulkStoreRequest $request)
    {
        $data = $request->validated();

        $kelasId = (int) $data['kelas_id'];
        $students = $data['students'];

        $created = [];

        DB::transaction(function () use ($students, $kelasId, &$created) {
            foreach ($students as $s) {
                $user = User::create([
                    'name' => $s['username'],
                    'email' => $s['email'],
                    'password' => Hash::make($s['password']),
                    'role' => 'siswa',
                    'avatar_path' => null,
                ]);

                SiswaProfile::create([
                    'user_id' => $user->id,
                    'full_name' => $s['full_name'],
                    'nisn' => $s['nisn'],
                    'gender' => $s['gender'],
                    'phone' => $s['phone'],
                    'kelas_id' => $kelasId,
                ]);

                $created[] = ['id' => $user->id, 'email' => $user->email];
            }
        });

        return response()->json([
            'success' => true,
            'data' => [
                'created_count' => count($created),
                'created' => $created,
            ],
            'error' => null,
        ], 201);
    }
}