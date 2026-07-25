@extends('layouts.app')

@section('title', 'DHCP Leases')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="list" style="width:16px;height:16px;"></i> DHCP Server Leases</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
        <button class="btn-action btn-add" id="btnAddDhcp" title="Add DHCP Lease">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Add Lease
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Hostname</th>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Server</th>
                        <th>Status</th>
                        <th>Last Seen</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="dhcpTable">
                    <tr><td colspan="7"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="dhcpModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="dhcpModalTitle">Add DHCP Lease</h3>
            <button class="crud-modal-close" id="dhcpModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="dhcpForm" class="crud-form">
            <input type="hidden" id="dhcpEditId" value="">
            <div class="form-group">
                <label for="dhcpAddress">IP Address</label>
                <input type="text" id="dhcpAddress" name="address" placeholder="192.168.1.100" required>
            </div>
            <div class="form-group">
                <label for="dhcpMacAddress">MAC Address</label>
                <input type="text" id="dhcpMacAddress" name="mac-address" placeholder="AA:BB:CC:DD:EE:FF" required>
            </div>
            <div class="form-group">
                <label for="dhcpServer">Server</label>
                <input type="text" id="dhcpServer" name="server" placeholder="dhcp1">
            </div>
            <div class="form-group">
                <label for="dhcpComment">Comment</label>
                <input type="text" id="dhcpComment" name="comment" placeholder="Optional comment">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="dhcpFormCancel">Cancel</button>
                <button type="submit" class="btn-submit" id="dhcpFormSubmit">Save</button>
            </div>
        </form>
    </div>
</div>

<div class="confirm-modal" id="confirmModal">
    <div class="confirm-modal-content">
        <i data-lucide="alert-triangle" style="width:40px;height:40px;color:#fbbf24;margin-bottom:12px;"></i>
        <h3>Konfirmasi Hapus</h3>
        <p id="confirmMessage">Apakah Anda yakin ingin menghapus item ini?</p>
        <div class="confirm-actions">
            <button class="btn-cancel" id="confirmCancel">Batal</button>
            <button class="btn-delete" id="confirmDelete">Hapus</button>
        </div>
    </div>
</div>
@endsection
