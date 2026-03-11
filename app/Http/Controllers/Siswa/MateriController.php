<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siswa\PracticePhotoUploadRequest;
use App\Http\Requests\Siswa\PracticeSubmitRequest;
use App\Models\Materi;
use App\Models\PracticeSubmission;
use App\Models\PracticeSubmissionItem;
use App\Models\PracticeSubmissionPhoto;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->isSiswa(), 403);

        $kelasId = $this->resolveSiswaKelasId($user);
        if (!$kelasId) {
            return response()->json([
                'success' => true,
                'data' => [],
                'error' => null,
            ]);
        }

        $search = trim((string) $request->query('search', ''));


        $materis = Materi::query()
        ->with([
            'kelas:id,name',
            'mapel:id,name',
            'practiceRule:id,materi_id,title,deadline_at',
        ])
        ->where('kelas_id', $kelasId)
        ->when($search !== '', function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhereHas('mapel', fn ($m) => $m->where('name', 'like', '%' . $search . '%'))
                    ->orWhereHas('practiceRule', fn ($r) => $r->where('title', 'like', '%' . $search . '%'));
            });
        })
        ->orderByDesc('id')
        ->get();

        $materiIds = $materis->pluck('id');

        $pretests = Test::query()
            ->whereIn('materi_id', $materiIds)
            ->where('type', 'pretest')
            ->get(['id', 'materi_id', 'title'])
            ->keyBy('materi_id');

        $attempts = TestAttempt::query()
            ->whereIn('test_id', $pretests->pluck('id'))
            ->where('student_user_id', $user->id)
            ->get(['test_id', 'status', 'score', 'finished_at'])
            ->keyBy('test_id');

        $submissions = PracticeSubmission::query()
            ->whereIn('materi_id', $materiIds)
            ->where('student_user_id', $user->id)
            ->get(['materi_id', 'status', 'total_score', 'submitted_at', 'graded_at'])
            ->keyBy('materi_id');

        $items = $materis->map(function (Materi $materi) use ($pretests, $attempts, $submissions) {
            $pretest = $pretests->get($materi->id);
            $attempt = $pretest ? $attempts->get($pretest->id) : null;
            $submission = $submissions->get($materi->id);

            $pretestStatus = 'missing';
            if ($pretest) {
                if (!$attempt) {
                    $pretestStatus = 'not_started';
                } elseif ($attempt->status === 'submitted' || $attempt->finished_at) {
                    $pretestStatus = 'submitted';
                } else {
                    $pretestStatus = 'in_progress';
                }
            }

            $canOpen = $pretestStatus === 'submitted';

            $availabilityLabel = match ($pretestStatus) {
                'submitted' => 'Materi terbuka',
                'in_progress' => 'Selesaikan pretest',
                'not_started' => 'Kerjakan pretest dulu',
                default => 'Pretest belum tersedia',
            };

            return [
                'id' => $materi->id,
                'title' => $materi->title,
                'kelas' => $materi->kelas?->name,
                'mapel' => $materi->mapel?->name,
                'praktik_text_preview' => Str::limit((string) $materi->praktik_text, 140),
                'practice_title' => $materi->practiceRule?->title,
                'practice_deadline_at' => optional($materi->practiceRule?->deadline_at)->toDateTimeString(),
                'pretest' => $pretest ? [
                    'id' => $pretest->id,
                    'title' => $pretest->title,
                    'status' => $pretestStatus,
                ] : null,
                'practice_status' => $submission?->status ?? 'not_started',
                'practice_score' => $submission?->total_score,
                'can_open' => $canOpen,
                'availability_label' => $availabilityLabel,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $items,
            'error' => null,
        ]);
    }

    public function show(Request $request, Materi $materi)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $this->authorizeStudentMateri($user, $materi);

        $materi->loadMissing([
            'kelas:id,name',
            'mapel:id,name',
            'practiceRule:id,materi_id,title,deadline_at',
            'practiceRule.checklists:id,practice_rule_id,title,order',
        ]);

        $submission = PracticeSubmission::query()
            ->with([
                'items:id,submission_id,checklist_id,note',
                'items.photos:id,submission_item_id,photo_path,created_at',
            ])
            ->where('materi_id', $materi->id)
            ->where('student_user_id', $user->id)
            ->first();

        $itemsByChecklist = $submission?->items?->keyBy('checklist_id') ?? collect();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $materi->id,
                'title' => $materi->title,
                'kelas' => $materi->kelas?->name,
                'mapel' => $materi->mapel?->name,
                'praktik_text' => $materi->praktik_text,
                'pdf' => [
                    'view_url' => route('api.siswa.materis.pdf', ['materi' => $materi->id]),
                    'download_url' => route('api.siswa.materis.download', ['materi' => $materi->id]),
                ],
                'practice' => [
                    'rule_id' => $materi->practiceRule?->id,
                    'title' => $materi->practiceRule?->title,
                    'description' => $materi->praktik_text,
                    'deadline_at' => optional($materi->practiceRule?->deadline_at)->toDateTimeString(),
                    'status' => $submission?->status ?? 'not_started',
                    'is_late' => (bool) ($submission?->is_late ?? false),
                    'submitted_at' => optional($submission?->submitted_at)->toDateTimeString(),
                    'graded_at' => optional($submission?->graded_at)->toDateTimeString(),
                    'total_score' => $submission?->total_score,
                    'feedback' => $submission?->feedback,
                    'checklists' => $materi->practiceRule?->checklists->map(function ($checklist) use ($itemsByChecklist) {
                        $item = $itemsByChecklist->get($checklist->id);

                        return [
                            'id' => $checklist->id,
                            'order' => (int) $checklist->order,
                            'title' => $checklist->title,
                            'note' => $item?->note,
                            'photos' => ($item?->photos ?? collect())->map(function ($photo) {
                                return [
                                    'id' => $photo->id,
                                    'view_url' => route('api.practice-photos.show', ['photo' => $photo->id]),
                                    'uploaded_at' => optional($photo->created_at)->toDateTimeString(),
                                ];
                            })->values(),
                        ];
                    })->values() ?? [],
                ],
            ],
            'error' => null,
        ]);
    }

    public function pdf(Request $request, Materi $materi)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $this->authorizeStudentMateri($user, $materi);
        abort_if(!$materi->pdf_path || !Storage::disk('public')->exists($materi->pdf_path), 404);

        return response()->file(
            Storage::disk('public')->path($materi->pdf_path),
            [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'private, max-age=60',
            ],
        );
    }

    public function download(Request $request, Materi $materi)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $this->authorizeStudentMateri($user, $materi);
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
            ['Content-Type' => 'application/pdf'],
        );
    }

    public function storePhoto(PracticePhotoUploadRequest $request, Materi $materi)
    {
        $user = $request->user();
        abort_unless($user && $user->isSiswa(), 403);

        $this->authorizeStudentMateri($user, $materi);
        $materi->loadMissing('practiceRule.checklists:id,practice_rule_id');

        abort_if(!$materi->practiceRule, 422, 'Praktek untuk materi ini belum tersedia.');

        $checklistId = (int) $request->validated('checklist_id');
        $validChecklist = $materi->practiceRule->checklists->firstWhere('id', $checklistId);
        abort_if(!$validChecklist, 422, 'Checklist tidak valid.');

        $submission = PracticeSubmission::firstOrCreate(
            [
                'materi_id' => $materi->id,
                'student_user_id' => $user->id,
            ],
            [
                'status' => 'draft',
                'is_late' => false,
            ],
        );

        abort_if(in_array($submission->status, ['submitted', 'graded'], true), 422, 'Submission sudah dikunci.');

        $item = PracticeSubmissionItem::firstOrCreate(
            [
                'submission_id' => $submission->id,
                'checklist_id' => $checklistId,
            ],
            [
                'note' => null,
            ],
        );

        $path = $request->file('photo')->store(
            "practice-photos/{$submission->id}/{$item->id}",
            'local',
        );

        $photo = $item->photos()->create([
            'photo_path' => $path,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $photo->id,
                'checklist_id' => $checklistId,
                'view_url' => route('api.practice-photos.show', ['photo' => $photo->id]),
                'uploaded_at' => optional($photo->created_at)->toDateTimeString(),
            ],
            'error' => null,
        ]);
    }

    public function destroyPhoto(Request $request, PracticeSubmissionPhoto $photo)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $photo->loadMissing('item.submission');
        abort_if(!$this->canViewPracticePhoto($user, $photo), 403);

        $submission = $photo->item->submission;
        abort_if((int) $submission->student_user_id !== (int) $user->id, 403);
        abort_if($submission->status !== 'draft', 422, 'Foto tidak bisa dihapus setelah submission dikirim.');

        DB::transaction(function () use ($photo) {
            $item = $photo->item;

            Storage::disk('local')->delete($photo->photo_path);
            $photo->delete();

            $item->loadCount('photos');
            if ((int) $item->photos_count === 0 && blank($item->note)) {
                $item->delete();
            }
        });

        return response()->json([
            'success' => true,
            'data' => true,
            'error' => null,
        ]);
    }

    public function viewPhoto(Request $request, PracticeSubmissionPhoto $photo)
    {
        $user = $request->user();
        abort_unless($user, 403);

        abort_if(!$this->canViewPracticePhoto($user, $photo), 403);
        abort_if(!$photo->photo_path || !Storage::disk('local')->exists($photo->photo_path), 404);

        return response()->file(
            Storage::disk('local')->path($photo->photo_path),
            [
                'Cache-Control' => 'private, max-age=60',
            ],
        );
    }

    public function submitPractice(PracticeSubmitRequest $request, Materi $materi)
    {
        $user = $request->user();
        abort_unless($user && $user->isSiswa(), 403);

        $this->authorizeStudentMateri($user, $materi);
        $materi->loadMissing('practiceRule.checklists:id,practice_rule_id,order');

        abort_if(!$materi->practiceRule, 422, 'Praktek untuk materi ini belum tersedia.');

        $submission = PracticeSubmission::query()
            ->with(['items:id,submission_id,checklist_id', 'items.photos:id,submission_item_id'])
            ->where('materi_id', $materi->id)
            ->where('student_user_id', $user->id)
            ->first();

        abort_if(!$submission, 422, 'Belum ada foto yang diupload.');
        abort_if($submission->status !== 'draft', 422, 'Submission sudah dikirim.');

        $photoCountByChecklist = $submission->items->mapWithKeys(function ($item) {
            return [$item->checklist_id => $item->photos->count()];
        });

        $emptyChecklistIds = $materi->practiceRule->checklists
            ->filter(fn ($checklist) => ($photoCountByChecklist[$checklist->id] ?? 0) === 0)
            ->pluck('id')
            ->values();

        if ($emptyChecklistIds->isNotEmpty() && !$request->boolean('confirm_incomplete')) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => 'Masih ada checklist yang belum memiliki foto.',
                'meta' => [
                    'empty_checklist_ids' => $emptyChecklistIds,
                    'empty_count' => $emptyChecklistIds->count(),
                ],
            ], 422);
        }

        $deadline = $materi->practiceRule->deadline_at;

        $submission->status = 'submitted';
        $submission->submitted_at = now();
        $submission->is_late = $deadline ? now()->gt($deadline) : false;
        $submission->save();

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $submission->status,
                'is_late' => $submission->is_late,
                'submitted_at' => optional($submission->submitted_at)->toDateTimeString(),
                'empty_count' => $emptyChecklistIds->count(),
            ],
            'error' => null,
        ]);
    }

    private function authorizeStudentMateri(User $user, Materi $materi): void
    {
        abort_unless($user->isSiswa(), 403);

        $kelasId = $this->resolveSiswaKelasId($user);
        abort_if(!$kelasId, 403);
        abort_if($kelasId !== (int) $materi->kelas_id, 403);

        $pretest = Test::query()
            ->where('materi_id', $materi->id)
            ->where('type', 'pretest')
            ->first(['id']);

        abort_if(!$pretest, 403, 'Pretest belum tersedia.');

        $attempt = TestAttempt::query()
            ->where('test_id', $pretest->id)
            ->where('student_user_id', $user->id)
            ->first(['status', 'finished_at']);

        $done = $attempt && ($attempt->status === 'submitted' || $attempt->finished_at);
        abort_if(!$done, 403, 'Selesaikan pretest terlebih dahulu.');
    }
    private function resolveSiswaKelasId(User $user): ?int
    {
        $kelasId = $user->siswaProfile()->value('kelas_id');
        return $kelasId ? (int) $kelasId : null;
    }

    private function canViewPracticePhoto(User $user, PracticeSubmissionPhoto $photo): bool
    {
        $photo->loadMissing([
            'item.submission.materi:id,kelas_id,mapel_id',
            'item.submission.student:id',
        ]);

        $submission = $photo->item?->submission;
        $materi = $submission?->materi;

        if (!$submission || !$materi) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isGuru()) {
            $user->loadMissing('guruProfile:user_id,kelas_id,mapel_id');
            $gp = $user->guruProfile;

            return $gp
                && (int) $gp->kelas_id === (int) $materi->kelas_id
                && (int) $gp->mapel_id === (int) $materi->mapel_id;
        }

        if ($user->isSiswa()) {
            return (int) $submission->student_user_id === (int) $user->id;
        }

        return false;
    }
}