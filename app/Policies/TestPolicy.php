<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TestPolicy
{
    /**
     * Ambil guru_profile via DB::table langsung — bukan $user->guruProfile.
     */
    private function guruMatchesTest(User $user, Test $test): bool
    {
        $gp = DB::table('guru_profiles')
            ->where('user_id', $user->id)
            ->first();

        if (!$gp || !$gp->kelas_id || !$gp->mapel_id) return false;

        $materi = $test->materi;
        if (!$materi) return false;

        return (int) $materi->kelas_id === (int) $gp->kelas_id
            && (int) $materi->mapel_id === (int) $gp->mapel_id;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function view(User $user, Test $test): bool
    {
        if ($user->role === 'admin') return true;
        if ($user->role !== 'guru') return false;
        return $this->guruMatchesTest($user, $test);
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