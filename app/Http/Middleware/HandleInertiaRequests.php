<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $authUser = $request->user();
        $sharedUser = null;

        if ($authUser) {
            if ($authUser->role === 'guru') {
                $authUser->loadMissing('guruProfile:user_id,full_name');
            }

            if ($authUser->role === 'siswa') {
                $authUser->loadMissing('siswaProfile:user_id,full_name');
            }

            $sharedUser = [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'email_verified_at' => optional($authUser->email_verified_at)->toDateTimeString(),
                'role' => $authUser->role,
                'avatar_path' => $authUser->avatar_path,
                'profile' => [
                    'full_name' => match ($authUser->role) {
                        'guru' => $authUser->guruProfile?->full_name,
                        'siswa' => $authUser->siswaProfile?->full_name,
                        default => null,
                    },
                ],
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $sharedUser,
            ],
            'reload' => fn () => $request->session()->pull('reload', false),
        ];
    }
}