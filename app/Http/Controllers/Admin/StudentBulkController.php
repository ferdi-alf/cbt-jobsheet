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
        $data    = $request->validated();
        $kelasId = (int) $data['kelas_id'];
        $students = $data['students'];
        $created  = [];

        DB::transaction(function () use ($students, $kelasId, &$created) {
            foreach ($students as $s) {
                $nisn = $s['nisn'];

                $username = filled($s['username'] ?? '') ? $s['username'] : 'siswa_' . $nisn;
                $email    = filled($s['email']    ?? '') ? $s['email']    : $nisn . '@student.local';
                $password = filled($s['password'] ?? '') ? $s['password'] : $nisn;
                $gender   = filled($s['gender']   ?? '') ? $s['gender']   : 'laki-laki';
                $phone    = $s['phone'] ?? '';

                $user = User::create([
                    'name'     => $username,
                    'email'    => $email,
                    'password' => Hash::make($password),
                    'role'     => 'siswa',
                ]);

                SiswaProfile::create([
                    'user_id'   => $user->id,
                    'full_name' => $s['full_name'],
                    'nisn'      => $nisn,
                    'gender'    => $gender,
                    'phone'     => $phone,
                    'kelas_id'  => $kelasId,
                ]);

                $created[] = ['id' => $user->id, 'email' => $email];
            }
        });

        return response()->json([
            'success' => true,
            'data'    => ['created_count' => count($created), 'created' => $created],
            'error'   => null,
        ], 201);
    }
}