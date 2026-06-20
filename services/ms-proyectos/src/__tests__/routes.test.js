/**
 * Pruebas unitarias — ms-proyectos / routes.js
 * Patrón: Mock del repository para aislar la capa HTTP
 */

// ── Mocks ──────────────────────────────────────────────────
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    proyecto: {},
    tarea: {},
  })),
}))

jest.mock('../repository', () => ({
  proyectoRepository: {
    findAll:  jest.fn(),
    findById: jest.fn(),
    create:   jest.fn(),
    update:   jest.fn(),
    delete:   jest.fn(),
  },
  tareaRepository: {
    findByProyecto: jest.fn(),
    create:         jest.fn(),
  },
}))

const request  = require('supertest')
const express  = require('express')
const router   = require('../routes')
const { proyectoRepository, tareaRepository } = require('../repository')

// ── App de prueba ──────────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/proyectos', router)

// ── Datos de prueba ────────────────────────────────────────
const proyectoMock = {
  id: 1,
  nombre: 'Proyecto Test',
  descripcion: 'Desc',
  estado: 'EN_PROCESO',
  tareas: [],
}

const tareaMock = {
  id: 10,
  titulo: 'Tarea Test',
  estado: 'PENDIENTE',
  proyectoId: 1,
}

// ══════════════════════════════════════════════════════════
// SUITE: GET /proyectos
// ══════════════════════════════════════════════════════════
describe('GET /proyectos', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería retornar 200 con lista de proyectos', async () => {
    proyectoRepository.findAll.mockResolvedValue([proyectoMock])

    const res = await request(app).get('/proyectos')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].nombre).toBe('Proyecto Test')
  })

  it('debería retornar 500 si el repository falla', async () => {
    proyectoRepository.findAll.mockRejectedValue(new Error('DB caída'))

    const res = await request(app).get('/proyectos')

    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('error')
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: GET /proyectos/:id
// ══════════════════════════════════════════════════════════
describe('GET /proyectos/:id', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería retornar 200 con el proyecto si existe', async () => {
    proyectoRepository.findById.mockResolvedValue(proyectoMock)

    const res = await request(app).get('/proyectos/1')

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
  })

  it('debería retornar 404 si el proyecto no existe', async () => {
    proyectoRepository.findById.mockResolvedValue(null)

    const res = await request(app).get('/proyectos/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Proyecto no encontrado')
  })

  it('debería retornar 500 en error de base de datos', async () => {
    proyectoRepository.findById.mockRejectedValue(new Error('timeout'))

    const res = await request(app).get('/proyectos/1')

    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: POST /proyectos
// ══════════════════════════════════════════════════════════
describe('POST /proyectos', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería crear un proyecto y retornar 201', async () => {
    const nuevo = { nombre: 'Nuevo', descripcion: 'Test', estado: 'PENDIENTE' }
    proyectoRepository.create.mockResolvedValue({ id: 2, ...nuevo })

    const res = await request(app)
      .post('/proyectos')
      .send(nuevo)

    expect(res.status).toBe(201)
    expect(res.body.nombre).toBe('Nuevo')
  })

  it('debería retornar 400 si la creación falla por datos inválidos', async () => {
    proyectoRepository.create.mockRejectedValue(new Error('nombre requerido'))

    const res = await request(app).post('/proyectos').send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: PUT /proyectos/:id
// ══════════════════════════════════════════════════════════
describe('PUT /proyectos/:id', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería actualizar y retornar 200 con el proyecto actualizado', async () => {
    const actualizado = { ...proyectoMock, nombre: 'Actualizado', estado: 'COMPLETADO' }
    proyectoRepository.update.mockResolvedValue(actualizado)

    const res = await request(app)
      .put('/proyectos/1')
      .send({ nombre: 'Actualizado', estado: 'COMPLETADO' })

    expect(res.status).toBe(200)
    expect(res.body.nombre).toBe('Actualizado')
  })

  it('debería retornar 400 si el proyecto no existe', async () => {
    proyectoRepository.update.mockRejectedValue(new Error('not found'))

    const res = await request(app)
      .put('/proyectos/999')
      .send({ nombre: 'X' })

    expect(res.status).toBe(400)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: DELETE /proyectos/:id
// ══════════════════════════════════════════════════════════
describe('DELETE /proyectos/:id', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería eliminar un proyecto y retornar 204', async () => {
    proyectoRepository.delete.mockResolvedValue(undefined)

    const res = await request(app).delete('/proyectos/1')

    expect(res.status).toBe(204)
  })

  it('debería retornar 400 si el proyecto no existe', async () => {
    proyectoRepository.delete.mockRejectedValue(new Error('not found'))

    const res = await request(app).delete('/proyectos/999')

    expect(res.status).toBe(400)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: GET /proyectos/:id/tareas
// ══════════════════════════════════════════════════════════
describe('GET /proyectos/:id/tareas', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería retornar las tareas de un proyecto', async () => {
    tareaRepository.findByProyecto.mockResolvedValue([tareaMock])

    const res = await request(app).get('/proyectos/1/tareas')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].titulo).toBe('Tarea Test')
  })

  it('debería retornar 500 si falla el repository de tareas', async () => {
    tareaRepository.findByProyecto.mockRejectedValue(new Error('error'))

    const res = await request(app).get('/proyectos/1/tareas')

    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: POST /proyectos/:id/tareas
// ══════════════════════════════════════════════════════════
describe('POST /proyectos/:id/tareas', () => {

  beforeEach(() => jest.clearAllMocks())

  it('debería crear una tarea y retornar 201', async () => {
    tareaRepository.create.mockResolvedValue({ id: 1, titulo: 'Nueva', proyectoId: 1 })

    const res = await request(app)
      .post('/proyectos/1/tareas')
      .send({ titulo: 'Nueva', estado: 'PENDIENTE' })

    expect(res.status).toBe(201)
    expect(res.body.titulo).toBe('Nueva')
  })

  it('debería agregar el proyectoId automáticamente desde el param', async () => {
    tareaRepository.create.mockResolvedValue({ id: 2, proyectoId: 5 })

    await request(app)
      .post('/proyectos/5/tareas')
      .send({ titulo: 'Tarea' })

    expect(tareaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ proyectoId: 5 })
    )
  })

  it('debería retornar 400 si falla la creación de tarea', async () => {
    tareaRepository.create.mockRejectedValue(new Error('error'))

    const res = await request(app)
      .post('/proyectos/1/tareas')
      .send({})

    expect(res.status).toBe(400)
  })
})
