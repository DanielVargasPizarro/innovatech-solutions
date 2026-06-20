# Frontend — Innovatech Solutions

Aplicación web SPA desarrollada con **React + Vite** para la gestión de proyectos y recursos humanos.

## Stack

- **Framework:** React 18
- **Bundler:** Vite 4
- **HTTP Client:** Axios
- **Routing:** React Router DOM

## Requisitos previos

- Node.js 18+
- npm 9+
- API Gateway corriendo en `http://localhost:3000`

## Instalación

```bash
cd frontend
npm install
```

## Variables de entorno

Crea un archivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

Disponible en `http://localhost:5173`

## Páginas disponibles

| Ruta           | Descripción                                      |
|----------------|--------------------------------------------------|
| `/login`       | Autenticación con JWT (email + password)         |
| `/`            | Dashboard con KPIs en tiempo real                |
| `/proyectos`   | Gestión CRUD de proyectos y tareas               |
| `/recursos`    | Gestión CRUD de empleados y asignaciones         |

## Usuarios de prueba

| Email                     | Password     | Rol          |
|---------------------------|--------------|--------------|
| admin@innovatech.com      | admin123     | ADMIN        |
| gestor@innovatech.com     | gestor123    | GESTOR       |
| colab@innovatech.com      | colab123     | COLABORADOR  |

## Estructura

```
frontend/
├── src/
│   ├── api.js            # Instancia Axios con interceptor JWT
│   ├── main.jsx          # Entry point + React Router
│   └── pages/
│       ├── Login.jsx     # Autenticación
│       ├── Dashboard.jsx # KPIs
│       ├── Proyectos.jsx # CRUD proyectos + modal edición
│       └── Recursos.jsx  # CRUD empleados
├── index.html
├── vite.config.js
├── package.json
└── Dockerfile
```

## Docker

```bash
docker compose up frontend
```

## Comunicación con backend

Todas las peticiones pasan por el **API Gateway** (puerto 3000). El token JWT se almacena en `localStorage` y se envía automáticamente en el header `Authorization: Bearer <token>` mediante un interceptor de Axios configurado en `api.js`.
