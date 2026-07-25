@extends('layouts.app')

@section('title', 'PPPoE Accounts')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="cable" style="width:16px;height:16px;"></i> Akun PPPoE</h3>
        <button class="btn-action btn-add" id="btnAddPppoe" title="Tambah Akun PPPoE">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Tambah Akun
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Username</th><th>Pelanggan</th><th>Router</th><th>Profile</th><th>IP Address</th><th>Status</th><th>Sync</th><th>Aksi</th></tr>
                </thead>
                <tbody id="pppoeTable">
                    <tr><td colspan="8"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="pppoeModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="pppoeModalTitle">Tambah Akun PPPoE</h3>
            <button class="crud-modal-close" id="pppoeModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="pppoeForm" class="crud-form">
            <input type="hidden" id="pppoeEditId" value="">
            <div class="form-group">
                <label for="pppCustomer">Pelanggan</label>
                <select id="pppCustomer" name="customer_id" required></select>
            </div>
            <div class="form-group">
                <label for="pppRouter">Router</label>
                <select id="pppRouter" name="router_id"><option value="">— Pilih Router —</option></select>
            </div>
            <div class="form-group">
                <label for="pppUser">Username PPPoE</label>
                <input type="text" id="pppUser" name="username" required>
            </div>
            <div class="form-group">
                <label for="pppPass">Password</label>
                <input type="text" id="pppPass" name="password" required>
            </div>
            <div class="form-group">
                <label for="pppProfile">Profile</label>
                <input type="text" id="pppProfile" name="profile" placeholder="default">
            </div>
            <div class="form-group">
                <label for="pppIp">IP Address</label>
                <input type="text" id="pppIp" name="ip_address" placeholder="Otomatis">
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="pppDisabled" name="disabled" value="1"> Nonaktif</label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="pppoeFormCancel">Batal</button>
                <button type="submit" class="btn-submit">Simpan & Sinkron</button>
            </div>
        </form>
    </div>
</div>
@endsection
