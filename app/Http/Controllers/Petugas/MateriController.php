<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesGuruProfile;
use App\Http\Requests\Petugas\MateriStoreRequest;
use App\Http\Requests\Petugas\MateriUpdateRequest;
use App\Models\Materi;
use App\Models\PracticeChecklist;
use App\Models\PracticeRule;
use App\Models\PracticeSubmission;
use App\Models\TestAttempt;
use App\Services\MateriResultsExportService;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MateriController extends Controller
{
    use PaginatesApi, ResolvesGuruProfile;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Materi::class);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $user = Auth::user();

        $query = Materi::query()
            ->with([
                'kelas:id,name',
                'mapel:id,name',
                'creator:id,name,email',
            ])
            ->orderByDesc('id');

        if ($user->role === 'guru') {
            $gp = $this->requireGuruProfile($user->id);

            $query->where('kelas_id', $gp->kelas_id)
                  ->where('mapel_id', $gp->mapel_id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%');
            });
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (Materi $m) {
            return [
                'id'                     => $m->id,
                'title'                  => $m->title,
                'kelas'                  => $m->kelas?->name,
                'mapel'                  => $m->mapel?->name,
                'kelas_id'               => $m->kelas_id,
                'mapel_id'               => $m->mapel_id,
                'export_results_zip_url' => route('api.materis.export-results-zip', ['materi' => $m->id]),
                'created_by'             => $m->creator ? [
                    'id'    => $m->creator->id,
                    'name'  => $m->creator->name,
                    'email' => $m->creator->email,
                ] : null,
                'praktik_text' => $m->praktik_text,
                'pdf_url'      => $m->pdf_path ? Storage::disk('public')->url($m->pdf_path) : null,
                'download_url' => route('api.materis.download', ['materi' => $m->id]),
                'created_at'   => optional($m->created_at)->toDateTimeString(),
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function show(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        $materi->load([
            'kelas:id,name',
            'mapel:id,name',
            'creator:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'                     => $materi->id,
                'title'                  => $materi->title,
                'praktik_text'           => $materi->praktik_text,
                'kelas_id'               => $materi->kelas_id,
                'mapel_id'               => $materi->mapel_id,
                'kelas'                  => $materi->kelas?->name,
                'mapel'                  => $materi->mapel?->name,
                'export_results_zip_url' => route('api.materis.export-results-zip', ['materi' => $materi->id]),
                'created_by'             => $materi->creator ? [
                    'id'    => $materi->creator->id,
                    'name'  => $materi->creator->name,
                    'email' => $materi->creator->email,
                ] : null,
                'pdf' => [
                    'url'          => $materi->pdf_path ? Storage::disk('public')->url($materi->pdf_path) : null,
                    'download_url' => route('api.materis.download', ['materi' => $materi->id]),
                ],
                'created_at' => optional($materi->created_at)->toDateTimeString(),
            ],
            'error' => null,
        ]);
    }

    public function store(MateriStoreRequest $request)
    {
        $this->authorize('create', Materi::class);

        $user = $request->user();
        $data = $request->validated();

        if ($user->role === 'guru') {
            $gp = $this->requireGuruProfile($user->id);

            $data['kelas_id'] = (int) $gp->kelas_id;
            $data['mapel_id'] = (int) $gp->mapel_id;
        }

        $pdfPath = $request->file('pdf')->store('materi_pdfs', 'public');

        $materi = Materi::create([
            'title'        => $data['title'],
            'praktik_text' => $data['praktik_text'] ?? null,
            'kelas_id'     => (int) $data['kelas_id'],
            'mapel_id'     => (int) $data['mapel_id'],
            'created_by'   => $user->id,
            'pdf_path'     => $pdfPath,
        ]);

        return response()->json(['success' => true, 'data' => ['id' => $materi->id]]);
    }

    public function update(MateriUpdateRequest $request, Materi $materi)
    {
        $this->authorize('update', $materi);

        $user = $request->user();
        $data = $request->validated();

        if ($user->role === 'guru') {
            unset($data['kelas_id'], $data['mapel_id']);
        }

        DB::transaction(function () use ($request, $materi, $data) {
            foreach (['title', 'praktik_text', 'kelas_id', 'mapel_id'] as $field) {
                if (array_key_exists($field, $data)) {
                    $materi->{$field} = in_array($field, ['kelas_id', 'mapel_id'])
                        ? (int) $data[$field]
                        : $data[$field];
                }
            }

            if ($request->hasFile('pdf')) {
                if ($materi->pdf_path) {
                    Storage::disk('public')->delete($materi->pdf_path);
                }
                $materi->pdf_path = $request->file('pdf')->store('materi_pdfs', 'public');
            }

            $materi->save();
        });

        return response()->json(['success' => true, 'data' => true]);
    }

    public function destroy(Request $request, Materi $materi)
    {
        $this->authorize('delete', $materi);

        DB::transaction(function () use ($materi) {
            if ($materi->pdf_path) {
                Storage::disk('public')->delete($materi->pdf_path);
            }
            $materi->delete();
        });

        return response()->json(['success' => true, 'data' => true]);
    }

    public function download(Request $request, Materi $materi)
    {
        $this->authorize('download', $materi);

        abort_if(!$materi->pdf_path || !Storage::disk('public')->exists($materi->pdf_path), 404);

        $materi->loadMissing(['kelas:id,name', 'mapel:id,name']);
        $filename = Str::slug(
            ($materi->title ?: 'materi') . '-' .
            ($materi->mapel?->name ?: 'mapel') . '-' .
            ($materi->kelas?->name ?: 'kelas')
        ) . '.pdf';

        return response()->download(
            Storage::disk('public')->path($materi->pdf_path),
            $filename,
            ['Content-Type' => 'application/pdf']
        );
    }

    public function tests(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        $tests = $materi->tests()
            ->select(['id', 'title', 'type', 'created_at'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($t) => [
                'id'         => $t->id,
                'title'      => $t->title,
                'type'       => $t->type,
                'created_at' => optional($t->created_at)->toDateTimeString(),
            ]);

        return response()->json(['success' => true, 'data' => $tests]);
    }

    public function practiceChecklists(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = PracticeRule::query()
            ->where('materi_id', $materi->id)
            ->select(['id', 'materi_id', 'title', 'deadline_at', 'created_by', 'created_at'])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where('title', 'like', '%' . $search . '%');
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(fn (PracticeRule $r) => [
            'id'          => $r->id,
            'title'       => $r->title,
            'deadline_at' => optional($r->deadline_at)->toDateTimeString(),
            'created_at'  => optional($r->created_at)->toDateTimeString(),
        ])->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function ruleChecklists(Request $request, PracticeRule $rule)
    {
        $rule->load('materi');
        $this->authorize('view', $rule->materi);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = PracticeChecklist::query()
            ->where('practice_rule_id', $rule->id)
            ->orderBy('order');

        if ($search !== '') {
            $query->where('title', 'like', '%' . $search . '%');
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(fn (PracticeChecklist $c) => [
            'id'         => $c->id,
            'title'      => $c->title,
            'order'      => $c->order,
            'created_at' => optional($c->created_at)->toDateTimeString(),
        ])->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function practiceResults(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = PracticeSubmission::query()
            ->with([
                'student:id,name,email',
                'student.siswaProfile:user_id,full_name',
                'grader:id,name,role',
                'grader.guruProfile:user_id,full_name',
            ])
            ->where('materi_id', $materi->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->orderByRaw("CASE WHEN status = 'submitted' THEN 0 ELSE 1 END")
            ->orderByDesc('submitted_at');

        // search by student name via join
        if ($search) {
            $query->whereHas('student.siswaProfile', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            });
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function ($row) {
            $graderName = null;
            if ($row->grader) {
                $graderName = $row->grader->role === 'admin'
                    ? 'Admin'
                    : ($row->grader->guruProfile?->full_name ?: $row->grader->name);
            }

            return [
                'id'              => $row->id,
                'full_name'       => $row->student?->siswaProfile?->full_name ?: ($row->student?->name ?: '-'),
                'status'          => $row->status,
                'status_label'    => $row->status === 'graded' ? 'Dikumpulkan - dinilai' : 'Dikumpulkan - belum dinilai',
                'total_score'     => $row->total_score,
                'graded_by_label' => $graderName,
                'submitted_at'    => optional($row->submitted_at)->toDateTimeString(),
                'graded_at'       => optional($row->graded_at)->toDateTimeString(),
                'feedback'        => $row->feedback,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function testAttempts(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        $type = (string) $request->query('type', 'pretest');
        abort_unless(in_array($type, ['pretest', 'posttest'], true), 422);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = TestAttempt::query()
            ->with([
                'test:id,materi_id,title,type',
                'student:id,name,email',
                'student.siswaProfile:user_id,full_name',
                'answers:id,attempt_id,is_correct',
            ])
            ->whereHas('test', function ($q) use ($materi, $type) {
                $q->where('materi_id', $materi->id)->where('type', $type);
            })
            ->where('status', 'submitted')
            ->orderByDesc('finished_at');

        if ($search) {
            $query->whereHas('student.siswaProfile', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            });
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function ($row) {
            $correct = $row->answers->where('is_correct', true)->count();
            $wrong   = $row->answers->where('is_correct', false)->count();

            return [
                'id'               => $row->id,
                'full_name'        => $row->student?->siswaProfile?->full_name ?: ($row->student?->name ?: '-'),
                'title'            => $row->test?->title ?: '-',
                'type'             => $row->test?->type,
                'duration_seconds' => $row->duration_seconds,
                'score'            => $row->score,
                'created_at'       => optional($row->created_at)->toDateTimeString(),
                'submitted_at'     => optional($row->finished_at)->toDateTimeString(),
                'correct'          => $correct,
                'wrong'            => $wrong,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function topStudents(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        $rows = DB::table('test_attempts')
            ->join('tests', 'tests.id', '=', 'test_attempts.test_id')
            ->join('users', 'users.id', '=', 'test_attempts.student_user_id')
            ->leftJoin('siswa_profiles', 'siswa_profiles.user_id', '=', 'users.id')
            ->selectRaw('test_attempts.student_user_id')
            ->selectRaw('COALESCE(siswa_profiles.full_name, users.name, users.email) as full_name')
            ->selectRaw('ROUND(AVG(test_attempts.score), 2) as avg_score')
            ->selectRaw("SUM(CASE WHEN tests.type = 'pretest' THEN 1 ELSE 0 END) as pretest_count")
            ->selectRaw("SUM(CASE WHEN tests.type = 'posttest' THEN 1 ELSE 0 END) as posttest_count")
            ->where('tests.materi_id', $materi->id)
            ->where('test_attempts.status', 'submitted')
            ->groupBy('test_attempts.student_user_id', 'full_name')
            ->orderByDesc('avg_score')
            ->limit(5)
            ->get();

        return response()->json(['success' => true, 'data' => $rows, 'error' => null]);
    }

    public function exportResultsZip(Request $request, Materi $materi, MateriResultsExportService $service)
    {
        $this->authorize('view', $materi);
        return $service->download($materi, $request->user());
    }
}