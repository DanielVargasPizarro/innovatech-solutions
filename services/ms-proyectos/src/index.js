require('dotenv').config()
const express = require('express')
const cors = require('cors')
const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ms-proyectos' }))

// Rutas
app.use('/proyectos', routes)

app.listen(PORT, () => {
  console.log(`✅ ms-proyectos corriendo en http://localhost:${PORT}`)
})
