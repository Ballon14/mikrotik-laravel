@extends('layouts.app')

@section('title', '🔒 IP Isolation')

@section('content')
<!-- Quick Isolate Card -->
<div class="card">
    <div class="card-header">
        <h3><span class="icon">🔒</span> Isolasi IP</h3>
    </div>
    <div class="card-body">
        <p class="section-desc">Isolasi IP akan memblokir semua traffic <strong>forward</strong> (masuk & keluar) pada IP yang dipilih melalui firewall filter rules.</p>
        <form id="quickIsolateForm" class="inline-form">
            <div class="form-group inline">
                <input type="text" id="quickIsolateIp" name="ip" placeholder="Masukkan IP address (contoh: 192.168.1.100)" required>
                <button type="submit" class="btn-action btn-isolate-primary">
                    <span>🔒</span> Isolasi IP
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Isolated IPs List -->
<div class="card">
    <div class="card-header">
        <h3><span class="icon">🚫</span> Daftar IP Terisolasi</h3>
        <span class="header-badge" id="isolatedCount">0</span>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="isolatedTable">
                    <tr><td colspan="3"><div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">Tidak ada IP yang diisolasi</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- DHCP Active Clients (for quick isolate) -->
<div class="card">
    <div class="card-header">
        <h3><span class="icon">📋</span> DHCP Active Clients</h3>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Hostname</th>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="dhcpIsolateTable">
                    <tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
