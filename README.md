# Innovatech Solutions — Plataforma de Microservicios

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| API Gateway | Node.js + Express + JWT + Circuit Breaker (opossum) |
| Microservicios | Node.js + Express + Prisma ORM |
| Base de datos | PostgreSQL 15 (una por servicio) |
| Infraestructura | Docker + Docker Compose |

---

## Arquitectura

```
React (5173)
    └── API Gateway (3000)   ← JWT + Circuit Breaker
            ├── ms-proyectos (3001) ← Prisma → db-proyectos (5432)
            ├── ms-recursos  (3002) ← Prisma → db-recursos  (5433)
            └── ms-analitica (3003) ← Prisma → db-analitica (5434)
```

---

## Levantar el proyecto (Docker — recomendado)

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y **corriendo**
- Puerto 3000, 5173 libres

### Paso 1 — Construir y levantar todos los contenedores

```bash
docker compose up --build -d
```

Espera ~30 segundos a que todos los servicios inicien. Verifica con:

```bash
docker ps
```

Deben aparecer 8 contenedores: `frontend`, `api-gateway`, `ms-proyectos`, `ms-recursos`, `ms-analitica`, `db-proyectos`, `db-recursos`, `db-analitica`.

---

### Paso 2 — Crear tablas y cargar datos de ejemplo

> **Este paso es obligatorio** para ver datos en el dashboard y en los proyectos.
> El comando `npm run seed` crea las tablas automáticamente si no existen y luego inserta los datos.

```bash
docker exec ms-proyectos npm run seed
docker exec ms-recursos  npm run seed
docker exec ms-analitica npx prisma db push
```

Resultado esperado:

```
✅ Seed completo con analytics
   ERP       (id:1)  → 7 tareas, 6 métricas, 4 hitos, 4 riesgos
   Cloud AWS (id:2)  → 6 tareas, 5 métricas, 4 hitos, 4 riesgos
   Mobile    (id:3)  → 6 tareas, 2 métricas, 4 hitos, 3 riesgos

✅ Seed de recursos completado
   - 10 empleados creados (8 asignados, 2 disponibles)
   - Asignaciones: 5 al ERP, 3 al Cloud, 4 al Mobile
```

---

### Paso 4 — Abrir la aplicación

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000

---

## Usuarios demo

| Email | Contraseña | Rol |
|---|---|---|
| admin@innovatech.com | admin123 | ADMIN |
| gestor@innovatech.com | gestor123 | GESTOR |
| colab@innovatech.com | colab123 | COLABORADOR |

---

## Comandos útiles

```bash
# Ver logs de un servicio
docker logs ms-proyectos -f

# Detener todo
docker compose down

# Detener y eliminar volúmenes (borra las BDs)
docker compose down -v

# Re-ejecutar el seed (limpia y vuelve a insertar datos)
docker exec ms-proyectos npm run seed
docker exec ms-recursos  npm run seed

# Reiniciar un servicio individual
docker restart ms-proyectos
```

---

## Variables de entorno

Cada servicio tiene su propio `.env` ya configurado para Docker. No requieren modificación para desarrollo local.

| Servicio | Variable | Valor |
|---|---|---|
| ms-proyectos | `DATABASE_URL` | `postgresql://postgres:secret@db-proyectos:5432/proyectos_db` |
| ms-recursos | `DATABASE_URL` | `postgresql://postgres:secret@db-recursos:5432/recursos_db` |
| ms-analitica | `DATABASE_URL` | `postgresql://postgres:secret@db-analitica:5432/analitica_db` |
| api-gateway | `JWT_SECRET` | `innovatech_secret_key_2024` |
| api-gateway | `MS_PROYECTOS_URL` | `http://ms-proyectos:3001` |
| api-gateway | `MS_RECURSOS_URL` | `http://ms-recursos:3002` |
| api-gateway | `MS_ANALITICA_URL` | `http://ms-analitica:3003` |

---

## Endpoints API

Todos los endpoints (excepto login) requieren header `Authorization: Bearer <token>`.

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Obtiene JWT |

### Proyectos (`ms-proyectos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/proyectos/proyectos` | Lista todos los proyectos (incluye tareas) |
| POST | `/proyectos/proyectos` | Crea un proyecto |
| PUT | `/proyectos/proyectos/:id` | Edita un proyecto |
| DELETE | `/proyectos/proyectos/:id` | Elimina un proyecto |
| GET | `/proyectos/proyectos/:id/analitica` | Analytics completo del proyecto (KPIs, métricas, hitos, riesgos) |
| GET | `/proyectos/proyectos/:id/tareas` | Tareas de un proyecto |
| POST | `/proyectos/proyectos/:id/tareas` | Crea una tarea |

### Recursos (`ms-recursos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/recursos/empleados` | Lista empleados (incluye asignaciones) |
| POST | `/recursos/empleados` | Crea empleado |
| PUT | `/recursos/empleados/:id` | Edita empleado |
| DELETE | `/recursos/empleados/:id` | Elimina empleado |
| POST | `/recursos/asignaciones` | Crea asignación empleado-proyecto |

### Analítica (`ms-analitica`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/analitica/kpis` | KPIs en tiempo real + guarda snapshot |
| GET | `/analitica/kpis/historial` | Historial de los últimos 30 snapshots |

---

## Estructura del proyecto

```
innovatech/
├── frontend/                  # React + Vite
│   └── src/pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx      # KPIs + progreso proyectos + historial
│       ├── Proyectos.jsx      # CRUD proyectos
│       ├── ProyectoDetalle.jsx # Analytics por proyecto (9 gráficos)
│       └── Recursos.jsx       # CRUD empleados
├── services/
│   ├── api-gateway/           # Puerto 3000 — JWT + Circuit Breaker
│   ├── ms-proyectos/          # Puerto 3001 — Proyectos, Tareas, Hitos, Riesgos, Métricas
│   ├── ms-recursos/           # Puerto 3002 — Empleados, Asignaciones
│   └── ms-analitica/          # Puerto 3003 — KPIs y Snapshots
├── docker-compose.yml
└── README.md
```

---

## Patrones implementados

| Patrón | Descripción |
|---|---|
| Database per Service | Cada microservicio tiene su propia PostgreSQL aislada |
| API Gateway | Único punto de entrada con autenticación JWT |
| Circuit Breaker | Opossum en el gateway (abre si >50% fallos en 5s, reset en 10s) |
| Repository Pattern | Toda la lógica de BD encapsulada en `repository.js` |

---

## Solución de problemas frecuentes

**El dashboard aparece vacío / "No se pudieron cargar los datos"**
→ Verificar que los 3 pasos de setup se ejecutaron (db push + seed).
→ Revisar que todos los contenedores estén `Up`: `docker ps`

**Error al correr el seed: "relation does not exist" / "table does not exist"**
→ El seed ya incluye `prisma db push` automáticamente. Asegúrate de usar `npm run seed` y no `node prisma/seed.js` directamente.

**Los contenedores no inician**
→ Asegurarse de que Docker Desktop esté abierto y corriendo antes de `docker compose up`

**Puerto 3000 ocupado (Windows)**
→ Ejecutar en PowerShell como Administrador:
```powershell
New-NetFirewallRule -DisplayName "API Puerto 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```
