# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

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
npm run backend        # NestJS backend on port 3006
npm run realtime       # Socket.IO realtime server on port 3007
npm run dev            # Vue frontend on port 5174
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
VITE_API_URL=http://localhost:3006

# PostgreSQL connection
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
POSTGRES_DB=acueducto

# Realtime server port
REALTIME_PORT=3007

# Backend API port (optional, defaults to 3006)
PORT=3006
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
