import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function ProyectoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get(`/proyectos/proyectos/${id}/analitica`)
      .then(({ data }) => { setData(data); setError('') })
      .catch(() => setError('No se pudo cargar el análisis del proyecto'))
      .finally(() => setLoading(false))
  }, [id])

  const logout = () => { localStorage.clear(); navigate('/login') }

  if (loading) return <Shell logout={logout}><p style={{ color: '#64748b', padding: '2rem' }}>Cargando análisis...</p></Shell>
  if (error)   return <Shell logout={logout}><p style={{ color: '#ef4444', padding: '2rem' }}>⚠️ {error}</p></Shell>

  const { proyecto, kpis } = data
  const tareas   = proyecto.tareas   || []
  const metricas = proyecto.metricas || []
  const hitos    = proyecto.hitos    || []
  const riesgos  = proyecto.riesgos  || []

  // Distribuciones
  const porCategoria = groupBy(tareas, 'categoria')
  const porPrioridad = groupBy(tareas, 'prioridad')

  const estadoColors = { EN_PROCESO: '#3b82f6', PENDIENTE: '#f59e0b', COMPLETADO: '#10b981', CANCELADO: '#ef4444' }

  return (
    <Shell logout={logout}>
      {/* Header del proyecto */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/proyectos" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.85rem' }}>← Volver a Proyectos</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, color: '#1a1a2e', fontSize: '1.5rem' }}>{proyecto.nombre}</h1>
          <span style={{ background: estadoColors[proyecto.estado] + '22', color: estadoColors[proyecto.estado], padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem' }}>
            {proyecto.estado.replace('_', ' ')}
          </span>
        </div>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          {proyecto.cliente && <><strong>Cliente:</strong> {proyecto.cliente} &nbsp;·&nbsp;</>}
          {proyecto.fechaInicio && <><strong>Inicio:</strong> {fmt(proyecto.fechaInicio)} &nbsp;·&nbsp;</>}
          {proyecto.fechaFin    && <><strong>Cierre:</strong> {fmt(proyecto.fechaFin)}</>}
        </p>
      </div>

      {/* Fila 1: 4 gráficos grandes */}
      <div style={s.row}>
        <ChartCard title="TAREAS COMPLETADAS POR MES">
          <BarChart
            data={metricas.map(m => ({ label: m.periodo.slice(5), value: m.tareasCompletadas }))}
            color="#2563eb"
            showGrowth
          />
        </ChartCard>

        <ChartCard title="DISTRIBUCIÓN DE CATEGORÍAS">
          <DonutChart
            data={Object.entries(porCategoria).map(([k, v]) => ({ label: k || 'Sin categoría', value: v }))}
            colors={['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']}
            centerLabel="Total"
            centerValue={tareas.length}
          />
        </ChartCard>

        <ChartCard title={`COSTO DEL PROYECTO (€)`}>
          <CostChart metricas={metricas} presupuesto={proyecto.presupuesto} />
        </ChartCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ChartCard title="PRIORIDAD DE TAREAS" compact>
            <DonutChart
              data={Object.entries(porPrioridad).map(([k, v]) => ({ label: k || '—', value: v }))}
              colors={['#ef4444', '#f59e0b', '#10b981']}
              centerLabel={null}
              size={120}
            />
          </ChartCard>
          <ChartCard title="RIESGOS ACTIVOS" compact>
            <RiesgoResumen riesgos={riesgos} />
          </ChartCard>
        </div>
      </div>

      {/* Fila 2: 5 gráficos más pequeños */}
      <div style={s.row}>
        <ChartCard title="ESTADO DE TAREAS">
          <DonutChart
            data={[
              { label: 'Completado', value: tareas.filter(t => t.estado === 'COMPLETADO').length },
              { label: 'En Proceso', value: tareas.filter(t => t.estado === 'EN_PROCESO').length },
              { label: 'Pendiente',  value: tareas.filter(t => t.estado === 'PENDIENTE').length },
            ].filter(d => d.value > 0)}
            colors={['#10b981', '#3b82f6', '#f59e0b']}
            centerLabel={`${kpis.pctAvance}%`}
            centerValue="avance"
            size={150}
          />
        </ChartCard>

        <ChartCard title="HORAS REGISTRADAS POR MES">
          <BarChart
            data={metricas.map(m => ({ label: m.periodo.slice(5), value: m.horasRegistradas }))}
            color="#8b5cf6"
            unit="h"
          />
        </ChartCard>

        <ChartCard title="HITOS DEL PROYECTO">
          <HitosList hitos={hitos} />
        </ChartCard>

        <ChartCard title="INCIDENCIAS POR MES">
          <BarChart
            data={metricas.map(m => ({ label: m.periodo.slice(5), value: m.incidencias }))}
            color="#ef4444"
            showGrowth
          />
        </ChartCard>

        <ChartCard title="ÍNDICE DE SALUD">
          <SaludScore kpis={kpis} />
        </ChartCard>
      </div>
    </Shell>
  )
}

// ── Shell con Sidebar ─────────────────────────────────────────

function Shell({ children, logout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={s.sidebar}>
        <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Innovatech</h2>
        <Link style={s.navLink} to="/">📊 Dashboard</Link>
        <Link style={s.navLink} to="/proyectos">📁 Proyectos</Link>
        <Link style={s.navLink} to="/recursos">👥 Recursos</Link>
        <button style={s.logoutBtn} onClick={logout}>Cerrar sesión</button>
      </nav>
      <main style={{ flex: 1, padding: '2rem', background: '#0f172a', minHeight: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

// ── Chart Card wrapper ────────────────────────────────────────

function ChartCard({ title, children, compact }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '10px', padding: compact ? '1rem' : '1.25rem', flex: 1, minWidth: 0 }}>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        ● {title}
      </p>
      {children}
    </div>
  )
}

// ── Bar Chart (SVG) ───────────────────────────────────────────

function BarChart({ data, color, unit = '', showGrowth }) {
  if (!data.length) return <p style={{ color: '#475569', fontSize: '0.85rem' }}>Sin datos</p>
  const max = Math.max(...data.map(d => d.value), 1)
  const H = 120, W = 260, barW = Math.min(32, (W / data.length) - 8)

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" style={{ display: 'block' }}>
      {data.map((d, i) => {
        const x = (W / data.length) * i + (W / data.length - barW) / 2
        const bh = max > 0 ? (d.value / max) * H : 0
        const y = H - bh
        const prev = data[i - 1]
        const growth = prev && prev.value > 0 ? Math.round(((d.value - prev.value) / prev.value) * 100) : null
        return (
          <g key={i}>
            <rect x={x} y={H} width={barW} height={0} fill={color} rx="3" style={{ animation: 'none' }}>
              <animate attributeName="y" from={H} to={y} dur="0.6s" fill="freeze" />
              <animate attributeName="height" from="0" to={bh} dur="0.6s" fill="freeze" />
            </rect>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
              {d.value}{unit}
            </text>
            {showGrowth && growth !== null && growth !== 0 && (
              <text x={x + barW / 2} y={y - 16} textAnchor="middle" fill={growth > 0 ? '#10b981' : '#ef4444'} fontSize="9" fontWeight="600">
                {growth > 0 ? '+' : ''}{growth}%
              </text>
            )}
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="#64748b" fontSize="10">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Donut Chart (SVG) ─────────────────────────────────────────

function DonutChart({ data, colors, centerLabel, centerValue, size = 170 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return <p style={{ color: '#475569', fontSize: '0.85rem' }}>Sin datos</p>
  const r = size / 2 - 20, cx = size / 2, cy = size / 2, stroke = 28

  let cumAngle = -90
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360
    const startA = cumAngle
    cumAngle += angle
    const endA = cumAngle
    const s = polarToXY(cx, cy, r, startA)
    const e = polarToXY(cx, cy, r, endA)
    const large = angle > 180 ? 1 : 0
    return { d: `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`, color: colors[i % colors.length], label: d.label, value: d.value, pct: Math.round((d.value / total) * 100) }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((sl, i) => (
          <path key={i} d={sl.d} fill="none" stroke={sl.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))}
        {centerLabel && (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="20" fontWeight="800">{centerLabel}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="11">{centerValue}</text>
          </>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {slices.map((sl, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: sl.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sl.label}</span>
            <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: '700', marginLeft: '0.25rem' }}>{sl.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Cost Chart (bars + area) ──────────────────────────────────

function CostChart({ metricas, presupuesto }) {
  if (!metricas.length) return <p style={{ color: '#475569', fontSize: '0.85rem' }}>Sin datos</p>
  const H = 120, W = 260
  const maxCosto = Math.max(...metricas.map(m => m.costoMes), 1)
  const barW = Math.min(32, (W / metricas.length) - 8)

  // Acumulado como línea
  let acum = 0
  const acumPoints = metricas.map((m, i) => {
    acum += m.costoMes
    const x = (W / metricas.length) * i + W / metricas.length / 2
    const y = H - (presupuesto ? (acum / presupuesto) * H : 0)
    return { x, y, acum }
  })
  const linePath = acumPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" style={{ display: 'block' }}>
      {metricas.map((m, i) => {
        const x = (W / metricas.length) * i + (W / metricas.length - barW) / 2
        const bh = (m.costoMes / maxCosto) * (H * 0.7)
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={barW} height={bh} fill="#1d4ed8" rx="3" opacity="0.85" />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="#64748b" fontSize="10">{m.periodo.slice(5)}</text>
          </g>
        )
      })}
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
      {acumPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#10b981" />
          {i === acumPoints.length - 1 && (
            <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">
              €{(p.acum / 1000).toFixed(0)}k
            </text>
          )}
        </g>
      ))}
      {presupuesto && (
        <>
          <line x1="0" y1={0} x2={W} y2={0} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
          <text x={W - 2} y={10} textAnchor="end" fill="#f59e0b" fontSize="9">Presupuesto €{(presupuesto / 1000).toFixed(0)}k</text>
        </>
      )}
    </svg>
  )
}

// ── Riesgos resumen ───────────────────────────────────────────

function RiesgoResumen({ riesgos }) {
  const count = { ALTO: 0, MEDIO: 0, BAJO: 0 }
  riesgos.forEach(r => { if (!r.mitigado) count[r.nivel] = (count[r.nivel] || 0) + 1 })
  const colores = { ALTO: '#ef4444', MEDIO: '#f59e0b', BAJO: '#10b981' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {Object.entries(count).map(([nivel, n]) => (
        <div key={nivel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: colores[nivel] || '#94a3b8', fontWeight: '600' }}>{nivel}</span>
          <span style={{ background: (colores[nivel] || '#94a3b8') + '33', color: colores[nivel] || '#94a3b8', borderRadius: '99px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: '700' }}>{n}</span>
        </div>
      ))}
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: '#475569' }}>
        {riesgos.filter(r => r.mitigado).length} mitigados de {riesgos.length} totales
      </p>
    </div>
  )
}

// ── Hitos list ────────────────────────────────────────────────

function HitosList({ hitos }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
      {hitos.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{h.completado ? '✅' : '⏳'}</span>
          <div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: h.completado ? '#94a3b8' : 'white', fontWeight: h.completado ? 'normal' : '600', textDecoration: h.completado ? 'line-through' : 'none' }}>{h.nombre}</p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569' }}>{fmt(h.fechaPlan)}{h.fechaReal ? ` → real: ${fmt(h.fechaReal)}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Salud Score ───────────────────────────────────────────────

function SaludScore({ kpis }) {
  const score = kpis.saludScore
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Saludable' : score >= 50 ? 'En riesgo' : 'Crítico'
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <ScorePill label="Progreso" value={`${kpis.pctAvance}%`}    color="#3b82f6" />
        <ScorePill label="Horas"    value={`${kpis.horasTotales}h`} color="#8b5cf6" />
        <ScorePill label="Issues"   value={kpis.incidenciasTotal}    color="#f59e0b" />
      </div>
      <div style={{ fontSize: '3rem', fontWeight: '900', color, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>× 10 = índice de salud</div>
      <div style={{ marginTop: '0.5rem', background: color + '22', color, padding: '0.2rem 0.75rem', borderRadius: '99px', display: 'inline-block', fontSize: '0.8rem', fontWeight: '700' }}>{label}</div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
        <span>Presupuesto usado: {kpis.pctPresupuesto}%</span>
        <span>Avance real: {kpis.pctAvance}%</span>
      </div>
      <div style={{ background: '#0f172a', borderRadius: '99px', height: '6px', marginTop: '0.35rem', overflow: 'hidden' }}>
        <div style={{ width: `${kpis.pctPresupuesto}%`, background: kpis.pctPresupuesto > kpis.pctAvance + 10 ? '#ef4444' : '#10b981', height: '100%', borderRadius: '99px' }} />
      </div>
    </div>
  )
}

function ScorePill({ label, value, color }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.3rem 0.6rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1rem', fontWeight: '800', color }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: '#475569' }}>{label}</div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

const polarToXY = (cx, cy, r, angle) => ({
  x: cx + r * Math.cos((angle * Math.PI) / 180),
  y: cy + r * Math.sin((angle * Math.PI) / 180),
})

const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const k = item[key] || 'Sin categoría'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})

const fmt = (d) => d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

// ── Estilos ───────────────────────────────────────────────────

const s = {
  sidebar:  { width: '220px', background: '#1a1a2e', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 },
  navLink:  { color: '#a5b4fc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.95rem' },
  logoutBtn:{ marginTop: 'auto', background: 'transparent', border: '1px solid #4f46e5', color: '#a5b4fc', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  row:      { display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
}
