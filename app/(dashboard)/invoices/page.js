'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiPost, apiPut, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function InvoicesPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ customer_id: '', invoice_number: '', amount: '', status: 'unpaid', due_date: '', period_start: '', period_end: '' })
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices?page=${p || page}`)
      const json = await res.json()
      if (json.success) { setData(json.data.data); setTotal(json.data.total); setPage(json.data.currentPage) }
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(1) }, [])

  const lastPage = Math.ceil(total / PAGE_SIZE)

  async function loadCustomers() {
    const res = await fetch('/api/customers?all=true')
    const json = await res.json()
    if (json.success) setCustomers(json.data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (modal?.id) await apiPut(`/api/invoices/${modal.id}`, form)
      else await apiPost('/api/invoices', form)
      setModal(null); load()
    } catch (err) { alert(err.message) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus tagihan ini?')) return
    await apiDelete(`/api/invoices/${id}`)
    load()
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>🧾 Invoices</h3>
        <button className="btn-action btn-add" onClick={async () => { await loadCustomers(); setForm({ customer_id: '', invoice_number: '', amount: '', status: 'unpaid', due_date: '', period_start: '', period_end: '' }); setModal({ id: null, title: 'Buat Tagihan' }) }}>➕ Buat Tagihan</button>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              : data.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">Belum ada tagihan</div></div></td></tr>
              : data.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.invoiceNumber}</strong></td>
                  <td>{i.customer?.name || '-'}</td>
                  <td>{i.dueDate}</td>
                  <td>Rp {Number(i.amount).toLocaleString('id-ID')}</td>
                  <td><span className={`status-badge ${i.status === 'paid' ? 'success' : 'danger'}`}>{i.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</span></td>
                  <td><button className="btn-delete" onClick={() => handleDelete(i.id)}>Hapus</button></td>
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

      {modal && (
        <div className="crud-modal show" onClick={e => e.target.classList.contains('crud-modal') && setModal(null)}>
          <div className="crud-modal-content crud-modal-wide">
            <div className="crud-modal-header"><h3>{modal.title}</h3><button className="crud-modal-close" onClick={() => setModal(null)}>✕</button></div>
            <form className="crud-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Invoice Number</label><input type="text" value={form.invoice_number} onChange={e => setForm({...form, invoice_number: e.target.value})} required /></div>
                <div className="form-group"><label>Customer</label><select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required><option value="">— Pilih —</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Amount</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
                <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Period Start</label><input type="date" value={form.period_start} onChange={e => setForm({...form, period_start: e.target.value})} /></div>
                <div className="form-group"><label>Period End</label><input type="date" value={form.period_end} onChange={e => setForm({...form, period_end: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></div>
              <div className="form-actions"><button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn-submit">Simpan</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
