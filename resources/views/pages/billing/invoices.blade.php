@extends('layouts.app')

@section('title', 'Billing Invoices')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="receipt" style="width:16px;height:16px;"></i> Data Tagihan (Invoices)</h3>
        <button class="btn-action btn-add" id="btnAddInvoice" title="Buat Tagihan">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Buat Tagihan
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
                    <tr><td colspan="6"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="invoiceModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="invoiceModalTitle">Buat Tagihan</h3>
            <button class="crud-modal-close" id="invoiceModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
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
                    <input type="date" id="invDueDate" name="due_date" required>
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

@endsection
