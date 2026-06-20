const express = require('express')
const router = express.Router()
const { proyectoRepository, tareaRepository } = require('./repository')

// ── Proyectos ──────────────────────────────────────────────

// GET /proyectos
router.get('/', async (req, res) => {
  try {
    const proyectos = await proyectoRepository.findAll()
    res.json(proyectos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /proyectos/:id/analitica
router.get('/:id/analitica', async (req, res) => {
  try {
    const proyecto = await proyectoRepository.findByIdWithAnalytics(req.params.id)
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const tareas = proyecto.tareas
    const completadas  = tareas.filter(t => t.estado === 'COMPLETADO').length
    const enProceso    = tareas.filter(t => t.estado === 'EN_PROCESO').length
    const horasTotales = tareas.reduce((s, t) => s + (t.horasReal || 0), 0)
    const incidencias  = proyecto.metricas.reduce((s, m) => s + m.incidencias, 0)

    const riesgosAltos  = proyecto.riesgos.filter(r => r.nivel === 'ALTO'  && !r.mitigado).length
    const riesgosMedios = proyecto.riesgos.filter(r => r.nivel === 'MEDIO' && !r.mitigado).length
    const pctAvance     = tareas.length > 0 ? Math.round((completadas / tareas.length) * 100) : 0
    const pctPresupuesto = proyecto.presupuesto ? Math.round((proyecto.costoActual / proyecto.presupuesto) * 100) : 0

    // Health score: empieza en 100, resta por riesgos y retraso de presupuesto
    const saludScore = Math.max(0, 100 - (riesgosAltos * 12) - (riesgosMedios * 5) - Math.max(0, pctPresupuesto - pctAvance) * 0.5)

    res.json({
      proyecto,
      kpis: {
        totalTareas:     tareas.length,
        completadas,
        enProceso,
        pctAvance,
        presupuesto:     proyecto.presupuesto || 0,
        costoActual:     proyecto.costoActual || 0,
        pctPresupuesto,
        incidenciasTotal: incidencias,
        horasTotales,
        saludScore:      Math.round(saludScore),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /proyectos/:id
router.get('/:id', async (req, res) => {
  try {
    const proyecto = await proyectoRepository.findById(req.params.id)
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })
    res.json(proyecto)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /proyectos
router.post('/', async (req, res) => {
  try {
    const proyecto = await proyectoRepository.create(req.body)
    res.status(201).json(proyecto)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /proyectos/:id
router.put('/:id', async (req, res) => {
  try {
    const proyecto = await proyectoRepository.update(req.params.id, req.body)
    res.json(proyecto)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /proyectos/:id
router.delete('/:id', async (req, res) => {
  try {
    await proyectoRepository.delete(req.params.id)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Tareas ─────────────────────────────────────────────────

// GET /proyectos/:id/tareas
router.get('/:id/tareas', async (req, res) => {
  try {
    const tareas = await tareaRepository.findByProyecto(req.params.id)
    res.json(tareas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /proyectos/:id/tareas
router.post('/:id/tareas', async (req, res) => {
  try {
    const tarea = await tareaRepository.create({
      ...req.body,
      proyectoId: Number(req.params.id),
    })
    res.status(201).json(tarea)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
