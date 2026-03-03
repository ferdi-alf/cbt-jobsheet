<?php

use App\Http\Controllers\Admin\LookupController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\KelasController;
use App\Http\Controllers\Admin\KelasMaterialController;
use App\Http\Controllers\Admin\KelasOverviewController;
use App\Http\Controllers\Admin\KelasStudentController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\MapelController;
use App\Http\Controllers\Admin\MapelGuruController;
use App\Http\Controllers\Admin\StudentBulkController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Petugas\MateriController;
use App\Http\Controllers\Petugas\PracticeRuleController;
use App\Http\Controllers\Petugas\StudentController as PetugasStudentController;
use App\Http\Controllers\Petugas\StudentPracticeController;

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
    Route::prefix('api')->group( function() {
        Route::apiResource('kelas', KelasController::class)->except('create', 'edit');
        Route::get('kelas/{kelas}/students', [KelasStudentController::class, 'index']);
        Route::get('kelas/{kelas}/overview', [KelasOverviewController::class, 'show']);
        Route::get('kelas/{kelas}/materials', [KelasMaterialController::class, 'index']);
    });

    Route::get('/mapels', fn () => inertia('Admin/Mapels/Index'))->name('mapels.index');
    Route::prefix('api')->group(function() {
        Route::apiResource('mapels', MapelController::class)->except(['create', 'edit']);
        Route::get('mapels/{mapel}/gurus', [MapelGuruController::class, 'index']);
    });


    Route::get('/students/create', fn () => inertia('Admin/Students/Create'))->name('students.create');
    Route::get('/students/data', fn () => inertia('Admin/Students/Index'))->name('students.index');
    Route::prefix('api')->group(function () {
        Route::post('/students/bulk', [StudentBulkController::class, 'store']);
        Route::apiResource('students', AdminStudentController::class)
            ->only(['update', 'destroy']);
    });



    Route::get('/scores', fn () => inertia('Admin/Scores/Index'))->name('scores.index');
});

Route::middleware(['auth', 'role:guru'])->group(function () {
    Route::get('/guru/dashboard', fn () => inertia('Guru/Dashboard'))->name('guru.dashboard');
    Route::get('/guru/students', fn () => inertia('Guru/Students/Index'))->name('guru.students.index');
});

Route::middleware(['auth', 'role:admin,guru'])->group(function () {
     Route::prefix('api')->group(function () {
        Route::get('/students', [PetugasStudentController::class, 'index']);
        Route::get('/students/{user}', [PetugasStudentController::class, 'show']);
        Route::get('/students/{student}/practices', [StudentPracticeController::class, 'index']);
        Route::get('/practice-submissions/{submission}/items', [StudentPracticeController::class, 'items']);
    });


    Route::get('/materi', fn () => inertia('Materi/Index'))->name('materi.index');
     Route::prefix('api')->group(function () {
        Route::get('/materis', [MateriController::class, 'index']);
        Route::get('/materis/{materi}', [MateriController::class, 'show']);
        Route::get('/materis/{materi}/tests', [MateriController::class, 'tests']);
        Route::get('/materis/{materi}/practice-checklists', [MateriController::class, 'practiceChecklists']);
        Route::get('/practice-rules/{rule}/checklists', [MateriController::class, 'ruleChecklists']);
        Route::get('/materis/{materi}/download', [MateriController::class, 'download'])
            ->name('api.materis.download');
        Route::post('/materis', [MateriController::class, 'store']);
        Route::post('/materis/{materi}', [MateriController::class, 'update']); 
        Route::delete('/materis/{materi}', [MateriController::class, 'destroy']);
    });


    
    Route::get('/practice-rules', fn () => inertia('Practice/Rules/Index'))->name('practice.rules.index');
    Route::prefix('api')->group(function () {
        Route::apiResource('practice-rules', PracticeRuleController::class)
            ->except(['create', 'edit']);

        Route::get('practice-rules/{practice_rule}/checklists', [PracticeRuleController::class, 'checklists']);
        Route::get('practice-rules/{practice_rule}/stats', [PracticeRuleController::class, 'stats']);
        Route::get('practice-rules/{practice_rule}/submissions', [PracticeRuleController::class, 'submissions']);

        Route::get('lookups/materis', [PracticeRuleController::class, 'lookupMateris']);
    });


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