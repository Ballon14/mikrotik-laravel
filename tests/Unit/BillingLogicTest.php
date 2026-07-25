<?php

namespace Tests\Unit;

use App\Jobs\CheckOverdueAccounts;
use App\Jobs\GenerateInvoices;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Payment;
use App\Services\PppoeSyncService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingLogicTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_invoice_for_active_customer(): void
    {
        $package = Package::factory()->create([
            'price' => 150000,
            'billing_period' => 'monthly',
        ]);

        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        (new GenerateInvoices)->handle();

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'amount' => 150000,
            'status' => 'unpaid',
        ]);
    }

    public function test_skips_inactive_customer(): void
    {
        $package = Package::factory()->create(['price' => 100000]);
        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'inactive',
        ]);

        (new GenerateInvoices)->handle();

        $this->assertDatabaseMissing('invoices', [
            'customer_id' => $customer->id,
        ]);
    }

    public function test_skips_customer_with_unpaid_invoice(): void
    {
        $package = Package::factory()->create(['price' => 100000]);
        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        Invoice::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'unpaid',
            'amount' => 100000,
        ]);

        (new GenerateInvoices)->handle();

        $this->assertEquals(1, Invoice::where('customer_id', $customer->id)->count());
    }

    public function test_generates_next_period_correctly(): void
    {
        $package = Package::factory()->create([
            'price' => 200000,
            'billing_period' => 'monthly',
        ]);

        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        Invoice::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'paid',
            'paid_at' => now(),
            'period_start' => Carbon::parse('2026-01-01'),
            'period_end' => Carbon::parse('2026-01-31'),
        ]);

        (new GenerateInvoices)->handle();

        $newInvoice = Invoice::where('customer_id', $customer->id)
            ->where('status', 'unpaid')
            ->first();

        $this->assertNotNull($newInvoice);
        $this->assertEquals('2026-02-01', $newInvoice->period_start->toDateString());
        $this->assertEquals('2026-02-28', $newInvoice->period_end->toDateString());
    }

    public function test_overdue_invoice_triggers_isolation(): void
    {
        $package = Package::factory()->create(['price' => 100000]);
        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        $invoice = Invoice::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'unpaid',
            'due_date' => Carbon::now()->subDays(5),
            'amount' => 100000,
        ]);

        $this->assertTrue($invoice->due_date->lessThan(now()), 'Invoice due_date should be in the past');

        $job = new CheckOverdueAccounts;
        $job->handle(app(PppoeSyncService::class));

        $updated = $customer->fresh();
        $this->assertEquals('isolated', $updated->status);
    }

    public function test_does_not_isolate_recently_overdue(): void
    {
        $package = Package::factory()->create(['price' => 100000]);
        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        Invoice::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'unpaid',
            'due_date' => Carbon::now()->subDay(),
            'amount' => 100000,
        ]);

        $job = new CheckOverdueAccounts;
        $job->handle(app(PppoeSyncService::class));

        $this->assertEquals('active', $customer->fresh()->status);
    }

    public function test_payment_marks_invoice_as_paid(): void
    {
        $package = Package::factory()->create(['price' => 100000]);
        $customer = Customer::factory()->create([
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        $invoice = Invoice::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'unpaid',
            'amount' => 100000,
        ]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 100000,
            'payment_method' => 'transfer',
            'paid_at' => now(),
        ]);

        $totalPaid = $invoice->payments()->sum('amount');

        if ($totalPaid >= $invoice->amount) {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        $this->assertEquals('paid', $invoice->fresh()->status);
    }
}
