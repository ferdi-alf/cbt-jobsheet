<?php

namespace App\Policies;

use App\Models\Materi;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MateriPolicy
{
    protected function isAdmin(User $user): bool
    {
        return $user->role === 'admin';
    }

    protected function isGuru(User $user): bool
    {
        return $user->role === 'guru';
    }

    /**
     * Ambil guru_profile via DB::table langsung — bukan $user->guruProfile.
     * Lazy-load relationship bisa menghasilkan kelas_id/mapel_id null
     * jika sebelumnya di-load dengan select constraint.
     */
    protected function guruMatchesMateri(User $user, Materi $materi): bool
    {
        $gp = DB::table('guru_profiles')
            ->where('user_id', $user->id)
            ->first();

        if (!$gp || !$gp->kelas_id || !$gp->mapel_id) return false;

        return (int) $gp->kelas_id === (int) $materi->kelas_id
            && (int) $gp->mapel_id === (int) $materi->mapel_id;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function view(User $user, Materi $materi): bool
    {
        if ($this->isAdmin($user)) return true;
        if ($this->isGuru($user)) return $this->guruMatchesMateri($user, $materi);
        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function update(User $user, Materi $materi): bool
    {
        if ($this->isAdmin($user)) return true;
        if ($this->isGuru($user)) return $this->guruMatchesMateri($user, $materi);
        return false;
    }

    public function delete(User $user, Materi $materi): bool
    {
        if ($this->isAdmin($user)) return true;
        if ($this->isGuru($user)) return $this->guruMatchesMateri($user, $materi);
        return false;
    }

    public function download(User $user, Materi $materi): bool
    {
        return $this->view($user, $materi);
    }
}