# Backend ProElectris

![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)
![Sequelize](https://img.shields.io/badge/Sequelize-6.32-52B0E7?logo=sequelize)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Backend API REST para el sistema de gestión de ProElectris, desarrollado con Node.js, Express y TypeScript. Proporciona endpoints para la administración de clientes y productos con validación robusta y conexión a PostgreSQL.

## Descripción

API backend que implementa operaciones CRUD completas para la gestión de clientes y productos. Incluye validaciones exhaustivas para datos paraguayos (RUC, CI), paginación, búsqueda, y manejo de errores profesional.

### Características Principales

- API REST con Express y TypeScript
- Validación robusta de datos de entrada
- Validadores específicos para datos paraguayos (RUC, CI)
- Paginación y búsqueda en endpoints de listado
- Manejo centralizado de errores
- Health check endpoint para monitoreo
- CORS configurado de manera segura
- Logging de peticiones HTTP

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express 4.18
- **Lenguaje**: TypeScript 5.1
- **ORM**: Sequelize 6.32
- **Base de Datos**: PostgreSQL 15+

### Dependencias Principales
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.32.1",
  "pg": "^8.11.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "typescript": "^5.1.6"
}
```

## Requisitos Previos

- Node.js 20.x o superior
- PostgreSQL 15 o superior
- npm o pnpm

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Yop007N/backendproelectris.git
cd backendproelectris
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
# Database Configuration
DB_NAME=proelectris_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (para futuras implementaciones)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Configurar la base de datos

Crear la base de datos en PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE proelectris_db;
\q
```

Las tablas se crearán automáticamente al iniciar la aplicación gracias a Sequelize.

### 5. Compilar TypeScript
```bash
npm run build
```

### 6. Iniciar el servidor

**Desarrollo** (con hot reload):
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
backendproelectris/
├── src/
│   ├── config/
│   │   └── database.ts           # Configuración de Sequelize
│   ├── controllers/
│   │   ├── clientes.controller.ts  # Controlador de clientes
│   │   └── productos.controller.ts # Controlador de productos
│   ├── models/
│   │   ├── Cliente.ts             # Modelo de Cliente
│   │   ├── Producto.ts            # Modelo de Producto
│   │   ├── ClienteProducto.ts     # Modelo de relación
│   │   └── index.ts               # Exportación de modelos
│   ├── routes/
│   │   └── routes.ts              # Definición de rutas
│   ├── index.ts                   # Configuración de Express
│   └── app.ts                     # Punto de entrada
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Health Check

#### GET /health
Verifica el estado del servidor y la conexión a la base de datos.

**Respuesta exitosa (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "database": "connected",
  "environment": "development",
  "version": "1.0.0"
}
```

### Clientes

#### GET /api/clientes
Obtiene todos los clientes con paginación y búsqueda.

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por nombre, email o RUC

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "direccion": "Av. Eusebio Ayala 1234",
      "telefono": "+595981234567",
      "email": "juan.perez@example.com",
      "ruc": "1234567-8",
      "ci": "1234567",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 45,
    "recordsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### POST /api/clientes
Crea un nuevo cliente.

**Body** (application/json):
```json
{
  "nombre": "Juan Pérez",
  "direccion": "Av. Eusebio Ayala 1234",
  "telefono": "+595981234567",
  "email": "juan.perez@example.com",
  "ruc": "1234567-8",
  "ci": "1234567"
}
```

**Validaciones**:
- `nombre`: Requerido, mínimo 2 caracteres
- `direccion`: Requerido, mínimo 5 caracteres
- `telefono`: Requerido, formato válido (8-15 dígitos)
- `email`: Requerido, formato válido, único
- `ruc`: Opcional, formato paraguayo (ej: 1234567-8), único
- `ci`: Opcional, solo números

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "Cliente creado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "direccion": "Av. Eusebio Ayala 1234",
    "telefono": "+595981234567",
    "email": "juan.perez@example.com",
    "ruc": "1234567-8",
    "ci": "1234567"
  }
}
```

**Errores posibles**:
- `400`: Errores de validación
- `409`: Email o RUC duplicado
- `500`: Error interno del servidor

#### PUT /api/clientes/:id
Actualiza un cliente existente.

**Parámetros**:
- `id`: ID del cliente (en la URL)

**Body** (application/json - todos los campos opcionales):
```json
{
  "nombre": "Juan Carlos Pérez",
  "telefono": "+595991234567"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Cliente actualizado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan Carlos Pérez",
    "direccion": "Av. Eusebio Ayala 1234",
    "telefono": "+595991234567",
    "email": "juan.perez@example.com",
    "ruc": "1234567-8",
    "ci": "1234567"
  }
}
```

**Errores posibles**:
- `400`: ID inválido o errores de validación
- `404`: Cliente no encontrado
- `409`: Email duplicado con otro cliente
- `500`: Error interno del servidor

#### DELETE /api/clientes/:id
Elimina un cliente.

