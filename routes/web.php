<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\MikrotikController;
use Illuminate\Support\Facades\Route;

// ─── Authentication Routes ───
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ─── Public API (no auth required) ───
Route::prefix('api')->group(function () {
    Route::get('/health', [MikrotikController::class, 'health']);
    Route::get('/daemon-status', [MikrotikController::class, 'daemonStatus']);
});

// ─── Protected Routes ───
Route::middleware('auth')->group(function () {

    // View Routes
    Route::get('/', function () {
        return view('pages.billing.dashboard');
    });
    Route::get('/monitoring', function () {
        return view('pages.overview');
    });
    Route::get('/interfaces', function () {
        return view('pages.interfaces');
    });
    Route::get('/dhcp', function () {
        return view('pages.dhcp');
    });
    Route::get('/routes', function () {
        return view('pages.routes');
    });
    Route::get('/firewall', function () {
        return view('pages.firewall');
    });
    Route::get('/arp', function () {
        return view('pages.arp');
    });
    Route::get('/logs', function () {
        return view('pages.logs');
    });
    Route::get('/hotspot', function () {
        return view('pages.hotspot');
    });
    Route::get('/ip-addresses', function () {
        return view('pages.ip-addresses');
    });
    Route::get('/ip-isolation', function () {
        return view('pages.ip-isolation');
    });

    // Billing View Routes
    Route::get('/packages', function () {
        return view('pages.billing.packages');
    });
    Route::get('/customers', function () {
        return view('pages.billing.customers');
    });
    Route::get('/invoices', function () {
        return view('pages.billing.invoices');
    });
    Route::get('/payments', function () {
        return view('pages.billing.payments');
    });
    Route::get('/routers', function () {
        return view('pages.billing.routers');
    });
    Route::get('/pppoe-accounts', function () {
        return view('pages.billing.pppoe-accounts');
    });
    Route::get('/audit-logs', function () {
        return view('pages.billing.audit-logs');
    });
    // API Routes
    Route::prefix('api')->group(function () {
        Route::get('/router', [MikrotikController::class, 'router']);
        Route::get('/identity', [MikrotikController::class, 'identity']);
        Route::get('/interfaces', [MikrotikController::class, 'interfaces']);
        Route::get('/interface/{name}', [MikrotikController::class, 'interfaceDetail']);
        Route::get('/traffic/{name}', [MikrotikController::class, 'traffic']);
        Route::get('/dns', [MikrotikController::class, 'dns']);
        Route::get('/logs', [MikrotikController::class, 'logs']);
        Route::get('/arp', [MikrotikController::class, 'arp']);
        Route::get('/hotspot/active', [MikrotikController::class, 'hotspotActive']);

        // ─── DHCP Leases CRUD ───
        Route::get('/dhcp-leases', [MikrotikController::class, 'dhcpLeases']);
        Route::post('/dhcp-leases', [MikrotikController::class, 'storeDhcpLease']);
        Route::put('/dhcp-leases/{id}', [MikrotikController::class, 'updateDhcpLease']);
        Route::delete('/dhcp-leases/{id}', [MikrotikController::class, 'destroyDhcpLease']);

        // ─── Routes ───
        Route::get('/routes', [MikrotikController::class, 'routes']);

        // ─── Firewall Filter CRUD ───
        Route::get('/firewall/filter', [MikrotikController::class, 'firewallFilter']);
        Route::post('/firewall/filter', [MikrotikController::class, 'storeFirewallFilter']);
        Route::put('/firewall/filter/{id}', [MikrotikController::class, 'updateFirewallFilter']);
        Route::delete('/firewall/filter/{id}', [MikrotikController::class, 'destroyFirewallFilter']);

        // ─── Firewall NAT CRUD ───
        Route::get('/firewall/nat', [MikrotikController::class, 'firewallNat']);
        Route::post('/firewall/nat', [MikrotikController::class, 'storeFirewallNat']);
        Route::put('/firewall/nat/{id}', [MikrotikController::class, 'updateFirewallNat']);
        Route::delete('/firewall/nat/{id}', [MikrotikController::class, 'destroyFirewallNat']);

        // ─── IP Addresses CRUD ───
        Route::get('/ip-addresses', [MikrotikController::class, 'ipAddresses']);
        Route::post('/ip-addresses', [MikrotikController::class, 'storeIpAddress']);
        Route::put('/ip-addresses/{id}', [MikrotikController::class, 'updateIpAddress']);
        Route::delete('/ip-addresses/{id}', [MikrotikController::class, 'destroyIpAddress']);

        // ─── IP Isolation ───
        Route::get('/isolated-ips', [MikrotikController::class, 'isolatedIps']);
        Route::post('/isolate-ip', [MikrotikController::class, 'isolateIp']);
        Route::post('/unisolate-ip', [MikrotikController::class, 'unisolateIp']);

        // ─── Billing API ───
        Route::get('/billing/dashboard', [BillingController::class, 'dashboard']);

        Route::get('/packages', [BillingController::class, 'packages']);
        Route::post('/packages', [BillingController::class, 'storePackage']);
        Route::put('/packages/{id}', [BillingController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [BillingController::class, 'destroyPackage']);

        Route::get('/customers', [BillingController::class, 'customers']);
        Route::post('/customers', [BillingController::class, 'storeCustomer']);
        Route::put('/customers/{id}', [BillingController::class, 'updateCustomer']);
        Route::delete('/customers/{id}', [BillingController::class, 'destroyCustomer']);

        Route::get('/invoices', [BillingController::class, 'invoices']);
        Route::post('/invoices', [BillingController::class, 'storeInvoice']);
        Route::put('/invoices/{id}', [BillingController::class, 'updateInvoice']);
        Route::delete('/invoices/{id}', [BillingController::class, 'destroyInvoice']);

        // ─── Payments ───
        Route::get('/payments', [BillingController::class, 'payments']);
        Route::post('/payments', [BillingController::class, 'storePayment']);
        Route::delete('/payments/{id}', [BillingController::class, 'destroyPayment']);

        // ─── Routers ───
        Route::get('/routers', [BillingController::class, 'routers']);
        Route::post('/routers', [BillingController::class, 'storeRouter']);
        Route::put('/routers/{id}', [BillingController::class, 'updateRouter']);
        Route::delete('/routers/{id}', [BillingController::class, 'destroyRouter']);

        // ─── PPPoE Accounts ───
        Route::get('/pppoe-accounts', [BillingController::class, 'pppoeAccounts']);
        Route::post('/pppoe-accounts', [BillingController::class, 'storePppoeAccount']);
        Route::put('/pppoe-accounts/{id}', [BillingController::class, 'updatePppoeAccount']);
        Route::delete('/pppoe-accounts/{id}', [BillingController::class, 'destroyPppoeAccount']);
        Route::post('/pppoe-accounts/{id}/sync', [BillingController::class, 'syncPppoeAccount']);

        // ─── Audit Logs ───
        Route::get('/audit-logs', [BillingController::class, 'auditLogs']);
    });
});
