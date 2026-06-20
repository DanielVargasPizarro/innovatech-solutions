# ms-proyectos — Microservicio de Gestión de Proyectos

Microservicio responsable de la gestión de proyectos y tareas en la plataforma **Innovatech Solutions**.

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
cd services/ms-proyectos
npm install
npx prisma generate
```

## Variables de entorno

Crea un archivo `.env` en la raíz del servicio:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/innovatech_proyectos
```

## Migración y seed

```bash
# Aplicar migraciones
npx prisma migrate dev --name init

# Cargar datos de prueba
npm run seed
```

## Ejecución

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El servicio quedará disponible en `http://localhost:3001`

## Endpoints disponibles

| Método | Ruta                      | Descripción                      |
|--------|---------------------------|----------------------------------|
| GET    | /health                   | Health check del servicio        |
| GET    | /proyectos                | Listar todos los proyectos       |
| GET    | /proyectos/:id            | Obtener proyecto por ID          |
| POST   | /proyectos                | Crear nuevo proyecto             |
| PUT    | /proyectos/:id            | Actualizar proyecto              |
| DELETE | /proyectos/:id            | Eliminar proyecto                |
| GET    | /proyectos/:id/tareas     | Listar tareas de un proyecto     |
| POST   | /proyectos/:id/tareas     | Agregar tarea a un proyecto      |

## Ejecutar pruebas unitarias

```bash
npm test
```

Genera reporte de cobertura en `coverage/lcov-report/index.html`.

```bash
# Ver reporte en navegador (macOS)
open coverage/lcov-report/index.html

# Ver reporte en navegador (Linux)
xdg-open coverage/lcov-report/index.html
```

## Estructura del proyecto

```
ms-proyectos/
├── prisma/
│   ├── schema.prisma     # Modelos: Proyecto, Tarea, Estado
│   └── seed.js           # Datos iniciales
├── src/
│   ├── index.js          # Entry point Express
│   ├── routes.js         # Definición de rutas HTTP
│   ├── repository.js     # Repository Pattern (acceso a BD)
│   └── __tests__/
│       ├── repository.test.js   # 19 tests — capa repository
│       └── routes.test.js       # 15 tests — capa HTTP
├── Dockerfile
├── package.json
└── .env
```

## Patrón de diseño

Implementa el **Repository Pattern**: la lógica de acceso a datos está encapsulada en `repository.js`, desacoplada de las rutas HTTP. Esto permite testear ambas capas de forma independiente.

## Docker

```bash
# Construir imagen
docker build -t ms-proyectos .

# Correr con Docker Compose (recomendado)
docker compose up ms-proyectos
```
