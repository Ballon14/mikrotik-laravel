<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class GenerateInvoices implements ShouldQueue
{
    use Queueable;

    public function __construct() {}

    public function handle(): void
    {
        $customers = Customer::with('package')->where('status', 'active')->get();

        foreach ($customers as $customer) {
            if (! $customer->package) {
                continue;
            }

            $lastInvoice = $customer->latestInvoice;

            if ($lastInvoice && $lastInvoice->status === 'unpaid') {
                continue;
            }

            $periodStart = $this->getNextPeriodStart($customer);
            $periodEnd = $this->getPeriodEnd($periodStart, $customer->package->billing_period ?? 'monthly');
            $dueDate = (clone $periodEnd)->addDays(7);

            $invoiceNumber = 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));

            Invoice::create([
                'customer_id' => $customer->id,
                'invoice_number' => $invoiceNumber,
                'amount' => $customer->package->price,
                'status' => 'unpaid',
                'due_date' => $dueDate,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
            ]);
        }
    }

    private function getNextPeriodStart(Customer $customer): Carbon
    {
        $latest = $customer->latestInvoice;

        if ($latest && $latest->period_end) {
            return (clone $latest->period_end)->addDay();
        }

        return now()->startOfMonth();
    }

    private function getPeriodEnd(Carbon $start, string $period): Carbon
    {
        return match ($period) {
            'weekly' => (clone $start)->addWeek()->subDay(),
            'quarterly' => (clone $start)->addMonths(3)->subDay(),
            'yearly' => (clone $start)->addYear()->subDay(),
            default => (clone $start)->addMonth()->subDay(),
        };
    }
}
