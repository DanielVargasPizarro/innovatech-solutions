# ms-analitica — Microservicio de Analítica y KPIs

Microservicio responsable de calcular y almacenar KPIs en tiempo real, consultando a ms-proyectos y ms-recursos.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **ORM:** Prisma v5
- **Base de datos:** PostgreSQL 15
- **HTTP Client:** Axios

## Variables de entorno

```env
PORT=3003
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/innovatech_analitica
MS_PROYECTOS_URL=http://ms-proyectos:3001
MS_RECURSOS_URL=http://ms-recursos:3002
```

## Instalación y ejecución

```bash
cd services/ms-analitica
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Disponible en `http://localhost:3003`

## Endpoints disponibles

| Método | Ruta             | Descripción                                              |
|--------|------------------|----------------------------------------------------------|
| GET    | /health          | Health check                                             |
| GET    | /kpis            | Calcular KPIs actuales + guardar snapshot en BD          |
| GET    | /kpis/historial  | Obtener historial de snapshots (últimos 30)              |

### Respuesta GET /kpis

```json
{
  "totalProyectos": 5,
  "proyectosActivos": 3,
  "tareasCompletadas": 12,
  "totalEmpleados": 8,
  "empleadosAsignados": 6,
  "tasaUtilizacion": 75.00
}
```

## Flujo de datos

```
GET /kpis
  ├── axios.get(MS_PROYECTOS_URL/proyectos)  → lista de proyectos con tareas
  ├── axios.get(MS_RECURSOS_URL/empleados)   → lista de empleados
  ├── Calcula KPIs en memoria
  └── prisma.kpiSnapshot.create(...)         → guarda snapshot en BD
```

## Docker

```bash
docker compose up ms-analitica
```
