'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function DhcpPage() {
  const [leases, setLeases] = useState([])
  const [isolatedIps, setIsolatedIps] = useState([])
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ address: '', macAddress: '', server: '', comment: '' })

  useEffect(() => {
    Promise.all([
      apiFetch('/api/dhcp-leases').catch(() => []),
      apiFetch('/api/isolated-ips').catch(() => []),
    ]).then(([l, i]) => { setLeases(l); setIsolatedIps(i) })
  }, [])

  const totalPages = Math.max(1, Math.ceil(leases.length / PAGE_SIZE))
  const items = leases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (modal?.id) {
        await apiPut(`/api/dhcp-leases/${modal.id}`, form)
      } else {
        await apiPost('/api/dhcp-leases', form)
      }
      setModal(null)
      const l = await apiFetch('/api/dhcp-leases')
      setLeases(l)
    } catch (err) { alert(err.message) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus DHCP lease ini?')) return
    await apiDelete(`/api/dhcp-leases/${id}`)
    const l = await apiFetch('/api/dhcp-leases')
    setLeases(l)
  }

  async function quickIsolate(ip) {
    if (!confirm(`Isolasi IP ${ip}?`)) return
    await apiPost('/api/isolate-ip', { ip })
    const i = await apiFetch('/api/isolated-ips')
    setIsolatedIps(i)
  }

  async function quickUnisolate(ip) {
    if (!confirm(`Unisolasi IP ${ip}?`)) return
    await apiPost('/api/unisolate-ip', { ip })
    const i = await apiFetch('/api/isolated-ips')
    setIsolatedIps(i)
  }

  function openEdit(lease, id) {
    setForm({ address: lease.address || '', macAddress: lease.macAddress || '', server: lease.server || '', comment: lease.comment || '' })
    setModal({ id, title: 'Edit DHCP Lease' })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>📋 DHCP Server Leases</h3>
        <button className="btn-action btn-add" onClick={() => { setForm({ address: '', macAddress: '', server: '', comment: '' }); setModal({ id: null, title: 'Add DHCP Lease' }) }}>
          ➕ Add Lease
        </button>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Server</th>
                <th>Status</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-text">Tidak ada DHCP lease</div></div></td></tr>
              ) : items.map((lease, i) => {
                const isIsolated = isolatedIps.includes(lease.address)
                return (
                  <tr key={i}>
                    <td>{lease.hostName || '-'}</td>
                    <td>
                      {lease.address || '-'}
                      {isIsolated ? <span className="badge badge-isolated" style={{ marginLeft: 6 }}>🔒 Isolated</span> : ''}
                    </td>
                    <td>{lease.macAddress || '-'}</td>
                    <td>{lease.server || '-'}</td>
                    <td><span className={`badge ${lease.status === 'bound' ? 'badge-bound' : 'badge-inactive'}`}><span className="badge-dot"></span>{lease.status || 'unknown'}</span></td>
                    <td>{lease.lastSeen || '-'}</td>
                    <td className="actions-cell">
                      <button className="btn-icon btn-edit" onClick={() => openEdit(lease, lease['.id'] || lease.id)}>✏️</button>
                      <button className="btn-icon btn-delete-icon" onClick={() => handleDelete(lease['.id'] || lease.id)}>🗑️</button>
                      {!isIsolated
                        ? <button className="btn-icon" style={{ color: 'var(--accent-yellow)' }} onClick={() => quickIsolate(lease.address)}>🔒</button>
                        : <button className="btn-icon" style={{ color: 'var(--accent-green)' }} onClick={() => quickUnisolate(lease.address)}>🔓</button>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">{items.length > 0 ? `${(page-1)*PAGE_SIZE+1}-${Math.min(page*PAGE_SIZE, leases.length)} dari ${leases.length}` : ''}</span>
            <div className="pagination-actions">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span style={{ padding: '5px 8px', color: 'var(--text-muted)', fontSize: 12 }}>{page} / {totalPages}</span>
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {modal && (
        <div className="crud-modal show" onClick={e => e.target.classList.contains('crud-modal') && setModal(null)}>
          <div className="crud-modal-content">
            <div className="crud-modal-header">
              <h3>{modal.title}</h3>
              <button className="crud-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="crud-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>IP Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="192.168.1.100" required />
              </div>
              <div className="form-group">
                <label>MAC Address</label>
                <input type="text" value={form.macAddress} onChange={e => setForm({...form, macAddress: e.target.value})} placeholder="AA:BB:CC:DD:EE:FF" required />
              </div>
              <div className="form-group">
                <label>Server</label>
                <input type="text" value={form.server} onChange={e => setForm({...form, server: e.target.value})} placeholder="dhcp1" />
              </div>
              <div className="form-group">
                <label>Comment</label>
                <input type="text" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} placeholder="Optional" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
