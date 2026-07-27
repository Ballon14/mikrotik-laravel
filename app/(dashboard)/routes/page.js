'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function RoutesPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/api/routes').then(setData).catch(() => {})
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const items = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <h3>🗺️ Routing Table</h3>
        <span className="header-badge">{data.length} routes</span>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Dst. Address</th><th>Gateway</th><th>Distance</th><th>Interface</th><th>Routing Mark</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">No route data</div></div></td></tr>
              ) : items.map((r, i) => (
                <tr key={r['.id'] || i}>
                  <td><strong>{r['dst-address']}</strong></td>
                  <td>{r.gateway || '-'}</td>
                  <td>{r.distance || '-'}</td>
                  <td>{r.interface || '-'}</td>
                  <td>{r['routing-mark'] || '-'}</td>
                  <td><span className={`status-badge ${r.disabled === 'true' ? 'warning' : 'success'}`}>{r.disabled === 'true' ? 'Disabled' : 'Active'}</span></td>
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
