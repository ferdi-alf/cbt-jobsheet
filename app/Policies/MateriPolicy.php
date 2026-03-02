<?php

namespace App\Policies;

use App\Models\Materi;
use App\Models\User;

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

    protected function guruMatchesMateri(User $user, Materi $materi): bool
    {
        $gp = $user->guruProfile;
        if (!$gp) return false;

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