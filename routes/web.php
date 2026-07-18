<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MikrotikController;

Route::get('/', function () { return view('pages.overview'); });
Route::get('/interfaces', function () { return view('pages.interfaces'); });
Route::get('/dhcp', function () { return view('pages.dhcp'); });
Route::get('/routes', function () { return view('pages.routes'); });
Route::get('/firewall', function () { return view('pages.firewall'); });
Route::get('/arp', function () { return view('pages.arp'); });
Route::get('/logs', function () { return view('pages.logs'); });
Route::get('/hotspot', function () { return view('pages.hotspot'); });

Route::prefix('api')->group(function () {
    Route::get('/health', [MikrotikController::class, 'health']);
    Route::get('/router', [MikrotikController::class, 'router']);
    Route::get('/identity', [MikrotikController::class, 'identity']);
    Route::get('/interfaces', [MikrotikController::class, 'interfaces']);
    Route::get('/interface/{name}', [MikrotikController::class, 'interfaceDetail']);
    Route::get('/traffic/{name}', [MikrotikController::class, 'traffic']);
    Route::get('/dhcp-leases', [MikrotikController::class, 'dhcpLeases']);
    Route::get('/routes', [MikrotikController::class, 'routes']);
    Route::get('/dns', [MikrotikController::class, 'dns']);
    Route::get('/firewall/filter', [MikrotikController::class, 'firewallFilter']);
    Route::get('/firewall/nat', [MikrotikController::class, 'firewallNat']);
    Route::get('/logs', [MikrotikController::class, 'logs']);
    Route::get('/arp', [MikrotikController::class, 'arp']);
    Route::get('/hotspot/active', [MikrotikController::class, 'hotspotActive']);
});
