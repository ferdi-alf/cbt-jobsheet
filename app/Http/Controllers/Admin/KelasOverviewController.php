<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Support\Facades\DB;

class KelasOverviewController extends Controller
{
    public function show(Kelas $kelas)
    {
        $totalStudents = DB::table('siswa_profiles')->where('kelas_id', $kelas->id)->count();
        $totalGuru = DB::table('guru_profiles')->where('kelas_id', $kelas->id)->distinct('user_id')->count('user_id');

        $genderL = DB::table('siswa_profiles')->where('kelas_id', $kelas->id)->where('gender', 'laki-laki')->count();
        $genderP = DB::table('siswa_profiles')->where('kelas_id', $kelas->id)->where('gender', 'perempuan')->count();

        $guruList = DB::table('guru_profiles')
            ->leftJoin('mapels', 'mapels.id', '=', 'guru_profiles.mapel_id')
            ->where('guru_profiles.kelas_id', $kelas->id)
            ->select([
                'guru_profiles.user_id as id',
                'guru_profiles.full_name',
                'guru_profiles.nip',
                'mapels.name as mapel',
            ])
            ->orderBy('guru_profiles.full_name')
            ->get();

        $topPosttest = DB::table('test_attempts as ta')
            ->join('tests as t', 't.id', '=', 'ta.test_id')
            ->join('materis as m', 'm.id', '=', 't.materi_id')
            ->join('users as u', 'u.id', '=', 'ta.student_user_id')
            ->where('t.type', 'posttest')
            ->where('m.kelas_id', $kelas->id)
            ->whereIn('ta.id', function ($sub) use ($kelas) {
                $sub->from('test_attempts as ta2')
                    ->join('tests as t2', 't2.id', '=', 'ta2.test_id')
                    ->join('materis as m2', 'm2.id', '=', 't2.materi_id')
                    ->where('t2.type', 'posttest')
                    ->whereColumn('ta2.student_user_id', 'ta.student_user_id')
                    ->where('m2.kelas_id', $kelas->id)
                    ->selectRaw('MAX(ta2.id)');
            })
            ->select([
                'ta.student_user_id as siswa_id',
                DB::raw('COALESCE(u.name, u.email) as name'),
                'ta.score as score',
            ])
            ->orderByDesc('ta.score')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'kelas' => [
                    'id' => $kelas->id,
                    'name' => $kelas->name,
                    'created_at' => optional($kelas->created_at)->toDateTimeString(),
                ],
                'stats' => [
                    'total_students' => (int) $totalStudents,
                    'total_guru' => (int) $totalGuru,
                ],
                'gender' => [
                    'laki_laki' => (int) $genderL,
                    'perempuan' => (int) $genderP,
                ],
                'top_posttest' => $topPosttest,
                'guru_list' => $guruList,
            ],
            'error' => null,
        ]);
    }
}