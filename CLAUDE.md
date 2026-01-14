# CLAUDE.md
#Zxcasd16#
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
##dsbiolfqicmdozvs
Water utility (acueducto) management system with offline-first capabilities for meter reading and billing. Built as a hybrid mobile/web application using Vue 3, Quasar, and NestJS. Supports geolocation-based readings, offline data capture with background sync, and real-time updates via WebSockets.

## Development Commands

### Running the Application

```bash
# Install dependencies (run once after clone)
npm install
cd backend && npm install

# Start all services (backend + realtime + frontend)
npm run start:all

# Or start services individually:
npm run backend        # NestJS backend on port 3030
npm run realtime       # Socket.IO realtime server on port 3007
npm run dev            # Vue frontend on port 5175
```

### Backend (NestJS)

```bash
cd backend

# Development
npm run start:dev      # Start with hot reload

# Production
npm run build          # Compile TypeScript
npm run start:prod     # Run compiled version

# Testing
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests

# Code quality
npm run lint           # Lint and fix TypeScript files
npm run format         # Format code with Prettier
```

### Frontend (Vue + Quasar)

```bash
# Development
npm run dev            # Start Vite dev server with hot reload

# Production
npm run build          # Build for web (requires TypeScript compilation)
npm run preview        # Preview production build locally
```

### Mobile (Capacitor)

```bash
# Build and deploy to Android
npm run build                  # Build web assets
npx cap sync android           # Sync web assets to Android
npx cap open android           # Open in Android Studio
```

## Architecture

### Monorepo Structure

- **`/src`** - Vue 3 frontend with Quasar UI framework
- **`/backend/src`** - NestJS backend API
- **`/backend/src/realtime-server.mjs`** - Standalone Socket.IO server for PostgreSQL notifications
- **`/android`** - Capacitor Android project

### Backend Architecture (NestJS)

**Modules:**
- `AuthModule` - JWT authentication with Passport strategies (local & JWT)
- `UsersModule` - User management
- `ConsumoModule` - Consumption/readings management (main business logic)
- `InstalacionesModule` - Installation (meter) management
- `GenericCaptureModule` - CRUD for sectores, estratos, tarifas (generic entities)
- `PdfModule` - PDF invoice generation with PDFKit
- `DatabaseModule` - TypeORM PostgreSQL configuration

**Key Files:**
- `backend/src/main.ts` - Bootstrap with CORS config, Swagger docs on `/api`
- `backend/src/database/database.module.ts` - TypeORM with connection config from env vars
- `backend/src/auth/guards/jwt-auth.guard.ts` - Protects authenticated routes

**Entities:** `consumption`, `installation`, `user`, `sector`, `estrato`, `tarifa`

### Frontend Architecture (Vue 3 + Quasar)

**State Management (Pinia):**
- `stores/auth.ts` - Authentication state, persisted to localStorage
- `stores/tabs.ts` - Tab navigation state

**Offline-First Architecture:**
- `services/database/db.service.ts` - Dexie (IndexedDB) for local storage with 3 tables:
  - `installations` - Cached installation data
  - `consumptions` - Recent consumption records
  - `offlineConsumptions` - Pending sync queue with `syncStatus` field
- `services/sync/sync.service.ts` - Network-aware sync orchestrator:
  - Auto-syncs on network reconnection
  - Uses Capacitor Network API for mobile, online/offline events for web
  - Syncs views (installations + last month consumptions) and pending data

**Real-time Updates:**
- `backend/src/realtime-server.mjs` - Standalone Socket.IO server listening to PostgreSQL `NOTIFY consumo_channel`
- Transforms PostgreSQL notifications into WebSocket events for connected clients
- Frontend composables (`useConsumptionRealtime.ts`) subscribe to updates

**Routing:**
- `src/router/index.ts` - Vue Router with auth guards and dynamic tab management
- Routes automatically add tabs when navigated to (except login/dashboard)

**API Layer:**
- `src/services/api/client.ts` - Axios instance with base URL from env
- Service pattern: `auth.service.ts`, `consumption.service.ts`, `installation.service.ts`

### Database

**PostgreSQL** - Primary data store with TypeORM entities
- Must have trigger/function for `NOTIFY consumo_channel` on consumption table changes (INSERT/UPDATE/DELETE)
- Connection configured via `.env` variables

**Dexie (IndexedDB)** - Frontend local cache and offline queue

### Mobile Integration (Capacitor)

- `capacitor.config.ts` - App config with `capacitor://` scheme
- Uses Capacitor plugins:
  - `@capacitor/geolocation` - GPS coordinates for readings
  - `@capacitor/network` - Network status monitoring
- Android scheme: `capacitor://localhost` with cleartext traffic enabled

## Environment Configuration

Create `.env` in project root:

```bash
# Backend API URL (used by frontend)
VITE_API_URL=http://localhost:3030

# PostgreSQL connection
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
POSTGRES_DB=acueducto

# Realtime server port
REALTIME_PORT=3007

# Backend API port (optional, defaults to 3030)
PORT=3030
```

**Production:** Update `VITE_API_URL` and `POSTGRES_HOST` to production IPs/domains

