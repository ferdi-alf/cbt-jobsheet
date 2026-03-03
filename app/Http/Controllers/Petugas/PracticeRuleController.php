<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Petugas\PracticeRuleStoreRequest;
use App\Http\Requests\Petugas\PracticeRuleUpdateRequest;
use App\Models\Materi;
use App\Models\PracticeChecklist;
use App\Models\PracticeRule;
use App\Models\PracticeSubmission;
use App\Models\SiswaProfile;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PracticeRuleController extends Controller
{
    use PaginatesApi;

    private function guruProfileOr403(Request $request)
    {
        $u = $request->user();
        $u->loadMissing('guruProfile');
        $gp = $u->guruProfile;
        abort_if(!$gp || !$gp->kelas_id || !$gp->mapel_id, 403);
        return $gp;
    }

    private function ensureGuruCanAccessMateri(Request $request, Materi $materi): void
    {
        $u = $request->user();
        if ($u->role !== 'guru') return;

        $gp = $this->guruProfileOr403($request);

        abort_if((int) $materi->kelas_id !== (int) $gp->kelas_id, 403);
        abort_if((int) $materi->mapel_id !== (int) $gp->mapel_id, 403);
    }

    private function ensureGuruCanAccessRule(Request $request, PracticeRule $rule): void
    {
        $u = $request->user();
        if ($u->role !== 'guru') return;

        $rule->loadMissing('materi:id,kelas_id,mapel_id');
        $this->ensureGuruCanAccessMateri($request, $rule->materi);
    }


    public function lookupMateris(Request $request)
    {
        $u = $request->user();

        $q = Materi::query()
            ->select(['id', 'title', 'kelas_id', 'mapel_id'])
            ->with(['kelas:id,name', 'mapel:id,name'])
            ->orderByDesc('id');

        if ($u->role === 'guru') {
            $gp = $this->guruProfileOr403($request);
            $q->where('kelas_id', $gp->kelas_id)->where('mapel_id', $gp->mapel_id);
        }

        $items = $q->limit(300)->get()->map(fn ($m) => [
            'id' => $m->id,
            'title' => $m->title,
            'kelas' => $m->kelas?->name,
            'mapel' => $m->mapel?->name,
        ]);

        return response()->json(['success' => true, 'data' => $items]);
    }

    
    public function index(Request $request)
    {
        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $u = $request->user();

        $query = PracticeRule::query()
            ->with([
                'materi:id,title,kelas_id,mapel_id',
                'materi.kelas:id,name',
                'materi.mapel:id,name',
                'creator:id,name,email',
            ])
            ->withCount('checklists')
            ->orderByDesc('id');

        if ($u->role === 'guru') {
            $gp = $this->guruProfileOr403($request);

            $query->whereHas('materi', function ($q) use ($gp) {
                $q->where('kelas_id', $gp->kelas_id)
                  ->where('mapel_id', $gp->mapel_id);
            });
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')
                  ->orWhereHas('materi', fn ($mq) => $mq->where('title', 'like', '%'.$search.'%'));
            });
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (PracticeRule $r) {
            return [
                'id' => $r->id,
                'title' => $r->title,
                'deadline_at' => optional($r->deadline_at)->toDateTimeString(),
                'created_at' => optional($r->created_at)->toDateTimeString(),

                'total_checklists' => (int) $r->checklists_count,

                'materi' => $r->materi ? [
                    'id' => $r->materi->id,
                    'title' => $r->materi->title,
                ] : null,

                'kelas' => $r->materi?->kelas?->name,
                'mapel' => $r->materi?->mapel?->name,

                'created_by' => $r->creator ? [
                    'id' => $r->creator->id,
                    'name' => $r->creator->name,
                    'email' => $r->creator->email,
                ] : null,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function show(Request $request, PracticeRule $practice_rule)
    {
        $this->ensureGuruCanAccessRule($request, $practice_rule);

        $mode = (string) $request->query('mode', '');

        if ($mode === 'edit') {
            $practice_rule->load([
                'checklists:id,practice_rule_id,title,order',
                'materi:id,title,kelas_id,mapel_id',
                'materi.kelas:id,name',
                'materi.mapel:id,name',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $practice_rule->id,
                    'materi_id' => (int) $practice_rule->materi_id,
                    'title' => $practice_rule->title,
                    'deadline_at' => optional($practice_rule->deadline_at)->toDateTimeString(),
                    'checklists' => $practice_rule->checklists
                        ->sortBy('order')
                        ->values()
                        ->map(fn ($c) => [
                            'id' => $c->id,
                            'title' => $c->title,
                            'order' => (int) $c->order,
                        ]),
                    'materi_label' => [
                        'title' => $practice_rule->materi?->title,
                        'kelas' => $practice_rule->materi?->kelas?->name,
                        'mapel' => $practice_rule->materi?->mapel?->name,
                    ],
                ],
                'error' => null,
            ]);
        }

        $practice_rule->load([
            'materi:id,title,kelas_id,mapel_id',
            'materi.kelas:id,name',
            'materi.mapel:id,name',
            'creator:id,name,email',
        ])->loadCount('checklists');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $practice_rule->id,
                'title' => $practice_rule->title,
                'deadline_at' => optional($practice_rule->deadline_at)->toDateTimeString(),
                'created_at' => optional($practice_rule->created_at)->toDateTimeString(),
                'total_checklists' => (int) $practice_rule->checklists_count,
                'materi' => $practice_rule->materi ? [
                    'id' => $practice_rule->materi->id,
                    'title' => $practice_rule->materi->title,
                ] : null,
                'kelas' => $practice_rule->materi?->kelas?->name,
                'mapel' => $practice_rule->materi?->mapel?->name,
                'created_by' => $practice_rule->creator ? [
                    'id' => $practice_rule->creator->id,
                    'name' => $practice_rule->creator->name,
                    'email' => $practice_rule->creator->email,
                ] : null,
            ],
            'error' => null,
        ]);
    }

    public function store(PracticeRuleStoreRequest $request)
    {
        $u = $request->user();
        $data = $request->validated();

        $materi = Materi::findOrFail((int) $data['materi_id']);
        $this->ensureGuruCanAccessMateri($request, $materi);

        $rule = DB::transaction(function () use ($data, $u) {
            $r = PracticeRule::create([
                'materi_id' => (int) $data['materi_id'],
                'title' => $data['title'],
                'deadline_at' => $data['deadline_at'] ?? null,
                'created_by' => $u->id,
            ]);

            $rows = collect($data['checklists'])
                ->values()
                ->map(fn ($it, $idx) => [
                    'title' => $it['title'],
                    'order' => $idx + 1,
                ])->all();

            $r->checklists()->createMany($rows);

            return $r;
        });

        return response()->json(['success' => true, 'data' => ['id' => $rule->id]]);
    }


    public function update(PracticeRuleUpdateRequest $request, PracticeRule $practice_rule)
    {
        $this->ensureGuruCanAccessRule($request, $practice_rule);

        $u = $request->user();
        $data = $request->validated();

        if ($u->role === 'guru') {
            unset($data['materi_id']);
        }

        if (isset($data['materi_id'])) {
            $materi = Materi::findOrFail((int) $data['materi_id']);
            $this->ensureGuruCanAccessMateri($request, $materi);
        }

        DB::transaction(function () use ($practice_rule, $data) {
            if (array_key_exists('title', $data)) {
                $practice_rule->title = $data['title'];
            }
            if (array_key_exists('deadline_at', $data)) {
                $practice_rule->deadline_at = $data['deadline_at'] ?: null;
            }
            if (array_key_exists('materi_id', $data)) {
                $practice_rule->materi_id = (int) $data['materi_id'];
            }
            $practice_rule->save();

            if (array_key_exists('checklists', $data)) {
                $practice_rule->checklists()->delete();

                $rows = collect($data['checklists'])
                    ->values()
                    ->map(fn ($it, $idx) => [
                        'title' => $it['title'],
                        'order' => $idx + 1,
                    ])->all();

                $practice_rule->checklists()->createMany($rows);
            }
        });

        return response()->json(['success' => true, 'data' => true]);
    }

    public function destroy(Request $request, PracticeRule $practice_rule)
    {
        $this->ensureGuruCanAccessRule($request, $practice_rule);

        DB::transaction(function () use ($practice_rule) {
            $practice_rule->checklists()->delete();
            $practice_rule->delete();
        });

        return response()->json(['success' => true, 'data' => true]);
    }

 
    public function checklists(Request $request, PracticeRule $practice_rule)
    {
        $this->ensureGuruCanAccessRule($request, $practice_rule);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $q = PracticeChecklist::query()
            ->where('practice_rule_id', $practice_rule->id)
            ->orderBy('order');

        if ($search !== '') {
            $q->where('title', 'like', '%'.$search.'%');
        }

        $paginator = $this->paginateEloquent($q, $page, $limit);

        $items = collect($paginator->items())->map(fn (PracticeChecklist $c) => [
            'id' => $c->id,
            'order' => (int) $c->order,
            'title' => $c->title,
            'created_at' => optional($c->created_at)->toDateTimeString(),
        ])->values();

        return $this->paginatedResponse($paginator, $items);
    }


    public function stats(Request $request, PracticeRule $practice_rule)
    {
        $this->ensureGuruCanAccessRule($request, $practice_rule);

        $practice_rule->loadMissing('materi:id,kelas_id');

        $kelasId = (int) $practice_rule->materi->kelas_id;

        $totalStudents = SiswaProfile::query()
            ->where('kelas_id', $kelasId)
            ->count();

        $submittedIds = PracticeSubmission::query()
            ->where('materi_id', $practice_rule->materi_id)
            ->whereNotNull('submitted_at')
            ->pluck('student_user_id')
            ->unique()
            ->values();

        $submittedCount = $submittedIds->count();
        $notSubmittedCount = max(0, $totalStudents - $submittedCount);

        $notSubmitted = SiswaProfile::query()
            ->with('user:id,name,email')
            ->where('kelas_id', $kelasId)
            ->whereNotIn('user_id', $submittedIds->all())
            ->orderBy('full_name')
            ->limit(500)
            ->get()
            ->map(fn ($sp) => [
                'id' => $sp->user_id,
                'name' => $sp->full_name ?: ($sp->user?->name ?? $sp->user?->email),
                'nisn' => $sp->nisn,
            ]);

        $chart = [
            ['label' => 'Sudah', 'value' => $submittedCount],
            ['label' => 'Belum', 'value' => $notSubmittedCount],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'total_students' => $totalStudents,
                'submitted' => $submittedCount,
                'not_submitted' => $notSubmittedCount,
                'chart' => $chart,
                'not_submitted_students' => $notSubmitted,
            ],
        ]);
    }

 
    public function submissions(Request $request, PracticeRule $practice_rule)
    {
        $this->ensureGuruCanAccessRule($request, $practice_rule);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $q = PracticeSubmission::query()
            ->with([
                'student:id,name,email',
                'student.siswaProfile:user_id,full_name,nisn,kelas_id',
            ])
            ->where('materi_id', $practice_rule->materi_id)
            ->whereNotNull('submitted_at')
            ->orderByDesc('submitted_at');

        if ($search !== '') {
            $q->whereHas('student.siswaProfile', fn ($sq) =>
                $sq->where('full_name', 'like', '%'.$search.'%')
                   ->orWhere('nisn', 'like', '%'.$search.'%')
            );
        }

        $paginator = $this->paginateEloquent($q, $page, $limit);

        $items = collect($paginator->items())->map(function (PracticeSubmission $s) {
            $sp = $s->student?->siswaProfile;
            return [
                'id' => $s->id,
                'student_id' => $s->student_user_id,
                'name' => $sp?->full_name ?? ($s->student?->name ?? $s->student?->email),
                'nisn' => $sp?->nisn,
                'status' => $s->status,
                'is_late' => (bool) $s->is_late,
                'submitted_at' => optional($s->submitted_at)->toDateTimeString(),
                'total_score' => $s->total_score,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }
}