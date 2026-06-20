/**
 * Pruebas unitarias — ms-proyectos / repository.js
 * Patrón: Mock de PrismaClient para aislar la lógica de negocio
 */

// ── Mock de @prisma/client ─────────────────────────────────
const mockPrisma = {
  proyecto: {
    findMany:  jest.fn(),
    findUnique: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
  tarea: {
    findMany: jest.fn(),
    create:   jest.fn(),
    update:   jest.fn(),
    delete:   jest.fn(),
  },
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}))

const { proyectoRepository, tareaRepository } = require('../repository')

// ── Datos de prueba ────────────────────────────────────────
const proyectoMock = {
  id: 1,
  nombre: 'Proyecto Alpha',
  descripcion: 'Descripción de prueba',
  estado: 'EN_PROCESO',
  tareas: [],
  fechaInicio: new Date('2024-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const tareaMock = {
  id: 1,
  titulo: 'Tarea de prueba',
  descripcion: 'Desc tarea',
  estado: 'PENDIENTE',
  proyectoId: 1,
  responsableId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ══════════════════════════════════════════════════════════
// SUITE: proyectoRepository
// ══════════════════════════════════════════════════════════
describe('proyectoRepository', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── findAll ──────────────────────────────────────────────
  describe('findAll()', () => {
    it('debería retornar una lista de proyectos con sus tareas', async () => {
      mockPrisma.proyecto.findMany.mockResolvedValue([proyectoMock])

      const resultado = await proyectoRepository.findAll()

      expect(mockPrisma.proyecto.findMany).toHaveBeenCalledWith({
        include: { tareas: true },
      })
      expect(resultado).toEqual([proyectoMock])
      expect(resultado).toHaveLength(1)
    })

    it('debería retornar un array vacío cuando no hay proyectos', async () => {
      mockPrisma.proyecto.findMany.mockResolvedValue([])

      const resultado = await proyectoRepository.findAll()

      expect(resultado).toEqual([])
    })

    it('debería lanzar un error si Prisma falla', async () => {
      mockPrisma.proyecto.findMany.mockRejectedValue(new Error('DB error'))

      await expect(proyectoRepository.findAll()).rejects.toThrow('DB error')
    })
  })

  // ── findById ─────────────────────────────────────────────
  describe('findById()', () => {
    it('debería retornar un proyecto por ID', async () => {
      mockPrisma.proyecto.findUnique.mockResolvedValue(proyectoMock)

      const resultado = await proyectoRepository.findById('1')

      expect(mockPrisma.proyecto.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { tareas: true },
      })
      expect(resultado).toEqual(proyectoMock)
    })

    it('debería retornar null si el proyecto no existe', async () => {
      mockPrisma.proyecto.findUnique.mockResolvedValue(null)

      const resultado = await proyectoRepository.findById('999')

      expect(resultado).toBeNull()
    })

    it('debería convertir el id de string a número', async () => {
      mockPrisma.proyecto.findUnique.mockResolvedValue(proyectoMock)

      await proyectoRepository.findById('5')

      expect(mockPrisma.proyecto.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 5 } })
      )
    })
  })

  // ── create ───────────────────────────────────────────────
  describe('create()', () => {
    it('debería crear un proyecto con los datos recibidos', async () => {
      const datos = { nombre: 'Nuevo proyecto', estado: 'PENDIENTE' }
      mockPrisma.proyecto.create.mockResolvedValue({ id: 2, ...datos, tareas: [] })

      const resultado = await proyectoRepository.create(datos)

      expect(mockPrisma.proyecto.create).toHaveBeenCalledWith({ data: datos })
      expect(resultado.nombre).toBe('Nuevo proyecto')
    })

    it('debería lanzar un error si la creación falla por datos inválidos', async () => {
      mockPrisma.proyecto.create.mockRejectedValue(new Error('Violación de constraint'))

      await expect(proyectoRepository.create({})).rejects.toThrow('Violación de constraint')
    })
  })

  // ── update ───────────────────────────────────────────────
  describe('update()', () => {
    it('debería actualizar un proyecto y retornar el proyecto actualizado', async () => {
      const datos = { nombre: 'Proyecto Actualizado', estado: 'COMPLETADO' }
      mockPrisma.proyecto.update.mockResolvedValue({ ...proyectoMock, ...datos })

      const resultado = await proyectoRepository.update('1', datos)

      expect(mockPrisma.proyecto.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: datos,
      })
      expect(resultado.nombre).toBe('Proyecto Actualizado')
      expect(resultado.estado).toBe('COMPLETADO')
    })

    it('debería lanzar error si el proyecto a actualizar no existe', async () => {
      mockPrisma.proyecto.update.mockRejectedValue(new Error('Record not found'))

      await expect(proyectoRepository.update('999', {})).rejects.toThrow('Record not found')
    })
  })

  // ── delete ───────────────────────────────────────────────
  describe('delete()', () => {
    it('debería eliminar un proyecto por ID', async () => {
      mockPrisma.proyecto.delete.mockResolvedValue(proyectoMock)

      await proyectoRepository.delete('1')

      expect(mockPrisma.proyecto.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('debería lanzar error si el proyecto no existe al intentar eliminar', async () => {
      mockPrisma.proyecto.delete.mockRejectedValue(new Error('Record not found'))

      await expect(proyectoRepository.delete('999')).rejects.toThrow('Record not found')
    })
  })
})

// ══════════════════════════════════════════════════════════
// SUITE: tareaRepository
// ══════════════════════════════════════════════════════════
describe('tareaRepository', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── findByProyecto ───────────────────────────────────────
  describe('findByProyecto()', () => {
    it('debería retornar las tareas de un proyecto específico', async () => {
      mockPrisma.tarea.findMany.mockResolvedValue([tareaMock])

      const resultado = await tareaRepository.findByProyecto('1')

      expect(mockPrisma.tarea.findMany).toHaveBeenCalledWith({
        where: { proyectoId: 1 },
      })
      expect(resultado).toEqual([tareaMock])
    })

    it('debería retornar array vacío si el proyecto no tiene tareas', async () => {
      mockPrisma.tarea.findMany.mockResolvedValue([])

      const resultado = await tareaRepository.findByProyecto('1')

      expect(resultado).toEqual([])
    })
  })

  // ── create ───────────────────────────────────────────────
  describe('create()', () => {
    it('debería crear una tarea asociada a un proyecto', async () => {
      const datos = { titulo: 'Nueva Tarea', proyectoId: 1, estado: 'PENDIENTE' }
      mockPrisma.tarea.create.mockResolvedValue({ id: 1, ...datos })

      const resultado = await tareaRepository.create(datos)

      expect(mockPrisma.tarea.create).toHaveBeenCalledWith({ data: datos })
      expect(resultado.titulo).toBe('Nueva Tarea')
    })

    it('debería lanzar error si faltan datos obligatorios', async () => {
      mockPrisma.tarea.create.mockRejectedValue(new Error('titulo es requerido'))

      await expect(tareaRepository.create({})).rejects.toThrow('titulo es requerido')
    })
  })

  // ── update ───────────────────────────────────────────────
  describe('update()', () => {
    it('debería actualizar una tarea existente', async () => {
      const datos = { estado: 'COMPLETADO' }
      mockPrisma.tarea.update.mockResolvedValue({ ...tareaMock, ...datos })

      const resultado = await tareaRepository.update('1', datos)

      expect(mockPrisma.tarea.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: datos,
      })
      expect(resultado.estado).toBe('COMPLETADO')
    })
  })

  // ── delete ───────────────────────────────────────────────
  describe('delete()', () => {
    it('debería eliminar una tarea por ID', async () => {
      mockPrisma.tarea.delete.mockResolvedValue(tareaMock)

      await tareaRepository.delete('1')

      expect(mockPrisma.tarea.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })
  })
})
