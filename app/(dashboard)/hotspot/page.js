'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function HotspotPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [totalBytes, setTotalBytes] = useState({ rx: 0, tx: 0 })

  useEffect(() => {
    apiFetch('/api/hotspot/active').then(arr => {
      setData(arr)
      let rx = 0, tx = 0
      for (const h of arr) {
        rx += parseInt(h['bytes-in'] || 0, 10)
        tx += parseInt(h['bytes-out'] || 0, 10)
      }
      setTotalBytes({ rx, tx })
    }).catch(() => {})
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const items = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function formatBytes(b) {
    if (!b) return '0 B'
    const u = ['B', 'KB', 'MB', 'GB', 'TB']
    let i = 0
    let v = b
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
    return v.toFixed(i === 0 ? 0 : 1) + ' ' + u[i]
  }

  function formatUptime(s) {
    if (!s) return '-'
    const parts = s.split(':').map(Number)
    if (parts.length === 3) return `${parts[0]}h ${parts[1]}m ${parts[2]}s`
    return s
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>📶 Hotspot Active Users</h3>
        <span className="header-badge">{data.length} active</span>
      </div>
      {data.length > 0 && (
        <div className="card-body" style={{ paddingTop: 0 }}>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 16 }}>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{formatBytes(totalBytes.rx)}</div><div className="stat-label">Total RX</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-info)' }}>{formatBytes(totalBytes.tx)}</div><div className="stat-label">Total TX</div></div>
          </div>
        </div>
      )}
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>IP Address</th><th>MAC Address</th><th>Uptime</th><th>RX</th><th>TX</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">No active hotspot users</div></div></td></tr>
              ) : items.map((h, i) => (
                <tr key={h['.id'] || i}>
                  <td><strong>{h.user || '-'}</strong></td>
                  <td>{h.address || '-'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{h['mac-address'] || '-'}</td>
                  <td>{formatUptime(h.uptime)}</td>
                  <td>{formatBytes(parseInt(h['bytes-in'] || 0, 10))}</td>
                  <td>{formatBytes(parseInt(h['bytes-out'] || 0, 10))}</td>
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
