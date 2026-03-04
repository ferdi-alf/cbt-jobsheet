<?php

namespace App\Providers;

use App\Models\Materi;
use App\Models\Test;
use App\Policies\MateriPolicy;
use App\Policies\TestPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Gate::policy(Materi::class, MateriPolicy::class);
        Gate::policy(Test::class, TestPolicy::class);


    }
}
