@extends('layouts.app')

@section('title', 'Payments')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="wallet" style="width:16px;height:16px;"></i> Data Pembayaran</h3>
        <button class="btn-action btn-add" id="btnAddPayment" title="Tambah Pembayaran">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Tambah Pembayaran
        </button>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Invoice</th><th>Pelanggan</th><th>Jumlah</th><th>Metode</th><th>Referensi</th><th>Waktu Bayar</th><th>Aksi</th></tr>
                </thead>
                <tbody id="paymentsTable">
                    <tr><td colspan="8"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="crud-modal" id="paymentModal">
    <div class="crud-modal-content">
        <div class="crud-modal-header">
            <h3 id="paymentModalTitle">Tambah Pembayaran</h3>
            <button class="crud-modal-close" id="paymentModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="paymentForm" class="crud-form">
            <div class="form-group">
                <label for="payInvoice">Invoice</label>
                <select id="payInvoice" name="invoice_id" required></select>
            </div>
            <div class="form-group">
                <label for="payAmount">Jumlah (Rp)</label>
                <input type="number" id="payAmount" name="amount" placeholder="Nominal pembayaran" required>
            </div>
            <div class="form-group">
                <label for="payMethod">Metode Pembayaran</label>
                <select id="payMethod" name="payment_method">
                    <option value="">— Pilih Metode —</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="cash">Tunai</option>
                    <option value="qris">QRIS</option>
                    <option value="other">Lainnya</option>
                </select>
            </div>
            <div class="form-group">
                <label for="payReference">Referensi</label>
                <input type="text" id="payReference" name="reference" placeholder="No. referensi">
            </div>
            <div class="form-group">
                <label for="payNotes">Catatan</label>
                <textarea id="payNotes" name="notes" placeholder="Catatan"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="paymentFormCancel">Batal</button>
                <button type="submit" class="btn-submit">Simpan</button>
            </div>
        </form>
    </div>
</div>
@endsection
