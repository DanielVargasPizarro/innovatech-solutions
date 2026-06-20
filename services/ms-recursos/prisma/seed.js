const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Limpiar y reiniciar secuencias para IDs predecibles
  await prisma.asignacion.deleteMany()
  await prisma.empleado.deleteMany()
  await prisma.$executeRaw`ALTER SEQUENCE "Empleado_id_seq" RESTART WITH 1`

  // ── Empleados ─────────────────────────────────────────────
  // IDs de empleados coinciden con los responsableId del seed de proyectos
  const empleados = await Promise.all([
    prisma.empleado.create({ data: { nombre: 'Ana Torres',      email: 'a.torres@innovatech.com',    cargo: 'Product Manager',          habilidades: ['Agile', 'Scrum', 'Jira', 'Stakeholder Management'], disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Carlos Reyes',    email: 'c.reyes@innovatech.com',     cargo: 'Arquitecto de Software',    habilidades: ['Node.js', 'Microservicios', 'Docker', 'PostgreSQL'], disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Lucía Méndez',    email: 'l.mendez@innovatech.com',    cargo: 'Desarrolladora Backend',    habilidades: ['Python', 'Django', 'REST APIs', 'AWS'],              disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Rodrigo Vega',    email: 'r.vega@innovatech.com',      cargo: 'Desarrollador Fullstack',   habilidades: ['React', 'Node.js', 'TypeScript', 'MongoDB'],         disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Fernanda López',  email: 'f.lopez@innovatech.com',     cargo: 'DevOps Engineer',           habilidades: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],            disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Diego Castillo',  email: 'd.castillo@innovatech.com',  cargo: 'Diseñador UX/UI',           habilidades: ['Figma', 'Adobe XD', 'React Native', 'Prototyping'],  disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Valentina Cruz',  email: 'v.cruz@innovatech.com',      cargo: 'Ingeniera Cloud',           habilidades: ['AWS', 'GCP', 'Networking', 'Security'],              disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Matías Herrera',  email: 'm.herrera@innovatech.com',   cargo: 'Desarrollador Mobile',      habilidades: ['React Native', 'Swift', 'Kotlin', 'Firebase'],       disponible: false, horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Camila Rojas',    email: 'c.rojas@innovatech.com',     cargo: 'QA Engineer',               habilidades: ['Selenium', 'Cypress', 'Postman', 'TestRail'],        disponible: true,  horasSemana: 40 } }),
    prisma.empleado.create({ data: { nombre: 'Sebastián Muñoz', email: 's.munoz@innovatech.com',     cargo: 'Analista de Datos',         habilidades: ['SQL', 'Power BI', 'Python', 'ETL'],                  disponible: true,  horasSemana: 40 } }),
  ])

  const [ana, carlos, lucia, rodrigo, fernanda, diego, valentina, matias] = empleados
  const hoy = new Date('2026-06-19')

  // ── Asignaciones Proyecto 1: ERP Corporativo (proyectoId externo = 1) ──
  await prisma.asignacion.createMany({
    data: [
      { empleadoId: ana.id,      proyectoId: 1, horasAsig: 20, fechaInicio: new Date('2026-01-15'), fechaFin: new Date('2026-08-30') },
      { empleadoId: carlos.id,   proyectoId: 1, horasAsig: 30, fechaInicio: new Date('2026-01-15'), fechaFin: new Date('2026-08-30') },
      { empleadoId: lucia.id,    proyectoId: 1, horasAsig: 40, fechaInicio: new Date('2026-02-01'), fechaFin: new Date('2026-08-30') },
      { empleadoId: rodrigo.id,  proyectoId: 1, horasAsig: 35, fechaInicio: new Date('2026-02-01'), fechaFin: new Date('2026-08-30') },
      { empleadoId: fernanda.id, proyectoId: 1, horasAsig: 20, fechaInicio: new Date('2026-03-01'), fechaFin: new Date('2026-08-30') },
    ]
  })

  // ── Asignaciones Proyecto 2: Migración Cloud AWS (proyectoId externo = 2) ──
  await prisma.asignacion.createMany({
    data: [
      { empleadoId: valentina.id, proyectoId: 2, horasAsig: 40, fechaInicio: new Date('2026-02-01'), fechaFin: new Date('2026-07-31') },
      { empleadoId: fernanda.id,  proyectoId: 2, horasAsig: 20, fechaInicio: new Date('2026-02-01'), fechaFin: new Date('2026-07-31') },
      { empleadoId: lucia.id,     proyectoId: 2, horasAsig: 20, fechaInicio: new Date('2026-03-01'), fechaFin: new Date('2026-07-31') },
    ]
  })

  // ── Asignaciones Proyecto 3: App Mobile Clientes (proyectoId externo = 3) ──
  await prisma.asignacion.createMany({
    data: [
      { empleadoId: matias.id,  proyectoId: 3, horasAsig: 40, fechaInicio: new Date('2026-05-01'), fechaFin: new Date('2026-11-30') },
      { empleadoId: diego.id,   proyectoId: 3, horasAsig: 30, fechaInicio: new Date('2026-05-01'), fechaFin: new Date('2026-11-30') },
      { empleadoId: ana.id,     proyectoId: 3, horasAsig: 10, fechaInicio: new Date('2026-05-01'), fechaFin: new Date('2026-11-30') },
      { empleadoId: rodrigo.id, proyectoId: 3, horasAsig: 20, fechaInicio: new Date('2026-06-01'), fechaFin: new Date('2026-11-30') },
    ]
  })

  console.log('✅ Seed de recursos completado')
  console.log(`   - 10 empleados creados (8 asignados, 2 disponibles)`)
  console.log('   - Asignaciones: 5 al ERP, 3 al Cloud, 4 al Mobile')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
