<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $role = $request->user()->role;

        return match ($role) {
            'admin' => Inertia::render('Admin/Dashboard'),
            'guru'  => Inertia::render('Guru/Dashboard'),
            'siswa' => Inertia::render('Siswa/Dashboard'),
            default => abort(403),
        };
    }
}