**Parámetros**:
- `id`: ID del cliente (en la URL)

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Cliente eliminado exitosamente",
  "data": {
    "id": "1"
  }
}
```

**Errores posibles**:
- `400`: ID inválido
- `404`: Cliente no encontrado
- `500`: Error interno del servidor

### Productos

#### GET /api/productos
Obtiene todos los productos.

**Respuesta exitosa (200)**:
```json
[
  {
    "id": 1,
    "nombre": "Producto A",
    "descripcion": "Descripción del producto",
    "codigo": "PROD-001",
    "precio": 150000.00,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

#### POST /api/productos
Crea un nuevo producto.

**Body** (application/json):
```json
{
  "nombre": "Producto A",
  "descripcion": "Descripción del producto",
  "codigo": "PROD-001",
  "precio": 150000.00
}
```

**Campos**:
- `nombre`: Requerido, máximo 100 caracteres
- `descripcion`: Opcional
- `codigo`: Requerido, máximo 20 caracteres
- `precio`: Requerido, decimal (10,2)

**Respuesta exitosa (200)**:
```json
{
  "id": 1,
  "nombre": "Producto A",
  "descripcion": "Descripción del producto",
  "codigo": "PROD-001",
  "precio": 150000.00
}
```

#### PUT /api/productos/:id
Actualiza un producto existente.

**Parámetros**:
- `id`: ID del producto (en la URL)

**Body** (application/json):
```json
{
  "nombre": "Producto A Modificado",
  "precio": 175000.00
}
```

**Respuesta exitosa (200)**:
```json
{
  "id": 1,
  "nombre": "Producto A Modificado",
  "descripcion": "Descripción del producto",
  "codigo": "PROD-001",
  "precio": 175000.00
}
```

**Errores posibles**:
- `404`: Producto no encontrado
- `500`: Error interno del servidor

#### DELETE /api/productos/:id
Elimina un producto.

**Parámetros**:
- `id`: ID del producto (en la URL)

**Respuesta exitosa (200)**:
```json
{
  "message": "Producto eliminado correctamente"
}
```

**Errores posibles**:
- `404`: Producto no encontrado
- `500`: Error interno del servidor

## Modelos de Datos

### Cliente
```typescript
{
  id: number;           // Auto-incremental
  nombre: string;       // Máximo 100 caracteres
  direccion: string;    // Máximo 200 caracteres
  telefono?: string;    // Máximo 20 caracteres
  email?: string;       // Máximo 100 caracteres, único
  ruc: string;          // Máximo 20 caracteres, único
  ci: string;           // Máximo 20 caracteres
  createdAt: Date;
  updatedAt: Date;
}
```

### Producto
```typescript
{
  id: number;           // Auto-incremental
  nombre: string;       // Máximo 100 caracteres
  descripcion?: string; // Texto
  codigo: string;       // Máximo 20 caracteres
  precio: number;       // Decimal (10,2)
  createdAt: Date;
  updatedAt: Date;
}
```

## Características de Seguridad

- **Validación de entrada**: Todos los endpoints validan datos antes de procesarlos
- **Prevención de SQL Injection**: Uso de Sequelize ORM con consultas parametrizadas
- **CORS configurado**: Solo permite orígenes específicos
- **Límite de payload**: 10MB máximo
- **Sanitización de datos**: Trim y normalización de entradas
- **Validadores específicos**: RUC paraguayo, CI, email, teléfono

## Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Tests (pendiente implementación)
npm test
```

## Manejo de Errores

La API devuelve respuestas consistentes en formato JSON:

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { }
}
```

**Respuesta de error**:
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": ["Lista de errores específicos"],
  "error": "Mensaje de error técnico (solo en development)"
}
```

### Códigos HTTP Utilizados

- `200`: Éxito
- `201`: Recurso creado exitosamente
- `400`: Error en la solicitud (validación)
- `404`: Recurso no encontrado
- `409`: Conflicto (duplicado)
- `500`: Error interno del servidor
- `503`: Servicio no disponible (base de datos desconectada)

## Despliegue

### Variables de Entorno en Producción

Asegúrate de configurar las siguientes variables:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_NAME=proelectris_db
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
CORS_ORIGIN=https://your-frontend-domain.com
```

### Recomendaciones

- Usar un gestor de procesos como PM2 o Docker
- Configurar HTTPS con un proxy inverso (Nginx)
- Implementar rate limiting
- Configurar logs con Winston o similar
- Monitoreo con herramientas como Sentry o New Relic

## Mejoras Futuras

- [ ] Implementar autenticación JWT
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar paginación en productos
- [ ] Agregar endpoint de búsqueda para productos
- [ ] Implementar validación de duplicados para código de producto
- [ ] Agregar middleware de rate limiting
- [ ] Implementar soft delete
- [ ] Agregar documentación con Swagger/OpenAPI
- [ ] Implementar logging estructurado
- [ ] Agregar métricas y monitoreo

## Contribuir

1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

- Repositorio: [https://github.com/Yop007N/backendproelectris](https://github.com/Yop007N/backendproelectris)
- Issues: [https://github.com/Yop007N/backendproelectris/issues](https://github.com/Yop007N/backendproelectris/issues)

---

Desarrollado con TypeScript, Express y PostgreSQL.
