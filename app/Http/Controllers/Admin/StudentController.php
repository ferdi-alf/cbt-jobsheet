<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StudentUpdateRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function update(StudentUpdateRequest $request, User $user)
    {
        if ($user->role !== 'siswa') {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => 'User bukan siswa',
            ], 422);
        }

        $data = $request->validated();

        DB::transaction(function () use ($data, $user) {
            $user->update([
                'name' => $data['username'],
                'email' => $data['email'],
            ]);

            // password optional
            if (!empty($data['password'])) {
                $user->update(['password' => Hash::make($data['password'])]);
            }

            DB::table('siswa_profiles')
                ->where('user_id', $user->id)
                ->update([
                    'full_name' => $data['full_name'],
                    'nisn' => $data['nisn'],
                    'gender' => $data['gender'],
                    'phone' => $data['phone'],
                    'kelas_id' => $data['kelas_id'],
                ]);
        });

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'siswa') {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => 'User bukan siswa',
            ], 422);
        }

        $studentId = $user->id;

        $attemptCount = DB::table('test_attempts')->where('student_user_id', $studentId)->count();
        $practiceCount = DB::table('practice_submissions')->where('student_user_id', $studentId)->count();

        if ($attemptCount > 0 || $practiceCount > 0) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => "Siswa tidak bisa dihapus karena sudah memiliki data nilai/praktik. (Attempts: {$attemptCount}, Praktik: {$practiceCount})",
            ], 422);
        }

        DB::transaction(function () use ($user) {
            DB::table('siswa_profiles')->where('user_id', $user->id)->delete();
            $user->delete();
        });

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }
}