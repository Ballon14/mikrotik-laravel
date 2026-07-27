'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/client-api.mjs'

const PAGE_SIZE = 25

export default function FirewallPage() {
  const [filterData, setFilterData] = useState([])
  const [natData, setNatData] = useState([])
  const [tab, setTab] = useState('filter')
  const [filterPage, setFilterPage] = useState(1)
  const [natPage, setNatPage] = useState(1)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/firewall/filter').catch(() => []),
      apiFetch('/api/firewall/nat').catch(() => []),
    ]).then(([f, n]) => { setFilterData(f); setNatData(n) })
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <h3>🛡️ Firewall Rules</h3>
      </div>
      <div className="card-body">
        <div className="tabs">
          <button className={`tab-btn ${tab === 'filter' ? 'active' : ''}`} onClick={() => setTab('filter')}>Filter Rules</button>
          <button className={`tab-btn ${tab === 'nat' ? 'active' : ''}`} onClick={() => setTab('nat')}>NAT Rules</button>
        </div>

        {tab === 'filter' && <FirewallTable data={filterData} page={filterPage} setPage={setFilterPage} type="filter" />}
        {tab === 'nat' && <FirewallTable data={natData} page={natPage} setPage={setNatPage} type="nat" />}
      </div>
    </div>
  )
}

function FirewallTable({ data, page, setPage, type }) {
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const items = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Chain</th>
              <th>Src Address</th>
              <th>Dst Address</th>
              <th>Protocol</th>
              <th>Action</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-text">Tidak ada {type} rule</div></div></td></tr>
            ) : items.map((rule, i) => (
              <tr key={i} className={(rule.disabled === 'true' || rule.disabled === true) ? 'row-disabled' : ''}>
                <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td><span className={`badge ${rule.chain === 'forward' ? 'badge-info' : rule.chain === 'input' ? 'badge-warning' : 'badge-active'}`}>{rule.chain || '-'}</span></td>
                <td>{rule.srcAddress || 'any'}</td>
                <td>{rule.dstAddress || 'any'}</td>
                <td>{rule.protocol || 'any'}</td>
                <td><span className={`badge ${rule.action === 'drop' || rule.action === 'reject' ? 'badge-error' : 'badge-active'}`}>{rule.action || '-'}</span></td>
                <td>{rule.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination-bar">
          <span className="pagination-info">{items.length > 0 ? `${(page-1)*PAGE_SIZE+1}-${Math.min(page*PAGE_SIZE, data.length)} dari ${data.length}` : ''}</span>
          <div className="pagination-actions">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span style={{ padding: '5px 8px', color: 'var(--text-muted)', fontSize: 12 }}>{page} / {totalPages}</span>
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </>
  )
}
