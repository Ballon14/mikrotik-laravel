<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\PppoeAccount;
use App\Services\PppoeSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ActivateCustomer implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Customer $customer,
    ) {}

    public function handle(PppoeSyncService $syncService): void
    {
        $this->customer->status = 'active';
        $this->customer->save();

        $accounts = PppoeAccount::with('router')
            ->where('customer_id', $this->customer->id)
            ->get();

        foreach ($accounts as $account) {
            if ($account->router) {
                $syncService->enableOnRouter($account);
            }
        }
    }
}
