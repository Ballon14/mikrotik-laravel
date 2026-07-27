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
use App\Services\MikrotikService;
use App\Services\PppoeSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        $monthExpr = DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%m', paid_at) as month"
            : 'MONTH(paid_at) as month';

        $monthlyData = Invoice::where('status', 'paid')
            ->whereYear('paid_at', now()->year)
            ->selectRaw('SUM(amount) as total')
            ->selectRaw($monthExpr)
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
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => Package::orderBy('id', 'desc')->get()->toArray(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => Package::orderBy('id', 'desc')->paginate(25)->toArray(),
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

        AuditLog::create([
            'action' => 'package_created',
            'entity_type' => 'package',
            'entity_id' => $package->id,
            'description' => "Paket {$package->name} dibuat",
            'new_values' => $package->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true, 'data' => $package]);
    }

    public function updatePackage(Request $request, $id)
    {
        $package = Package::findOrFail($id);
        $original = $package->toArray();
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'speed' => 'nullable|string',
            'description' => 'nullable|string',
            'billing_period' => 'nullable|string|in:weekly,monthly,quarterly,yearly',
        ]);

        $package->update($validated);
        $changed = $package->getChanges();

        AuditLog::create([
            'action' => 'package_updated',
            'entity_type' => 'package',
            'entity_id' => $package->id,
            'description' => "Paket {$package->name} diupdate",
            'old_values' => array_intersect_key($original, $changed),
            'new_values' => $changed,
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function destroyPackage($id)
    {
        $package = Package::findOrFail($id);
        $package->delete();

        AuditLog::create([
            'action' => 'package_deleted',
            'entity_type' => 'package',
            'entity_id' => $id,
            'description' => "Paket {$package->name} dihapus",
            'old_values' => $package->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function syncPackages(MikrotikService $mikrotikService)
    {
        try {
            $profiles = $mikrotikService->getPppProfiles();

            if (! is_array($profiles)) {
                throw new \Exception('Gagal mengambil data dari router MikroTik');
            }

            $added = 0;
            foreach ($profiles as $profile) {
                // Ignore default profiles that are usually built-in
                if ($profile['name'] === 'default' || $profile['name'] === 'default-encryption') {
                    continue;
                }

                $exists = Package::where('name', $profile['name'])->exists();
                if (! $exists) {
                    Package::create([
                        'name' => $profile['name'],
                        'price' => 0, // Admin must edit this later
                        'speed' => $profile['rate-limit'] ?? null,
                        'billing_period' => 'monthly', // Default assumption
                        'description' => 'Disinkronkan dari MikroTik PPP Profile',
                    ]);
                    $added++;
                }
            }

            if ($added > 0) {
                AuditLog::create([
                    'action' => 'packages_synced',
                    'entity_type' => 'package',
                    'description' => "$added paket disinkronkan dari MikroTik",
                    'user_id' => Auth::id(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Berhasil sinkronisasi. $added paket baru ditambahkan.",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: '.$e->getMessage(),
            ], 500);
        }
    }

    // ─── Customers ───

    public function customers()
    {
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => Customer::with(['package', 'pppoeAccounts.router', 'latestInvoice'])
                    ->orderBy('id', 'desc')
                    ->get()
                    ->toArray(),
            ]);
        }

        $customers = Customer::with(['package', 'pppoeAccounts.router', 'latestInvoice'])
            ->orderBy('id', 'desc')
            ->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $customers->toArray(),
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
            'new_values' => $customer->toArray(),
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

        $changed = $customer->getChanges();
        AuditLog::create([
            'action' => 'customer_updated',
            'entity_type' => 'customer',
            'entity_id' => $customer->id,
            'description' => "Pelanggan {$customer->name} diupdate",
            'old_values' => array_intersect_key($customer->getOriginal(), $changed),
            'new_values' => $changed,
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

        $customerName = $customer->name;
        $customer->delete();

        AuditLog::create([
            'action' => 'customer_deleted',
            'entity_type' => 'customer',
            'entity_id' => $id,
            'description' => "Pelanggan {$customerName} dihapus",
            'old_values' => ['name' => $customerName],
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    // ─── PPPoE Accounts ───

    public function pppoeAccounts()
    {
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => PppoeAccount::with(['customer', 'router'])->orderBy('id', 'desc')->get()->toArray(),
            ]);
        }

        $accounts = PppoeAccount::with(['customer', 'router'])->orderBy('id', 'desc')->paginate(25);

        return response()->json(['success' => true, 'data' => $accounts->toArray()]);
    }

    public function storePppoeAccount(StorePppoeAccountRequest $request)
    {
        $validated = $request->validated();
        $account = PppoeAccount::create($validated);

        if (! ($validated['disabled'] ?? false)) {
            SyncPppoeToRouter::dispatch($account);
        }

        AuditLog::create([
            'action' => 'pppoe_account_created',
            'entity_type' => 'pppoe_account',
            'entity_id' => $account->id,
            'description' => "Akun PPPoE {$account->username} dibuat",
            'new_values' => $account->load('customer', 'router')->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $account->load('customer', 'router'),
        ]);
    }

    public function updatePppoeAccount(Request $request, $id)
    {
        $account = PppoeAccount::findOrFail($id);
        $original = $account->toArray();
        $validated = $request->validate([
            'router_id' => 'nullable|exists:routers,id',
            'password' => 'nullable|string|max:100',
            'profile' => 'nullable|string|max:100',
            'ip_address' => 'nullable|string|max:50',
            'disabled' => 'nullable|boolean',
        ]);

        $account->update($validated);

        SyncPppoeToRouter::dispatch($account);

        $changed = $account->getChanges();
        AuditLog::create([
            'action' => 'pppoe_account_updated',
            'entity_type' => 'pppoe_account',
            'entity_id' => $account->id,
            'description' => "Akun PPPoE {$account->username} diupdate",
            'old_values' => array_intersect_key($original, $changed),
            'new_values' => $changed,
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function destroyPppoeAccount($id, PppoeSyncService $syncService)
    {
        $account = PppoeAccount::with('router')->findOrFail($id);
        $syncService->removeFromRouter($account);
        $account->delete();

        AuditLog::create([
            'action' => 'pppoe_account_deleted',
            'entity_type' => 'pppoe_account',
            'entity_id' => $id,
            'description' => "Akun PPPoE {$account->username} dihapus",
            'old_values' => $account->toArray(),
            'user_id' => Auth::id(),
        ]);

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
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => Invoice::with(['customer', 'payments'])->orderBy('id', 'desc')->get()->toArray(),
            ]);
        }

        $invoices = Invoice::with(['customer', 'payments'])->orderBy('id', 'desc')->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $invoices->toArray(),
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

        $invoice = Invoice::create($validated);

        AuditLog::create([
            'action' => 'invoice_created',
            'entity_type' => 'invoice',
            'entity_id' => $invoice->id,
            'description' => "Tagihan {$invoice->invoice_number} dibuat",
            'new_values' => $invoice->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function updateInvoice(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $original = $invoice->toArray();
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
        $changed = $invoice->getChanges();

        AuditLog::create([
            'action' => 'invoice_updated',
            'entity_type' => 'invoice',
            'entity_id' => $invoice->id,
            'description' => "Tagihan {$invoice->invoice_number} diupdate",
            'old_values' => array_intersect_key($original, $changed),
            'new_values' => $changed,
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function destroyInvoice($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        AuditLog::create([
            'action' => 'invoice_deleted',
            'entity_type' => 'invoice',
            'entity_id' => $id,
            'description' => "Tagihan {$invoice->invoice_number} dihapus",
            'old_values' => $invoice->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    // ─── Payments ───

    public function payments()
    {
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => Payment::with('invoice.customer')->orderBy('id', 'desc')->get()->toArray(),
            ]);
        }

        $payments = Payment::with('invoice.customer')->orderBy('id', 'desc')->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $payments->toArray(),
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
            'new_values' => $payment->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $payment->load('invoice.customer'),
        ]);
    }

    public function destroyPayment($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        AuditLog::create([
            'action' => 'payment_deleted',
            'entity_type' => 'payment',
            'entity_id' => $id,
            'description' => "Pembayaran #{$payment->id} dihapus",
            'old_values' => $payment->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    // ─── Routers ───

    public function routers()
    {
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => Router::orderBy('id', 'desc')->get()->map(function ($router) {
                    return $router->makeHidden('password');
                })->toArray(),
            ]);
        }

        $routers = Router::orderBy('id', 'desc')->paginate(25)->through(function ($router) {
            return $router->makeHidden('password');
        });

        return response()->json(['success' => true, 'data' => $routers->toArray()]);
    }

    public function storeRouter(StoreRouterRequest $request)
    {
        $validated = $request->validated();
        $router = Router::create($validated);

        AuditLog::create([
            'action' => 'router_created',
            'entity_type' => 'router',
            'entity_id' => $router->id,
            'description' => "Router {$router->name} ditambahkan",
            'new_values' => $router->makeHidden('password')->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $router->makeHidden('password'),
        ]);
    }

    public function updateRouter(Request $request, $id)
    {
        $router = Router::findOrFail($id);
        $original = $router->toArray();
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
        $changed = $router->getChanges();

        AuditLog::create([
            'action' => 'router_updated',
            'entity_type' => 'router',
            'entity_id' => $router->id,
            'description' => "Router {$router->name} diupdate",
            'old_values' => array_intersect_key($original, $changed),
            'new_values' => $changed,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $router->fresh()->makeHidden('password'),
        ]);
    }

    public function destroyRouter($id)
    {
        $router = Router::findOrFail($id);
        $router->delete();

        AuditLog::create([
            'action' => 'router_deleted',
            'entity_type' => 'router',
            'entity_id' => $id,
            'description' => "Router {$router->name} dihapus",
            'old_values' => $router->makeHidden('password')->toArray(),
            'user_id' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    // ─── Audit Logs ───

    public function auditLogs()
    {
        if (request('all')) {
            return response()->json([
                'success' => true,
                'data' => AuditLog::with('user')
                    ->orderBy('id', 'desc')
                    ->get()
                    ->toArray(),
            ]);
        }

        $logs = AuditLog::with('user')
            ->orderBy('id', 'desc')
            ->paginate(25);

        return response()->json(['success' => true, 'data' => $logs->toArray()]);
    }
}
