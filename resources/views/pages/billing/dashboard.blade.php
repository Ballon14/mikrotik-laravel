@extends('layouts.app')

@section('title', 'Billing Dashboard')

@section('content')
<div class="stats-grid" id="billingStats">
    <div class="stat-card">
        <div class="stat-icon stat-icon-blue"><i data-lucide="users" style="width:20px;height:20px;"></i></div>
        <div class="stat-info"><span class="stat-label">Pelanggan Aktif</span><span class="stat-value" id="statActive">-</span></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon stat-icon-red"><i data-lucide="users" style="width:20px;height:20px;"></i></div>
        <div class="stat-info"><span class="stat-label">Terisolir</span><span class="stat-value" id="statIsolated">-</span></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon stat-icon-green"><i data-lucide="wallet" style="width:20px;height:20px;"></i></div>
        <div class="stat-info"><span class="stat-label">Pendapatan Bulan Ini</span><span class="stat-value" id="statRevenue">-</span></div>
    </div>
    <div class="stat-card">
        <div class="stat-icon stat-icon-yellow"><i data-lucide="clock" style="width:20px;height:20px;"></i></div>
        <div class="stat-info"><span class="stat-label">Tertagih</span><span class="stat-value" id="statPending">-</span></div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="trending-up" style="width:16px;height:16px;"></i> Pendapatan Bulanan (Tahun Ini)</h3>
    </div>
    <div class="card-body">
        <div id="revenueChart" style="height:250px;display:flex;align-items:flex-end;gap:8px;padding:20px 0;">
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="list" style="width:16px;height:16px;"></i> Pembayaran Terbaru</h3>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead><tr><th>Invoice</th><th>Pelanggan</th><th>Jumlah</th><th>Metode</th><th>Waktu</th></tr></thead>
                <tbody id="recentPaymentsTable">
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

        // Chart
        const chart = document.getElementById('revenueChart');
        const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const maxVal = Math.max(...Object.values(d.monthlyData), 1);
        chart.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const val = d.monthlyData[m] || 0;
            const pct = (val / maxVal) * 100;
            chart.innerHTML += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <div style="width:100%;background:var(--accent);border-radius:4px 4px 0 0;height:${Math.max(pct,2)}%;min-height:4px;opacity:${val ? 1 : 0.3};"></div>
                <span style="font-size:10px;color:var(--text-secondary);">${months[m]}</span>
                <span style="font-size:9px;color:var(--text-muted);">${val ? 'Rp' + Number(val/1000).toFixed(0)+'k' : ''}</span>
            </div>`;
        }

        // Recent payments
        const tbody = document.getElementById('recentPaymentsTable');
        if (d.recentPayments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada pembayaran</div></div></td></tr>';
        } else {
            tbody.innerHTML = d.recentPayments.map(p => `
                <tr>
                    <td>${p.invoice?.invoice_number || '-'}</td>
                    <td>${p.invoice?.customer?.name || '-'}</td>
                    <td>Rp ${Number(p.amount).toLocaleString('id-ID')}</td>
                    <td>${p.payment_method || '-'}</td>
                    <td>${new Date(p.paid_at).toLocaleString('id-ID')}</td>
                </tr>
            `).join('');
        }
        lucide.createIcons();
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', loadBillingDashboard);
</script>
@endpush
