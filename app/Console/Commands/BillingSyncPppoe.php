<?php

namespace App\Console\Commands;

use App\Models\PppoeAccount;
use App\Services\PppoeSyncService;
use Illuminate\Console\Command;

class BillingSyncPppoe extends Command
{
    protected $signature = 'billing:sync-pppoe {--id= : Sync specific account ID}';

    protected $description = 'Sync all PPPoE accounts to MikroTik router';

    public function handle(PppoeSyncService $syncService): int
    {
        $query = PppoeAccount::with('router')->whereHas('router', function ($q) {
            $q->where('is_active', true);
        });

        if ($id = $this->option('id')) {
            $query->where('id', $id);
        }

        $accounts = $query->get();

        if ($accounts->isEmpty()) {
            $this->warn('No PPPoE accounts to sync.');

            return Command::SUCCESS;
        }

        $success = 0;
        $failed = 0;

        foreach ($accounts as $account) {
            $this->line("Syncing {$account->username}...");
            try {
                $syncService->sync($account);
                $success++;
            } catch (\Exception $e) {
                $this->error("Failed: {$e->getMessage()}");
                $failed++;
            }
        }

        $this->info("Sync complete. Success: {$success}, Failed: {$failed}");

        return Command::SUCCESS;
    }
}
