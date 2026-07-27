'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function ArpPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/api/arp').then(setData).catch(() => {})
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const items = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <h3>📡 ARP Table</h3>
        <span className="header-badge">{data.length} entries</span>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>IP Address</th><th>MAC Address</th><th>Interface</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={4}><div className="empty-state"><div className="empty-state-text">No ARP data</div></div></td></tr>
              ) : items.map((a, i) => (
                <tr key={a['.id'] || i}>
                  <td><strong>{a.address}</strong></td>
                  <td style={{ fontFamily: 'monospace' }}>{a['mac-address'] || '-'}</td>
                  <td>{a.interface || '-'}</td>
                  <td><span className={`status-badge ${a.disabled === 'true' ? 'warning' : a.dynamic === 'true' ? 'info' : 'success'}`}>{a.dynamic === 'true' ? 'Dynamic' : a.disabled === 'true' ? 'Disabled' : 'Static'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination-bar">
            <span>{(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, data.length)} dari {data.length}</span>
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
