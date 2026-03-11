<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PosttestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->isSiswa(), 403);

        $kelasId = $this->resolveSiswaKelasId($user);

        if (!$kelasId) {
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => [],
                    'stats' => [
                        'total' => 0,
                        'waiting' => 0,
                        'in_progress' => 0,
                        'submitted' => 0,
                    ],
                    'meta' => [
                        'page' => 1,
                        'limit' => 8,
                        'total' => 0,
                        'totalPages' => 0,
                        'hasNextPage' => false,
                        'search' => '',
                    ],
                ],
                'error' => null,
            ]);
        }

        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, min(8, (int) $request->query('limit', 8)));
        $search = trim((string) $request->query('search', ''));
        $searchKey = Str::lower($search);

        $cacheKey = implode(':', [
            'siswa-posttests-v1',
            'user', $user->id,
            'kelas', $kelasId,
            'page', $page,
            'limit', $limit,
            'q', md5($searchKey),
        ]);

        $payload = Cache::remember($cacheKey, now()->addSeconds(20), function () use ($user, $kelasId, $page, $limit, $search) {
            $now = now();

            $baseQuery = Test::query()
                ->from('tests')
                ->join('materis', 'materis.id', '=', 'tests.materi_id')
                ->leftJoin('test_attempts as my_attempt', function ($join) use ($user) {
                    $join->on('my_attempt.test_id', '=', 'tests.id')
                        ->where('my_attempt.student_user_id', '=', $user->id);
                })
                ->where('tests.type', 'posttest')
                ->where('materis.kelas_id', $kelasId)
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('tests.title', 'like', '%' . $search . '%')
                            ->orWhere('materis.title', 'like', '%' . $search . '%');
                    });
                });

            $statsRow = (clone $baseQuery)
                ->selectRaw('COUNT(DISTINCT tests.id) as total')
                ->selectRaw("SUM(CASE WHEN my_attempt.id IS NULL THEN 1 ELSE 0 END) as waiting")
                ->selectRaw("SUM(CASE WHEN my_attempt.id IS NOT NULL AND (my_attempt.status <> 'submitted' AND my_attempt.finished_at IS NULL) THEN 1 ELSE 0 END) as in_progress")
                ->selectRaw("SUM(CASE WHEN my_attempt.status = 'submitted' OR my_attempt.finished_at IS NOT NULL THEN 1 ELSE 0 END) as submitted")
                ->first();

            $paginator = (clone $baseQuery)
                ->select([
                    'tests.id',
                    'tests.materi_id',
                    'tests.type',
                    'tests.title',
                    'tests.duration_minutes',
                    'tests.start_at',
                    'tests.end_at',
                    'tests.is_score_visible',
                    'tests.created_at',
                    'my_attempt.id as attempt_id',
                    'my_attempt.status as attempt_status',
                    'my_attempt.score as attempt_score',
                    'my_attempt.started_at as attempt_started_at',
                    'my_attempt.finished_at as attempt_finished_at',
                ])
                ->with([
                    'materi:id,title,kelas_id,mapel_id',
                    'materi.kelas:id,name',
                    'materi.mapel:id,name',
                ])
                ->withCount('questions')
                ->orderByRaw("CASE
                    WHEN (my_attempt.status = 'submitted' OR my_attempt.finished_at IS NOT NULL) THEN 2
                    WHEN my_attempt.id IS NOT NULL THEN 0
                    ELSE 1
                END ASC")
                ->orderByRaw('CASE WHEN tests.end_at IS NULL THEN 1 ELSE 0 END ASC')
                ->orderBy('tests.end_at')
                ->orderByDesc('tests.id')
                ->paginate($limit, ['*'], 'page', $page);

            $pageItems = collect($paginator->items());
            $materiIds = $pageItems->pluck('materi_id')->filter()->values();

            $pretests = Test::query()
                ->where('type', 'pretest')
                ->whereIn('materi_id', $materiIds)
                ->get(['id', 'materi_id'])
                ->keyBy('materi_id');

            $pretestAttempts = TestAttempt::query()
                ->whereIn('test_id', $pretests->pluck('id'))
                ->where('student_user_id', $user->id)
                ->get(['test_id', 'status', 'finished_at'])
                ->keyBy('test_id');

            $items = $pageItems
                ->map(function (Test $test) use ($now, $pretests, $pretestAttempts) {
                    $attemptStatus = $this->mapAttemptStatus(
                        $test->attempt_status,
                        $test->attempt_finished_at,
                    );

                    $pretest = $pretests->get($test->materi_id);
                    $pretestAttempt = $pretest ? $pretestAttempts->get($pretest->id) : null;

                    $pretestDone = $pretest
                        && $this->mapAttemptStatus(
                            $pretestAttempt?->status,
                            $pretestAttempt?->finished_at,
                        ) === 'submitted';

                    $availabilityStatus = $this->mapPosttestAvailabilityStatus(
                        $pretestDone,
                        $attemptStatus,
                        $test->start_at,
                        $test->end_at,
                        $now,
                    );

                    $canStart = in_array($availabilityStatus, ['available', 'in_progress'], true);
                    $publicKey = $this->makePublicKey($test);

                    return [
                        'id' => $test->id,
                        'public_key' => $publicKey,
                        'type' => 'posttest',
                        'title' => $test->title,
                        'duration_minutes' => (int) $test->duration_minutes,
                        'start_at' => optional($test->start_at)->toDateTimeString(),
                        'end_at' => optional($test->end_at)->toDateTimeString(),
                        'deadline_at' => optional($test->end_at)->toDateTimeString(),
                        'total_questions' => (int) ($test->questions_count ?? 0),
                        'is_score_visible' => (bool) $test->is_score_visible,
                        'entry_url' => route('siswa.tests.take', ['publicKey' => $publicKey]),
                        'result_url' => route('siswa.tests.finished', ['publicKey' => $publicKey]),
                        'availability_status' => $availabilityStatus,
                        'can_start' => $canStart,
                        'materi' => $test->materi ? [
                            'id' => $test->materi->id,
                            'title' => $test->materi->title,
                            'kelas' => $test->materi?->kelas?->name,
                            'mapel' => $test->materi?->mapel?->name,
                        ] : null,
                        'attempt' => $test->attempt_id ? [
                            'status' => $attemptStatus,
                            'score' => $test->is_score_visible && $test->attempt_score !== null
                                ? (int) $test->attempt_score
                                : null,
                            'started_at' => $test->attempt_started_at,
                            'finished_at' => $test->attempt_finished_at,
                        ] : null,
                    ];
                })
                ->values();

            return [
                'items' => $items,
                'stats' => [
                    'total' => (int) ($statsRow->total ?? 0),
                    'waiting' => (int) ($statsRow->waiting ?? 0),
                    'in_progress' => (int) ($statsRow->in_progress ?? 0),
                    'submitted' => (int) ($statsRow->submitted ?? 0),
                ],
                'meta' => [
                    'page' => $paginator->currentPage(),
                    'limit' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'totalPages' => $paginator->lastPage(),
                    'hasNextPage' => $paginator->hasMorePages(),
                    'search' => $search,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payload,
            'error' => null,
        ]);
    }

    private function resolveSiswaKelasId(User $user): ?int
    {
        $kelasId = $user->siswaProfile()->value('kelas_id');
        return $kelasId ? (int) $kelasId : null;
    }

    private function mapAttemptStatus(?string $status, $finishedAt): string
    {
        if ($status === 'submitted' || $finishedAt) {
            return 'submitted';
        }

        if ($status) {
            return 'in_progress';
        }

        return 'not_started';
    }

    private function mapPosttestAvailabilityStatus(
        bool $pretestDone,
        string $attemptStatus,
        $startAt,
        $endAt,
        $now,
    ): string {
        if ($attemptStatus === 'submitted') {
            return 'submitted';
        }

        if (!$pretestDone) {
            return 'locked_pretest';
        }

        if ($attemptStatus === 'in_progress') {
            return 'in_progress';
        }

        if ($startAt && $now->lt($startAt)) {
            return 'upcoming';
        }

        if ($endAt && $now->gt($endAt)) {
            return 'expired';
        }

        return 'available';
    }

    private function makePublicKey(Test $test): string
    {
        $slug = Str::slug(Str::limit($test->title, 50, ''));
        $encodedId = strtoupper(base_convert((string) $test->id, 10, 36));
        $signature = substr(hash_hmac(
            'sha256',
            implode('|', [
                $test->id,
                $test->type,
                $test->materi_id,
                optional($test->created_at)->timestamp,
            ]),
            (string) config('app.key')
        ), 0, 12);

        return "{$slug}-{$test->type}-{$encodedId}-{$signature}";
    }
}