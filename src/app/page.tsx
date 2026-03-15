'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const USERS = [
  { name: 'Nick Fury', email: 'nick@shield.com', role: 'ADMIN', country: 'America' },
  { name: 'Captain Marvel', email: 'marvel@shield.com', role: 'MANAGER', country: 'India' },
  { name: 'Captain America', email: 'america@shield.com', role: 'MANAGER', country: 'America' },
  { name: 'Thanos', email: 'thanos@shield.com', role: 'MEMBER', country: 'India' },
  { name: 'Thor', email: 'thor@shield.com', role: 'MEMBER', country: 'India' },
  { name: 'Travis', email: 'travis@shield.com', role: 'MEMBER', country: 'America' },
]

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login(email: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('Login failed. Please try again.')
      }
    } catch {
      setError('Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2d0a4e 0%, #4a1080 50%, #2d0a4e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
            <span style={{ color: '#f472b6' }}>Slooze</span>
            <span style={{ color: '#c084fc' }}>meals</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Select your profile to continue</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {USERS.map(user => (
            <button
              key={user.email}
              onClick={() => login(user.email)}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: '12px', border: '2px solid #e9d5ff',
                background: '#fdf4ff', cursor: 'pointer', transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c3aed'
                ;(e.currentTarget as HTMLButtonElement).style.background = '#f3e8ff'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e9d5ff'
                ;(e.currentTarget as HTMLButtonElement).style.background = '#fdf4ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                  {user.name[0]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '15px' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.country}</div>
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                background: user.role === 'ADMIN' ? '#7c3aed' : user.role === 'MANAGER' ? '#ec4899' : '#6b7280',
                color: 'white'
              }}>
                {user.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}