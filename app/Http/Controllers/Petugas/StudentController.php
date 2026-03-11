<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 10));
        $search = trim((string) $request->query('search', ''));

        $auth = $request->user();

        $query = DB::table('users as u')
            ->join('siswa_profiles as sp', 'sp.user_id', '=', 'u.id')
            ->leftJoin('kelas as k', 'k.id', '=', 'sp.kelas_id')
            ->where('u.role', 'siswa')
            ->select([
                'u.id as id',
                'u.email as email',
                'u.name as username',
                'u.avatar_path as avatar_path',
                'sp.full_name as full_name',
                'sp.kelas_id as kelas_id',
                'k.name as kelas',
                'u.created_at as created_at',
            ])
            ->orderBy('sp.full_name');

        
        if ($auth?->role === 'guru') {
            $kelasId = DB::table('guru_profiles')->where('user_id', $auth->id)->value('kelas_id');
            $query->where('sp.kelas_id', $kelasId ?: -1);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('sp.full_name', 'like', "%{$search}%")
                    ->orWhere('u.email', 'like', "%{$search}%")
                    ->orWhere('u.name', 'like', "%{$search}%")
                    ->orWhere('k.name', 'like', "%{$search}%");
            });
        }

        $query->addSelect([
            'avg_posttest' => DB::table('test_attempts as ta')
                ->join('tests as t', 't.id', '=', 'ta.test_id')
                ->whereColumn('ta.student_user_id', 'u.id')
                ->where('t.type', 'posttest')
                ->selectRaw('COALESCE(AVG(ta.score), 0)'),
        ]);

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(function ($s) {
            return [
                'id' => $s->id,
                'avatar_path' => $s->avatar_path,
                'full_name' => $s->full_name,
                'kelas' => $s->kelas,
                'email' => $s->email,
                'avg_posttest' => round((float) $s->avg_posttest, 2),
                'created_at' => optional($s->created_at)->toDateTimeString(),
            ];
        })->values();

        $total = $paginator->total();
        $totalPages = (int) ceil($total / $limit);

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'total' => $total,
                'page' => $paginator->currentPage(),
                'limit' => $limit,
                'totalPages' => $totalPages,
                'hasNextPage' => $paginator->hasMorePages(),
                'hasPrevPage' => $paginator->currentPage() > 1,
            ],
            'error' => null,
        ]);
    }

    public function show(User $user, Request $request)
    {
        $auth = $request->user();

        if ($user->role !== 'siswa') {
            return response()->json(['success' => false, 'data' => null, 'error' => 'User bukan siswa'], 422);
        }

        $studentId = $user->id;

        $student = DB::table('users as u')
            ->join('siswa_profiles as sp', 'sp.user_id', '=', 'u.id')
            ->leftJoin('kelas as k', 'k.id', '=', 'sp.kelas_id')
            ->where('u.id', $studentId)
            ->select([
                'u.id as id',
                'u.email as email',
                'u.name as username',
                'u.avatar_path as avatar_path',
                'sp.full_name as full_name',
                'sp.nisn as nisn',
                'sp.gender as gender',
                'sp.phone as phone',
                'sp.kelas_id as kelas_id',
                'k.name as kelas',
                'u.created_at as created_at',
            ])
            ->first();

        if (!$student) {
            return response()->json(['success' => false, 'data' => null, 'error' => 'Siswa tidak ditemukan'], 404);
        }

        if ($auth?->role === 'guru') {
            $kelasId = DB::table('guru_profiles')->where('user_id', $auth->id)->value('kelas_id');
            if ((int) $student->kelas_id !== (int) $kelasId) {
                return response()->json(['success' => false, 'data' => null, 'error' => 'Tidak punya akses ke siswa ini'], 403);
            }
        }

        $avgPre = DB::table('test_attempts as ta')
            ->join('tests as t', 't.id', '=', 'ta.test_id')
            ->where('ta.student_user_id', $studentId)
            ->where('t.type', 'pretest')
            ->avg('ta.score');

        $avgPost = DB::table('test_attempts as ta')
            ->join('tests as t', 't.id', '=', 'ta.test_id')
            ->where('ta.student_user_id', $studentId)
            ->where('t.type', 'posttest')
            ->avg('ta.score');

        $lastPost = DB::table('test_attempts as ta')
            ->join('tests as t', 't.id', '=', 'ta.test_id')
            ->join('materis as m', 'm.id', '=', 't.materi_id')
            ->where('ta.student_user_id', $studentId)
            ->where('t.type', 'posttest')
            ->orderByDesc('ta.id')
            ->limit(10)
            ->select([
                'ta.score',
                'ta.finished_at',
                'm.title as materi',
            ])
            ->get()
            ->reverse()
            ->values();

        $attempts = DB::table('test_attempts as ta')
            ->join('tests as t', 't.id', '=', 'ta.test_id')
            ->join('materis as m', 'm.id', '=', 't.materi_id')
            ->where('ta.student_user_id', $studentId)
            ->whereIn('t.type', ['pretest', 'posttest'])
            ->orderByDesc('ta.id')
            ->limit(50)
            ->select([
                'ta.id',
                't.type',
                't.title as test_title',
                'm.title as materi_title',
                'ta.score',
                'ta.status',
                'ta.started_at',
                'ta.finished_at',
                'ta.duration_seconds',
            ])
            ->get();


        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'avatar_path' => $student->avatar_path,
                    'full_name' => $student->full_name,
                    'username' => $student->username,
                    'email' => $student->email,
                    'kelas_id' => $student->kelas_id,
                    'kelas' => $student->kelas,
                    'nisn' => $student->nisn,
                    'gender' => $student->gender,
                    'phone' => $student->phone,
                    'created_at' => optional($student->created_at)->toDateTimeString(),
                ],
                'stats' => [
                    'avg_pretest' => round((float) ($avgPre ?? 0), 2),
                    'avg_posttest' => round((float) ($avgPost ?? 0), 2),
                ],
                'chart' => [
                    'last_posttests' => $lastPost,
                ],
                'tables' => [
                    'attempts' => $attempts,
                ],
            ],
            'error' => null,
        ]);
    }

}