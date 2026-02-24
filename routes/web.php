<?php

use App\Http\Controllers\Admin\LookupController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth'])
    ->name('dashboard');

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/users', fn () => inertia('Admin/Users/Index'))->name('users.index');

    Route::prefix('api')->group(function () {
        Route::get('/lookups/kelas', [LookupController::class, 'kelas']);
        Route::get('/lookups/mapels', [LookupController::class, 'mapels']);
        Route::apiResource('users', UserController::class)->except(['create', 'edit']);
    });
    
    Route::get('/kelas', fn () => inertia('Admin/Kelas/Index'))->name('kelas.index');
    Route::get('/students/create', fn () => inertia('Admin/Students/Create'))->name('students.create');
    Route::get('/students', fn () => inertia('Admin/Students/Index'))->name('students.index');
    Route::get('/scores', fn () => inertia('Admin/Scores/Index'))->name('scores.index');
});

Route::middleware(['auth', 'role:admin,guru'])->group(function () {
    Route::get('/materi', fn () => inertia('Materi/Index'))->name('materi.index');
    Route::get('/practice-rules', fn () => inertia('Practice/Rules/Index'))->name('practice.rules.index');
    Route::get('/practice-results', fn () => inertia('Practice/Results/Index'))->name('practice.results.index');
    Route::get('/tests', fn () => inertia('Tests/Index'))->name('tests.index');
});

Route::middleware(['auth', 'role:siswa'])->group(function () {
    Route::get('/my-materi', fn () => inertia('Siswa/Materi/Index'))->name('siswa.materi.index');
    Route::get('/pretest', fn () => inertia('Siswa/Tests/Pretest'))->name('siswa.pretest');
    Route::get('/posttest', fn () => inertia('Siswa/Tests/Posttest'))->name('siswa.posttest');
    Route::get('/upload-practice', fn () => inertia('Siswa/Practice/Upload'))->name('siswa.practice.upload');
});

require __DIR__ . '/auth.php';