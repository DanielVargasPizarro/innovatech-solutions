import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Recursos() {
  const [empleados, setEmpleados] = useState([])
  const [form, setForm]           = useState({ nombre: '', email: '', cargo: '', habilidades: '', horasSemana: 40 })
  const [loading, setLoading]     = useState(true)
  const [idEditando, setIdEditando]   = useState(null)
  const [formEditar, setFormEditar]   = useState({ nombre: '', email: '', cargo: '', habilidades: '', horasSemana: 40 })

  const fetchEmpleados = () => {
    api.get('/recursos/empleados')
      .then(({ data }) => setEmpleados(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmpleados() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/recursos/empleados', {
        ...form,
        habilidades: form.habilidades ? form.habilidades.split(',').map(h => h.trim()) : [],
        horasSemana: Number(form.horasSemana),
      })
      setForm({ nombre: '', email: '', cargo: '', habilidades: '', horasSemana: 40 })
      fetchEmpleados()
    } catch (err) { console.error(err) }
  }

  const toggleDisponibilidad = async (emp) => {
    try {
      await api.put(`/recursos/empleados/${emp.id}`, { disponible: !emp.disponible })
      fetchEmpleados()
    } catch (err) { console.error(err) }
  }

  const iniciarEdicion = (emp) => {
    setIdEditando(emp.id)
    setFormEditar({ nombre: emp.nombre, email: emp.email, cargo: emp.cargo, habilidades: emp.habilidades?.join(', ') || '', horasSemana: emp.horasSemana })
  }

  const handleUpdate = async (id) => {
    try {
      await api.put(`/recursos/empleados/${id}`, {
        ...formEditar,
        habilidades: formEditar.habilidades ? formEditar.habilidades.split(',').map(h => h.trim()) : [],
        horasSemana: Number(formEditar.horasSemana),
      })
      setIdEditando(null)
      fetchEmpleados()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar empleado?')) return
    try {
      await api.delete(`/recursos/empleados/${id}`)
      fetchEmpleados()
    } catch (err) { console.error(err) }
  }

  return (
    <div style={s.layout}>
      <nav style={s.sidebar}>
        <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Innovatech</h2>
        <Link style={s.navLink} to="/">📊 Dashboard</Link>
        <Link style={s.navLink} to="/proyectos">📁 Proyectos</Link>
        <Link style={s.navLink} to="/recursos">👥 Recursos</Link>
      </nav>

      <main style={s.main}>
        <h1 style={s.title}>Gestión de Recursos Humanos</h1>

        <form onSubmit={handleCreate} style={s.form}>
          <input style={s.input} placeholder="Nombre"    value={form.nombre}      onChange={(e) => setForm({ ...form, nombre: e.target.value })}      required />
          <input style={s.input} placeholder="Email"     type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}  required />
          <input style={s.input} placeholder="Cargo"     value={form.cargo}       onChange={(e) => setForm({ ...form, cargo: e.target.value })}       required />
          <input style={s.input} placeholder="Habilidades (separadas por coma)" value={form.habilidades} onChange={(e) => setForm({ ...form, habilidades: e.target.value })} />
          <input style={{ ...s.input, width: '110px' }} type="number" placeholder="Hrs/sem" value={form.horasSemana} onChange={(e) => setForm({ ...form, horasSemana: e.target.value })} />
          <button type="submit" style={s.btn}>+ Agregar Empleado</button>
        </form>

        {loading ? <p style={{ color: '#64748b' }}>Cargando...</p> : (
          <table style={s.table}>
            <thead>
              <tr style={s.trHeader}>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Cargo</th>
                <th style={s.th}>Habilidades</th>
                <th style={s.th}>Hrs/sem</th>
                <th style={s.th}>Disponible</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => (
                <tr key={emp.id} style={s.trBody}>
                  {idEditando === emp.id ? (
                    <>
                      <td style={s.td}><input style={s.inputInline} value={formEditar.nombre}      onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })} /></td>
                      <td style={s.td}><input style={s.inputInline} value={formEditar.cargo}       onChange={(e) => setFormEditar({ ...formEditar, cargo: e.target.value })} /></td>
                      <td style={s.td}><input style={s.inputInline} value={formEditar.habilidades} onChange={(e) => setFormEditar({ ...formEditar, habilidades: e.target.value })} /></td>
                      <td style={s.td}><input style={{ ...s.inputInline, width: '60px' }} type="number" value={formEditar.horasSemana} onChange={(e) => setFormEditar({ ...formEditar, horasSemana: e.target.value })} /></td>
                      <td style={s.td}><DisponibleBadge disponible={emp.disponible} /></td>
                      <td style={{ ...s.td, display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleUpdate(emp.id)} style={s.btnSave}>💾 Guardar</button>
                        <button onClick={() => setIdEditando(null)}  style={s.btnCancel}>Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...s.td, color: '#e2e8f0', fontWeight: '500' }}>{emp.nombre}</td>
                      <td style={s.td}>{emp.cargo}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {emp.habilidades?.map(h => (
                            <span key={h} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '2px 7px', borderRadius: '99px', fontSize: '0.72rem' }}>{h}</span>
                          ))}
                        </div>
                      </td>
                      <td style={s.td}>{emp.horasSemana}h</td>
                      <td style={s.td}>
                        <button onClick={() => toggleDisponibilidad(emp)} style={{ background: emp.disponible ? '#052e16' : '#450a0a', border: `1px solid ${emp.disponible ? '#166534' : '#991b1b'}`, color: emp.disponible ? '#4ade80' : '#f87171', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                          {emp.disponible ? '✓ Disponible' : '✗ Asignado'}
                        </button>
                      </td>
                      <td style={{ ...s.td, display: 'flex', gap: '6px' }}>
                        <button onClick={() => iniciarEdicion(emp)} style={s.btnEdit}>✏️ Editar</button>
                        <button onClick={() => handleDelete(emp.id)} style={s.btnDelete}>🗑️</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}

function DisponibleBadge({ disponible }) {
  return (
    <span style={{ background: disponible ? '#052e16' : '#450a0a', border: `1px solid ${disponible ? '#166534' : '#991b1b'}`, color: disponible ? '#4ade80' : '#f87171', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '600' }}>
      {disponible ? '✓ Disponible' : '✗ Asignado'}
    </span>
  )
}

const s = {
  layout:   { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  sidebar:  { width: '220px', background: '#1a1a2e', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 },
  navLink:  { color: '#a5b4fc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.95rem' },
  main:     { flex: 1, padding: '2rem', background: '#0f172a' },
  title:    { marginBottom: '1.5rem', color: '#e2e8f0', fontWeight: '700' },
  form:     { display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' },
  input:    { padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '0.875rem' },
  btn:      { padding: '0.6rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },

  table:    { width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' },
  trHeader: { borderBottom: '1px solid #334155' },
  th:       { padding: '0.875rem 1rem', textAlign: 'left', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' },
  trBody:   { borderBottom: '1px solid #0f172a' },
  td:       { padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.875rem', verticalAlign: 'middle' },

  inputInline: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', width: '90%', fontSize: '0.82rem' },
  btnEdit:   { background: '#172554', color: '#60a5fa', border: '1px solid #1d4ed8', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' },
  btnDelete: { background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSave:   { background: '#052e16', color: '#4ade80', border: '1px solid #166534', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' },
  btnCancel: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' },
}
