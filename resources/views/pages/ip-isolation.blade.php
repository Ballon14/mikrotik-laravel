@extends('layouts.app')

@section('title', 'IP Isolation')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="lock" style="width:16px;height:16px;"></i> Isolasi IP</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
    </div>
    <div class="card-body">
        <p class="section-desc">Isolasi IP akan memblokir semua traffic <strong>forward</strong> (masuk & keluar) pada IP yang dipilih melalui firewall filter rules.</p>
        <form id="quickIsolateForm" class="inline-form">
            <div class="form-group inline">
                <input type="text" id="quickIsolateIp" name="ip" placeholder="Masukkan IP address (contoh: 192.168.1.100)" required>
                <button type="submit" class="btn-action btn-isolate-primary">
                    <i data-lucide="lock" style="width:14px;height:14px;"></i> Isolasi IP
                </button>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="shield-off" style="width:16px;height:16px;"></i> Daftar IP Terisolasi</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
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
                    <tr><td colspan="3"><div class="empty-state"><i data-lucide="check-circle" style="width:24px;height:24px;color:#34d399;"></i><div class="empty-state-text">Tidak ada IP yang diisolasi</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="list" style="width:16px;height:16px;"></i> DHCP Active Clients</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
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
                    <tr><td colspan="5"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="confirm-modal" id="confirmModal">
    <div class="confirm-modal-content">
        <p id="confirmMessage">Apakah Anda yakin ingin menghapus item ini?</p>
        <div class="confirm-modal-actions">
            <button class="btn-cancel" id="confirmCancel">Batal</button>
            <button class="btn-delete" id="confirmDelete">Hapus</button>
        </div>
    </div>
</div>
@endsection
