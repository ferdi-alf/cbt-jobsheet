<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Materi;
use App\Models\PracticeRule;
use App\Models\PracticeSubmission;
use App\Models\SiswaProfile;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return match ($user->role) {
            'admin' => $this->adminDashboard(),
            'guru'  => $this->guruDashboard($user),
            'siswa' => $this->siswaDashboard($user),
            default => abort(403),
        };
    }

    private function adminDashboard()
    {
        $stats = [
            'total_siswa'  => User::where('role', 'siswa')->count(),
            'total_guru'   => User::where('role', 'guru')->count(),
            'total_kelas'  => Kelas::count(),
            'total_materi' => Materi::count(),
        ];

        $top10Posttest = TestAttempt::with(['student.siswaProfile.kelas'])
            ->whereHas('test', fn ($q) => $q->where('type', 'posttest'))
            ->where('status', 'submitted')
            ->select('student_user_id', DB::raw('ROUND(AVG(score), 1) as avg_score'))
            ->groupBy('student_user_id')
            ->orderByDesc('avg_score')
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'full_name' => $a->student?->siswaProfile?->full_name ?? $a->student?->name ?? '-',
                'kelas'     => $a->student?->siswaProfile?->kelas?->name ?? '-',
                'avg_score' => (float) $a->avg_score,
            ]);

        $genderRaw = SiswaProfile::selectRaw('gender, COUNT(*) as total')
            ->groupBy('gender')
            ->pluck('total', 'gender');

        $genderData = [
            ['name' => 'Laki-laki', 'value' => (int) ($genderRaw['laki-laki'] ?? 0), 'color' => '#3b82f6'],
            ['name' => 'Perempuan', 'value' => (int) ($genderRaw['perempuan'] ?? 0),  'color' => '#ec4899'],
        ];

        $materiThisMonth = Materi::with(['creator.guruProfile', 'kelas', 'mapel'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($m) => [
                'title'      => $m->title,
                'created_at' => $m->created_at->format('d M Y'),
                'creator'    => $m->creator?->isAdmin()
                    ? 'Admin'
                    : ($m->creator?->guruProfile?->full_name ?? $m->creator?->name ?? '-'),
                'kelas'      => $m->kelas?->name ?? '-',
                'mapel'      => $m->mapel?->name ?? '-',
            ]);

        $kelasSummary = Kelas::all()->map(function ($k) {
            $siswaIds = SiswaProfile::where('kelas_id', $k->id)->pluck('user_id');

            $avgPretest = TestAttempt::whereIn('student_user_id', $siswaIds)
                ->whereHas('test', fn ($q) => $q->where('type', 'pretest'))
                ->where('status', 'submitted')->avg('score');

            $avgPosttest = TestAttempt::whereIn('student_user_id', $siswaIds)
                ->whereHas('test', fn ($q) => $q->where('type', 'posttest'))
                ->where('status', 'submitted')->avg('score');

            $praktikSelesai = PracticeSubmission::whereIn('student_user_id', $siswaIds)
                ->where('status', 'submitted')->count();

            return [
                'kelas'           => $k->name,
                'total_siswa'     => $siswaIds->count(),
                'avg_pretest'     => $avgPretest  ? round($avgPretest,  1) : null,
                'avg_posttest'    => $avgPosttest ? round($avgPosttest, 1) : null,
                'praktik_selesai' => $praktikSelesai,
            ];
        });

        $recentActivity = TestAttempt::with(['student.siswaProfile', 'test.materi'])
            ->where('status', 'submitted')
            ->latest('finished_at')
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'student_name' => $a->student?->siswaProfile?->full_name ?? $a->student?->name ?? '-',
                'type'         => $a->test?->type === 'pretest' ? 'Pretest' : 'Posttest',
                'materi'       => $a->test?->materi?->title ?? '-',
                'score'        => $a->score,
                'time'         => $a->finished_at?->diffForHumans() ?? '-',
            ]);

        return Inertia::render('Admin/Dashboard', compact(
            'stats', 'top10Posttest', 'genderData', 'materiThisMonth', 'kelasSummary', 'recentActivity'
        ));
    }

    /* ──────────────────────────────────────────────────── GURU ── */
    private function guruDashboard(User $user)
    {
        $guru = DB::table('guru_profiles')
            ->where('user_id', $user->id)
            ->first();

        $kelasIdGuru = $guru?->kelas_id ?? null;
        $mapelGuru = $guru?->mapel_id ?? null;

        if ($kelasIdGuru) {
            $siswaIds = DB::table('siswa_profiles')
                ->where('kelas_id', $kelasIdGuru)
                ->pluck('user_id');
        } else {
            $kelasIdsFromMateri = DB::table('materis')
                ->where('created_by', $user->id)
                ->whereNotNull('kelas_id')
                ->distinct()
                ->pluck('kelas_id');

            $siswaIds = $kelasIdsFromMateri->isNotEmpty()
                ? DB::table('siswa_profiles')
                    ->whereIn('kelas_id', $kelasIdsFromMateri)
                    ->pluck('user_id')
                : collect();
        }

        $totalMateri = DB::table('materis')
            ->where('created_by', $user->id)
            ->count();

        $totalPraktik = DB::table('practice_submissions')
            ->join('materis', 'practice_submissions.materi_id', '=', 'materis.id')
            ->where('materis.kelas_id', $kelasIdGuru)
            ->where('materis.mapel_id', $mapelGuru)
            ->where('practice_submissions.status', 'submitted')
            ->count();

        $stats = [
            'total_siswa'   => $siswaIds->count(),
            'total_materi'  => $totalMateri,
            'total_praktik' => $totalPraktik,
        ];

        $top10Posttest = collect();
        if ($siswaIds->isNotEmpty()) {
            $top10Posttest = TestAttempt::with(['student.siswaProfile.kelas'])
                ->whereIn('student_user_id', $siswaIds)
                ->whereHas('test', fn ($q) => $q->where('type', 'posttest'))
                ->where('status', 'submitted')
                ->select('student_user_id', DB::raw('ROUND(AVG(score), 1) as avg_score'))
                ->groupBy('student_user_id')
                ->orderByDesc('avg_score')
                ->limit(10)
                ->get()
                ->map(fn ($a) => [
                    'full_name' => $a->student?->siswaProfile?->full_name ?? $a->student?->name ?? '-',
                    'kelas'     => $a->student?->siswaProfile?->kelas?->name ?? '-',
                    'avg_score' => (float) $a->avg_score,
                ]);
        }


        $genderRaw = $siswaIds->isNotEmpty()
            ? DB::table('siswa_profiles')
                ->whereIn('user_id', $siswaIds)
                ->selectRaw('gender, COUNT(*) as total')
                ->groupBy('gender')
                ->pluck('total', 'gender')
            : collect();

        $genderData = [
            ['name' => 'Laki-laki', 'value' => (int) ($genderRaw['laki-laki'] ?? 0), 'color' => '#3b82f6'],
            ['name' => 'Perempuan', 'value' => (int) ($genderRaw['perempuan'] ?? 0),  'color' => '#ec4899'],
        ];

        $ungradedSubmissions = DB::table('practice_submissions')
            ->join('materis', 'practice_submissions.materi_id', '=', 'materis.id')
            ->join('users',   'practice_submissions.student_user_id', '=', 'users.id')
            ->leftJoin('siswa_profiles', 'siswa_profiles.user_id', '=', 'users.id')
            ->where('materis.kelas_id', $kelasIdGuru)
            ->where('materis.mapel_id', $mapelGuru)
            ->where('practice_submissions.status', 'submitted')
            ->whereNull('practice_submissions.graded_at')
            ->orderByDesc('practice_submissions.submitted_at')
            ->limit(20)
            ->select([
                'practice_submissions.id',
                DB::raw('COALESCE(siswa_profiles.full_name, users.name) as student_name'),
                'materis.title as materi',
                'practice_submissions.submitted_at',
                'practice_submissions.is_late',
            ])
            ->get()
            ->map(fn ($s) => [
                'id'           => $s->id,
                'student_name' => $s->student_name,
                'materi'       => $s->materi,
                'submitted_at' => $s->submitted_at
                    ? \Carbon\Carbon::parse($s->submitted_at)->format('d M Y, H:i')
                    : '-',
                'is_late'      => (bool) $s->is_late,
            ]);

        return Inertia::render('Guru/Dashboard', compact(
            'stats', 'top10Posttest', 'genderData', 'ungradedSubmissions'
        ));
    }

    /* ───────────────────────────────────────────────── SISWA ── */
    private function siswaDashboard(User $user)
    {
        /*
         * Query eksplisit — pastikan semua field terbaca dari DB.
         */
        $siswa = DB::table('siswa_profiles')
            ->where('user_id', $user->id)
            ->first();

        $kelasId = $siswa?->kelas_id ?? null;

        $kelasName = $kelasId
            ? DB::table('kelas')->where('id', $kelasId)->value('name')
            : null;

        $profile = [
            'full_name'   => $siswa?->full_name ?? $user->name,
            'nisn'        => $siswa?->nisn ?? '-',
            'kelas'       => $kelasName ?? '-',
            'gender'      => $siswa?->gender ?? '-', 
            'email'       => $user->email,
            'avatar_path' => $user->avatar_path,
            
        ];

        $pretestDone = TestAttempt::where('student_user_id', $user->id)
            ->whereHas('test', fn ($q) => $q->where('type', 'pretest'))
            ->where('status', 'submitted')->exists();

        $posttestDone = TestAttempt::where('student_user_id', $user->id)
            ->whereHas('test', fn ($q) => $q->where('type', 'posttest'))
            ->where('status', 'submitted')->exists();

        $pretestScore = TestAttempt::where('student_user_id', $user->id)
            ->whereHas('test', fn ($q) => $q->where('type', 'pretest')->where('is_score_visible', true))
            ->where('status', 'submitted')
            ->latest('finished_at')->value('score');

        $posttestScore = TestAttempt::where('student_user_id', $user->id)
            ->whereHas('test', fn ($q) => $q->where('type', 'posttest')->where('is_score_visible', true))
            ->where('status', 'submitted')
            ->latest('finished_at')->value('score');

        $totalPraktikAvailable = $kelasId
            ? PracticeRule::whereHas('materi', fn ($q) => $q->where('kelas_id', $kelasId))->count()
            : 0;

        $praktikSubmitted = PracticeSubmission::where('student_user_id', $user->id)
            ->where('status', 'submitted')->count();

        $progress = [
            'pretest_done'      => $pretestDone,
            'pretest_score'     => $pretestScore,
            'posttest_done'     => $posttestDone,
            'posttest_score'    => $posttestScore,
            'praktik_submitted' => $praktikSubmitted,
            'praktik_total'     => $totalPraktikAvailable,
        ];

        $materis = $kelasId
            ? Materi::with(['mapel', 'creator.guruProfile'])
                ->where('kelas_id', $kelasId)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($m) => [
                    'id'           => $m->id,
                    'title'        => $m->title,
                    'mapel'        => $m->mapel?->name ?? '-',
                    'creator'      => $m->creator?->isAdmin()
                        ? 'Admin'
                        : ($m->creator?->guruProfile?->full_name ?? $m->creator?->name ?? '-'),
                    'created_at'   => $m->created_at->format('d M Y'),
                    'has_practice' => $m->practiceRule()->exists(),
                    'has_test'     => $m->tests()->exists(),
                ])
            : collect();

        $recentScores = TestAttempt::with(['test'])
            ->where('student_user_id', $user->id)
            ->where('status', 'submitted')
            ->whereHas('test', fn ($q) => $q->where('is_score_visible', true))
            ->latest('finished_at')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'label' => ($a->test?->type === 'pretest' ? 'Pre' : 'Post') . ' · ' . Str::limit($a->test?->title ?? '', 12),
                'score' => $a->score,
                'type'  => $a->test?->type ?? '-',
                'date'  => $a->finished_at?->format('d M') ?? '-',
            ]);

        return Inertia::render('Siswa/Dashboard', compact(
            'profile', 'progress', 'materis', 'recentScores'
        ));
    }
}