## Key Technical Patterns

### Offline-First Flow

1. User creates consumption record offline
2. Saved to `offlineConsumptions` table with `syncStatus: 'pending'`
3. Network listener detects reconnection
4. `SyncService.syncPendingData()` posts to backend API
5. On success, record marked with `syncStatus: 'synced'`

### Real-time Updates Flow

1. Backend modifies consumption via TypeORM
2. PostgreSQL trigger fires `NOTIFY consumo_channel`
3. `realtime-server.mjs` receives notification via `pgClient.on('notification')`
4. Transforms payload (type casting, boolean conversion)
5. Emits `consumo_update` event to all connected Socket.IO clients
6. Frontend composable updates local state/UI

### Authentication Flow

1. User submits credentials to `/auth/login`
2. `LocalStrategy` validates against database
3. Returns JWT token + user object
4. Token stored in Pinia store + localStorage
5. Axios default header set: `Authorization: Bearer <token>`
6. `JwtAuthGuard` validates token on protected routes

## Important Notes

- **Dual Database Pattern:** Backend uses PostgreSQL, frontend uses Dexie. Sync layer keeps them consistent.
- **Three-Process Architecture:** Must run backend API + realtime server + frontend separately (or use `npm run start:all`)
- **CORS Configuration:** `backend/src/main.ts` has extensive origin whitelist for Capacitor/mobile development
- **TypeScript Strict Mode:** Both frontend and backend use strict TypeScript
- **No Database Migrations:** `synchronize: false` in TypeORM config - schema changes require manual SQL
- **Mobile Testing:** Use `capacitor://` URLs in CORS whitelist, not `http://localhost`

## Common Workflows

### Adding a New Entity

1. Create TypeORM entity in `backend/src/entities/`
2. Create DTOs in corresponding module `dto/` folder
3. Generate module/controller/service: `cd backend && nest g resource <name>`
4. Add module to `AppModule` imports
5. Frontend: Add TypeScript interface in `src/types/`
6. Create API service in `src/services/api/`

### Implementing Offline Support for New Data

1. Add Dexie table in `src/services/database/db.service.ts`
2. Extend `storageService` with save/retrieve methods
3. Update `SyncService.syncViews()` to include new data
4. Add sync status tracking if mutations needed

### Adding Real-time Updates for New Entity

1. Create PostgreSQL trigger/function for `NOTIFY <entity>_channel`
2. Add listener in `realtime-server.mjs`
3. Create frontend composable (pattern: `useConsumptionRealtime.ts`)
4. Subscribe in relevant component

---

## 🧠 Memoria Evolutiva (Lecciones Aprendidas)

> Esta sección documenta errores críticos, anti-patrones y correcciones aplicadas en sesiones anteriores para evitar repetirlos.

### Sesión: Módulo de Usuarios y Rediseño UI (2025-12-03)

#### ❌ Errores Críticos Cometidos

1. **ALUCINACIÓN: MD5 en lugar de bcrypt**
   - **Error**: Asumí que las contraseñas se hasheaban con MD5 y comparé usando `crypto.createHash('md5')`
   - **Realidad**: El usuario había informado explícitamente que se usa **bcrypt** con el campo `password_hash`
   - **Corrección aplicada**: Implementar `bcrypt.compare(plainPassword, passwordHash)` correctamente
   - **Lección**: NUNCA asumir algoritmos de hashing. Siempre verificar en el código existente o preguntar. La seguridad de contraseñas es crítica.

2. **Campo de autenticación incorrecto**
   - **Error**: Intenté usar campo `login` o `username` para autenticación
   - **Realidad**: La tabla `usuarios` usa el campo `email` para login
   - **Corrección aplicada**:
     - Backend: `LocalStrategy` configurado con `usernameField: 'email'`
     - Frontend: Cambiar input de `username` a `email` en LoginPage.vue
   - **Lección**: Verificar PRIMERO la estructura de la tabla antes de implementar autenticación

3. **Nombre de tabla incorrecto**
   - **Error**: Asumí que la tabla se llamaba `users` (convención inglés)
   - **Realidad**: La tabla se llama `usuarios` (español)
   - **Corrección aplicada**: `@Entity('usuarios')` en user.entity.ts
   - **Lección**: Este proyecto usa nomenclatura en ESPAÑOL para las tablas de base de datos

4. **Hashing en el frontend (ERROR DE SEGURIDAD)**
   - **Error**: El frontend estaba hasheando la contraseña con MD5 antes de enviarla al backend
   - **Realidad**: El frontend debe enviar la contraseña en **texto plano** por HTTPS, el backend se encarga del hashing
   - **Corrección aplicada**: Eliminar todo código de hashing en LoginPage.vue
   - **Lección**: NUNCA hashear contraseñas en el cliente. El hashing debe ocurrir SOLO en el servidor

5. **Campos legacy no eliminados**
   - **Error**: Dejé campos `login` y `pswd` en la entidad User que no existían en la tabla
   - **Realidad**: La tabla solo tiene `email` y `password_hash`
   - **Corrección aplicada**: Eliminar completamente campos obsoletos
   - **Lección**: Limpiar completamente código legacy, no solo comentarlo

