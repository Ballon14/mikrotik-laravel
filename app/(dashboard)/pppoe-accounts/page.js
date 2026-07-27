'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiPost, apiPut, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function PppoeAccountsPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ customer_id: '', username: '', password: '', service: 'pppoe', remote_address: '', profile: 'default', router_id: '', status: 'disabled' })
  const [customers, setCustomers] = useState([])
  const [routers, setRouters] = useState([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(new Set())

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pppoe-accounts?page=${p || page}`)
      const json = await res.json()
      if (json.success) { setData(json.data.data); setTotal(json.data.total); setPage(json.data.currentPage) }
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(1) }, [])

  const lastPage = Math.ceil(total / PAGE_SIZE)

  async function loadRelated() {
    const [cRes, rRes] = await Promise.all([fetch('/api/customers?all=true'), fetch('/api/routers?all=true')])
    const cj = await cRes.json(); const rj = await rRes.json()
    if (cj.success) setCustomers(cj.data)
    if (rj.success) setRouters(rj.data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const payload = { ...form, customer_id: form.customer_id ? Number(form.customer_id) : null, router_id: form.router_id ? Number(form.router_id) : null }
      if (modal?.id) await apiPut(`/api/pppoe-accounts/${modal.id}`, payload)
      else await apiPost('/api/pppoe-accounts', payload)
      setModal(null); load()
    } catch (err) { alert(err.message) }
  }

  async function handleSync(id) {
    setSyncing(s => new Set(s).add(id))
    try {
      const res = await fetch(`/api/pppoe-accounts/${id}/sync`, { method: 'POST' })
      const json = await res.json()
      if (!json.success) alert(json.error || 'Sync failed')
      load()
    } catch (err) { alert(err.message) }
    finally { setSyncing(s => { const n = new Set(s); n.delete(id); return n }) }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>🔌 PPPoE Accounts</h3>
        <button className="btn-action btn-add" onClick={async () => { await loadRelated(); setForm({ customer_id: '', username: '', password: '', service: 'pppoe', remote_address: '', profile: 'default', router_id: '', status: 'disabled' }); setModal({ id: null, title: 'Tambah Akun PPPoE' }) }}>➕ Tambah Akun</button>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Username</th><th>Customer</th><th>Service</th><th>Profile</th><th>Status</th><th>Router</th><th>Sync</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              : data.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-text">Belum ada akun PPPoE</div></div></td></tr>
              : data.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.username}</strong></td>
                  <td>{a.customer?.name || '-'}</td>
                  <td>{a.service}</td>
                  <td>{a.profile}</td>
                  <td><span className={`status-badge ${a.isActive ? 'success' : 'warning'}`}>{a.isActive ? 'Active' : 'Disabled'}</span></td>
                  <td>{a.router?.name || '-'}</td>
                  <td><button className="btn-edit" onClick={() => handleSync(a.id)} disabled={syncing.has(a.id)}>{syncing.has(a.id) ? '⏳' : '🔄'}</button></td>
                  <td>
                    <button className="btn-edit" onClick={async () => { await loadRelated(); setForm({ customer_id: String(a.customerId), username: a.username, password: '', service: a.service, remote_address: a.remoteAddress || '', profile: a.profile, router_id: a.routerId ? String(a.routerId) : '', status: a.isActive ? 'enabled' : 'disabled' }); setModal({ id: a.id, title: 'Edit Akun PPPoE' }) }}>Edit</button>
                    <button className="btn-delete" style={{ marginLeft: 4 }} onClick={async () => { if (confirm('Hapus akun PPPoE?')) { await apiDelete(`/api/pppoe-accounts/${a.id}`); load() } }}>Hapus</button>
                  </td>
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
                <div className="form-group"><label>Username</label><input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required /></div>
                <div className="form-group"><label>Password</label><input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={modal.id ? '(kosongkan jika tidak diubah)' : ''} required={!modal.id} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Customer</label><select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required><option value="">— Pilih —</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label>Router</label><select value={form.router_id} onChange={e => setForm({...form, router_id: e.target.value})}><option value="">— Pilih —</option>{routers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Service</label><select value={form.service} onChange={e => setForm({...form, service: e.target.value})}><option value="pppoe">PPPoE</option><option value="pptp">PPTP</option><option value="l2tp">L2TP</option><option value="ovpn">OpenVPN</option></select></div>
                <div className="form-group"><label>Profile</label><input type="text" value={form.profile} onChange={e => setForm({...form, profile: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Remote Address</label><input type="text" value={form.remote_address} onChange={e => setForm({...form, remote_address: e.target.value})} /></div>
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></div>
              <div className="form-actions"><button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn-submit">Simpan</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
