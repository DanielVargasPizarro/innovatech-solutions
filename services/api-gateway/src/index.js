require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { verifyToken } = require('./middleware/auth')
const { breakers } = require('./circuitBreaker')

const app = express()
const PORT = process.env.PORT || 3000

const SERVICES = {
  proyectos: process.env.MS_PROYECTOS_URL,
  recursos:  process.env.MS_RECURSOS_URL,
  analitica: process.env.MS_ANALITICA_URL,
}

app.use(cors())
app.use(express.json())

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }))

// ── Auth: login (genera JWT) ───────────────────────────────
// En producción esto consultaría una BD de usuarios con bcrypt
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body

  // Usuarios demo hardcodeados — reemplazar con BD real
  const usuarios = {
    'admin@innovatech.com':    { id: 1, rol: 'ADMIN',      password: 'admin123' },
    'gestor@innovatech.com':   { id: 2, rol: 'GESTOR',     password: 'gestor123' },
    'colab@innovatech.com':    { id: 3, rol: 'COLABORADOR', password: 'colab123' },
  }

  const usuario = usuarios[email]
  if (!usuario || usuario.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  const token = jwt.sign(
    { id: usuario.id, email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token, rol: usuario.rol })
})

// ── Helper: proxy con circuit breaker ─────────────────────
const proxyRequest = (breakerKey, serviceUrl) => async (req, res) => {
  try {
    const url = `${serviceUrl}${req.originalUrl.replace(`/${breakerKey}`, '') || '/'}`
    const result = await breakers[breakerKey].fire({
      method:  req.method,
      url,
      data:    req.body,
      headers: { 'Content-Type': 'application/json' },
    })
    res.json(result)
  } catch (err) {
    if (err.code === 'EOPENBREAKER') {
      return res.status(503).json({
        error: `Servicio ${breakerKey} temporalmente no disponible (circuit breaker abierto)`,
      })
    }
    res.status(502).json({ error: `Error en ${breakerKey}: ${err.message}` })
  }
}

// ── Rutas protegidas con JWT ───────────────────────────────
app.use('/proyectos', verifyToken, proxyRequest('proyectos', SERVICES.proyectos))
app.use('/recursos',  verifyToken, proxyRequest('recursos',  SERVICES.recursos))
app.use('/analitica', verifyToken, proxyRequest('analitica', SERVICES.analitica))

// ── 404 fallback ───────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

app.listen(PORT, () => {
  console.log(`✅ API Gateway corriendo en http://localhost:${PORT}`)
  console.log(`   Rutas disponibles:`)
  console.log(`   POST /auth/login`)
  console.log(`   /proyectos  → ${SERVICES.proyectos}`)
  console.log(`   /recursos   → ${SERVICES.recursos}`)
  console.log(`   /analitica  → ${SERVICES.analitica}`)
})
