<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PracticeSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentPracticeController extends Controller
{
    public function index(User $student, Request $request)
    {
        if ($student->role !== 'siswa') {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => 'User bukan siswa',
            ], 422);
        }

        $auth = $request->user();
        if ($auth->role === 'guru') {
            $kelasId = DB::table('guru_profiles')->where('user_id', $auth->id)->value('kelas_id');
            $studentKelas = DB::table('siswa_profiles')->where('user_id', $student->id)->value('kelas_id');
            if (!$kelasId || $studentKelas != $kelasId) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'error' => 'Forbidden',
                ], 403);
            }
        }

        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 10));
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('practice_submissions as ps')
            ->join('materis as m', 'm.id', '=', 'ps.materi_id')
            ->where('ps.student_user_id', $student->id)
            ->select([
                'ps.id',
                'm.title as materi_title',
                'ps.status',
                'ps.is_late',
                'ps.submitted_at',
                'ps.total_score',
            ])
            ->orderByDesc('ps.id');

        if ($search !== '') {
            $query->where('m.title', 'like', "%{$search}%");
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(function ($p) {
            return [
                'id' => $p->id,
                'materi_title' => $p->materi_title,
                'status' => $p->status,
                'is_late' => (bool) $p->is_late,
                'submitted_at' => optional($p->submitted_at)->toDateTimeString(),
                'total_score' => $p->total_score,
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

    // expandable row: items+photos untuk 1 submission
    public function items(PracticeSubmission $submission, Request $request)
    {
        $auth = $request->user();

        // authz: guru hanya boleh lihat submission siswa kelas dia
        if ($auth->role === 'guru') {
            $kelasId = DB::table('guru_profiles')->where('user_id', $auth->id)->value('kelas_id');
            $studentKelas = DB::table('siswa_profiles')->where('user_id', $submission->student_user_id)->value('kelas_id');
            if (!$kelasId || $studentKelas != $kelasId) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'error' => 'Forbidden',
                ], 403);
            }
        }

        $rows = DB::table('practice_submission_items as psi')
            ->join('practice_checklists as pc', 'pc.id', '=', 'psi.checklist_id')
            ->where('psi.submission_id', $submission->id)
            ->orderBy('pc.order')
            ->select([
                'psi.id',
                'pc.title as title',
                'psi.note as note',
            ])
            ->get()
            ->map(function ($it) {
                $photos = DB::table('practice_submission_photos')
                    ->where('submission_item_id', $it->id)
                    ->orderByDesc('id')
                    ->get()
                    ->map(fn($ph) => [
                        'id' => $ph->id,
                        'url' => asset('storage/'.$ph->photo_path),
                    ]);

                return [
                    'id' => $it->id,
                    'title' => $it->title,
                    'note' => $it->note,
                    'has_photo' => $photos->count() > 0,
                    'photos' => $photos,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $rows,
            'error' => null,
        ]);
    }
}