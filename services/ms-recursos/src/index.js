require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ms-recursos' }))

// GET /empleados
app.get('/empleados', async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany({ include: { asignaciones: true } })
    res.json(empleados)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /empleados/:id
app.get('/empleados/:id', async (req, res) => {
  try {
    const empleado = await prisma.empleado.findUnique({
      where: { id: Number(req.params.id) },
      include: { asignaciones: true },
    })
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
    res.json(empleado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /empleados
app.post('/empleados', async (req, res) => {
  try {
    const empleado = await prisma.empleado.create({ data: req.body })
    res.status(201).json(empleado)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /empleados/:id
app.put('/empleados/:id', async (req, res) => {
  try {
    const empleado = await prisma.empleado.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    })
    res.json(empleado)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ==========================================
// 🔥 NUEVA RUTA: DELETE /empleados/:id 🔥
// ==========================================
app.delete('/empleados/:id', async (req, res) => {
  try {
    const idEmpleado = Number(req.params.id)

    // Opcional pero recomendado: Eliminar primero las asignaciones ligadas a este empleado
    // para evitar fallos de llaves foráneas (integredad referencial) en PostgreSQL
    await prisma.asignacion.deleteMany({
      where: { empleadoId: idEmpleado }
    })

    // Ahora sí eliminamos al empleado con seguridad
    const empleadoEliminado = await prisma.empleado.delete({
      where: { id: idEmpleado },
    })

    res.json({ message: 'Empleado eliminado con éxito', empleadoEliminado })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /asignaciones
app.post('/asignaciones', async (req, res) => {
  try {
    const asignacion = await prisma.asignacion.create({ data: req.body })
    res.status(201).json(asignacion)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`✅ ms-recursos corriendo en http://localhost:${PORT}`)
})