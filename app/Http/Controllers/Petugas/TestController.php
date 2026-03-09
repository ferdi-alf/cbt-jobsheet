<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Petugas\TestStoreRequest;
use App\Http\Requests\Petugas\TestUpdateRequest;
use App\Models\Materi;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestQuestion;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TestController extends Controller
{
    use PaginatesApi;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Test::class);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);
        $user = $request->user();

        $query = Test::query()
            ->select([
                'id',
                'materi_id',
                'type',
                'title',
                'duration_minutes',
                'is_score_visible',
                'created_by',
                'created_at',
                'start_at',
                'end_at',
            ])
            ->with([
                'materi:id,title,kelas_id,mapel_id',
                'materi.kelas:id,name',
                'materi.mapel:id,name',
                'creator:id,name,email,role',
                'creator.guruProfile:user_id,full_name',
            ])
            ->withCount('questions')
            ->orderByDesc('id');

            if ($user->role === 'guru') {
                $gp = $user->guruProfile;
                if (!$gp || !$gp->kelas_id || !$gp->mapel_id) {
                    return $this->paginatedResponse(
                        $this->paginateEloquent($query->whereRaw('1=0'), $page, $limit),
                        collect([])->values()
                    );
                }

                $query->whereHas('materi', function ($q) use ($gp) {
                    $q->where('kelas_id', $gp->kelas_id)
                    ->where('mapel_id', $gp->mapel_id);
                });
            }

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%'.$search.'%')
                    ->orWhere('type', 'like', '%'.$search.'%')
                    ->orWhereHas('materi', fn($m) => $m->where('title', 'like', '%'.$search.'%'));
                });
            }

            $paginator = $this->paginateEloquent($query, $page, $limit);

            $items = collect($paginator->items())->map(function (Test $t) {
                $creator = $t->creator;

                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'type' => $t->type,
                    'duration_minutes' => (int) $t->duration_minutes,
                    'is_score_visible' => (bool) $t->is_score_visible,
                    'start_at' => optional($t->start_at)->toDateTimeString(),
                    'end_at' => optional($t->end_at)->toDateTimeString(),
                    'total_questions' => (int) ($t->questions_count ?? 0),

                    'materi' => $t->materi ? [
                        'id' => $t->materi->id,
                        'title' => $t->materi->title,
                        'kelas' => $t->materi?->kelas?->name,
                        'mapel' => $t->materi?->mapel?->name,
                    ] : null,

                    'created_by' => $creator ? [
                        'id' => $creator->id,
                        'name' => $creator->name,
                        'email' => $creator->email,
                        'role' => $creator->role,
                        'full_name' => $creator->guruProfile?->full_name,
                    ] : null,

                    'created_at' => optional($t->created_at)->toDateTimeString(),
                ];
            })->values();

            return $this->paginatedResponse($paginator, $items);
        }

    public function store(TestStoreRequest $request)
    {
        $this->authorize('create', Test::class);

        $user = $request->user();
        $data = $request->validated();

        $materi = Materi::query()->with(['kelas:id,name','mapel:id,name'])->findOrFail($data['materi_id']);

        if ($user->role === 'guru') {
            $gp = $user->guruProfile;
            abort_if(!$gp || !$gp->kelas_id || !$gp->mapel_id, 403);
            abort_if((int)$materi->kelas_id !== (int)$gp->kelas_id, 403);
            abort_if((int)$materi->mapel_id !== (int)$gp->mapel_id, 403);
        }

        $testId = DB::transaction(function () use ($data, $user) {
                $this->ensureSinglePretestPerMateri(
                    (int) $data['materi_id'],
                    (string) $data['type'],
                );

                $test = Test::create([
                    'materi_id' => (int)$data['materi_id'],
                    'type' => $data['type'],
                    'title' => $data['title'],
                    'duration_minutes' => (int)$data['duration_minutes'],
                    'start_at' => $data['start_at'] ?? null,
                    'end_at' => $data['end_at'] ?? null,
                    'is_score_visible' => (bool)$data['is_score_visible'],
                    'created_by' => $user->id,
                ]);

            $questions = collect($data['questions'])->values()->map(function ($q, $idx) use ($test) {
                return [
                    'test_id' => $test->id,
                    'question' => $q['question'],
                    'option_a' => $q['option_a'],
                    'option_b' => $q['option_b'],
                    'option_c' => $q['option_c'],
                    'option_d' => $q['option_d'],
                    'option_e' => $q['option_e'],
                    'correct_option' => $q['correct_option'],
                    'order' => $idx + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });

            TestQuestion::insert($questions->all());

            return $test->id;
        });

        return response()->json(['success' => true, 'data' => ['id' => $testId], 'error' => null]);
    }


    public function show(Request $request, Test $test)
    {
        $test->load([
            'materi:id,title,kelas_id,mapel_id',
            'materi.kelas:id,name',
            'materi.mapel:id,name',
            'creator:id,name,email,role',
            'creator.guruProfile:user_id,full_name',
        ])->loadCount('questions');
        
        $this->authorize('view', $test);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $test->id,
                'materi_id' => (int)$test->materi_id,
                'type' => $test->type,
                'title' => $test->title,
                'duration_minutes' => (int)$test->duration_minutes,
                'start_at' => optional($test->start_at)->toDateTimeString(),
                'end_at' => optional($test->end_at)->toDateTimeString(),
                'is_score_visible' => (bool)$test->is_score_visible,

                'materi_label' => $test->materi ? [
                    'title' => $test->materi->title,
                    'kelas' => $test->materi->kelas?->name,
                    'mapel' => $test->materi->mapel?->name,
                ] : null,

                'questions' => $test->questions->map(fn($q) => [
                    'id' => $q->id,
                    'order' => (int)$q->order,
                    'question' => $q->question,
                    'option_a' => $q->option_a,
                    'option_b' => $q->option_b,
                    'option_c' => $q->option_c,
                    'option_d' => $q->option_d,
                    'option_e' => $q->option_e,
                    'correct_option' => $q->correct_option,
                ])->values(),
            ],
            'error' => null,
        ]);
    }

    public function update(TestUpdateRequest $request, Test $test)
    {
        $test->load('materi');
        $this->authorize('update', $test);

        $user = $request->user();
        $data = $request->validated();

        if (isset($data['materi_id'])) {
            $materi = Materi::findOrFail($data['materi_id']);

            if ($user->role === 'guru') {
                $gp = $user->guruProfile;
                abort_if(!$gp || !$gp->kelas_id || !$gp->mapel_id, 403);
                abort_if((int)$materi->kelas_id !== (int)$gp->kelas_id, 403);
                abort_if((int)$materi->mapel_id !== (int)$gp->mapel_id, 403);
            }
        }

        DB::transaction(function () use ($test, $data) {
            $nextMateriId = (int) ($data['materi_id'] ?? $test->materi_id);
            $nextType = (string) ($data['type'] ?? $test->type);

            $this->ensureSinglePretestPerMateri(
                $nextMateriId,
                $nextType,
                $test->id,
            );

            foreach (['materi_id','type','title','duration_minutes','start_at','end_at','is_score_visible'] as $f) {
                if (array_key_exists($f, $data)) $test->{$f} = $data[$f];
            }
            $test->save();

            if (array_key_exists('questions', $data)) {
                TestQuestion::query()->where('test_id', $test->id)->delete();

                $rows = collect($data['questions'])->values()->map(function ($q, $idx) use ($test) {
                    return [
                        'test_id' => $test->id,
                        'question' => $q['question'],
                        'option_a' => $q['option_a'],
                        'option_b' => $q['option_b'],
                        'option_c' => $q['option_c'],
                        'option_d' => $q['option_d'],
                        'option_e' => $q['option_e'],
                        'correct_option' => $q['correct_option'],
                        'order' => $idx + 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                });

                TestQuestion::insert($rows->all());
            }
        });

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

    public function destroy(Request $request, Test $test)
    {
        $this->authorize('delete', $test);

        DB::transaction(function () use ($test) {
            TestQuestion::query()->where('test_id', $test->id)->delete();
            $test->delete();
        });

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

 
    public function questions(Request $request, Test $test)
    {
        $test->load('materi');
        $this->authorize('view', $test);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = TestQuestion::query()
            ->where('test_id', $test->id)
            ->orderBy('order');

        if ($search !== '') {
            $query->where('question', 'like', '%'.$search.'%');
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (TestQuestion $q) {
            return [
                'id' => $q->id,
                'order' => (int)$q->order,
                'question' => $q->question,
                'options' => [
                    'a' => $q->option_a,
                    'b' => $q->option_b,
                    'c' => $q->option_c,
                    'd' => $q->option_d,
                    'e' => $q->option_e,
                ],
                'correct_option' => $q->correct_option,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function overview(Request $request, Test $test)
    {
        $test->load([
            'materi:id,title,kelas_id,mapel_id',
            'materi.kelas:id,name',
            'materi.mapel:id,name',
            'creator:id,name,email,role',
            'creator.guruProfile:user_id,full_name',
        ])->loadCount('questions');
        $this->authorize('view', $test);

        $totalQuestions = $test->questions()->count();
        $attemptsCount = $test->attempts()->count();

        $top5 = TestAttempt::query()
            ->where('test_id', $test->id)
            ->whereNotNull('score')
            ->orderByDesc('score')
            ->limit(5)
            ->with(['student:id,name,email', 'student.siswaProfile:user_id,full_name,kelas_id'])
            ->get()
            ->map(function ($a) {
                $name = $a->student?->siswaProfile?->full_name
                    ?: ($a->student?->name ?: $a->student?->email);

                return [
                    'student_id' => $a->student_user_id,
                    'name' => $name,
                    'score' => (int)($a->score ?? 0),
                ];
            })->values();

        $above80 = TestAttempt::query()
            ->where('test_id', $test->id)
            ->whereNotNull('score')
            ->where('score', '>=', 80)
            ->count();

        $below80 = TestAttempt::query()
            ->where('test_id', $test->id)
            ->whereNotNull('score')
            ->where('score', '<', 80)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $test->id,
                'title' => $test->title,
                'type' => $test->type,
                'duration_minutes' => (int)$test->duration_minutes,
                'start_at' => optional($test->start_at)->toDateTimeString(),
                'end_at' => optional($test->end_at)->toDateTimeString(),
                'is_score_visible' => (bool)$test->is_score_visible,
                'materi' => $test->materi ? [
                    'id' => $test->materi->id,
                    'title' => $test->materi->title,
                    'kelas' => $test->materi->kelas?->name,
                    'mapel' => $test->materi->mapel?->name,
                ] : null,
                'created_by' => $test->creator ? [
                    'id' => $test->creator->id,
                    'name' => $test->creator->name,
                    'email' => $test->creator->email,
                    'role' => $test->creator->role,
                    'full_name' => $test->creator->guruProfile?->full_name,
                ] : null,
                'stats' => [
                    'total_questions' => $totalQuestions,
                    'total_attempts' => $attemptsCount,
                ],
                'top5' => $top5,
                'pie' => [
                    ['label' => '>= 80', 'value' => $above80],
                    ['label' => '< 80', 'value' => $below80],
                ],
            ],
            'error' => null,
        ]);
    }

    public function attempts(Request $request, Test $test)
    {
        $test->load('materi');
        $this->authorize('view', $test);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = TestAttempt::query()
            ->where('test_id', $test->id)
            ->with([
                'student:id,name,email',
                'student.siswaProfile:user_id,full_name,kelas_id,nisn',
                'student.siswaProfile.kelas:id,name',
            ])
            ->withCount([
                'answers as correct_count' => fn($q) => $q->where('is_correct', true),
                'answers as wrong_count' => fn($q) => $q->where('is_correct', false),
            ])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('email', 'like', '%'.$search.'%')
                  ->orWhere('name', 'like', '%'.$search.'%')
                  ->orWhereHas('siswaProfile', fn($sp) => $sp->where('full_name', 'like', '%'.$search.'%')
                      ->orWhere('nisn', 'like', '%'.$search.'%'));
            });
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (TestAttempt $a) {
            $profile = $a->student?->siswaProfile;

            $name = $profile?->full_name ?: ($a->student?->name ?: $a->student?->email);

            return [
                'id' => $a->id,
                'name' => $name,
                'kelas' => $profile?->kelas?->name,
                'nisn' => $profile?->nisn,
                'duration_seconds' => (int)($a->duration_seconds ?? 0),
                'started_at' => optional($a->started_at)->toDateTimeString(),
                'finished_at' => optional($a->finished_at)->toDateTimeString(),
                'score' => (int)($a->score ?? 0),
                'correct' => (int)($a->correct_count ?? 0),
                'wrong' => (int)($a->wrong_count ?? 0),
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    private function ensureSinglePretestPerMateri(int $materiId, string $type, ?int $ignoreTestId = null): void
    {
        if ($type !== 'pretest') {
            return;
        }

        $exists = Test::query()
            ->where('materi_id', $materiId)
            ->where('type', 'pretest')
            ->when($ignoreTestId, fn ($q) => $q->whereKeyNot($ignoreTestId))
            ->lockForUpdate()
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'materi_id' => [
                    'Materi ini sudah memiliki pretest. Setiap materi hanya boleh memiliki 1 pretest.',
                ],
            ]);
        }
    }
}