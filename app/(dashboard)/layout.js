'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// Toast
let toastTimeout
function showToast(message, type = 'error') {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = message
  toast.className = `toast ${type} show`
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 4000)
}

export { showToast }

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [routerName, setRouterName] = useState('MikroTik')
  const [connected, setConnected] = useState(false)
  const [activeCounts, setActiveCounts] = useState({})
  const [monthlyRevenue, setMonthlyRevenue] = useState('-')
  const [daemonHealthy, setDaemonHealthy] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    async function init() {
      try {
        const [identityRes, daemonRes, billingRes] = await Promise.all([
          fetch('/api/identity').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/daemon-status').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/billing/dashboard').then(r => r.json()).catch(() => ({ success: false })),
        ])

        if (identityRes.success && identityRes.data?.name) {
          setRouterName(identityRes.data.name)
          setConnected(true)
        }

        if (daemonRes.success) {
          setDaemonHealthy(daemonRes.data.healthy)
        }

        if (billingRes.success) {
          setActiveCounts(billingRes.data.activeCustomers ?? '-')
          setMonthlyRevenue('Rp' + Number(billingRes.data.monthlyRevenue || 0).toLocaleString('id-ID'))
        }
      } catch (e) {
        console.error('[Init]', e)
      }
    }
    init()
  }, [status])

  const isActive = useCallback((path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }, [pathname])

  if (status === 'loading') return null

  const navItems = [
    { section: 'Billing System', items: [
      { href: '/', label: 'Billing Dashboard', icon: '📊' },
      { href: '/packages', label: 'Packages', icon: '💳' },
      { href: '/customers', label: 'Customers', icon: '👥' },
      { href: '/invoices', label: 'Invoices', icon: '🧾' },
      { href: '/payments', label: 'Payments', icon: '👛' },
      { href: '/pppoe-accounts', label: 'PPPoE Accounts', icon: '🔌' },
      { href: '/routers', label: 'Routers', icon: '🖥️' },
      { href: '/audit-logs', label: 'Audit Logs', icon: '📋' },
    ]},
    { section: 'Monitoring', items: [
      { href: '/monitoring', label: 'System Overview', icon: '📈' },
      { href: '/interfaces', label: 'Interfaces', icon: '🔗' },
      { href: '/dhcp', label: 'DHCP Leases', icon: '📋' },
      { href: '/arp', label: 'ARP Table', icon: '📡' },
    ]},
    { section: 'Network', items: [
      { href: '/ip-addresses', label: 'IP Addresses', icon: '🌐' },
      { href: '/routes', label: 'Routing Table', icon: '🗺️' },
      { href: '/firewall', label: 'Firewall Rules', icon: '🛡️' },
      { href: '/ip-isolation', label: 'IP Isolation', icon: '🔒' },
    ]},
    { section: 'Services', items: [
      { href: '/hotspot', label: 'Hotspot Active', icon: '📶' },
      { href: '/logs', label: 'System Logs', icon: '📄' },
    ]},
  ]

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        id="mobileToggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed', top: '16px', left: '16px', zIndex: 200,
          width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div
        className="mobile-overlay"
        style={{
          display: sidebarOpen ? 'block' : 'none',
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 99,
        }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">📡</div>
            <div className="sidebar-logo-text">
              <h1>MikroTik</h1>
              <span>Billing & Monitor</span>
            </div>
          </div>
        </div>

        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <div className="status-dot"></div>
          <div className="status-info">
            <span className="label">Router</span>
            <span className="value">{connected ? routerName : 'Disconnected'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(group => (
            <div key={group.section}>
              <div className="nav-section-title">{group.section}</div>
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <div className="refresh-indicator">
              <div className="refresh-spinner" id="refreshSpinner"></div>
              <span>Auto-refresh</span>
            </div>
            <span>v1.2</span>
          </div>

          <button
            className="sidebar-logout-btn"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="page-header">
          <h2 id="pageTitle">{getPageTitle(pathname)}</h2>
          <div className="header-actions">
            <a href="/" className="header-billing-shortcut" style={{ display: activeCounts ? 'flex' : 'none' }}>
              <span>👥</span>
              <span className="shortcut-label">Aktif:</span>
              <span className="shortcut-value">{activeCounts}</span>
              <span style={{ marginLeft: 8 }}>👛</span>
              <span className="shortcut-label">Bulan Ini:</span>
              <span className="shortcut-value">{monthlyRevenue}</span>
            </a>
            <span className="header-badge">RouterOS -</span>
          </div>
        </div>

        <div className="page-content">
          {!daemonHealthy && (
            <div className="daemon-banner daemon-banner-warning" id="daemonWarningBanner">
              <span>⚠️</span>
              <span>Daemon tidak terhubung ke router. Data monitoring tidak tersedia.</span>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Toast */}
      <div className="toast" id="toast"></div>

      {/* Confirm Modal */}
      <div className="confirm-modal" id="confirmModal">
        <div className="confirm-modal-content">
          <h3 id="confirmModalTitle">Konfirmasi</h3>
          <p id="confirmMessage">Apakah Anda yakin?</p>
          <div className="confirm-actions">
            <button className="btn-cancel" id="confirmCancel">Batal</button>
            <button className="btn-delete" id="confirmDelete">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getPageTitle(path) {
  const titles = {
    '/': 'Billing Dashboard',
    '/monitoring': 'System Overview',
    '/interfaces': 'Network Interfaces',
    '/dhcp': 'DHCP Leases',
    '/routes': 'Routing Table',
    '/firewall': 'Firewall Rules',
    '/arp': 'ARP Table',
    '/logs': 'System Logs',
    '/hotspot': 'Hotspot Active',
    '/ip-addresses': 'IP Addresses',
    '/ip-isolation': 'IP Isolation',
    '/packages': 'Packages',
    '/customers': 'Customers',
    '/invoices': 'Invoices',
    '/payments': 'Payments',
    '/routers': 'Routers',
    '/pppoe-accounts': 'PPPoE Accounts',
    '/audit-logs': 'Audit Logs',
  }
  return titles[path] || 'MikroTik Dashboard'
}
