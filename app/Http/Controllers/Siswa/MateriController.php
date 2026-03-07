<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $profile = $user->siswaProfile;

        if (!$profile || !$profile->kelas_id) {
            return response()->json([
                'success' => true,
                'data' => [],
                'error' => null,
            ]);
        }

        $kelasId = (int) $profile->kelas_id;

        $materis = Materi::query()
            ->where('kelas_id', $kelasId)
            ->with(['kelas:id,name', 'mapel:id,name'])
            ->orderByDesc('id')
            ->get(['id', 'title', 'pdf_path', 'praktik_text', 'kelas_id', 'mapel_id', 'created_at']);

        if ($materis->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'error' => null,
            ]);
        }

        $materiIds = $materis->pluck('id');

        $pretests = Test::query()
            ->where('type', 'pretest')
            ->whereIn('materi_id', $materiIds)
            ->orderByDesc('id')
            ->get(['id', 'materi_id', 'title', 'duration_minutes', 'start_at', 'end_at']);

        $pretestByMateri = $pretests->unique('materi_id')->keyBy('materi_id');

        $attempts = TestAttempt::query()
            ->whereIn('test_id', $pretestByMateri->pluck('id'))
            ->where('student_user_id', $user->id)
            ->get(['test_id', 'status', 'score', 'finished_at'])
            ->keyBy('test_id');

        $items = $materis->map(function (Materi $m) use ($pretestByMateri, $attempts) {
            $pt = $pretestByMateri->get($m->id);
            $att = $pt ? $attempts->get($pt->id) : null;

            $ptStatus = 'not_started';
            if ($att) {
                $ptStatus = ($att->status === 'finished' || $att->finished_at)
                    ? 'finished'
                    : 'in_progress';
            }

            $pretestDone = ($ptStatus === 'finished');

            $isLocked = true;
            $lockReason = 'Pretest belum tersedia';

            if ($pt) {
                if ($pretestDone) {
                    $isLocked = false;
                    $lockReason = null;
                } else {
                    $isLocked = true;
                    $lockReason = 'Kerjakan pretest dulu';
                }
            }

            return [
                'id' => $m->id,
                'title' => $m->title,
                'kelas' => $m->kelas?->name,
                'mapel' => $m->mapel?->name,
                'created_at' => optional($m->created_at)->toDateTimeString(),

                'is_locked' => $isLocked,
                'lock_reason' => $lockReason,

                'pretest' => $pt ? [
                    'id' => $pt->id,
                    'title' => $pt->title,
                    'deadline_at' => optional($pt->end_at)->toDateTimeString(),
                    'status' => $ptStatus,
                    'score' => $att?->score !== null ? (int) $att->score : null,
                ] : null,

                'pdf' => [
                    'download_url' => route('api.siswa.materis.download', ['materi' => $m->id]),
                ],
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $items,
            'error' => null,
        ]);
    }

    public function download(Request $request, Materi $materi)
    {
        $user = $request->user();
        $profile = $user->siswaProfile;

        abort_if(!$profile || !$profile->kelas_id, 403);
        abort_if((int) $materi->kelas_id !== (int) $profile->kelas_id, 403);

        // cek pretest materi ini sudah selesai
        $pretest = Test::query()
            ->where('type', 'pretest')
            ->where('materi_id', $materi->id)
            ->orderByDesc('id')
            ->first(['id']);

        abort_if(!$pretest, 403);

        $attempt = TestAttempt::query()
            ->where('test_id', $pretest->id)
            ->where('student_user_id', $user->id)
            ->first(['status', 'finished_at']);

        $done = $attempt && ($attempt->status === 'finished' || $attempt->finished_at);
        abort_if(!$done, 403);

        abort_if(!$materi->pdf_path, 404);

        $path = $materi->pdf_path;

        $disk = null;
        if (Storage::disk('public')->exists($path)) $disk = 'public';
        if (!$disk && Storage::disk('local')->exists($path)) $disk = 'local';
        abort_if(!$disk, 404);

        $materi->load(['kelas:id,name', 'mapel:id,name']);

        $filename = Str::slug(
            ($materi->title ?? 'materi') .
            '-' . ($materi->mapel?->name ?? 'mapel') .
            '-' . ($materi->kelas?->name ?? 'kelas')
        ) . '.pdf';

        return response()->download(Storage::disk($disk)->path($path), $filename);
    }
}