const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.riesgo.deleteMany()
  await prisma.hito.deleteMany()
  await prisma.metricaMensual.deleteMany()
  await prisma.tarea.deleteMany()
  await prisma.proyecto.deleteMany()
  await prisma.$executeRaw`ALTER SEQUENCE "Proyecto_id_seq" RESTART WITH 1`
  await prisma.$executeRaw`ALTER SEQUENCE "Tarea_id_seq" RESTART WITH 1`

  // ── PROYECTO 1: ERP Corporativo ───────────────────────────
  const erp = await prisma.proyecto.create({
    data: {
      nombre:      'Sistema ERP Corporativo',
      descripcion: 'Modernización del sistema de gestión empresarial: RRHH, finanzas, inventario y operaciones.',
      estado:      'EN_PROCESO',
      fechaInicio: new Date('2026-01-15'),
      fechaFin:    new Date('2026-08-30'),
      presupuesto: 450000,
      costoActual: 322000,
      cliente:     'Corporación Apex S.A.',
    }
  })

  await prisma.tarea.createMany({ data: [
    { titulo: 'Análisis de requerimientos',     descripcion: 'Levantamiento con stakeholders',                  estado: 'COMPLETADO',  responsableId: 1, proyectoId: erp.id,   categoria: 'Análisis',    prioridad: 'ALTA',  horasEst: 80,  horasReal: 88  },
    { titulo: 'Diseño de arquitectura técnica', descripcion: 'Definición de capas y modelo de datos',           estado: 'COMPLETADO',  responsableId: 2, proyectoId: erp.id,   categoria: 'Arquitectura', prioridad: 'ALTA',  horasEst: 120, horasReal: 115 },
    { titulo: 'Desarrollo módulo RRHH',         descripcion: 'Implementación de gestión de empleados y nómina', estado: 'COMPLETADO',  responsableId: 3, proyectoId: erp.id,   categoria: 'Desarrollo',  prioridad: 'ALTA',  horasEst: 320, horasReal: 345 },
    { titulo: 'Desarrollo módulo Finanzas',     descripcion: 'Cuentas, presupuestos y reportes',                estado: 'EN_PROCESO',  responsableId: 4, proyectoId: erp.id,   categoria: 'Desarrollo',  prioridad: 'ALTA',  horasEst: 380, horasReal: 210 },
    { titulo: 'Desarrollo módulo Inventario',   descripcion: 'Control de stock y movimientos',                  estado: 'EN_PROCESO',  responsableId: 5, proyectoId: erp.id,   categoria: 'Desarrollo',  prioridad: 'MEDIA', horasEst: 290, horasReal: 120 },
    { titulo: 'Integración y pruebas QA',       descripcion: 'Testing de integración y UAT',                    estado: 'PENDIENTE',   responsableId: 6, proyectoId: erp.id,   categoria: 'QA',          prioridad: 'ALTA',  horasEst: 200, horasReal: 0   },
    { titulo: 'Capacitación de usuarios',       descripcion: 'Formación al equipo y documentación',             estado: 'PENDIENTE',   responsableId: 2, proyectoId: erp.id,   categoria: 'Formación',   prioridad: 'MEDIA', horasEst: 60,  horasReal: 0   },
  ]})

  await prisma.metricaMensual.createMany({ data: [
    { proyectoId: erp.id, periodo: '2026-01', tareasCompletadas: 1, horasRegistradas: 320,  incidencias: 0, costoMes: 45000 },
    { proyectoId: erp.id, periodo: '2026-02', tareasCompletadas: 2, horasRegistradas: 380,  incidencias: 1, costoMes: 52000 },
    { proyectoId: erp.id, periodo: '2026-03', tareasCompletadas: 4, horasRegistradas: 415,  incidencias: 2, costoMes: 58000 },
    { proyectoId: erp.id, periodo: '2026-04', tareasCompletadas: 3, horasRegistradas: 390,  incidencias: 1, costoMes: 55000 },
    { proyectoId: erp.id, periodo: '2026-05', tareasCompletadas: 5, horasRegistradas: 430,  incidencias: 3, costoMes: 63000 },
    { proyectoId: erp.id, periodo: '2026-06', tareasCompletadas: 2, horasRegistradas: 360,  incidencias: 2, costoMes: 49000 },
  ]})

  await prisma.hito.createMany({ data: [
    { proyectoId: erp.id, nombre: 'Kickoff y análisis completo',    fechaPlan: new Date('2026-02-15'), fechaReal: new Date('2026-02-18'), completado: true  },
    { proyectoId: erp.id, nombre: 'Módulo RRHH en producción',      fechaPlan: new Date('2026-04-30'), fechaReal: new Date('2026-05-07'), completado: true  },
    { proyectoId: erp.id, nombre: 'Módulo Finanzas en producción',  fechaPlan: new Date('2026-07-15'), fechaReal: null,                   completado: false },
    { proyectoId: erp.id, nombre: 'Go-live ERP completo',           fechaPlan: new Date('2026-08-30'), fechaReal: null,                   completado: false },
  ]})

  await prisma.riesgo.createMany({ data: [
    { proyectoId: erp.id, descripcion: 'Retraso en módulo financiero por complejidad regulatoria', nivel: 'ALTO',  mitigado: false },
    { proyectoId: erp.id, descripcion: 'Rotación de personal clave en equipo de desarrollo',       nivel: 'MEDIO', mitigado: false },
    { proyectoId: erp.id, descripcion: 'Integración con sistemas legacy del cliente',               nivel: 'ALTO',  mitigado: true  },
    { proyectoId: erp.id, descripcion: 'Retrasos en aprobación de requerimientos por el cliente',  nivel: 'BAJO',  mitigado: true  },
  ]})

  // ── PROYECTO 2: Migración Cloud AWS ───────────────────────
  const cloud = await prisma.proyecto.create({
    data: {
      nombre:      'Migración Cloud AWS',
      descripcion: 'Migración de infraestructura on-premise a AWS con alta disponibilidad y disaster recovery.',
      estado:      'EN_PROCESO',
      fechaInicio: new Date('2026-02-01'),
      fechaFin:    new Date('2026-07-31'),
      presupuesto: 180000,
      costoActual: 138000,
      cliente:     'Innovatech (Interno)',
    }
  })

  await prisma.tarea.createMany({ data: [
    { titulo: 'Auditoría de infraestructura actual', descripcion: 'Inventario de servidores y dependencias',      estado: 'COMPLETADO', responsableId: 7, proyectoId: cloud.id, categoria: 'Análisis',       prioridad: 'ALTA',  horasEst: 60,  horasReal: 65  },
    { titulo: 'Diseño de arquitectura cloud',        descripcion: 'VPCs, subnets, IAM y grupos de seguridad',    estado: 'COMPLETADO', responsableId: 7, proyectoId: cloud.id, categoria: 'Arquitectura',    prioridad: 'ALTA',  horasEst: 80,  horasReal: 75  },
    { titulo: 'Migración bases de datos',            descripcion: 'Exportación y migración a RDS',                estado: 'EN_PROCESO', responsableId: 8, proyectoId: cloud.id, categoria: 'Desarrollo',      prioridad: 'ALTA',  horasEst: 200, horasReal: 110 },
    { titulo: 'Migración de aplicaciones',           descripcion: 'Containerización y despliegue en ECS',         estado: 'EN_PROCESO', responsableId: 3, proyectoId: cloud.id, categoria: 'Desarrollo',      prioridad: 'ALTA',  horasEst: 240, horasReal: 95  },
    { titulo: 'Configuración CI/CD',                 descripcion: 'Pipelines con CodePipeline y CodeBuild',       estado: 'PENDIENTE',  responsableId: 5, proyectoId: cloud.id, categoria: 'DevOps',          prioridad: 'MEDIA', horasEst: 120, horasReal: 0   },
    { titulo: 'Pruebas de failover y recuperación',  descripcion: 'Simulación de fallos y alta disponibilidad',  estado: 'PENDIENTE',  responsableId: 7, proyectoId: cloud.id, categoria: 'QA',              prioridad: 'ALTA',  horasEst: 80,  horasReal: 0   },
  ]})

  await prisma.metricaMensual.createMany({ data: [
    { proyectoId: cloud.id, periodo: '2026-02', tareasCompletadas: 1, horasRegistradas: 240, incidencias: 0, costoMes: 28000 },
    { proyectoId: cloud.id, periodo: '2026-03', tareasCompletadas: 2, horasRegistradas: 310, incidencias: 1, costoMes: 38000 },
    { proyectoId: cloud.id, periodo: '2026-04', tareasCompletadas: 3, horasRegistradas: 350, incidencias: 2, costoMes: 45000 },
    { proyectoId: cloud.id, periodo: '2026-05', tareasCompletadas: 2, horasRegistradas: 290, incidencias: 1, costoMes: 32000 },
    { proyectoId: cloud.id, periodo: '2026-06', tareasCompletadas: 1, horasRegistradas: 270, incidencias: 3, costoMes: 27000 },
  ]})

  await prisma.hito.createMany({ data: [
    { proyectoId: cloud.id, nombre: 'Arquitectura cloud aprobada',      fechaPlan: new Date('2026-03-15'), fechaReal: new Date('2026-03-14'), completado: true  },
    { proyectoId: cloud.id, nombre: 'BD migradas a RDS sin pérdida',    fechaPlan: new Date('2026-05-31'), fechaReal: null,                   completado: false },
    { proyectoId: cloud.id, nombre: 'Todas las apps en contenedores',   fechaPlan: new Date('2026-06-30'), fechaReal: null,                   completado: false },
    { proyectoId: cloud.id, nombre: 'Cutover final a producción cloud',  fechaPlan: new Date('2026-07-31'), fechaReal: null,                   completado: false },
  ]})

  await prisma.riesgo.createMany({ data: [
    { proyectoId: cloud.id, descripcion: 'Pérdida de datos durante migración de BD',              nivel: 'ALTO',  mitigado: true  },
    { proyectoId: cloud.id, descripcion: 'Tiempo de inactividad durante cutover a producción',    nivel: 'ALTO',  mitigado: false },
    { proyectoId: cloud.id, descripcion: 'Costos de AWS superiores a lo presupuestado',           nivel: 'MEDIO', mitigado: false },
    { proyectoId: cloud.id, descripcion: 'Incompatibilidad de versiones en contenedores legacy',  nivel: 'MEDIO', mitigado: true  },
  ]})

  // ── PROYECTO 3: App Mobile Clientes ───────────────────────
  const mobile = await prisma.proyecto.create({
    data: {
      nombre:      'App Mobile Clientes',
      descripcion: 'App iOS y Android para autogestión de clientes: consultas, reclamos y seguimiento de pedidos.',
      estado:      'PENDIENTE',
      fechaInicio: new Date('2026-05-01'),
      fechaFin:    new Date('2026-11-30'),
      presupuesto: 95000,
      costoActual: 28000,
      cliente:     'StartupTech SpA',
    }
  })

  await prisma.tarea.createMany({ data: [
    { titulo: 'Research y benchmarking',        descripcion: 'Análisis de competidores y propuesta de valor',  estado: 'COMPLETADO', responsableId: 1, proyectoId: mobile.id, categoria: 'Análisis',    prioridad: 'MEDIA', horasEst: 40,  horasReal: 38  },
    { titulo: 'Diseño UX/UI',                   descripcion: 'Wireframes, prototipo y design system',          estado: 'EN_PROCESO', responsableId: 6, proyectoId: mobile.id, categoria: 'Diseño',      prioridad: 'ALTA',  horasEst: 120, horasReal: 65  },
    { titulo: 'Desarrollo backend API REST',    descripcion: 'Autenticación, pedidos y notificaciones push',   estado: 'PENDIENTE',  responsableId: 4, proyectoId: mobile.id, categoria: 'Desarrollo',  prioridad: 'ALTA',  horasEst: 200, horasReal: 0   },
    { titulo: 'Desarrollo app React Native',    descripcion: 'Pantallas, navegación y llamadas API',           estado: 'PENDIENTE',  responsableId: 8, proyectoId: mobile.id, categoria: 'Desarrollo',  prioridad: 'ALTA',  horasEst: 280, horasReal: 0   },
    { titulo: 'Testing en dispositivos reales', descripcion: 'QA en iOS y Android, pruebas de rendimiento',   estado: 'PENDIENTE',  responsableId: 6, proyectoId: mobile.id, categoria: 'QA',          prioridad: 'ALTA',  horasEst: 80,  horasReal: 0   },
    { titulo: 'Publicación App Store / Play',   descripcion: 'Proceso de revisión y publicación en tiendas',  estado: 'PENDIENTE',  responsableId: 1, proyectoId: mobile.id, categoria: 'Despliegue',  prioridad: 'MEDIA', horasEst: 20,  horasReal: 0   },
  ]})

  await prisma.metricaMensual.createMany({ data: [
    { proyectoId: mobile.id, periodo: '2026-05', tareasCompletadas: 1, horasRegistradas: 180, incidencias: 0, costoMes: 15000 },
    { proyectoId: mobile.id, periodo: '2026-06', tareasCompletadas: 1, horasRegistradas: 220, incidencias: 1, costoMes: 22000 },
  ]})

  await prisma.hito.createMany({ data: [
    { proyectoId: mobile.id, nombre: 'Design system aprobado por cliente',  fechaPlan: new Date('2026-06-30'), fechaReal: null, completado: false },
    { proyectoId: mobile.id, nombre: 'Backend API en ambiente de testing',  fechaPlan: new Date('2026-08-31'), fechaReal: null, completado: false },
    { proyectoId: mobile.id, nombre: 'Beta privada con usuarios piloto',    fechaPlan: new Date('2026-10-15'), fechaReal: null, completado: false },
    { proyectoId: mobile.id, nombre: 'Lanzamiento en App Store y Play',     fechaPlan: new Date('2026-11-30'), fechaReal: null, completado: false },
  ]})

  await prisma.riesgo.createMany({ data: [
    { proyectoId: mobile.id, descripcion: 'Rechazo de la app por políticas de App Store',            nivel: 'MEDIO', mitigado: false },
    { proyectoId: mobile.id, descripcion: 'Cambios de alcance por el cliente durante el desarrollo', nivel: 'ALTO',  mitigado: false },
    { proyectoId: mobile.id, descripcion: 'Problemas de rendimiento en dispositivos de gama baja',  nivel: 'BAJO',  mitigado: false },
  ]})

  // ── Proyectos complementarios ─────────────────────────────
  await prisma.proyecto.create({
    data: { nombre: 'Portal Web Innovatech', descripcion: 'Rediseño del portal corporativo.', estado: 'COMPLETADO', fechaInicio: new Date('2025-10-01'), fechaFin: new Date('2026-02-28'), presupuesto: 60000, costoActual: 58500, cliente: 'Innovatech (Interno)' }
  })
  await prisma.proyecto.create({
    data: { nombre: 'BI Dashboard Gerencial', descripcion: 'Panel de inteligencia de negocios para gerencia.', estado: 'PENDIENTE', fechaInicio: new Date('2026-07-01'), fechaFin: new Date('2026-12-31'), presupuesto: 75000, costoActual: 0, cliente: 'Innovatech (Interno)' }
  })

  console.log('✅ Seed completo con analytics')
  console.log(`   ERP       (id:${erp.id})   → 7 tareas, 6 métricas, 4 hitos, 4 riesgos`)
  console.log(`   Cloud AWS (id:${cloud.id})   → 6 tareas, 5 métricas, 4 hitos, 4 riesgos`)
  console.log(`   Mobile    (id:${mobile.id})   → 6 tareas, 2 métricas, 4 hitos, 3 riesgos`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
