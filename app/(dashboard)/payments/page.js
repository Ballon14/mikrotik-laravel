'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiPost, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function PaymentsPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ invoice_id: '', amount: '', payment_method: '', reference: '', notes: '' })
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payments?page=${p || page}`)
      const json = await res.json()
      if (json.success) { setData(json.data.data); setTotal(json.data.total); setPage(json.data.currentPage) }
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(1) }, [])

  const lastPage = Math.ceil(total / PAGE_SIZE)

  async function loadInvoices() {
    const res = await fetch('/api/invoices?all=true')
    const json = await res.json()
    if (json.success) setInvoices(json.data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await apiPost('/api/payments', form)
      setShowModal(false)
      load()
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>👛 Payments</h3>
        <button className="btn-action btn-add" onClick={async () => { await loadInvoices(); setForm({ invoice_id: '', amount: '', payment_method: '', reference: '', notes: '' }); setShowModal(true) }}>➕ Catat Pembayaran</button>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Invoice</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              : data.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">Belum ada pembayaran</div></div></td></tr>
              : data.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.invoice?.invoiceNumber || '-'}</td>
                  <td>{p.invoice?.customer?.name || '-'}</td>
                  <td>Rp {Number(p.amount).toLocaleString('id-ID')}</td>
                  <td>{p.paymentMethod || '-'}</td>
                  <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lastPage > 1 && (
          <div className="pagination-bar">
            <span>{(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, total)} dari {total}</span>
            <div className="pagination-actions">
              <button className="page-btn" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
              <span style={{ padding: '5px 8px', color: 'var(--text-muted)', fontSize: 12 }}>{page} / {lastPage}</span>
              <button className="page-btn" disabled={page >= lastPage} onClick={() => load(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="crud-modal show" onClick={e => e.target.classList.contains('crud-modal') && setShowModal(false)}>
          <div className="crud-modal-content">
            <div className="crud-modal-header"><h3>Catat Pembayaran</h3><button className="crud-modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form className="crud-form" onSubmit={handleSubmit}>
              <div className="form-group"><label>Invoice</label><select value={form.invoice_id} onChange={e => setForm({...form, invoice_id: e.target.value})} required><option value="">— Pilih Invoice —</option>{invoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.customer?.name} (Rp {Number(i.amount).toLocaleString('id-ID')})</option>)}</select></div>
              <div className="form-group"><label>Amount</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Payment Method</label><input type="text" value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})} /></div>
                <div className="form-group"><label>Reference</label><input type="text" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Notes</label><input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="form-actions"><button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-submit">Simpan</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
