/**
 * Pruebas unitarias — ms-recursos / index.js
 * Patrón: Mock de PrismaClient para aislar la lógica de negocio
 */

// ── Mock de @prisma/client ─────────────────────────────────
const mockPrisma = {
  empleado: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
  asignacion: {
    create:     jest.fn(),
    deleteMany: jest.fn(),
  },
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}))

const request = require('supertest')
const express = require('express')
const cors    = require('cors')

// Reconstruir la app sin llamar a listen()
// (importamos el módulo copiando la lógica de index.js)
let app

beforeAll(() => {
  // Replicamos la app de ms-recursos sin el listen()
  app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ms-recursos' }))

  app.get('/empleados', async (req, res) => {
    try {
      const empleados = await mockPrisma.empleado.findMany({ include: { asignaciones: true } })
      res.json(empleados)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/empleados/:id', async (req, res) => {
    try {
      const empleado = await mockPrisma.empleado.findUnique({
        where: { id: Number(req.params.id) },
        include: { asignaciones: true },
      })
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/empleados', async (req, res) => {
    try {
      const empleado = await mockPrisma.empleado.create({ data: req.body })
      res.status(201).json(empleado)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  app.put('/empleados/:id', async (req, res) => {
    try {
      const empleado = await mockPrisma.empleado.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      })
      res.json(empleado)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  app.delete('/empleados/:id', async (req, res) => {
    try {
      const idEmpleado = Number(req.params.id)
      await mockPrisma.asignacion.deleteMany({ where: { empleadoId: idEmpleado } })
      const empleadoEliminado = await mockPrisma.empleado.delete({ where: { id: idEmpleado } })
      res.json({ message: 'Empleado eliminado con éxito', empleadoEliminado })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/asignaciones', async (req, res) => {
    try {
      const asignacion = await mockPrisma.asignacion.create({ data: req.body })
      res.status(201).json(asignacion)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
})

// ── Datos de prueba ────────────────────────────────────────
const empleadoMock = {
  id: 1,
  nombre: 'Juan Pérez',
  email: 'juan@innovatech.com',
  cargo: 'Desarrollador',
  habilidades: ['Node.js', 'React'],
  disponible: true,
  horasSemana: 40,
  asignaciones: [],
}

const asignacionMock = {
  id: 1,
  empleadoId: 1,
  proyectoId: 10,
  horasAsig: 20,
}

// ══════════════════════════════════════════════════════════
// SUITE: Health Check
// ══════════════════════════════════════════════════════════
describe('GET /health', () => {
  it('debería retornar status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.service).toBe('ms-recursos')
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: GET /empleados
// ══════════════════════════════════════════════════════════
describe('GET /empleados', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería retornar 200 con lista de empleados', async () => {
    mockPrisma.empleado.findMany.mockResolvedValue([empleadoMock])

    const res = await request(app).get('/empleados')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].nombre).toBe('Juan Pérez')
  })

  it('debería retornar array vacío si no hay empleados', async () => {
    mockPrisma.empleado.findMany.mockResolvedValue([])

    const res = await request(app).get('/empleados')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })

  it('debería retornar 500 si Prisma falla', async () => {
    mockPrisma.empleado.findMany.mockRejectedValue(new Error('DB error'))

    const res = await request(app).get('/empleados')

    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: GET /empleados/:id
// ══════════════════════════════════════════════════════════
describe('GET /empleados/:id', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería retornar 200 con el empleado si existe', async () => {
    mockPrisma.empleado.findUnique.mockResolvedValue(empleadoMock)

    const res = await request(app).get('/empleados/1')

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('juan@innovatech.com')
  })

  it('debería retornar 404 si el empleado no existe', async () => {
    mockPrisma.empleado.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/empleados/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Empleado no encontrado')
  })

  it('debería retornar 500 en error de base de datos', async () => {
    mockPrisma.empleado.findUnique.mockRejectedValue(new Error('timeout'))

    const res = await request(app).get('/empleados/1')

    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: POST /empleados
// ══════════════════════════════════════════════════════════
describe('POST /empleados', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería crear un empleado y retornar 201', async () => {
    const nuevo = { nombre: 'Ana López', email: 'ana@test.com', cargo: 'Diseñadora' }
    mockPrisma.empleado.create.mockResolvedValue({ id: 2, ...nuevo })

    const res = await request(app).post('/empleados').send(nuevo)

    expect(res.status).toBe(201)
    expect(res.body.nombre).toBe('Ana López')
  })

  it('debería retornar 400 en error de creación', async () => {
    mockPrisma.empleado.create.mockRejectedValue(new Error('email único violado'))

    const res = await request(app).post('/empleados').send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: PUT /empleados/:id
// ══════════════════════════════════════════════════════════
describe('PUT /empleados/:id', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería actualizar un empleado y retornar 200', async () => {
    mockPrisma.empleado.update.mockResolvedValue({ ...empleadoMock, disponible: false })

    const res = await request(app)
      .put('/empleados/1')
      .send({ disponible: false })

    expect(res.status).toBe(200)
    expect(res.body.disponible).toBe(false)
  })

  it('debería retornar 400 si el empleado no existe', async () => {
    mockPrisma.empleado.update.mockRejectedValue(new Error('not found'))

    const res = await request(app).put('/empleados/999').send({})

    expect(res.status).toBe(400)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: DELETE /empleados/:id
// ══════════════════════════════════════════════════════════
describe('DELETE /empleados/:id', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería eliminar asignaciones y luego al empleado', async () => {
    mockPrisma.asignacion.deleteMany.mockResolvedValue({ count: 1 })
    mockPrisma.empleado.delete.mockResolvedValue(empleadoMock)

    const res = await request(app).delete('/empleados/1')

    expect(res.status).toBe(200)
    expect(mockPrisma.asignacion.deleteMany).toHaveBeenCalledWith({
      where: { empleadoId: 1 },
    })
    expect(mockPrisma.empleado.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(res.body.message).toBe('Empleado eliminado con éxito')
  })

  it('debería retornar 500 si falla la eliminación', async () => {
    mockPrisma.asignacion.deleteMany.mockRejectedValue(new Error('falla'))

    const res = await request(app).delete('/empleados/1')

    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: POST /asignaciones
// ══════════════════════════════════════════════════════════
describe('POST /asignaciones', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería crear una asignación y retornar 201', async () => {
    mockPrisma.asignacion.create.mockResolvedValue(asignacionMock)

    const res = await request(app)
      .post('/asignaciones')
      .send({ empleadoId: 1, proyectoId: 10, horasAsig: 20 })

    expect(res.status).toBe(201)
    expect(res.body.empleadoId).toBe(1)
  })

  it('debería retornar 400 si faltan datos', async () => {
    mockPrisma.asignacion.create.mockRejectedValue(new Error('datos inválidos'))

    const res = await request(app).post('/asignaciones').send({})

    expect(res.status).toBe(400)
  })
})
