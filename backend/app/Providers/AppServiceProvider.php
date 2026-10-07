<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use App\Policies\MonitoredApiPolicy;
use App\Services\ApiMonitoringService;
use App\Services\IncidentService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            //
        }

        Auth::provider('users', function ($app, $settings) {
            //
        });

        Schedule::command('api-monitor:check')
            ->everyMinute();

        Gate::policy(MonitoredApi::class, MonitoredApiPolicy::class);
    }
}