# ms-recursos — Microservicio de Gestión de Recursos Humanos

Microservicio responsable de la gestión de empleados y asignaciones en la plataforma **Innovatech Solutions**.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **ORM:** Prisma v5
- **Base de datos:** PostgreSQL 15
- **Tests:** Jest + Supertest

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 15 corriendo (o usar Docker Compose)
- npm 9+

## Instalación

```bash
cd services/ms-recursos
npm install
npx prisma generate
```

## Variables de entorno

```env
PORT=3002
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/innovatech_recursos
```

## Migración

```bash
npx prisma migrate dev --name init
```

## Ejecución

```bash
npm run dev   # Desarrollo
npm start     # Producción
```

Disponible en `http://localhost:3002`

## Endpoints disponibles

| Método | Ruta                | Descripción                                          |
|--------|---------------------|------------------------------------------------------|
| GET    | /health             | Health check                                         |
| GET    | /empleados          | Listar todos los empleados con sus asignaciones      |
| GET    | /empleados/:id      | Obtener empleado por ID                              |
| POST   | /empleados          | Crear nuevo empleado                                 |
| PUT    | /empleados/:id      | Actualizar empleado                                  |
| DELETE | /empleados/:id      | Eliminar empleado (cascada en asignaciones)          |
| POST   | /asignaciones       | Crear asignación empleado-proyecto                   |

### Ejemplo — Crear empleado

```json
POST /empleados
{
  "nombre": "María García",
  "email": "maria@innovatech.com",
  "cargo": "Desarrolladora Frontend",
  "habilidades": ["React", "TypeScript", "CSS"],
  "disponible": true,
  "horasSemana": 40
}
```

### Ejemplo — Crear asignación

```json
POST /asignaciones
{
  "empleadoId": 1,
  "proyectoId": 3,
  "horasAsig": 20
}
```

## Ejecutar pruebas unitarias

```bash
npm test
```

- **15 tests** cubriendo todos los endpoints
- Mocks de PrismaClient para aislamiento completo
- Verificación de eliminación en cascada (asignaciones → empleado)

## Estructura

```
ms-recursos/
├── prisma/
│   └── schema.prisma     # Modelos: Empleado, Asignacion
├── src/
│   ├── index.js          # Entry point con toda la lógica
│   └── __tests__/
│       └── recursos.test.js   # 15 tests unitarios
├── Dockerfile
├── package.json
└── .env
```

## Docker

```bash
docker compose up ms-recursos
```
