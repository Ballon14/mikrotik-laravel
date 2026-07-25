<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\StorePppoeAccountRequest;
use App\Http\Requests\StoreRouterRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Jobs\ActivateCustomer;
use App\Jobs\SyncPppoeToRouter;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PppoeAccount;
use App\Models\Router;
use App\Services\PppoeSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
    // ─── Dashboard ───

    public function dashboard()
    {
        $activeCustomers = Customer::where('status', 'active')->count();
        $isolatedCustomers = Customer::where('status', 'isolated')->count();
        $totalCustomers = Customer::count();
        $monthlyRevenue = Invoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');
        $pendingRevenue = Invoice::where('status', 'unpaid')->sum('amount');
        $recentPayments = Payment::with('invoice.customer')
            ->latest()
            ->take(10)
            ->get();

        $monthlyData = Invoice::where('status', 'paid')
            ->whereYear('paid_at', now()->year)
            ->selectRaw('MONTH(paid_at) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        return response()->json([
            'success' => true,
            'data' => [
                'activeCustomers' => $activeCustomers,
                'isolatedCustomers' => $isolatedCustomers,
                'totalCustomers' => $totalCustomers,
                'monthlyRevenue' => $monthlyRevenue,
                'pendingRevenue' => $pendingRevenue,
                'recentPayments' => $recentPayments,
                'monthlyData' => $monthlyData,
            ],
        ]);
    }

    // ─── Packages ───

    public function packages()
    {
        return response()->json([
            'success' => true,
            'data' => Package::orderBy('id', 'desc')->get(),
        ]);
    }

    public function storePackage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'speed' => 'nullable|string',
            'description' => 'nullable|string',
            'billing_period' => 'nullable|string|in:weekly,monthly,quarterly,yearly',
        ]);

        $package = Package::create($validated);

        return response()->json(['success' => true, 'data' => $package]);
    }

    public function updatePackage(Request $request, $id)
    {
        $package = Package::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'speed' => 'nullable|string',
            'description' => 'nullable|string',
            'billing_period' => 'nullable|string|in:weekly,monthly,quarterly,yearly',
        ]);

        $package->update($validated);

        return response()->json(['success' => true]);
    }

    public function destroyPackage($id)
    {
        Package::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    // ─── Customers ───

    public function customers()
    {
        $customers = Customer::with(['package', 'pppoeAccounts.router', 'latestInvoice'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function storeCustomer(StoreCustomerRequest $request)
    {
        $validated = $request->validated();
        $customer = Customer::create($validated);

        $account = PppoeAccount::create([
            'customer_id' => $customer->id,
            'username' => $validated['pppoe_username'],
            'password' => $validated['pppoe_password'],
            'service' => 'pppoe',
            'disabled' => $validated['status'] !== 'active',
        ]);

        if ($customer->status === 'active') {
            SyncPppoeToRouter::dispatch($account);
        }

        AuditLog::create([
            'action' => 'customer_created',
            'entity_type' => 'customer',
            'entity_id' => $customer->id,
            'description' => "Pelanggan {$customer->name} dibuat",
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true, 'data' => $customer->load('package', 'pppoeAccounts')]);
    }

    public function updateCustomer(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $oldStatus = $customer->status;
        $validated = $request->validated();
        $customer->update($validated);

        $account = $customer->pppoeAccounts()->first();
        if ($account) {
            $account->update([
                'username' => $validated['pppoe_username'],
                'password' => $validated['pppoe_password'],
            ]);

            if ($customer->status === 'active') {
                SyncPppoeToRouter::dispatch($account);
            }
        }

        if ($oldStatus !== 'active' && $customer->status === 'active') {
            ActivateCustomer::dispatch($customer);
        }

        AuditLog::create([
            'action' => 'customer_updated',
            'entity_type' => 'customer',
            'entity_id' => $customer->id,
            'description' => "Pelanggan {$customer->name} diupdate",
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function destroyCustomer($id)
    {
        $customer = Customer::findOrFail($id);

        foreach ($customer->pppoeAccounts as $account) {
            $account->delete();
        }

        $customer->delete();

        return response()->json(['success' => true]);
    }

    // ─── PPPoE Accounts ───

    public function pppoeAccounts()
    {
        $accounts = PppoeAccount::with(['customer', 'router'])->orderBy('id', 'desc')->get();

        return response()->json(['success' => true, 'data' => $accounts]);
    }

    public function storePppoeAccount(StorePppoeAccountRequest $request)
    {
        $validated = $request->validated();
        $account = PppoeAccount::create($validated);

        if (! ($validated['disabled'] ?? false)) {
            SyncPppoeToRouter::dispatch($account);
        }

        return response()->json([
            'success' => true,
            'data' => $account->load('customer', 'router'),
        ]);
    }

    public function updatePppoeAccount(Request $request, $id)
    {
        $account = PppoeAccount::findOrFail($id);
        $validated = $request->validate([
            'router_id' => 'nullable|exists:routers,id',
            'password' => 'nullable|string|max:100',
            'profile' => 'nullable|string|max:100',
            'ip_address' => 'nullable|string|max:50',
            'disabled' => 'nullable|boolean',
        ]);

        $account->update($validated);

        SyncPppoeToRouter::dispatch($account);

        return response()->json(['success' => true]);
    }

    public function destroyPppoeAccount($id, PppoeSyncService $syncService)
    {
        $account = PppoeAccount::with('router')->findOrFail($id);
        $syncService->removeFromRouter($account);
        $account->delete();

        return response()->json(['success' => true]);
    }

    public function syncPppoeAccount($id)
    {
        $account = PppoeAccount::with('router')->findOrFail($id);
        SyncPppoeToRouter::dispatch($account);

        return response()->json(['success' => true, 'message' => 'Sync ditambahkan ke antrian']);
    }

    // ─── Invoices ───

    public function invoices()
    {
        $invoices = Invoice::with(['customer', 'payments'])->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function storeInvoice(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_number' => 'required|string|unique:invoices',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:unpaid,paid',
            'due_date' => 'required|date',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date',
        ]);

        if ($validated['status'] === 'paid') {
            $validated['paid_at'] = now();
        }

        Invoice::create($validated);

        return response()->json(['success' => true]);
    }

    public function updateInvoice(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number,'.$id,
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:unpaid,paid',
            'due_date' => 'required|date',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date',
        ]);

        if ($validated['status'] === 'paid' && $invoice->status === 'unpaid') {
            $validated['paid_at'] = now();
        } elseif ($validated['status'] === 'unpaid') {
            $validated['paid_at'] = null;
        }

        $invoice->update($validated);

        return response()->json(['success' => true]);
    }

    public function destroyInvoice($id)
    {
        Invoice::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    // ─── Payments ───

    public function payments()
    {
        $payments = Payment::with('invoice.customer')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function storePayment(StorePaymentRequest $request)
    {
        $validated = $request->validated();

        if (! isset($validated['paid_at'])) {
            $validated['paid_at'] = now();
        }

        $payment = Payment::create($validated);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        $totalPaid = $invoice->payments()->sum('amount');

        if ($totalPaid >= $invoice->amount) {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $customer = $invoice->customer;
            if ($customer && $customer->status !== 'active') {
                ActivateCustomer::dispatch($customer);
            }
        }

        AuditLog::create([
            'action' => 'payment_recorded',
            'entity_type' => 'payment',
            'entity_id' => $payment->id,
            'description' => "Pembayaran Rp {$validated['amount']} untuk invoice {$invoice->invoice_number}",
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $payment->load('invoice.customer'),
        ]);
    }

    public function destroyPayment($id)
    {
        Payment::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    // ─── Routers ───

    public function routers()
    {
        $routers = Router::orderBy('id', 'desc')->get()->map(function ($router) {
            return $router->makeHidden('password');
        });

        return response()->json(['success' => true, 'data' => $routers]);
    }

    public function storeRouter(StoreRouterRequest $request)
    {
        $validated = $request->validated();
        $router = Router::create($validated);

        return response()->json([
            'success' => true,
            'data' => $router->makeHidden('password'),
        ]);
    }

    public function updateRouter(Request $request, $id)
    {
        $router = Router::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
            'username' => 'required|string|max:100',
            'password' => 'nullable|string|max:255',
            'api_port' => 'nullable|string|max:10',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $router->update($validated);

        return response()->json([
            'success' => true,
            'data' => $router->fresh()->makeHidden('password'),
        ]);
    }

    public function destroyRouter($id)
    {
        Router::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    // ─── Audit Logs ───

    public function auditLogs()
    {
        $logs = AuditLog::with('user')
            ->orderBy('id', 'desc')
            ->take(100)
            ->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }
}
