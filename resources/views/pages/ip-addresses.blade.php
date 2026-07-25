@extends('layouts.app')

@section('title', 'IP Addresses')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="globe" style="width:16px;height:16px;"></i> IP Addresses</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
        <button class="btn-action btn-add" id="btnAddIpAddress" title="Add IP Address">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Add IP
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Network</th>
                        <th>Interface</th>
                        <th>Status</th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="ipAddressTable">
                    <tr><td colspan="6"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="ipAddressModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="ipAddressModalTitle">Add IP Address</h3>
            <button class="crud-modal-close" id="ipAddressModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="ipAddressForm" class="crud-form">
            <input type="hidden" id="ipAddressEditId" value="">
            <div class="form-group">
                <label for="ipAddrAddress">Address (CIDR)</label>
                <input type="text" id="ipAddrAddress" name="address" placeholder="192.168.1.1/24" required>
            </div>
            <div class="form-group">
                <label for="ipAddrInterface">Interface</label>
                <select id="ipAddrInterface" name="interface" required>
                    <option value="">— Pilih Interface —</option>
                </select>
            </div>
            <div class="form-group">
                <label for="ipAddrComment">Comment</label>
                <input type="text" id="ipAddrComment" name="comment" placeholder="Optional">
            </div>
            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" id="ipAddrDisabled" name="disabled" value="yes">
                    <span>Disabled</span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="ipAddressFormCancel">Cancel</button>
                <button type="submit" class="btn-submit" id="ipAddressFormSubmit">Save</button>
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
