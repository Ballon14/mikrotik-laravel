<?php

namespace App\Providers;

use App\Jobs\CheckOverdueAccounts;
use App\Jobs\GenerateInvoices;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            $schedule->job(new GenerateInvoices)->dailyAt('01:00');
            $schedule->job(new CheckOverdueAccounts)->dailyAt('06:00');
        });
    }
}
