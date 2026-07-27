'use client'

import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'

export default function OverviewPage() {
  const [data, setData] = useState(null)
  const [charts, setCharts] = useState({ uplink: [], bridge: [] })
  const uplinkCanvas = useRef(null)
  const bridgeCanvas = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [resource, identity, interfaces, uplinkTraffic, bridgeTraffic] = await Promise.all([
          apiFetch('/api/router').catch(() => null),
          apiFetch('/api/identity').catch(() => null),
          apiFetch('/api/interfaces').catch(() => []),
          apiFetch('/api/traffic/ether1').catch(() => []),
          apiFetch('/api/traffic/bridge').catch(() => []),
        ])
        setData({ resource, identity, interfaces })
        setCharts({ uplink: uplinkTraffic, bridge: bridgeTraffic })
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (charts.uplink.length >= 2) drawChart(uplinkCanvas.current, charts.uplink)
    if (charts.bridge.length >= 2) drawChart(bridgeCanvas.current, charts.bridge)
  }, [charts])

  if (!data) {
    return <div className="stats-grid">
      {[1,2,3,4].map(i => <div key={i} className="stat-card" style={{ height: 100 }}></div>)}
    </div>
  }

  const r = data.resource || {}
  const cpuLoad = Number(r.cpuLoad) || 0
  const totalMem = Number(r.totalMemory) || 0
  const freeMem = Number(r.freeMemory) || 0
  const usedMem = totalMem - freeMem
  const ramPercent = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0
  const totalHdd = Number(r.totalHddSpace) || 0
  const freeHdd = Number(r.freeHddSpace) || 0
  const usedHdd = totalHdd - freeHdd
  const hddPercent = totalHdd > 0 ? Math.round((usedHdd / totalHdd) * 100) : 0

  function fmtBytes(b, d = 1) {
    if (!b || b === 0) return '0 B'
    const k = 1024
    const sizes = ['B','KiB','MiB','GiB','TiB']
    const i = Math.floor(Math.log(b) / Math.log(k))
    return parseFloat((b / Math.pow(k, i)).toFixed(d)) + ' ' + sizes[i]
  }

  return (
    <>
      <div className="stats-grid">
        {[
          { label: 'CPU Load', value: cpuLoad + '%', pct: cpuLoad, color: cpuLoad > 80 ? 'red' : cpuLoad > 50 ? 'cyan' : 'green', icon: '🖥️' },
          { label: 'RAM Usage', value: ramPercent + '%', sub: `${fmtBytes(usedMem)} / ${fmtBytes(totalMem)}`, pct: ramPercent, color: ramPercent > 80 ? 'red' : ramPercent > 50 ? 'cyan' : 'green', icon: '🧠' },
          { label: 'Storage', value: hddPercent + '%', sub: `${fmtBytes(usedHdd)} / ${fmtBytes(totalHdd)}`, pct: hddPercent, color: hddPercent > 90 ? 'red' : hddPercent > 70 ? 'cyan' : 'green', icon: '💾' },
          { label: 'Uptime', value: (r.uptime || '-').replace(/w/g,'w ').replace(/d/g,'d ').replace(/h/g,'h ').replace(/m/g,'m '), icon: '⏰' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.color || 'blue'}`}>
            <div className="stat-card-top">
              <span className="stat-label">{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <div className="stat-value">{s.value}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
            {s.pct !== undefined && (
              <div className="progress-bar">
                <div className={`progress-fill ${s.color}`} style={{ width: Math.min(100, s.pct) + '%' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>ℹ️ System Information</h3>
        </div>
        <div className="card-body">
          <div className="info-grid">
            {[
              ['Board Name', r.boardName || '-'],
              ['Architecture', r.architectureName || '-'],
              ['RouterOS Version', r.version || '-'],
              ['CPU Model', r.cpu || '-'],
              ['CPU Count', r.cpuCount || '-'],
              ['CPU Frequency', r.cpuFrequency ? r.cpuFrequency + ' MHz' : '-'],
            ].map(([l, v]) => (
              <div key={l} className="info-item">
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>🌐 Uplink</h3>
            <span className="chart-status">{charts.uplink.length} samples</span>
          </div>
          <div className="chart-body">
            <div className="chart-canvas-wrap">
              {charts.uplink.length < 2 ? (
                <div className="chart-waiting">
                  <span>Menunggu data traffic...</span>
                </div>
              ) : <canvas ref={uplinkCanvas} style={{ width: '100%', height: '100%' }}></canvas>}
            </div>
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span className="chart-legend-dot rx"></span>
              <span>RX: <span className="chart-legend-value" id="rxUplink">-</span></span>
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot tx"></span>
              <span>TX: <span className="chart-legend-value" id="txUplink">-</span></span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>🔗 Bridge</h3>
            <span className="chart-status">{charts.bridge.length} samples</span>
          </div>
          <div className="chart-body">
            <div className="chart-canvas-wrap">
              {charts.bridge.length < 2 ? (
                <div className="chart-waiting">
                  <span>Menunggu data traffic...</span>
                </div>
              ) : <canvas ref={bridgeCanvas} style={{ width: '100%', height: '100%' }}></canvas>}
            </div>
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span className="chart-legend-dot rx"></span>
              <span>RX: <span className="chart-legend-value" id="rxBridge">-</span></span>
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot tx"></span>
              <span>TX: <span className="chart-legend-value" id="txBridge">-</span></span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function drawChart(canvas, data) {
  if (!canvas) return
  const rect = canvas.parentElement.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const W = rect.width, H = rect.height
  const P = { top: 10, right: 10, bottom: 24, left: 55 }
  const cw = W - P.left - P.right, ch = H - P.top - P.bottom
  ctx.clearRect(0, 0, W, H)

  data = data.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0))

  let maxVal = 0
  data.forEach(d => { maxVal = Math.max(maxVal, d.rxRate || 0, d.txRate || 0) })
  maxVal = Math.max(maxVal, 1024) * 1.15

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)'
  ctx.lineWidth = 1
  ctx.font = "10px 'JetBrains Mono', monospace"
  ctx.fillStyle = 'rgba(100, 116, 139, 0.7)'
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const y = P.top + (ch / 4) * i
    const val = maxVal - (maxVal / 4) * i
    ctx.beginPath(); ctx.moveTo(P.left, y); ctx.lineTo(W - P.right, y); ctx.stroke()
    ctx.fillText(formatSpeed(val * 8), P.left - 5, y + 3)
  }

  function drawLine(points, key, color, fill) {
    if (points.length < 2) return
    const step = cw / (Math.max(points.length - 1, 1))
    ctx.beginPath()
    points.forEach((p, i) => {
      const x = P.left + i * step, val = p[key] || 0, y = P.top + ch - (val / maxVal) * ch
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke()
    const lastX = P.left + (points.length - 1) * step
    ctx.lineTo(lastX, P.top + ch); ctx.lineTo(P.left, P.top + ch); ctx.closePath()
    ctx.fillStyle = fill; ctx.fill()
  }

  drawLine(data, 'rxRate', '#22d3ee', 'rgba(34, 211, 238, 0.08)')
  drawLine(data, 'txRate', '#34d399', 'rgba(52, 211, 153, 0.08)')

  ctx.fillStyle = 'rgba(100, 116, 139, 0.5)'
  ctx.textAlign = 'center'
  ctx.font = "9px 'JetBrains Mono', monospace"
  if (data.length >= 2) {
    const oldest = new Date(data[0].ts)
    const newest = new Date(data[data.length - 1].ts)
    ctx.fillText(oldest.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), P.left, H - 4)
    ctx.fillText(newest.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), W - P.right, H - 4)
  }

  const last = data[data.length - 1]
  const rxEl = document.getElementById('rx' + (canvas.id?.includes('bridge') ? 'Bridge' : 'Uplink'))
  const txEl = document.getElementById('tx' + (canvas.id?.includes('bridge') ? 'Bridge' : 'Uplink'))
}

function formatSpeed(bps) {
  if (!bps || bps === 0) return '0 bps'
  const n = Number(bps)
  if (n >= 1073741824) return (n / 1073741824).toFixed(2) + ' Gibps'
  if (n >= 1048576) return (n / 1048576).toFixed(2) + ' Mibps'
  if (n >= 1024) return (n / 1024).toFixed(2) + ' Kibps'
  return n + ' bps'
}
