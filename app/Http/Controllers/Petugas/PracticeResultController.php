<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Petugas\PracticeGradeRequest;
use App\Models\PracticeSubmission;
use App\Models\PracticeSubmissionItem;
use App\Models\User;
use App\Support\Api\PaginatesApi;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PracticeResultController extends Controller
{
    use PaginatesApi;

    public function summary(Request $request)
    {
        $user = $request->user();
        abort_unless(in_array($user?->role, ['admin', 'guru'], true), 403);

        $query = $this->scopedBaseQuery($user);

        $summary = (clone $query)
            ->selectRaw("SUM(CASE WHEN practice_submissions.status = 'submitted' THEN 1 ELSE 0 END) as pending_count")
            ->selectRaw("SUM(CASE WHEN practice_submissions.status = 'graded' THEN 1 ELSE 0 END) as graded_count")
            ->selectRaw("COUNT(*) as total_count")
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'pending_count' => (int) ($summary->pending_count ?? 0),
                'graded_count' => (int) ($summary->graded_count ?? 0),
                'total_count' => (int) ($summary->total_count ?? 0),
            ],
            'error' => null,
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless(in_array($user?->role, ['admin', 'guru'], true), 403);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);
        $filter = (string) $request->query('filter', 'all');

        $query = $this->scopedBaseQuery($user)
            ->with([
                'student:id,name,email',
                'student.siswaProfile:user_id,full_name',
                'materi:id,title',
                'grader:id,name,email,role',
                'grader.guruProfile:user_id,full_name',
            ]);

        if ($filter === 'pending') {
            $query->where('practice_submissions.status', 'submitted');
        } elseif ($filter === 'graded') {
            $query->where('practice_submissions.status', 'graded');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('student', function ($student) use ($search) {
                    $student->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhereHas('siswaProfile', fn ($sp) => $sp->where('full_name', 'like', '%' . $search . '%'));
                })->orWhereHas('materi', fn ($materi) => $materi->where('title', 'like', '%' . $search . '%'));
            });
        }

        if ($filter === 'all') {
            $query->orderByRaw("CASE WHEN practice_submissions.status = 'submitted' THEN 0 ELSE 1 END ASC");
        }

        $query->orderByDesc('practice_submissions.submitted_at')
            ->orderByDesc('practice_submissions.id');

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (PracticeSubmission $submission) {
            $studentName = $submission->student?->siswaProfile?->full_name
                ?? $submission->student?->name
                ?? $submission->student?->email
                ?? '-';

            $graderName = $submission->grader?->guruProfile?->full_name
                ?? $submission->grader?->name
                ?? $submission->grader?->email;

            return [
                'id' => $submission->id,
                'student_name' => $studentName,
                'status' => $submission->status,
                'submitted_at' => optional($submission->submitted_at)->toDateTimeString(),
                'total_score' => $submission->total_score,
                'graded_at' => optional($submission->graded_at)->toDateTimeString(),
                'feedback' => $submission->feedback,
                'materi_title' => $submission->materi?->title,
                'graded_by' => $graderName,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function show(Request $request, PracticeSubmission $submission)
    {
        $user = $request->user();
        abort_unless(in_array($user?->role, ['admin', 'guru'], true), 403);
        abort_unless($this->canAccessSubmission($user, $submission), 403);

        $submission->load([
            'student:id,name,email',
            'student.siswaProfile:user_id,full_name',
            'materi:id,title,praktik_text,kelas_id,mapel_id',
            'materi.practiceRule:id,materi_id,title,deadline_at',
            'materi.practiceRule.checklists:id,practice_rule_id,title,order',
            'items:id,submission_id,checklist_id,note',
            'items.photos:id,submission_item_id,photo_path,created_at',
            'grader:id,name,email,role',
            'grader.guruProfile:user_id,full_name',
        ]);

        $itemsByChecklist = $submission->items->keyBy('checklist_id');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $submission->id,
                'status' => $submission->status,
                'submitted_at' => optional($submission->submitted_at)->toDateTimeString(),
                'graded_at' => optional($submission->graded_at)->toDateTimeString(),
                'total_score' => $submission->total_score,
                'feedback' => $submission->feedback,
                'student' => [
                    'id' => $submission->student?->id,
                    'full_name' => $submission->student?->siswaProfile?->full_name
                        ?? $submission->student?->name
                        ?? $submission->student?->email,
                    'email' => $submission->student?->email,
                ],
                'materi' => [
                    'id' => $submission->materi?->id,
                    'title' => $submission->materi?->title,
                ],
                'grader' => $submission->grader ? [
                    'id' => $submission->grader->id,
                    'name' => $submission->grader->guruProfile?->full_name
                        ?? $submission->grader->name
                        ?? $submission->grader->email,
                ] : null,
                'practice' => [
                    'title' => $submission->materi?->practiceRule?->title,
                    'description' => $submission->materi?->praktik_text,
                    'deadline_at' => optional($submission->materi?->practiceRule?->deadline_at)->toDateTimeString(),
                    'checklists' => $submission->materi?->practiceRule?->checklists->map(function ($checklist) use ($itemsByChecklist) {
                        $item = $itemsByChecklist->get($checklist->id);

                        return [
                            'id' => $checklist->id,
                            'order' => (int) $checklist->order,
                            'title' => $checklist->title,
                            'note' => $item?->note,
                            'photos' => ($item?->photos ?? collect())->map(fn ($photo) => [
                                'id' => $photo->id,
                                'view_url' => route('api.practice-photos.show', ['photo' => $photo->id]),
                                'uploaded_at' => optional($photo->created_at)->toDateTimeString(),
                            ])->values(),
                        ];
                    })->values() ?? [],
                ],
            ],
            'error' => null,
        ]);
    }

    public function grade(PracticeGradeRequest $request, PracticeSubmission $submission)
    {
        $user = $request->user();
        abort_unless(in_array($user?->role, ['admin', 'guru'], true), 403);
        abort_unless($this->canAccessSubmission($user, $submission), 403);

        $submission->loadMissing('materi.practiceRule.checklists:id,practice_rule_id');
        $data = $request->validated();

        $allowedChecklistIds = $submission->materi?->practiceRule?->checklists
            ?->pluck('id')->map(fn ($id) => (int) $id)->all() ?? [];

        DB::transaction(function () use ($submission, $data, $user, $allowedChecklistIds) {
            $submission->status = 'graded';
            $submission->total_score = (int) $data['total_score'];
            $submission->feedback = $data['feedback'] ?? null;
            $submission->graded_by = $user->id;
            $submission->graded_at = now();
            $submission->save();

            foreach (($data['notes'] ?? []) as $row) {
                $checklistId = (int) $row['checklist_id'];
                if (!in_array($checklistId, $allowedChecklistIds, true)) {
                    continue;
                }

                PracticeSubmissionItem::updateOrCreate(
                    [
                        'submission_id' => $submission->id,
                        'checklist_id' => $checklistId,
                    ],
                    [
                        'note' => filled($row['note'] ?? null) ? $row['note'] : null,
                    ],
                );
            }
        });

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }

    private function scopedBaseQuery(User $user): Builder
    {
        $query = PracticeSubmission::query()
            ->whereIn('practice_submissions.status', ['submitted', 'graded']);

        if ($user->role === 'admin') {
            return $query;
        }

        $gp = $user->guruProfile;
        if (!$gp || !$gp->kelas_id || !$gp->mapel_id) {
            return $query->whereRaw('1=0');
        }

        return $query->whereHas('materi', function ($materi) use ($gp) {
            $materi->where('kelas_id', $gp->kelas_id)
                ->where('mapel_id', $gp->mapel_id);
        });
    }

    private function canAccessSubmission(User $user, PracticeSubmission $submission): bool
    {
        $submission->loadMissing('materi:id,kelas_id,mapel_id');

        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'guru') {
            $gp = $user->guruProfile;
            return $gp
                && (int) $gp->kelas_id === (int) $submission->materi?->kelas_id
                && (int) $gp->mapel_id === (int) $submission->materi?->mapel_id;
        }

        return false;
    }
}
