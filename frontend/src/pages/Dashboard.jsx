import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [kpis, setKpis]           = useState(null)
  const [historial, setHistorial] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/analitica/kpis'),
      api.get('/analitica/kpis/historial'),
      api.get('/proyectos/proyectos'),
    ])
      .then(([kpisRes, histRes, proyRes]) => {
        setKpis(kpisRes.data)
        setHistorial(histRes.data)
        setProyectos(proyRes.data)
        setError('')
      })
      .catch(() => setError('No se pudieron cargar los datos del dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div style={s.layout}>
      <Sidebar logout={logout} />
      <main style={s.main}>
        <h1 style={s.title}>Panel de Gestión</h1>

        {loading && <p style={{ color: '#64748b' }}>Cargando indicadores...</p>}
        {error   && <p style={s.errorBanner}>⚠️ {error}</p>}

        {kpis && (
          <div style={s.alertBox}>
            {kpis.tasaUtilizacion > 85 && (
              <div style={{ ...s.alert, borderLeft: '4px solid #ef4444', background: '#450a0a22' }}>
                ⚠️ <strong style={{ color: '#fca5a5' }}>Alerta Operaciones:</strong> <span style={{ color: '#94a3b8' }}>Tasa de utilización crítica ({kpis.tasaUtilizacion}%). El personal está sobreasignado.</span>
              </div>
            )}
            {kpis.totalProyectos > 0 && kpis.tareasCompletadas === 0 && (
              <div style={{ ...s.alert, borderLeft: '4px solid #f59e0b', background: '#451a0322' }}>
                📋 <strong style={{ color: '#fcd34d' }}>Aviso:</strong> <span style={{ color: '#94a3b8' }}>Proyectos activos sin tareas completadas registradas aún.</span>
              </div>
            )}
          </div>
        )}

        {kpis && (
          <div style={s.grid}>
            <KpiCard label="Total Proyectos"     value={kpis.totalProyectos}     color="#6366f1" />
            <KpiCard label="Proyectos Activos"   value={kpis.proyectosActivos}   color="#10b981" />
            <KpiCard label="Tareas Completadas"  value={kpis.tareasCompletadas}  color="#f59e0b" />
            <KpiCard label="Total Empleados"     value={kpis.totalEmpleados}     color="#8b5cf6" />
            <KpiCard label="Empleados Asignados" value={kpis.empleadosAsignados} color="#ec4899" />
            <KpiCard label="Tasa Utilización"    value={`${kpis.tasaUtilizacion}%`} color="#0ea5e9" />
          </div>
        )}

        {proyectos.length > 0 && (
          <section style={s.section}>
            <h2 style={s.subTitle}>📁 Progreso por Proyecto</h2>
            <p style={s.desc}>Estado de avance de tareas en cada proyecto activo.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {proyectos.map(p => <ProyectoCard key={p.id} proyecto={p} />)}
            </div>
          </section>
        )}

        {proyectos.length > 0 && (
          <section style={s.section}>
            <h2 style={s.subTitle}>📊 Distribución de Estados</h2>
            <p style={s.desc}>Proyectos agrupados por estado actual.</p>
            <div style={s.distribucionGrid}>
              <EstadoCard estado="EN_PROCESO" label="En Proceso" color="#10b981" proyectos={proyectos} />
              <EstadoCard estado="PENDIENTE"  label="Pendiente"  color="#f59e0b" proyectos={proyectos} />
              <EstadoCard estado="COMPLETADO" label="Completado" color="#6366f1" proyectos={proyectos} />
              <EstadoCard estado="CANCELADO"  label="Cancelado"  color="#ef4444" proyectos={proyectos} />
            </div>
          </section>
        )}

        <section style={s.section}>
          <h2 style={s.subTitle}>⏳ Historial de Snapshots</h2>
          <p style={s.desc}>Registros históricos almacenados por el microservicio de analítica (ms-analitica). Se generan con cada visita.</p>
          {historial.length === 0
            ? <p style={{ color: '#475569', fontSize: '0.9rem' }}>Sin snapshots registrados aún.</p>
            : (
              <table style={s.table}>
                <thead>
                  <tr style={s.trHeader}>
                    <th style={s.th}>Fecha</th>
                    <th style={s.th}>Proyectos</th>
                    <th style={s.th}>Activos</th>
                    <th style={s.th}>Tareas Compl.</th>
                    <th style={s.th}>Tasa Utilización</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(snap => (
                    <tr key={snap.id} style={s.trBody}>
                      <td style={s.td}>{new Date(snap.fecha || snap.createdAt).toLocaleString('es-CL')}</td>
                      <td style={s.td}>{snap.totalProyectos}</td>
                      <td style={s.td}>{snap.proyectosActivos}</td>
                      <td style={s.td}>{snap.tareasCompletadas}</td>
                      <td style={{ ...s.td, fontWeight: '700', color: '#0ea5e9' }}>{snap.tasaUtilizacion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </section>
      </main>
    </div>
  )
}

function Sidebar({ logout }) {
  return (
    <nav style={s.sidebar}>
      <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Innovatech</h2>
      <Link style={s.navLink} to="/">📊 Dashboard</Link>
      <Link style={s.navLink} to="/proyectos">📁 Proyectos</Link>
      <Link style={s.navLink} to="/recursos">👥 Recursos</Link>
      <button style={s.logoutBtn} onClick={logout}>Cerrar sesión</button>
    </nav>
  )
}

function KpiCard({ label, value, color }) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
      <p style={s.cardLabel}>{label}</p>
      <p style={{ ...s.cardValue, color }}>{value}</p>
    </div>
  )
}

function ProyectoCard({ proyecto }) {
  const tareas = proyecto.tareas || []
  const total      = tareas.length
  const completadas = tareas.filter(t => t.estado === 'COMPLETADO').length
  const enProceso   = tareas.filter(t => t.estado === 'EN_PROCESO').length
  const pct = total > 0 ? Math.round((completadas / total) * 100) : 0
  const badgeColor = { EN_PROCESO: '#10b981', PENDIENTE: '#f59e0b', COMPLETADO: '#6366f1', CANCELADO: '#ef4444' }[proyecto.estado] || '#64748b'

  return (
    <div style={s.proyectoCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div>
          <p style={{ margin: 0, fontWeight: '600', color: '#e2e8f0', fontSize: '0.9rem' }}>{proyecto.nombre}</p>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>{proyecto.descripcion}</p>
        </div>
        <span style={{ background: badgeColor + '22', color: badgeColor, fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
          {proyecto.estado.replace('_', ' ')}
        </span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginBottom: '0.25rem' }}>
          <span>{completadas}/{total} tareas completadas</span>
          <span style={{ fontWeight: '700', color: pct === 100 ? '#10b981' : '#6366f1' }}>{pct}%</span>
        </div>
        <div style={{ background: '#0f172a', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#6366f1', height: '100%', borderRadius: '99px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {completadas > 0 && <Chip label={`✅ ${completadas} completadas`} color="#10b981" />}
        {enProceso   > 0 && <Chip label={`🔄 ${enProceso} en proceso`}   color="#f59e0b" />}
        {(total - completadas - enProceso) > 0 && <Chip label={`⏳ ${total - completadas - enProceso} pendientes`} color="#64748b" />}
      </div>
    </div>
  )
}

function Chip({ label, color }) {
  return <span style={{ fontSize: '0.72rem', color, background: color + '22', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: '500' }}>{label}</span>
}

function EstadoCard({ estado, label, color, proyectos }) {
  const count = proyectos.filter(p => p.estado === estado).length
  return (
    <div style={{ ...s.card, borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <p style={{ fontSize: '2rem', fontWeight: '900', color, margin: 0 }}>{count}</p>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>{label}</p>
    </div>
  )
}

const s = {
  layout:   { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  sidebar:  { width: '220px', background: '#1a1a2e', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 },
  navLink:  { color: '#a5b4fc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.95rem' },
  logoutBtn:{ marginTop: 'auto', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  main:     { flex: 1, padding: '2rem', background: '#0f172a', overflowY: 'auto' },
  title:    { marginBottom: '1.5rem', color: '#e2e8f0', fontWeight: '700' },

  errorBanner: { color: '#fca5a5', background: '#450a0a', padding: '0.75rem', borderRadius: '6px', borderLeft: '4px solid #ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' },
  alertBox:    { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' },
  alert:       { padding: '0.875rem 1rem', borderRadius: '6px', fontSize: '0.85rem' },

  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  distribucionGrid:{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' },

  card:      { background: '#1e293b', borderRadius: '10px', padding: '1.25rem', border: '1px solid #334155' },
  cardLabel: { fontSize: '0.78rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardValue: { fontSize: '2rem', fontWeight: '900', margin: '0.5rem 0 0' },

  section:       { background: '#1e293b', borderRadius: '10px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.25rem' },
  subTitle:      { margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#e2e8f0', fontWeight: '600' },
  desc:          { margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#64748b' },
  proyectoCard:  { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.875rem 1rem' },

  table:    { width: '100%', borderCollapse: 'collapse' },
  trHeader: { borderBottom: '1px solid #334155' },
  th:       { padding: '0.75rem 1rem', textAlign: 'left', color: '#475569', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  trBody:   { borderBottom: '1px solid #1e293b' },
  td:       { padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' },
}
