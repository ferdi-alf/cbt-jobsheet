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
use App\Http\Controllers\Petugas\TestController;
use App\Http\Controllers\Siswa\PretestController as SiswaPretestController;
use App\Http\Controllers\Siswa\MateriController as SiswaMateriController;
use App\Http\Controllers\Siswa\TestSessionController as SiswaTestSessionController;

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
        Route::put('/materis/{materi}', [MateriController::class, 'update']);
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
    Route::prefix('api')->group(function () {
       Route::apiResource('tests', TestController::class)
           ->except(['create', 'edit']);
       Route::get('tests/{test}/overview', [TestController::class, 'overview']);
       Route::get('tests/{test}/attempts', [TestController::class, 'attempts']);
       Route::get('tests/{test}/questions', [TestController::class, 'questions']);
   });
});

Route::middleware(['auth', 'role:siswa'])->group(function () {
    Route::get('/my-materi', fn () => inertia('Siswa/Materi/Index'))->name('siswa.materi.index');
    Route::get('/pretest', fn () => inertia('Siswa/Tests/Pretest'))->name('siswa.pretest');
    Route::get('/posttest', fn () => inertia('Siswa/Tests/Posttest'))->name('siswa.posttest');
    Route::get('/upload-practice', fn () => inertia('Siswa/Practice/Upload'))->name('siswa.practice.upload');

    Route::get('/tes/{publicKey}', fn (string $publicKey) => inertia('Siswa/Tests/Take', [
        'publicKey' => $publicKey,
    ]))->name('siswa.tests.take');

    Route::get('/tes/{publicKey}/selesai', fn (string $publicKey) => inertia('Siswa/Tests/Finished', [
        'publicKey' => $publicKey,
    ]))->name('siswa.tests.finished');

    Route::prefix('api')->group(function () {
        Route::post('/tests/{publicKey}/start', [SiswaTestSessionController::class, 'start'])
            ->name('api.siswa.tests.start');
            
        Route::post('/tests/{publicKey}/answers', [SiswaTestSessionController::class, 'saveAnswer'])
            ->name('api.siswa.tests.answers');
        Route::post('/tests/{publicKey}/submit', [SiswaTestSessionController::class, 'submit'])
            ->name('api.siswa.tests.submit');
        Route::get('/tests/{publicKey}/result', [SiswaTestSessionController::class, 'result'])
            ->name('api.siswa.tests.result');
    });

    Route::prefix('api/siswa')->group(function () {
        Route::get('/pretests', [SiswaPretestController::class, 'index'])
            ->name('api.siswa.pretests.index');

        Route::get('/materis', [SiswaMateriController::class, 'index'])
            ->name('api.siswa.materis.index');
            
        Route::get('/materis/{materi}', [SiswaMateriController::class, 'show'])
            ->name('api.siswa.materis.show');

        Route::get('/materis/{materi}/pdf', [SiswaMateriController::class, 'pdf'])
            ->name('api.siswa.materis.pdf');

        Route::get('/materis/{materi}/download', [SiswaMateriController::class, 'download'])
            ->name('api.siswa.materis.download');

        Route::post('/materis/{materi}/practice/photos', [SiswaMateriController::class, 'storePhoto'])
            ->name('api.siswa.practice.photos.store');
        Route::post('/materis/{materi}/practice/submit', [SiswaMateriController::class, 'submitPractice'])
            ->name('api.siswa.practice.submit');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('/api/practice-photos/{photo}', [SiswaMateriController::class, 'viewPhoto'])
        ->name('api.practice-photos.show');
    Route::delete('/api/practice-photos/{photo}', [SiswaMateriController::class, 'destroyPhoto'])
        ->name('api.practice-photos.destroy');
});

require __DIR__ . '/auth.php';