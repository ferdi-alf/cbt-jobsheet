<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User;

class TestPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function view(User $user, Test $test): bool
    {
        if ($user->role === 'admin') return true;
        if ($user->role !== 'guru') return false;

        $gp = $user->guruProfile;
        if (!$gp || !$gp->kelas_id || !$gp->mapel_id) return false;

        $materi = $test->materi;
        if (!$materi) return false;

        return (int)$materi->kelas_id === (int)$gp->kelas_id
            && (int)$materi->mapel_id === (int)$gp->mapel_id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function update(User $user, Test $test): bool
    {
        return $this->view($user, $test);
    }

    public function delete(User $user, Test $test): bool
    {
        return $this->view($user, $test);
    }
}