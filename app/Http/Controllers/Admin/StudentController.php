<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StudentUpdateRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function update(StudentUpdateRequest $request, User $student)
    {
        if ($student->role !== 'siswa') {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => 'User bukan siswa',
            ], 422);
        }

        $data = $request->validated();

        DB::transaction(function () use ($data, $student) {
            $student->update([
                'name' => $data['username'],
                'email' => $data['email'],
            ]);

            if (!empty($data['password'])) {
                $student->update(['password' => Hash::make($data['password'])]);
            }

            DB::table('siswa_profiles')
                ->where('user_id', $student->id)
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

    public function destroy(User $student)
    {
        if ($student->role !== 'siswa') {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => 'User bukan siswa',
            ], 422);
        }

        $studentId = $student->id;

        $attemptCount = DB::table('test_attempts')
            ->where('student_user_id', $studentId)
            ->count();

        $practiceCount = DB::table('practice_submissions')
            ->where('student_user_id', $studentId)
            ->count();

        if ($attemptCount > 0 || $practiceCount > 0) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => "Siswa tidak bisa dihapus karena sudah memiliki data nilai/praktik. (Attempts: {$attemptCount}, Praktik: {$practiceCount})",
            ], 422);
        }

        DB::transaction(function () use ($student) {
            DB::table('siswa_profiles')->where('user_id', $student->id)->delete();
            $student->delete();
        });

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }
}