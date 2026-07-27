@extends('layouts.app')

@section('title', 'Billing Packages')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="credit-card" style="width:16px;height:16px;"></i> Data Paket Internet</h3>
        <div style="display:flex;gap:8px;">
            <button class="btn-action" id="btnSyncPackages" title="Sync dari MikroTik PPP Profile" style="background:var(--color-primary);color:var(--text-inverted);">
                <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Sync MikroTik
            </button>
            <button class="btn-action btn-add" id="btnAddPackage" title="Tambah Paket">
                <i data-lucide="plus" style="width:14px;height:14px;"></i> Tambah Paket
            </button>
        </div>
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
                        <th>Periode</th>
                        <th>Deskripsi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="packagesTable">
                    <tr><td colspan="7"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="packageModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="packageModalTitle">Tambah Paket</h3>
            <button class="crud-modal-close" id="packageModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
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
            <div class="form-group">
                <label for="pkgPeriod">Periode Tagihan</label>
                <select id="pkgPeriod" name="billing_period">
                    <option value="">— Pilih Periode —</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="quarterly">Triwulan</option>
                    <option value="yearly">Tahunan</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="packageFormCancel">Batal</button>
                <button type="submit" class="btn-submit" id="packageFormSubmit">Simpan</button>
            </div>
        </form>
    </div>
</div>

@endsection
