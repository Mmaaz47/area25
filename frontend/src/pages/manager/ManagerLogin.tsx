import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ManagerLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('manager_auth', '1')
      navigate('/manager')
    } else {
      setError('Invalid credentials')
    }
  }

  // Show notice if redirected with loggedOut flag
  React.useEffect(() => {
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
        <p style={{ marginTop: 4, color: 'var(--muted-text)' }}>Use demo credentials: <strong>admin / admin</strong></p>
        {notice && <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: 8, borderRadius: 8, marginBottom: 8 }}>{notice}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit">Login</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button onClick={() => navigate('/') } style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>Return Home</button>
        </div>
      </div>
    </div>
  )
}


