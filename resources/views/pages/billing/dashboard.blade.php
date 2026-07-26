@extends('layouts.app')

@section('title', 'Billing Dashboard')

@section('content')
<div class="stats-grid">
    <div class="stat-card cyan">
        <div class="stat-card-top">
            <span class="stat-label">Pelanggan Aktif</span>
            <i data-lucide="users" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="statActive">-</div>
    </div>
    <div class="stat-card red">
        <div class="stat-card-top">
            <span class="stat-label">Terisolir</span>
            <i data-lucide="user-x" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="statIsolated">-</div>
    </div>
    <div class="stat-card green">
        <div class="stat-card-top">
            <span class="stat-label">Pendapatan Bulan Ini</span>
            <i data-lucide="wallet" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="statRevenue">-</div>
    </div>
    <div class="stat-card orange">
        <div class="stat-card-top">
            <span class="stat-label">Tertagih</span>
            <i data-lucide="clock" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="statPending">-</div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="trending-up" style="width:16px;height:16px;"></i> Pendapatan Bulanan (Tahun Ini)</h3>
    </div>
    <div class="card-body">
        <div id="revenueChart" class="revenue-chart"></div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="list" style="width:16px;height:16px;"></i> Pembayaran Terbaru</h3>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table" id="recentPaymentsTable">
                <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>Pelanggan</th>
                        <th>Jumlah</th>
                        <th>Metode</th>
                        <th>Waktu</th>
                    </tr>
                </thead>
                <tbody id="recentPaymentsTableBody">
                    <tr><td colspan="5"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
async function loadBillingDashboard() {
    try {
        const res = await fetch('/api/billing/dashboard');
        const json = await res.json();
        if (!json.success) return;
        const d = json.data;

        document.getElementById('statActive').textContent = d.activeCustomers;
        document.getElementById('statIsolated').textContent = d.isolatedCustomers;
        document.getElementById('statRevenue').textContent = 'Rp ' + Number(d.monthlyRevenue).toLocaleString('id-ID');
        document.getElementById('statPending').textContent = 'Rp ' + Number(d.pendingRevenue).toLocaleString('id-ID');

        const chart = document.getElementById('revenueChart');
        const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const maxVal = Math.max(...Object.values(d.monthlyData), 1);
        chart.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const val = d.monthlyData[m] || 0;
            const pct = (val / maxVal) * 100;
            chart.innerHTML += `<div class="chart-bar-group">
                <div class="chart-bar" style="height:${Math.max(pct,2)}%"></div>
                <span class="chart-label">${months[m]}</span>
                <span class="chart-value">${val ? 'Rp' + Number(val/1000).toFixed(0)+'k' : ''}</span>
            </div>`;
        }

        const tbody = document.getElementById('recentPaymentsTableBody');
        if (d.recentPayments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada pembayaran</div></div></td></tr>';
        } else {
            tbody.innerHTML = d.recentPayments.map(p => `
                <tr>
                    <td data-label="Invoice">${p.invoice?.invoice_number || '-'}</td>
                    <td data-label="Pelanggan">${p.invoice?.customer?.name || '-'}</td>
                    <td data-label="Jumlah">Rp ${Number(p.amount).toLocaleString('id-ID')}</td>
                    <td data-label="Metode">${p.payment_method || '-'}</td>
                    <td data-label="Waktu">${new Date(p.paid_at).toLocaleString('id-ID')}</td>
                </tr>
            `).join('');
            addTableLabels('recentPaymentsTable');
        }
        lucide.createIcons();
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', loadBillingDashboard);
</script>
@endpush
