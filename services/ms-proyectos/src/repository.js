const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Repository Pattern: toda la lógica de BD está acá
// aislada del resto de la aplicación

const proyectoRepository = {
  findAll: () => prisma.proyecto.findMany({ include: { tareas: true } }),

  findById: (id) =>
    prisma.proyecto.findUnique({ where: { id: Number(id) }, include: { tareas: true } }),

  findByIdWithAnalytics: (id) =>
    prisma.proyecto.findUnique({
      where: { id: Number(id) },
      include: {
        tareas:   true,
        metricas: { orderBy: { periodo: 'asc' } },
        hitos:    { orderBy: { fechaPlan: 'asc' } },
        riesgos:  true,
      },
    }),

  create: (data) => prisma.proyecto.create({ data }),

  update: (id, data) =>
    prisma.proyecto.update({ where: { id: Number(id) }, data }),

  delete: (id) => prisma.proyecto.delete({ where: { id: Number(id) } }),
}

const tareaRepository = {
  findByProyecto: (proyectoId) =>
    prisma.tarea.findMany({ where: { proyectoId: Number(proyectoId) } }),

  create: (data) => prisma.tarea.create({ data }),

  update: (id, data) =>
    prisma.tarea.update({ where: { id: Number(id) }, data }),

  delete: (id) => prisma.tarea.delete({ where: { id: Number(id) } }),
}

module.exports = { proyectoRepository, tareaRepository }
