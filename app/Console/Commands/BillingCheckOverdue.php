<?php

namespace App\Console\Commands;

use App\Jobs\CheckOverdueAccounts;
use Illuminate\Console\Command;

class BillingCheckOverdue extends Command
{
    protected $signature = 'billing:check-overdue';

    protected $description = 'Check overdue invoices and isolate accounts';

    public function handle(): int
    {
        $this->info('Checking overdue accounts...');

        CheckOverdueAccounts::dispatchSync();

        $this->info('Overdue check completed.');

        return Command::SUCCESS;
    }
}
