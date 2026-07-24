@extends('layouts.app')

@section('title', '💳 Billing <span>Packages</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">💳</span> Data Paket Internet</h3>
        <button class="btn-action btn-add" id="btnAddPackage" title="Tambah Paket">
            <span>＋</span> Tambah Paket
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Paket</th>
                        <th>Harga (Rp)</th>
                        <th>Speed</th>
                        <th>Deskripsi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="packagesTable">
                    <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add/Edit Package Modal -->
<div class="crud-modal" id="packageModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="packageModalTitle">Tambah Paket</h3>
            <button class="crud-modal-close" id="packageModalClose">✕</button>
        </div>
        <form id="packageForm" class="crud-form">
            <input type="hidden" id="packageEditId" value="">
            <div class="form-group">
                <label for="pkgName">Nama Paket</label>
                <input type="text" id="pkgName" name="name" placeholder="Misal: Paket 10 Mbps" required>
            </div>
            <div class="form-group">
                <label for="pkgPrice">Harga (Rp)</label>
                <input type="number" id="pkgPrice" name="price" placeholder="Misal: 150000" required>
            </div>
            <div class="form-group">
                <label for="pkgSpeed">Speed Bandwidth</label>
                <input type="text" id="pkgSpeed" name="speed" placeholder="Misal: 10M/10M">
            </div>
            <div class="form-group">
                <label for="pkgDesc">Deskripsi</label>
                <input type="text" id="pkgDesc" name="description" placeholder="Deskripsi paket">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="packageFormCancel">Batal</button>
                <button type="submit" class="btn-submit" id="packageFormSubmit">Simpan</button>
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
