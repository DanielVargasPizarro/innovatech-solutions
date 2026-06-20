require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3003

const MS_PROYECTOS = process.env.MS_PROYECTOS_URL
const MS_RECURSOS = process.env.MS_RECURSOS_URL

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ms-analitica' }))

// GET /kpis — calcula KPIs en tiempo real consultando los otros microservicios
app.get('/kpis', async (req, res) => {
  try {
    const [proyectosRes, recursosRes] = await Promise.all([
      axios.get(`${MS_PROYECTOS}/proyectos`),
      axios.get(`${MS_RECURSOS}/empleados`),
    ])

    const proyectos = proyectosRes.data
    const empleados = recursosRes.data

    const totalProyectos = proyectos.length
    const proyectosActivos = proyectos.filter((p) => p.estado === 'EN_PROCESO').length
    const tareasCompletadas = proyectos
      .flatMap((p) => p.tareas || [])
      .filter((t) => t.estado === 'COMPLETADO').length
    const empleadosAsignados = empleados.filter((e) => !e.disponible).length
    const tasaUtilizacion =
      empleados.length > 0 ? (empleadosAsignados / empleados.length) * 100 : 0

    const kpi = {
      totalProyectos,
      proyectosActivos,
      tareasCompletadas,
      totalEmpleados: empleados.length,
      empleadosAsignados,
      tasaUtilizacion: Math.round(tasaUtilizacion * 100) / 100,
    }

    // Guarda snapshot en la BD de analítica
    await prisma.kpiSnapshot.create({
      data: {
        totalProyectos,
        proyectosActivos,
        tareasCompletadas,
        tasaUtilizacion,
      },
    })

    res.json(kpi)
  } catch (err) {
    res.status(500).json({ error: 'Error calculando KPIs: ' + err.message })
  }
})

// GET /kpis/historial — historial de snapshots
app.get('/kpis/historial', async (req, res) => {
  try {
    const historial = await prisma.kpiSnapshot.findMany({
      orderBy: { fecha: 'desc' },
      take: 30,
    })
    res.json(historial)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`✅ ms-analitica corriendo en http://localhost:${PORT}`)
})
