'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'

const PAGE_SIZE = 50

const topicColors = {
  'dhcp': '#4fc3f7',
  'pppoe': '#81c784',
  'firewall': '#e57373',
  'system': '#ffb74d',
  'info': '#90caf9',
  'error': '#ef5350',
  'warning': '#ffa726',
  'debug': '#ce93d8',
  'critical': '#f44336',
  'account': '#a5d6a7',
  'hotspot': '#4dd0e1',
  'wireless': '#b39ddb',
}

function getTopicColor(topic) {
  if (!topic) return '#aaa'
  const t = topic.toLowerCase()
  for (const [key, color] of Object.entries(topicColors)) {
    if (t.includes(key)) return color
  }
  return '#90a4ae'
}

export default function LogsPage() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/api/logs').then(setData).catch(() => {})
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const items = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <h3>📄 System Logs</h3>
        <span className="header-badge">{data.length} entries</span>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th style={{ width: 80 }}>Time</th><th style={{ width: 100 }}>Topics</th><th>Message</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={3}><div className="empty-state"><div className="empty-state-text">No log data</div></div></td></tr>
              ) : items.map((log, i) => {
                const topics = (log.topics || '').split(',').filter(Boolean)
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 11, color: 'var(--text-muted)' }}>{log.time}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {topics.length > 0 ? topics.map((t, j) => (
                          <span key={j} style={{
                            fontSize: 10, padding: '1px 6px', borderRadius: 3,
                            background: getTopicColor(t) + '22',
                            color: getTopicColor(t),
                            border: `1px solid ${getTopicColor(t)}44`,
                          }}>{t}</span>
                        )) : <span style={{ color: '#666', fontSize: 11 }}>-</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{log.message || '-'}</td>
                  </tr>
                )
              })}
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
