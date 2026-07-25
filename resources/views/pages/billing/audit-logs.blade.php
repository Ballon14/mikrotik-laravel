@extends('layouts.app')

@section('title', 'Audit Logs')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="scroll-text" style="width:16px;height:16px;"></i> Audit Trail</h3>
        <button class="btn-action" onclick="loadAuditLogs()" title="Refresh">
            <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Refresh
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr><th>Waktu</th><th>Aksi</th><th>Tipe</th><th>Deskripsi</th><th>User</th></tr>
                </thead>
                <tbody id="auditLogsTable">
                    <tr><td colspan="5"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
window.loadAuditLogs = async function(page) {
    try {
        const res = await fetch('/api/audit-logs?page=' + (page || 1));
        const json = await res.json();
        const tbody = document.getElementById('auditLogsTable');
        if (!json.success || json.data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada log</div></div></td></tr>';
            document.getElementById("auditLogsPagination").innerHTML = "";
            return;
        }
        tbody.innerHTML = json.data.data.map(log => `
            <tr>
                <td style="white-space:nowrap;">${new Date(log.created_at).toLocaleString('id-ID')}</td>
                <td><code>${log.action}</code></td>
                <td>${log.entity_type}</td>
                <td>${esc(log.description || '')}</td>
                <td>${log.user ? log.user.name : '-'}</td>
            </tr>
        `).join('');
        addTableLabels("auditLogsTable");
        renderBillingPagination("auditLogsPagination", json.data.current_page, json.data.last_page, json.data.total, "loadAuditLogs");
        lucide.createIcons();
    } catch(e) { console.error(e); }
};

document.addEventListener('DOMContentLoaded', () => loadAuditLogs());
</script>
@endpush
