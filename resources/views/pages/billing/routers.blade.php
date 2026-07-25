@extends('layouts.app')

@section('title', 'Routers')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="server" style="width:16px;height:16px;"></i> Data Router MikroTik</h3>
        <button class="btn-action btn-add" id="btnAddRouter" title="Tambah Router">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Tambah Router
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nama</th><th>Host</th><th>Port</th><th>Username</th><th>Aktif</th><th>Aksi</th></tr>
                </thead>
                <tbody id="routersTable">
                    <tr><td colspan="7"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="routerModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="routerModalTitle">Tambah Router</h3>
            <button class="crud-modal-close" id="routerModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="routerForm" class="crud-form">
            <input type="hidden" id="routerEditId" value="">
            <div class="form-group">
                <label for="rtrName">Nama Router</label>
                <input type="text" id="rtrName" name="name" placeholder="Misal: Router Utama" required>
            </div>
            <div class="form-group">
                <label for="rtrHost">Host/IP</label>
                <input type="text" id="rtrHost" name="host" placeholder="192.168.88.1" required>
            </div>
            <div class="form-group">
                <label for="rtrPort">Port API</label>
                <input type="number" id="rtrPort" name="port" value="8728">
            </div>
            <div class="form-group">
                <label for="rtrUser">Username</label>
                <input type="text" id="rtrUser" name="username" placeholder="admin" required>
            </div>
            <div class="form-group">
                <label for="rtrPass">Password</label>
                <input type="password" id="rtrPass" name="password" placeholder="Password (dienkripsi otomatis)">
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="rtrActive" name="is_active" value="1" checked> Aktif</label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="routerFormCancel">Batal</button>
                <button type="submit" class="btn-submit">Simpan</button>
            </div>
        </form>
    </div>
</div>
@endsection
