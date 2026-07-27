'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function IpAddressesPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/api/ip-addresses').then(setData).catch(() => {})
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const items = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <h3>🌐 IP Addresses</h3>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Network</th>
                <th>Interface</th>
                <th>Type</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              ) : items.map((addr, i) => {
                const dynamic = addr.dynamic === 'true' || addr.dynamic === true
                const disabled = addr.disabled === 'true' || addr.disabled === true
                return (
                  <tr key={i} className={disabled ? 'row-disabled' : ''}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{addr.address || '-'}</td>
                    <td>{addr.network || '-'}</td>
                    <td>{addr.interface || '-'}</td>
                    <td>
                      {dynamic ? <span className="badge badge-info">Dynamic</span> : <span className="badge badge-active">Static</span>}
                      {disabled ? <span className="badge badge-disabled" style={{ marginLeft: 4 }}>Disabled</span> : ''}
                    </td>
                    <td>{addr.comment || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">{(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, data.length)} dari {data.length}</span>
            <div className="pagination-actions">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span style={{ padding: '5px 8px', color: 'var(--text-muted)', fontSize: 12 }}>{page} / {totalPages}</span>
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
