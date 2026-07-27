'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'

export default function InterfacesPage() {
  const [data, setData] = useState([])

  useEffect(() => {
    apiFetch('/api/interfaces').then(setData).catch(() => {})
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <h3>🔗 Network Interfaces</h3>
      </div>
      <div className="card-body">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>MAC Address</th>
                <th>TX</th>
                <th>RX</th>
                <th>MTU</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-text">Loading...</div></div></td></tr>
              ) : data.map((iface, i) => {
                const running = iface.running === 'true' || iface.running === true
                const disabled = iface.disabled === 'true' || iface.disabled === true
                let badge, badgeText
                if (disabled) { badge = 'badge-disabled'; badgeText = 'Disabled' }
                else if (running) { badge = 'badge-running'; badgeText = 'Running' }
                else { badge = 'badge-inactive'; badgeText = 'Down' }

                return (
                  <tr key={i}>
                    <td>{iface.name || '-'}</td>
                    <td>{iface.type || '-'}</td>
                    <td><span className={`badge ${badge}`}><span className="badge-dot"></span>{badgeText}</span></td>
                    <td>{iface.macAddress || '-'}</td>
                    <td style={{ color: 'var(--accent-green)' }}>↑ {fmtBytes((iface.txByte || 0) * 8)}</td>
                    <td style={{ color: 'var(--accent-cyan)' }}>↓ {fmtBytes((iface.rxByte || 0) * 8)}</td>
                    <td>{iface.mtu || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function fmtBytes(b, d = 1) {
  if (!b || b === 0) return '0 b'
  const k = 1024
  const sizes = ['b','Kib','Mib','Gib','Tib']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return parseFloat((b / Math.pow(k, i)).toFixed(d)) + ' ' + sizes[i]
}
