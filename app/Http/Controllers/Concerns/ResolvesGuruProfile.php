<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Materi;
use Illuminate\Support\Facades\DB;

/**
 * Pastikan guru_profile selalu di-query langsung dari DB.
 * Jangan andalkan $user->guruProfile (Eloquent lazy-load) karena
 * kelas_id / mapel_id bisa tidak ter-load jika ada caching atau
 * constraint select di tempat lain.
 */
trait ResolvesGuruProfile
{
    /**
     * Ambil guru_profile milik user dari DB secara eksplisit.
     * Return stdClass | null.
     */
    protected function getGuruProfile(int $userId): ?object
    {
        return DB::table('guru_profiles')
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Ambil guru_profile dan abort 403 jika tidak ada
     * atau kelas_id / mapel_id belum diisi.
     */
    protected function requireGuruProfile(int $userId): object
    {
        $gp = $this->getGuruProfile($userId);

        abort_if(
            !$gp || !$gp->kelas_id || !$gp->mapel_id,
            403,
            'Profil guru belum lengkap (kelas / mapel belum diset).'
        );

        return $gp;
    }

    /**
     * Pastikan materi dapat diakses oleh guru:
     * kelas_id & mapel_id materi harus cocok dengan profil guru.
     */
    protected function assertGuruCanAccessMateri(object $gp, Materi $materi): void
    {
        abort_if(
            (int) $materi->kelas_id !== (int) $gp->kelas_id,
            403
        );
        abort_if(
            (int) $materi->mapel_id !== (int) $gp->mapel_id,
            403
        );
    }
}