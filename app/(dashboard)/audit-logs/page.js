'use client'

import { useState, useEffect, useCallback } from 'react'

const PAGE_SIZE = 50

export default function AuditLogsPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/audit-logs?page=${p || page}`)
      const json = await res.json()
      if (json.success) { setData(json.data.data); setTotal(json.data.total); setPage(json.data.currentPage) }
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(1) }, [])

  const lastPage = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <h3>📜 Audit Logs</h3>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              : data.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-text">Belum ada log</div></div></td></tr>
              : data.map((log, i) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                  <td>{log.user?.name || log.user?.email || 'System'}</td>
                  <td><span className="status-badge" style={{ fontSize: 11, padding: '2px 6px' }}>{log.action}</span></td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '-'}</td>
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
    </div>
  )
}
