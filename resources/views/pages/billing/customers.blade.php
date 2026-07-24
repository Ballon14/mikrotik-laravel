@extends('layouts.app')

@section('title', '👥 Billing <span>Customers</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">👥</span> Data Pelanggan</h3>
        <button class="btn-action btn-add" id="btnAddCustomer" title="Tambah Pelanggan">
            <span>＋</span> Tambah Pelanggan
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Pelanggan</th>
                        <th>PPPoE User</th>
                        <th>Paket</th>
                        <th>No HP</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="customersTable">
                    <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add/Edit Customer Modal -->
<div class="crud-modal" id="customerModal">
    <div class="crud-modal-content crud-modal-wide">
        <div class="crud-modal-header">
            <h3 id="customerModalTitle">Tambah Pelanggan</h3>
            <button class="crud-modal-close" id="customerModalClose">✕</button>
        </div>
        <form id="customerForm" class="crud-form">
            <input type="hidden" id="customerEditId" value="">
            <div class="form-row">
                <div class="form-group">
                    <label for="custName">Nama Lengkap</label>
                    <input type="text" id="custName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="custPhone">No HP/WhatsApp</label>
                    <input type="text" id="custPhone" name="phone">
                </div>
            </div>
            <div class="form-group">
                <label for="custAddress">Alamat</label>
                <input type="text" id="custAddress" name="address">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="custPppoeUser">PPPoE Username</label>
                    <input type="text" id="custPppoeUser" name="pppoe_username" required>
                </div>
                <div class="form-group">
                    <label for="custPppoePass">PPPoE Password</label>
                    <input type="text" id="custPppoePass" name="pppoe_password" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="custPackage">Pilih Paket</label>
                    <select id="custPackage" name="package_id" required>
                        <option value="">— Pilih Paket —</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="custStatus">Status</label>
                    <select id="custStatus" name="status" required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="isolated">Isolated (Terisolir)</option>
                    </select>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-cancel" id="customerFormCancel">Batal</button>
                <button type="submit" class="btn-submit" id="customerFormSubmit">Simpan</button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="confirm-modal" id="confirmModal">
    <div class="confirm-modal-content">
        <div class="confirm-icon">⚠️</div>
        <h3>Konfirmasi Hapus</h3>
        <p id="confirmMessage">Apakah Anda yakin ingin menghapus item ini?</p>
        <div class="confirm-actions">
            <button class="btn-cancel" id="confirmCancel">Batal</button>
            <button class="btn-delete" id="confirmDelete">Hapus</button>
        </div>
    </div>
</div>
@endsection