#### 🔍 Ineficiencias en el Flujo

1. **Múltiples intentos de debug innecesarios**
   - Agregué logs extensivos antes de revisar la estructura real de la tabla
   - **Mejor práctica**: Siempre hacer `SHOW COLUMNS FROM table_name` o revisar la definición de la entidad ANTES de debuggear

2. **No consultar view_usuarios inicialmente**
   - El usuario mencionó `view_usuarios` al inicio pero implementé contra la tabla directamente
   - **Mejor práctica**: Preguntar explícitamente si se debe usar la view o la tabla base

3. **Cambios incrementales en lugar de fix completo**
   - Hice 3-4 intentos parciales (MD5 → bcrypt mal → bcrypt bien)
   - **Mejor práctica**: Cuando se detecta un error de concepto, revisar TODO el flujo de autenticación de una vez

#### ✅ Patrones Exitosos Aplicados

1. **UI/UX Moderno Consistente**
   - Patrón establecido en BancosPage/NewBancoPage y replicado exitosamente en Users
   - Componentes:
     - Gradientes: `background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
     - Border radius: 12px para inputs, 20px para cards
     - Altura estándar: 48px inputs, 52px botones
     - Transiciones: `all 0.3s ease`
     - Secciones con headers: icono + título + border-bottom
   - **Resultado**: UI profesional, moderna y consistente en múltiples módulos

2. **Toggle de vistas (Tabla/Tarjetas)**
   - Implementado con `q-btn-toggle` + `v-if="viewMode === 'table'"` / `v-else`
   - Mantiene paginación funcional en ambas vistas
   - **Resultado**: Flexibilidad para diferentes preferencias de usuario

3. **Organización de formularios en secciones lógicas**
   - Agrupación semántica con iconos descriptivos
   - Labels externos + hints en toggles
   - **Resultado**: Formularios largos más navegables y comprensibles

#### 🚫 Anti-Patrones Identificados

1. **NO asumir convenciones de otros frameworks**
   - Este proyecto usa nombres en ESPAÑOL (usuarios, no users)
   - Este proyecto usa `password_hash`, no `passwordHash` ni `password`

2. **NO implementar seguridad basándose en código frontend**
   - Vi crypto-js en el código y asumí que era para passwords
   - En realidad, crypto-js puede estar para otros propósitos (tokens, IDs, etc.)

3. **NO hacer cambios sin leer la tabla primero**
   - TypeORM entities DEBEN mapear exactamente a las columnas existentes
   - Usar `@Column({ name: 'snake_case' })` cuando sea necesario

4. **NO mezclar estrategias de password hashing**
   - O es bcrypt o es otro algoritmo, pero debe ser consistente
   - SIEMPRE usar bcrypt para nuevas implementaciones de auth

#### 📋 Checklist para Próximas Tareas de Autenticación

Antes de implementar o modificar autenticación:

- [ ] Ejecutar `SELECT * FROM [tabla] LIMIT 1` para ver estructura real
- [ ] Verificar qué campo se usa para username/email en la tabla
- [ ] Verificar nombre exacto del campo de password en la tabla
- [ ] Confirmar algoritmo de hashing usado (buscar en código existente)
- [ ] Verificar si hay views (`view_usuarios`) que deben usarse en lugar de tablas
- [ ] Confirmar si el proyecto usa nomenclatura en inglés o español
- [ ] Asegurarse que frontend NO hashea contraseñas antes de enviar

#### 📋 Checklist para Rediseños de UI

Cuando el usuario solicite "mejorar diseño" o "modernizar":

- [ ] Aplicar gradientes de fondo: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
- [ ] Border radius consistente: 12px inputs, 16-20px cards
- [ ] Altura estándar: 48px inputs, 52px botones
- [ ] Transiciones suaves: `all 0.3s ease`
- [ ] Organizar formularios en secciones con iconos + títulos
- [ ] Labels externos (fuera del input) con asterisco rojo para requeridos
- [ ] Iconos prepend en todos los inputs
- [ ] Botones con sombras: `box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3)`
- [ ] Hover effects con `transform: translateY(-2px)`
- [ ] Responsive design con breakpoint en 768px
- [ ] Si es listado: implementar toggle tabla/tarjetas

#### 🎯 Reglas de Oro para Este Proyecto

1. **Base de datos**: Nomenclatura en ESPAÑOL (usuarios, bancos, instalaciones)
2. **Contraseñas**: bcrypt en backend, texto plano desde frontend
3. **Autenticación**: Campo `email` + `password_hash`
4. **Views**: Preferir `view_*` cuando estén disponibles para consultas
5. **UI**: Mantener consistencia con el patrón moderno establecido (gradientes, sombras, border-radius)
6. **TypeORM**: `synchronize: false` - cambios de schema son manuales
7. **Rutas de API**: Siempre verificar que coincidan con el backend real

---

### Última actualización: 2025-12-03
**Próxima sesión**: Revisar esta sección ANTES de empezar cualquier tarea relacionada con autenticación o UI.
