'use client'

import { useState, useEffect } from 'react'

export default function IpIsolationPage() {
  const [isolatedIps, setIsolatedIps] = useState([])
  const [inputIp, setInputIp] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/isolated-ips')
      const json = await res.json()
      if (json.success) setIsolatedIps(json.data || [])
    } catch {}
  }

  useEffect(() => { load() }, [])

  async function handleIsolate(e) {
    e.preventDefault()
    if (!inputIp.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/isolate-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: inputIp.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setInputIp('')
        load()
      } else {
        alert(json.error || 'Gagal mengisolasi IP')
      }
    } catch (err) { alert(err.message) }
    finally { setLoading(false) }
  }

  async function handleUnisolate(ip) {
    if (!confirm(`Buka isolasi IP ${ip}?`)) return
    try {
      const res = await fetch('/api/unisolate-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      })
      const json = await res.json()
      if (json.success) load()
      else alert(json.error || 'Gagal membuka isolasi')
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>🔒 IP Isolation</h3>
        <span className="header-badge">{isolatedIps.length} isolated</span>
      </div>
      <div className="card-body">
        <form className="crud-form" onSubmit={handleIsolate} style={{ maxWidth: 500, marginBottom: 24 }}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>IP Address</label>
              <input type="text" value={inputIp} onChange={e => setInputIp(e.target.value)} placeholder="192.168.1.100" required />
            </div>
            <div className="form-group" style={{ alignSelf: 'flex-end' }}>
              <button type="submit" className="btn-submit" disabled={loading}>{loading ? '⏳' : '🔒 Isolate'}</button>
            </div>
          </div>
        </form>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>IP Address</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {isolatedIps.length === 0 ? (
                <tr><td colSpan={2}><div className="empty-state"><div className="empty-state-text">Tidak ada IP yang diisolasi</div></div></td></tr>
              ) : isolatedIps.map((ip, i) => (
                <tr key={i}>
                  <td><strong>{ip}</strong></td>
                  <td>
                    <button className="btn-edit" onClick={() => handleUnisolate(ip)}>🔓 Unisolate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
