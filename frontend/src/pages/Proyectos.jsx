import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO']

export default function Proyectos() {
  const navigate = useNavigate()
  const [proyectos, setProyectos] = useState([])
  const [form, setForm]           = useState({ nombre: '', descripcion: '', estado: 'EN_PROCESO' })
  const [loading, setLoading]     = useState(true)
  const [editando, setEditando]   = useState(null)
  const [editForm, setEditForm]   = useState({ nombre: '', descripcion: '', estado: '' })

  const fetchProyectos = () => {
    api.get('/proyectos/proyectos')
      .then(({ data }) => setProyectos(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProyectos() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.post('/proyectos/proyectos', form)
    setForm({ nombre: '', descripcion: '', estado: 'EN_PROCESO' })
    fetchProyectos()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar proyecto?')) return
    await api.delete(`/proyectos/proyectos/${id}`)
    fetchProyectos()
  }

  const abrirEditar = (p) => {
    setEditando(p.id)
    setEditForm({ nombre: p.nombre, descripcion: p.descripcion || '', estado: p.estado })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    await api.put(`/proyectos/proyectos/${editando}`, editForm)
    setEditando(null)
    fetchProyectos()
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
        <h1 style={s.title}>Gestión de Proyectos</h1>

        <form onSubmit={handleCreate} style={s.form}>
          <input style={s.input} placeholder="Nombre del proyecto" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <input style={s.input} placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <select style={s.input} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <button type="submit" style={s.btn}>+ Crear Proyecto</button>
        </form>

        {loading ? <p style={{ color: '#64748b' }}>Cargando...</p> : (
          <table style={s.table}>
            <thead>
              <tr style={s.trHeader}>
                <th style={s.th}>ID</th>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Estado</th>
                <th style={s.th}>Tareas</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id} style={s.trBody}>
                  <td style={s.td}>{p.id}</td>
                  <td style={{ ...s.td, color: '#e2e8f0', fontWeight: '500' }}>{p.nombre}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: badgeColor(p.estado) + '33', color: badgeColor(p.estado) }}>{p.estado.replace('_', ' ')}</span></td>
                  <td style={s.td}>{p.tareas?.length ?? 0} tareas</td>
                  <td style={{ ...s.td, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/proyectos/${p.id}`)} style={s.analyticsBtn}>📊 Analytics</button>
                    <button onClick={() => abrirEditar(p)} style={s.editBtn}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} style={s.deleteBtn}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {editando && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>✏️ Editar Proyecto</h2>
            <form onSubmit={handleEdit} style={s.modalForm}>
              <label style={s.label}>Nombre</label>
              <input style={s.inputModal} value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required />
              <label style={s.label}>Descripción</label>
              <input style={s.inputModal} value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} />
              <label style={s.label}>Estado</label>
              <select style={s.inputModal} value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}>
                {ESTADOS.map((e) => <option key={e}>{e}</option>)}
              </select>
              <div style={s.modalBtns}>
                <button type="button" onClick={() => setEditando(null)} style={s.cancelBtn}>Cancelar</button>
                <button type="submit" style={s.saveBtn}>💾 Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const badgeColor = (estado) => ({ PENDIENTE: '#f59e0b', EN_PROCESO: '#3b82f6', COMPLETADO: '#10b981', CANCELADO: '#ef4444' }[estado] || '#64748b')

const s = {
  layout:   { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  sidebar:  { width: '220px', background: '#1a1a2e', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 },
  navLink:  { color: '#a5b4fc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.95rem' },
  main:     { flex: 1, padding: '2rem', background: '#0f172a' },
  title:    { marginBottom: '1.5rem', color: '#e2e8f0', fontWeight: '700' },
  form:     { display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' },
  input:    { padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '0.9rem' },
  btn:      { padding: '0.6rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },

  table:    { width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' },
  trHeader: { borderBottom: '1px solid #334155' },
  th:       { padding: '0.875rem 1rem', textAlign: 'left', color: '#475569', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' },
  trBody:   { borderBottom: '1px solid #0f172a' },
  td:       { padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.875rem', verticalAlign: 'middle' },
  badge:    { padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' },

  analyticsBtn: { background: '#1e1b4b', color: '#a5b4fc', border: '1px solid #4338ca', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem' },
  editBtn:      { background: '#172554', color: '#60a5fa', border: '1px solid #1d4ed8', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem' },
  deleteBtn:    { background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' },

  overlay:    { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:      { background: '#1e293b', borderRadius: '12px', padding: '2rem', width: '440px', border: '1px solid #334155', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  modalTitle: { margin: '0 0 1.5rem', color: '#e2e8f0', fontSize: '1.15rem', fontWeight: '700' },
  modalForm:  { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label:      { fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputModal: { padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  modalBtns:  { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancelBtn:  { padding: '0.6rem 1.25rem', background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' },
  saveBtn:    { padding: '0.6rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
}
