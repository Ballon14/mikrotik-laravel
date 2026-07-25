<?php

namespace App\Console\Commands;

use App\Jobs\GenerateInvoices;
use Illuminate\Console\Command;

class BillingGenerateInvoices extends Command
{
    protected $signature = 'billing:generate-invoices';

    protected $description = 'Generate invoices for all active customers';

    public function handle(): int
    {
        $this->info('Generating invoices...');

        GenerateInvoices::dispatchSync();

        $this->info('Invoices generated successfully.');

        return Command::SUCCESS;
    }
}
