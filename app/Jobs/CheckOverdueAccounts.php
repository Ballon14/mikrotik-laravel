<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Services\PppoeSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CheckOverdueAccounts implements ShouldQueue
{
    use Queueable;

    public function __construct() {}

    public function handle(PppoeSyncService $syncService): void
    {
        $overdueInvoices = Invoice::with('customer.pppoeAccounts.router')
            ->where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->get();

        foreach ($overdueInvoices as $invoice) {
            $customer = $invoice->customer;
            if (! $customer) {
                continue;
            }

            $daysOverdue = (int) round(abs(now()->diffInDays($invoice->due_date)));

            if ($daysOverdue >= 3 && $customer->status === 'active') {
                $customer->status = 'isolated';
                $customer->save();

                foreach ($customer->pppoeAccounts as $account) {
                    if ($account->router) {
                        $syncService->disableOnRouter($account);
                    }
                }
            }

            if ($daysOverdue >= 1 && $daysOverdue < 3) {
                // Reminder notification would go here
                // For now, this is a placeholder for WhatsApp/email integration
                Log::info("Reminder: Invoice {$invoice->invoice_number} for customer {$customer->name} is {$daysOverdue} day(s) overdue.");
            }
        }
    }
}
