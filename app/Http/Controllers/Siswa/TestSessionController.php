<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siswa\SaveTestAnswerRequest;
use App\Http\Requests\Siswa\SubmitTestRequest;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestQuestion;
use Illuminate\Http\Request;

class TestSessionController extends Controller
{
    public function start(string $publicKey, Request $request)
    {
        $test = $this->resolveTest($publicKey);
        $user = $this->authorizeStudent($request, $test);
        $now = now();

        $attempt = TestAttempt::query()
            ->where('test_id', $test->id)
            ->where('student_user_id', $user->id)
            ->first();

        if ($attempt && $this->isSubmittedAttempt($attempt)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'already_finished' => true,
                    'redirect_url' => route('siswa.tests.finished', ['publicKey' => $publicKey]),
                    'finish_reason' => 'manual',
                ],
                'error' => null,
            ]);
        }

        if (!$attempt) {
            if ($test->start_at && $now->lt($test->start_at)) {
                abort(422, 'Test belum dimulai.');
            }

            if ($test->end_at && $now->gt($test->end_at)) {
                abort(422, 'Test sudah berakhir.');
            }

            $attempt = TestAttempt::create([
                'test_id' => $test->id,
                'student_user_id' => $user->id,
                'started_at' => $now,
                'status' => 'on_progress',
                'duration_seconds' => 0,
            ]);
        }

        if (!$attempt->started_at) {
            $attempt->started_at = $now;
            $attempt->status = 'on_progress';
            $attempt->save();
        }

        if ($this->isExpired($test, $attempt)) {
            $this->finalizeAttempt($test, $attempt);

            return response()->json([
                'success' => true,
                'data' => [
                    'already_finished' => true,
                    'redirect_url' => route('siswa.tests.finished', ['publicKey' => $publicKey]),
                    'finish_reason' => 'timeout',
                ],
                'error' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->sessionPayload($test, $attempt, $publicKey),
            'error' => null,
        ]);
    }

    public function saveAnswer(string $publicKey, SaveTestAnswerRequest $request)
    {
        $test = $this->resolveTest($publicKey);
        $user = $this->authorizeStudent($request, $test);

        $attempt = TestAttempt::query()
            ->where('test_id', $test->id)
            ->where('student_user_id', $user->id)
            ->firstOrFail();

        if ($this->isSubmittedAttempt($attempt)) {
            abort(409, 'Test sudah selesai.');
        }

        if ($this->isExpired($test, $attempt)) {
            $this->finalizeAttempt($test, $attempt);
            abort(409, 'Waktu habis. Jawaban sudah dikirim otomatis.');
        }

        $data = $request->validated();
        $selected = $this->normalizeOption($data['selected_option'] ?? null);

        $question = $test->questions()
            ->whereKey($data['question_id'])
            ->firstOrFail();

        $attempt->answers()->updateOrCreate(
            ['question_id' => $question->id],
            [
                'selected_option' => $selected,
                'is_correct' => $selected === $this->normalizeOption($question->correct_option),
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'answered_count' => $attempt->answers()->whereNotNull('selected_option')->count(),
            ],
            'error' => null,
        ]);
    }

    public function submit(string $publicKey, SubmitTestRequest $request)
    {
        $test = $this->resolveTest($publicKey);
        $user = $this->authorizeStudent($request, $test);

        $attempt = TestAttempt::firstOrCreate(
            [
                'test_id' => $test->id,
                'student_user_id' => $user->id,
            ],
            [
                'started_at' => now(),
                'status' => 'on_progress',
                'duration_seconds' => 0,
            ]
        );

        if ($this->isSubmittedAttempt($attempt)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'redirect_url' => route('siswa.tests.finished', ['publicKey' => $publicKey]),
                ],
                'error' => null,
            ]);
        }

        $answers = collect($request->validated('answers', []));
        if ($answers->isNotEmpty()) {
            $questions = $test->questions()->get()->keyBy('id');

            foreach ($answers as $row) {
                $question = $questions->get((int) $row['question_id']);
                if (!$question) {
                    continue;
                }

                $selected = $this->normalizeOption($row['selected_option'] ?? null);
                if ($selected === null) {
                    continue;
                }

                $attempt->answers()->updateOrCreate(
                    ['question_id' => $question->id],
                    [
                        'selected_option' => $selected,
                        'is_correct' => $selected === $this->normalizeOption($question->correct_option),
                    ]
                );
            }
        }

        $this->finalizeAttempt($test, $attempt);

        return response()->json([
            'success' => true,
            'data' => [
                'redirect_url' => route('siswa.tests.finished', ['publicKey' => $publicKey]),
            ],
            'error' => null,
        ]);
    }

    public function result(string $publicKey, Request $request)
    {
        $test = $this->resolveTest($publicKey);
        $user = $this->authorizeStudent($request, $test);

        $attempt = TestAttempt::query()
            ->with('answers')
            ->where('test_id', $test->id)
            ->where('student_user_id', $user->id)
            ->firstOrFail();

        abort_if(!$this->isSubmittedAttempt($attempt), 404);

        $totalQuestions = $test->questions()->count();
        $answeredCount = $attempt->answers->whereNotNull('selected_option')->count();
        $correctCount = $attempt->answers->where('is_correct', true)->count();
        $wrongCount = max(0, $answeredCount - $correctCount);
        $unansweredCount = max(0, $totalQuestions - $answeredCount);

        return response()->json([
            'success' => true,
            'data' => [
                'public_key' => $publicKey,
                'title' => $test->title,
                'type' => $test->type,
                'materi' => $test->materi ? [
                    'id' => $test->materi->id,
                    'title' => $test->materi->title,
                    'kelas' => $test->materi?->kelas?->name,
                    'mapel' => $test->materi?->mapel?->name,
                ] : null,
                'started_at' => optional($attempt->started_at)->toDateTimeString(),
                'finished_at' => optional($attempt->finished_at)->toDateTimeString(),
                'duration_seconds' => (int) ($attempt->duration_seconds ?? 0),
                'total_questions' => $totalQuestions,
                'answered_count' => $answeredCount,
                'unanswered_count' => $unansweredCount,
                'correct_count' => $correctCount,
                'wrong_count' => $wrongCount,
                'score' => $test->is_score_visible ? (int) ($attempt->score ?? 0) : null,
                'is_score_visible' => (bool) $test->is_score_visible,
                'back_url' => route($test->type === 'pretest' ? 'siswa.pretest' : 'siswa.posttest'),
                'back_label' => $test->type === 'pretest' ? 'pretest' : 'posttest',
            ],
            'error' => null,
        ]);
    }

    private function sessionPayload(Test $test, TestAttempt $attempt, string $publicKey): array
    {
        $test->loadMissing([
            'materi:id,title,kelas_id,mapel_id',
            'materi.kelas:id,name',
            'materi.mapel:id,name',
            'questions:id,test_id,question,option_a,option_b,option_c,option_d,option_e,correct_option',
        ]);

        $answers = $attempt->answers()
            ->get(['question_id', 'selected_option'])
            ->mapWithKeys(fn ($row) => [
                (int) $row->question_id => $this->normalizeOption($row->selected_option),
            ]);

        $questions = $test->questions
            ->sortBy(fn (TestQuestion $q) => $this->stableHash("q|{$attempt->id}|{$q->id}"))
            ->values()
            ->map(function (TestQuestion $q, int $index) use ($attempt, $answers) {
                $options = collect([
                    ['value' => 'A', 'text' => $q->option_a],
                    ['value' => 'B', 'text' => $q->option_b],
                    ['value' => 'C', 'text' => $q->option_c],
                    ['value' => 'D', 'text' => $q->option_d],
                    ['value' => 'E', 'text' => $q->option_e],
                ])
                    ->filter(fn (array $opt) => filled($opt['text']))
                    ->sortBy(fn (array $opt) => $this->stableHash("o|{$attempt->id}|{$q->id}|{$opt['value']}"))
                    ->values()
                    ->map(fn (array $opt, int $i) => [
                        'label' => chr(65 + $i),
                        'value' => $opt['value'],
                        'text' => $opt['text'],
                    ])
                    ->values();

                return [
                    'id' => $q->id,
                    'number' => $index + 1,
                    'question' => $q->question,
                    'selected_option' => $answers->get($q->id),
                    'options' => $options,
                ];
            })
            ->values();

        $expiresAt = $this->expiresAt($test, $attempt);

        return [
            'public_key' => $publicKey,
            'title' => $test->title,
            'type' => $test->type,
            'materi' => $test->materi ? [
                'id' => $test->materi->id,
                'title' => $test->materi->title,
                'kelas' => $test->materi?->kelas?->name,
                'mapel' => $test->materi?->mapel?->name,
            ] : null,
            'duration_minutes' => (int) $test->duration_minutes,
            'started_at' => optional($attempt->started_at)->toIso8601String(),
            'expires_at' => optional($expiresAt)->toIso8601String(),
            'remaining_seconds' => max(0, now()->diffInSeconds($expiresAt, false)),
            'is_score_visible' => (bool) $test->is_score_visible,
            'total_questions' => $questions->count(),
            'answered_count' => $questions->filter(fn ($q) => !empty($q['selected_option']))->count(),
            'result_url' => route('siswa.tests.finished', ['publicKey' => $publicKey]),
            'questions' => $questions,
        ];
    }

    private function finalizeAttempt(Test $test, TestAttempt $attempt): void
    {
        if ($this->isSubmittedAttempt($attempt)) {
            return;
        }

        $totalQuestions = max(1, $test->questions()->count());
        $correctCount = $attempt->answers()->where('is_correct', true)->count();
        $score = (int) round(($correctCount / $totalQuestions) * 100);

        $finishedAt = now();
        $durationSeconds = 0;

        if ($attempt->started_at) {
            $rawDuration = (float) $attempt->started_at->diffInRealSeconds($finishedAt, false);
            $durationSeconds = max(0, (int) floor($rawDuration));
            $maxSeconds = (int) $test->duration_minutes * 60;
            $durationSeconds = min($durationSeconds, $maxSeconds);
        }

        $attempt->update([
            'status' => 'submitted',
            'finished_at' => $finishedAt,
            'score' => $score,
            'duration_seconds' => (int) $durationSeconds,
        ]);
    }

    private function authorizeStudent(Request $request, Test $test)
    {
        $user = $request->user();
        abort_if(!$user || $user->role !== 'siswa', 403);

        $kelasId = $user->siswaProfile?->kelas_id;
        abort_if(!$kelasId, 403);
        abort_if((int) $test->materi?->kelas_id !== (int) $kelasId, 403);

        return $user;
    }

    private function resolveTest(string $publicKey): Test
    {
        $parts = explode('-', $publicKey);
        abort_unless(count($parts) >= 4, 404);

        $signature = array_pop($parts);
        $encodedId = array_pop($parts);
        $type = array_pop($parts);

        $id = (int) base_convert(strtolower($encodedId), 36, 10);
        abort_if($id <= 0, 404);

        $test = Test::query()
            ->with([
                'materi:id,title,kelas_id,mapel_id',
                'materi.kelas:id,name',
                'materi.mapel:id,name',
            ])
            ->findOrFail($id);

        $expected = substr(hash_hmac(
            'sha256',
            implode('|', [
                $test->id,
                $test->type,
                $test->materi_id,
                optional($test->created_at)->timestamp,
            ]),
            (string) config('app.key')
        ), 0, 12);

        abort_unless(hash_equals($expected, $signature), 404);
        abort_unless($test->type === $type, 404);

        return $test;
    }

    private function expiresAt(Test $test, TestAttempt $attempt)
    {
        $base = $attempt->started_at
            ? $attempt->started_at->copy()->addMinutes((int) $test->duration_minutes)
            : now()->addMinutes((int) $test->duration_minutes);

        if ($test->end_at && $test->end_at->lt($base)) {
            return $test->end_at->copy();
        }

        return $base;
    }

    private function isExpired(Test $test, TestAttempt $attempt): bool
    {
        return now()->gte($this->expiresAt($test, $attempt));
    }

    private function isSubmittedAttempt(TestAttempt $attempt): bool
    {
        return $attempt->status === 'submitted' || !is_null($attempt->finished_at);
    }

    private function normalizeOption(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $upper = strtoupper(trim($value));
        return in_array($upper, ['A', 'B', 'C', 'D', 'E'], true) ? $upper : null;
    }

    private function stableHash(string $seed): string
    {
        return hash_hmac('sha256', $seed, (string) config('app.key'));
    }
}