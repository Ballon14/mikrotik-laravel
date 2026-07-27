'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/client-api.mjs'
import Link from 'next/link'

export default function BillingDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const d = await apiFetch('/api/billing/dashboard')
        setData(d)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="stats-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="stat-card" style={{ padding: 20 }}>
            <div className="skeleton skeleton-text" style={{ height: 12, width: 80 }}></div>
            <div className="skeleton skeleton-stat" style={{ height: 32, width: 100, marginTop: 12 }}></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return <div className="empty-state"><div className="empty-state-text">Gagal memuat data</div></div>

  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const monthlyArr = data.monthlyData || {}
  const maxRevenue = Math.max(...Object.values(monthlyArr).map(Number), 1)

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card cyan">
          <div className="stat-card-top">
            <span className="stat-label">Pelanggan Aktif</span>
            <span>👥</span>
          </div>
          <div className="stat-value">{data.activeCustomers || 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-top">
            <span className="stat-label">Pendapatan Bulan Ini</span>
            <span>💰</span>
          </div>
          <div className="stat-value">Rp {Number(data.monthlyRevenue || 0).toLocaleString('id-ID')}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-card-top">
            <span className="stat-label">Pendapatan Tertunda</span>
            <span>⏳</span>
          </div>
          <div className="stat-value">Rp {Number(data.pendingRevenue || 0).toLocaleString('id-ID')}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-top">
            <span className="stat-label">Total Pelanggan</span>
            <span>📊</span>
          </div>
          <div className="stat-value">{data.totalCustomers || 0}</div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3>💰 Pendapatan Bulanan ({new Date().getFullYear()})</h3>
          </div>
          <div className="card-body">
            <div className="revenue-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 250, padding: '20px 0' }}>
              {months.map((m, i) => {
                const val = Number(monthlyArr[String(i + 1)] || 0)
                const pct = maxRevenue > 0 ? (val / maxRevenue) * 100 : 0
                return (
                  <div key={m} className="chart-bar-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div className="chart-value" style={{ fontSize: 9, color: 'var(--text-muted)' }}>Rp{(val / 1000).toFixed(0)}k</div>
                    <div className="chart-bar" style={{ width: '100%', background: 'linear-gradient(180deg, var(--accent-cyan), rgba(34, 211, 238, 0.3))', borderRadius: '4px 4px 0 0', minHeight: 4, height: Math.max(pct, 4) + '%', transition: 'height 0.6s ease' }}></div>
                    <div className="chart-label" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{m}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>💳 Pembayaran Terbaru</h3>
            <Link href="/payments" style={{ fontSize: 12, color: 'var(--accent-cyan)', textDecoration: 'none' }}>Lihat Semua</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {(!data.recentPayments || data.recentPayments.length === 0) ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-state-text">Belum ada pembayaran</div>
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                {data.recentPayments.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)', fontSize: 12 }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.invoice?.customer?.name || '-'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.invoice?.invoiceNumber || ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Rp {Number(p.amount).toLocaleString('id-ID')}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Link href="/customers" className="stat-card blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-card-top">
            <span className="stat-label">Pelanggan Aktif</span>
            <span>✅</span>
          </div>
          <div className="stat-value">{data.activeCustomers || 0}</div>
          <div className="stat-sub">dari {data.totalCustomers || 0} total</div>
        </Link>
        <Link href="/ip-isolation" className="stat-card red" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-card-top">
            <span className="stat-label">Diisolasi</span>
            <span>🔒</span>
          </div>
          <div className="stat-value">{data.isolatedCustomers || 0}</div>
          <div className="stat-sub">pelanggan diblokir</div>
        </Link>
      </div>
    </>
  )
}
