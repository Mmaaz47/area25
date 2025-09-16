import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ManagerLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store token in sessionStorage (more secure than localStorage)
        sessionStorage.setItem('manager_token', data.token)
        sessionStorage.setItem('manager_token_expires', data.expiresAt)
        navigate('/manager')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Show notice if redirected with loggedOut flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('loggedOut')) {
      setNotice('Logged out')
      // Clean the query param to avoid persistent message on refresh
      const url = new URL(window.location.href)
      url.searchParams.delete('loggedOut')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  return (
    <div style={{ padding: 16, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Manager Login</h2>
        {notice && <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: 8, borderRadius: 8, marginBottom: 8 }}>{notice}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button onClick={() => navigate('/') } style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>Return Home</button>
        </div>
      </div>
    </div>
  )
}