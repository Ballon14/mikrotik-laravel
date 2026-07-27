'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.target)
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email atau password salah')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      margin: 0,
      background: 'var(--bg-primary)',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">📡</div>
            <h1>MikroTik</h1>
            <span>Billing & Monitor Dashboard</span>
          </div>

          {error && (
            <div style={{
              display: 'block',
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              color: 'var(--accent-red)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@billing.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(56, 189, 248, 0.2))',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '8px',
                color: 'var(--accent-cyan)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
