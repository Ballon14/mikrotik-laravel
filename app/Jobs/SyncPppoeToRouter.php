<?php

namespace App\Jobs;

use App\Models\PppoeAccount;
use App\Services\PppoeSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncPppoeToRouter implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public PppoeAccount $pppoeAccount,
    ) {}

    public function handle(PppoeSyncService $syncService): void
    {
        $syncService->sync($this->pppoeAccount);
    }
}
