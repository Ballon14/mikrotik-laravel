'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiPost, apiPut, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25
const periodLabels = { weekly: 'Mingguan', monthly: 'Bulanan', quarterly: 'Triwulan', yearly: 'Tahunan' }

export default function PackagesPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', speed: '', description: '', billing_period: 'monthly' })
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/packages?page=${p || page}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data.data)
        setTotal(json.data.total)
        setPage(json.data.currentPage)
      }
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(1) }, [])

  const lastPage = Math.ceil(total / PAGE_SIZE)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (modal?.id) {
        await apiPut(`/api/packages/${modal.id}`, form)
      } else {
        await apiPost('/api/packages', form)
      }
      setModal(null)
      load()
    } catch (err) { alert(err.message) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus paket ini?')) return
    await apiDelete(`/api/packages/${id}`)
    load()
  }

  function openEdit(pkg) {
    setForm({ name: pkg.name, price: String(pkg.price), speed: pkg.speed || '', description: pkg.description || '', billing_period: pkg.billingPeriod || 'monthly' })
    setModal({ id: pkg.id, title: 'Edit Paket' })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>💳 Packages</h3>
        <button className="btn-action btn-add" onClick={() => { setForm({ name: '', price: '', speed: '', description: '', billing_period: 'monthly' }); setModal({ id: null, title: 'Tambah Paket' }) }}>
          ➕ Tambah Paket
        </button>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Speed</th>
                <th>Period</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-text">Belum ada paket</div></div></td></tr>
              ) : data.map(pkg => (
                <tr key={pkg.id}>
                  <td>{pkg.id}</td>
                  <td><strong>{pkg.name}</strong></td>
                  <td>Rp {Number(pkg.price).toLocaleString('id-ID')}</td>
                  <td>{pkg.speed || '-'}</td>
                  <td>{periodLabels[pkg.billingPeriod] || pkg.billingPeriod || '-'}</td>
                  <td>{pkg.description || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => openEdit(pkg)}>Edit</button>
                    <button className="btn-delete" style={{ marginLeft: 4 }} onClick={() => handleDelete(pkg.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lastPage > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">{(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, total)} dari {total}</span>
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
          <div className="crud-modal-content">
            <div className="crud-modal-header">
              <h3>{modal.title}</h3>
              <button className="crud-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="crud-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Paket</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Harga</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Speed</label>
                  <input type="text" value={form.speed} onChange={e => setForm({...form, speed: e.target.value})} placeholder="50Mbps" />
                </div>
              </div>
              <div className="form-group">
                <label>Billing Period</label>
                <select value={form.billing_period} onChange={e => setForm({...form, billing_period: e.target.value})}>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="quarterly">Triwulan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
