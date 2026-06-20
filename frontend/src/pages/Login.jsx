import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const navigate = useNavigate()

  const usarCredencialesDemo = (userEmail, userPass) => {
    setEmail(userEmail)
    setPassword(userPass)
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('rol', data.rol)
      navigate('/')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoMark}>I</div>
        <h1 style={s.title}>Innovatech Solutions</h1>
        <p style={s.subtitle}>Plataforma de Gestión</p>

        {error && <p style={s.error}>⚠️ {error}</p>}

        <form onSubmit={handleLogin} style={s.form}>
          <input
            style={s.input} type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required disabled={loading}
          />
          <div style={{ position: 'relative' }}>
            <input
              style={s.input} type={showPassword ? 'text' : 'password'} placeholder="Contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required disabled={loading}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={s.togglePassword}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" style={{ ...s.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>

        <div style={s.demoSection}>
          <p style={s.hintTitle}>Acceso rápido por rol</p>
          <div style={s.demoBtnGrid}>
            <button onClick={() => usarCredencialesDemo('admin@innovatech.com', 'admin123')}
              style={{ ...s.demoBtn, borderLeft: '3px solid #6366f1' }}>👑 Admin</button>
            <button onClick={() => usarCredencialesDemo('gestor@innovatech.com', 'gestor123')}
              style={{ ...s.demoBtn, borderLeft: '3px solid #10b981' }}>💼 Gestor</button>
            <button onClick={() => usarCredencialesDemo('colab@innovatech.com', 'colab123')}
              style={{ ...s.demoBtn, borderLeft: '3px solid #f59e0b' }}>👥 Colab</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  container:      { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', fontFamily: 'sans-serif' },
  card:           { background: '#1e293b', padding: '2.5rem', borderRadius: '12px', border: '1px solid #334155', width: '380px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  logoMark:       { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: '0 auto 1rem' },
  title:          { margin: '0 0 0.25rem', fontSize: '1.4rem', color: '#e2e8f0', textAlign: 'center', fontWeight: '700' },
  subtitle:       { color: '#64748b', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' },
  form:           { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  input:          { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', outline: 'none' },
  button:         { padding: '0.8rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '700', letterSpacing: '0.02em' },
  error:          { color: '#fca5a5', background: '#450a0a', padding: '0.6rem 0.8rem', borderRadius: '6px', borderLeft: '3px solid #ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' },
  togglePassword: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' },
  demoSection:    { marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #334155' },
  hintTitle:      { fontSize: '0.75rem', fontWeight: '600', color: '#475569', margin: '0 0 0.75rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' },
  demoBtnGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' },
  demoBtn:        { background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer', color: '#94a3b8', fontWeight: '600', textAlign: 'left' },
}
