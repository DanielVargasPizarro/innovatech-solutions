import axios from 'axios'
//service layer pattern toda comunicacion para por aca los componentes no usan fetch directamente
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})
//Intercepta automáticamente todas las peticiones HTTP
//  sin que cada componente tenga que preocuparse por eso.
// Interceptor pattern: adjunta JWT en cada request automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: si el token vencio, redirige al login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
