@extends('layouts.app')

@section('title', '🧾 Billing <span>Invoices</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">🧾</span> Data Tagihan (Invoices)</h3>
        <button class="btn-action btn-add" id="btnAddInvoice" title="Buat Tagihan">
            <span>＋</span> Buat Tagihan
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No Tagihan</th>
                        <th>Pelanggan</th>
                        <th>Jatuh Tempo</th>
                        <th>Nominal (Rp)</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="invoicesTable">
                    <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add/Edit Invoice Modal -->
<div class="crud-modal" id="invoiceModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="invoiceModalTitle">Buat Tagihan</h3>
            <button class="crud-modal-close" id="invoiceModalClose">✕</button>
        </div>
        <form id="invoiceForm" class="crud-form">
            <input type="hidden" id="invoiceEditId" value="">
            <div class="form-group">
                <label for="invNumber">Nomor Tagihan</label>
                <input type="text" id="invNumber" name="invoice_number" placeholder="INV-202607-001" required>
            </div>
            <div class="form-group">
                <label for="invCustomer">Pelanggan</label>
                <select id="invCustomer" name="customer_id" required>
                    <option value="">— Pilih Pelanggan —</option>
                </select>
            </div>
            <div class="form-group">
                <label for="invAmount">Nominal (Rp)</label>
                <input type="number" id="invAmount" name="amount" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="invDueDate">Jatuh Tempo</label>
                    <input type="date" id="invDueDate" name="due_date" required style="color:var(--text-primary); background:var(--bg-input); border:1px solid var(--border-color); padding:10px 14px; border-radius:8px; width:100%; box-sizing:border-box;">
                </div>
                <div class="form-group">
                    <label for="invStatus">Status</label>
                    <select id="invStatus" name="status" required>
                        <option value="unpaid">Unpaid (Belum Lunas)</option>
                        <option value="paid">Paid (Lunas)</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="invoiceFormCancel">Batal</button>
                <button type="submit" class="btn-submit" id="invoiceFormSubmit">Simpan</button>
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
