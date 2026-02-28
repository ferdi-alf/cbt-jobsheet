<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GuruMeController extends Controller
{
    public function show(Request $request)
    {
        $u = $request->user();

        if ($u->role !== 'guru') {
            return response()->json(['success' => false, 'data' => null, 'error' => 'Forbidden'], 403);
        }

        $gp = DB::table('guru_profiles as gp')
            ->leftJoin('kelas as k', 'k.id', '=', 'gp.kelas_id')
            ->leftJoin('mapels as m', 'm.id', '=', 'gp.mapel_id')
            ->where('gp.user_id', $u->id)
            ->select([
                'gp.full_name',
                'gp.nip',
                'k.id as kelas_id',
                'k.name as kelas',
                'm.name as mapel',
            ])
            ->first();

        $totalStudents = $gp?->kelas_id
            ? DB::table('siswa_profiles')->where('kelas_id', $gp->kelas_id)->count()
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'guru' => [
                    'full_name' => $gp?->full_name,
                    'nip' => $gp?->nip,
                    'kelas_id' => $gp?->kelas_id,
                    'kelas' => $gp?->kelas,
                    'mapel' => $gp?->mapel,
                ],
                'stats' => [
                    'total_students' => (int) $totalStudents,
                ],
            ],
            'error' => null,
        ]);
    }
}