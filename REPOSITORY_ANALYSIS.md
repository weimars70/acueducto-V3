# Repository Analysis: Acueducto V3

## Executive Summary

**Acueducto V3** is a comprehensive water utility management system designed for meter reading, billing, inventory management, and payroll processing. The application is built as a hybrid mobile/web solution with offline-first capabilities, real-time synchronization, and multi-tenant support.

**Project Type:** Full-stack enterprise application  
**Primary Use Case:** Water utility operations management  
**Deployment:** Web application + Android mobile app  
**Architecture:** Monorepo with separate frontend and backend

---

## Technology Stack

### Frontend
- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **UI Framework:** Quasar Framework 2.14.6
- **State Management:** Pinia 2.1.7 with persistence plugin
- **Routing:** Vue Router 4.3.0
- **Build Tool:** Vite 5.4.2
- **TypeScript:** 5.5.3 (strict mode)
- **Offline Storage:** Dexie 3.2.4 (IndexedDB wrapper)
- **HTTP Client:** Axios 1.6.7
- **Real-time:** Socket.IO Client 4.7.4
- **PDF Generation:** jsPDF 3.0.4, jsPDF-AutoTable 5.0.2
- **Excel:** XLSX 0.18.5

### Backend
- **Framework:** NestJS 10.0.0
- **Database ORM:** TypeORM 0.3.20
- **Database:** PostgreSQL (via `pg` 8.14.0)
- **Authentication:** JWT with Passport.js (local & JWT strategies)
- **Password Hashing:** bcrypt 6.0.0
- **API Documentation:** Swagger/OpenAPI (@nestjs/swagger)
- **Real-time Server:** Standalone Socket.IO server (realtime-server.mjs)
- **PDF Generation:** PDFKit 0.13.0
- **Validation:** class-validator, class-transformer

### Mobile
- **Platform:** Capacitor 6.0.0
- **Target:** Android (native app)
- **Plugins:**
  - `@capacitor/geolocation` - GPS coordinates for meter readings
  - `@capacitor/network` - Network status monitoring

### Development Tools
- **Package Manager:** npm/yarn
- **Concurrent Execution:** concurrently 9.1.2
- **Linting:** ESLint with TypeScript support
- **Code Formatting:** Prettier

---

## Architecture Overview

### Monorepo Structure

```
acueducto-V3/
├── src/                    # Vue 3 Frontend
│   ├── pages/             # 99 page components
│   ├── components/        # Reusable Vue components
│   ├── services/          # API services & offline storage
│   ├── stores/            # Pinia stores (auth, tabs)
│   ├── router/            # Vue Router configuration
│   ├── types/             # TypeScript type definitions
│   └── composables/       # Vue composables
├── backend/src/           # NestJS Backend
│   ├── entities/          # 33 TypeORM entities
│   ├── [module]/          # Feature modules (40+ modules)
│   ├── database/          # Database configuration
│   ├── auth/              # Authentication module
│   └── realtime-server.mjs # Standalone WebSocket server
├── android/               # Capacitor Android project
├── database-migrations/   # SQL migration scripts
└── assets/                # App icons and splash screens
```

### Three-Process Architecture

1. **Backend API Server** (Port 3006)
   - NestJS REST API
   - JWT authentication
   - Swagger documentation at `/api`
   - PostgreSQL connection via TypeORM

2. **Realtime Server** (Port 3007)
   - Standalone Socket.IO server
   - Listens to PostgreSQL `NOTIFY` events
   - Broadcasts updates to connected clients

3. **Frontend Dev Server** (Port 5175)
   - Vite development server
   - Hot module replacement
   - Proxies API requests to backend

---

## Core Business Modules

### 1. Meter Reading & Consumption (`consumo`)
- **Purpose:** Record water meter readings with GPS coordinates
- **Features:**
  - Offline-first data capture
  - Geolocation tracking
  - Monthly consumption calculation
  - Billing status tracking (`facturada`)
- **Entity:** `Consumption` (consumo table)
- **Key Fields:** lectura, consumo, fecha, latitud, longitud, facturada

### 2. Customer Management (`clientes`)
- **Purpose:** Manage water utility customers
- **Features:**
  - Multi-identification types (tipo-ident)
  - Person/business classification (tipo-persona)
  - Tax regime management (tipo-regimen)
  - Sector assignment
  - Contact information
- **Entity:** `Cliente` (clientes table)
- **Related:** terceros (third parties), ciudades, sectores

### 3. Inventory Management
- **Modules:**
  - `items` - Inventory items/products
  - `items-grupos` - Item groups/categories
  - `movimientos-inventario` - Inventory movements
  - `salidas` - Inventory exits/dispensing
  - `ajustes-inventario` - Inventory adjustments
  - `tipos-ajuste-inventario` - Adjustment types
  - `tipo-movimiento-item` - Movement types
- **Purpose:** Track inventory, purchases, and stock adjustments

### 4. Purchasing (`compras`)
- **Purpose:** Manage supplier purchases
- **Entity:** `Compra` (compras table)
- **Related:** terceros (suppliers), items

### 5. Billing & Tariffs
- **Modules:**
  - `tarifas` - Tariff master data
  - `estratos` - Socioeconomic strata
  - `estratos-tipo` - Strata types
  - `estratos-tarifas` - Strata-specific tariffs
  - `conceptos-factura` - Invoice line items
  - `impuestos` - Taxes
  - `diferidos` - Deferred payments
- **Purpose:** Calculate bills based on consumption, strata, and tariffs

### 6. Payroll (`nomina`)
- **Modules:**
  - `empleados` - Employees
  - `periodos-nomina` - Payroll periods
  - `conceptos-nomina` - Payroll concepts (deductions, additions)
- **Purpose:** Employee payroll processing
- **Status:** Implementation in progress (see PROPUESTA-NOMINA.md)

### 7. Master Data Management
- **Cities:** `ciudades`
- **Sectors:** `sectores`
- **Banks:** `bancos`
- **Cost Centers:** `centro-costos`
- **Meter Brands:** `marcas-medidor`
- **Professions:** `profesiones`
- **Years:** `years`
- **Third Parties:** `terceros` (suppliers, customers, vendors)

### 8. User & Access Control
- **Users:** `users` (usuarios table)
- **Authentication:** JWT-based with bcrypt password hashing
- **Multi-tenant:** `empresa_id` scoping
- **Roles:** Role-based access control (role entity)

---

## Database Architecture

### Database System
- **Type:** PostgreSQL
- **ORM:** TypeORM (synchronize: false - manual migrations)
- **Connection:** Environment-based configuration
- **Real-time:** PostgreSQL `NOTIFY`/`LISTEN` for change notifications

### Key Entities (33 total)

**Core Business:**
- `consumption` (consumo) - Meter readings
- `installation` (instalaciones) - Meter installations
- `cliente` (clientes) - Customers
- `tercero` (terceros) - Third parties

**Inventory:**
- `item` (items) - Inventory items
- `item-grupo` (items_grupos) - Item groups
- `ajuste-inventario` (ajustes_inventario) - Inventory adjustments
- `salida` (salidas) - Inventory exits
- `compra` (compras) - Purchases

**Billing:**
- `tarifa` (tarifas) - Tariffs
- `estrato` (estratos) - Strata
- `concepto-factura` (conceptos_factura) - Invoice concepts
- `impuesto` (impuestos) - Taxes
- `diferido` (diferidos) - Deferred payments

**Master Data:**
- `ciudad` (ciudades) - Cities
- `sector` (sectores) - Sectors
- `banco` (bancos) - Banks
- `centro-costos` (centro_costos) - Cost centers
- `marca-medidor` (marcas_medidor) - Meter brands
- `profesion` (profesiones) - Professions
- `year` (years) - Years

**Configuration:**
- `tipo-ident` (tipo_ident) - ID types
- `tipo-impuesto` (tipo_impuesto) - Tax types
- `tipo-persona` (tipo_persona) - Person types
- `tipo-regimen` (tipo_regimen) - Tax regime types
- `tipo-movimiento-item` (tipo_movimiento_item) - Movement types
- `tipo-ajuste-inventario` (tipos_ajuste_inventario) - Adjustment types

**System:**
- `user` (usuarios) - Users
- `role` (roles) - Roles
- `empresa` (empresas) - Companies (multi-tenant)
- `user-empresa` (user_empresa) - User-company associations

**Payroll:**
- `empleado` (empleados) - Employees
- `periodo-nomina` (periodos_nomina) - Payroll periods
- `concepto-nomina` (conceptos_nomina) - Payroll concepts

### Database Naming Convention
- **Tables:** Spanish names (snake_case)
- **Entities:** TypeScript classes (PascalCase)
- **Columns:** snake_case in database, camelCase in entities
- **Primary Keys:** `codigo` (number) or `id` (number)

---

## Frontend Architecture

### State Management (Pinia)

**Auth Store** (`stores/auth.ts`)
- User session management
- JWT token storage (localStorage)
- Authentication state
- Multi-company support

**Tabs Store** (`stores/tabs.ts`)
- Dynamic tab navigation
- Tab persistence
- Route-based tab management

### Offline-First Architecture

**Dexie Database** (`services/database/db.service.ts`)
- **Tables:**
  - `installations` - Cached installation data
  - `consumptions` - Recent consumption records
  - `offlineConsumptions` - Pending sync queue

**Sync Service** (`services/sync/sync.service.ts`)
- Network-aware synchronization
- Auto-sync on reconnection
- Pending data queue management
- View synchronization (installations + consumptions)

### Real-time Updates

**Composables:**
- `useConsumptionRealtime.ts` - Real-time consumption updates
- Socket.IO client integration
- Automatic UI updates on data changes

### Routing

**Router Configuration** (`router/index.ts`)
- 50+ routes organized hierarchically
- Auth guards
- Dynamic tab management
- Route-based menu items

**Key Routes:**
- `/login` - Authentication
- `/dashboard` - Main dashboard
- `/consumptions` - Meter readings
- `/clientes` - Customer management
- `/items` - Inventory
- `/compras` - Purchases
- `/ajustes-inventario` - Inventory adjustments
- `/empleados` - Employees
- `/periodos-nomina` - Payroll periods

### UI Components

**Framework:** Quasar Framework
- Material Design components
- Responsive layout system
- Form components
- Data tables
- Dialogs and notifications

**Design Patterns:**
- Modern gradient backgrounds
- Consistent border-radius (12px inputs, 20px cards)
- Standard heights (48px inputs, 52px buttons)
- Smooth transitions
- Icon-based navigation
- Toggle views (table/cards)

---

## Backend Architecture

### Module Structure

Each feature module follows NestJS conventions:
```
[module]/
├── [module].module.ts      # Module definition
├── [module].controller.ts  # REST endpoints
├── [module].service.ts     # Business logic
└── dto/
    ├── create-[module].dto.ts
    └── update-[module].dto.ts
```

### Authentication & Authorization

**Auth Module** (`auth/`)
- **Strategies:**
  - `LocalStrategy` - Email/password login
  - `JwtStrategy` - JWT token validation
- **Guards:**
  - `JwtAuthGuard` - Protects authenticated routes
  - `LocalAuthGuard` - Login endpoint protection
- **Password Security:** bcrypt hashing (backend only)

**Key Implementation Notes:**
- Login uses `email` field (not username)
- Password stored as `password_hash` in database
- Frontend sends plain password (hashed in backend)
- JWT expires in 8 hours
- Multi-company support via `empresa_id`

### API Structure

**Base URL:** `/api` (Swagger documentation)

**Endpoints Pattern:**
- `GET /[module]` - List all (with pagination/filters)
- `GET /[module]/:id` - Get by ID
- `POST /[module]` - Create new
- `PATCH /[module]/:id` - Update
- `DELETE /[module]/:id` - Delete

**Special Endpoints:**
- `POST /auth/login` - Authentication
- `GET /auth/profile` - Current user profile
- `POST /pdf/generate` - PDF generation
- `GET /consumo/view` - Consumption views
- `POST /sync/sync-data` - Data synchronization

### Real-time Server

**File:** `backend/src/realtime-server.mjs`

**Functionality:**
- Connects to PostgreSQL
- Listens to `NOTIFY` events on `consumo_channel`
- Transforms PostgreSQL notifications to Socket.IO events
- Broadcasts to all connected clients
- Type casting and data transformation

**Events:**
- `consumo_update` - Consumption record changes
- Connection/disconnection handling

---

## Mobile App (Capacitor)

### Configuration

**File:** `capacitor.config.ts`
- App ID: `com.weimar.acueductos`
- App Name: `weimar-acueductos`
- Web Dir: `dist`
- Scheme: `capacitor://localhost`
- Cleartext traffic enabled for development

### Android Project

**Location:** `android/`
- Gradle-based build system
- Capacitor integration
- Native Android configuration

### Build Process

```bash
npm run build              # Build web assets
npx cap sync android       # Sync to Android project
npx cap open android       # Open in Android Studio
```

### Mobile Features

- **Geolocation:** GPS coordinates for meter readings
- **Network Status:** Offline detection
- **Native Navigation:** Capacitor scheme URLs
- **Offline Storage:** IndexedDB via Dexie

---

## Development Workflow

### Environment Setup

**Required Environment Variables:**
```bash
# Frontend
VITE_API_URL=http://localhost:3006

# Backend
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
POSTGRES_DB=acueducto
PORT=3006
REALTIME_PORT=3007
JWT_SECRET=your_secret_key
```

### Running the Application

**All Services:**
```bash
npm run start:all
```

**Individual Services:**
```bash
npm run backend    # Backend API (port 3006)
npm run realtime   # Real-time server (port 3007)
npm run dev        # Frontend (port 5175)
```

### Development Commands

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

**Backend:**
- `cd backend && npm run start:dev` - Development with hot reload
- `cd backend && npm run build` - Compile TypeScript
- `cd backend && npm run start:prod` - Production mode
- `cd backend && npm run lint` - Lint code
- `cd backend && npm test` - Run tests

**Mobile:**
- `npm run build` - Build web assets
- `npx cap sync android` - Sync to Android
- `npx cap open android` - Open Android Studio

---

## Key Features

### 1. Offline-First Meter Reading
- Capture readings without internet connection
- GPS coordinates automatically recorded
- Automatic sync when connection restored
- Conflict resolution for concurrent edits

### 2. Real-time Updates
- WebSocket-based real-time synchronization
- Automatic UI updates on data changes
- PostgreSQL trigger-based notifications
- Multi-client synchronization

### 3. Multi-tenant Support
- Company-based data isolation (`empresa_id`)
- User-company associations
- Company-specific configurations

### 4. Comprehensive Inventory Management
- Item master data
- Purchase management
- Inventory movements tracking
- Stock adjustments
- Exit/dispensing records

### 5. Billing System
- Tariff management
- Strata-based pricing
- Invoice concept management
- Tax calculations
- Deferred payment tracking

### 6. Payroll Module (In Progress)
- Employee management
- Payroll period management
- Payroll concept configuration
- Calculation engine (planned)

### 7. PDF Generation
- Invoice generation
- Report generation
- PDFKit-based rendering

### 8. Data Export
- Excel export functionality
- XLSX library integration
- Custom export configurations

---

## Code Quality & Patterns

### TypeScript Usage
- **Strict Mode:** Enabled
- **Type Safety:** Full type coverage
- **Interfaces:** Defined in `src/types/`
- **DTOs:** Class-validator for request validation

### Code Organization
- **Modular Architecture:** Feature-based modules
- **Separation of Concerns:** Clear service/controller separation
- **Reusability:** Shared components and composables
- **Consistency:** Standardized patterns across modules

### Error Handling
- Try-catch blocks in async operations
- Error logging to console
- User-friendly error messages
- API error response handling

### Security
- JWT authentication
- bcrypt password hashing
- CORS configuration
- Route guards
- Input validation (class-validator)

---

## Areas for Improvement

### 1. Testing
- **Current State:** Test infrastructure exists but limited coverage
- **Recommendation:** 
  - Unit tests for services
  - Integration tests for API endpoints
  - E2E tests for critical flows
  - Frontend component tests

### 2. Database Migrations
- **Current State:** Manual SQL scripts, `synchronize: false`
- **Recommendation:**
  - Implement TypeORM migrations
  - Version-controlled schema changes
  - Migration rollback support

### 3. Error Handling
- **Current State:** Basic error handling
- **Recommendation:**
  - Centralized error handling
  - Structured error responses
  - Error logging service
  - User-friendly error messages

### 4. Documentation
- **Current State:** Basic README and CLAUDE.md
- **Recommendation:**
  - API documentation (Swagger is set up)
  - Component documentation
  - Architecture diagrams
  - Deployment guides

### 5. Performance
- **Current State:** No obvious performance issues
- **Recommendation:**
  - Database query optimization
  - Caching strategy
  - Pagination improvements
  - Lazy loading for large datasets

### 6. Security Enhancements
- **Current State:** Basic security implemented
- **Recommendation:**
  - Rate limiting
  - Input sanitization
  - SQL injection prevention (TypeORM helps)
  - XSS protection
  - HTTPS enforcement

### 7. Monitoring & Logging
- **Current State:** Console logging
- **Recommendation:**
  - Structured logging (Winston, Pino)
  - Error tracking (Sentry)
  - Performance monitoring
  - Analytics integration

### 8. CI/CD
- **Current State:** Manual deployment
- **Recommendation:**
  - Automated testing pipeline
  - Build automation
  - Deployment automation
  - Environment management

---

## Project Statistics

### Codebase Size
- **Frontend Pages:** 99 Vue components
- **Backend Modules:** 40+ NestJS modules
- **Entities:** 33 TypeORM entities
- **API Services:** 47 frontend service files
- **Routes:** 50+ frontend routes

### Technology Versions
- Vue 3.4.38
- NestJS 10.0.0
- TypeORM 0.3.20
- Quasar 2.14.6
- TypeScript 5.5.3
- Capacitor 6.0.0

### Dependencies
- **Frontend:** 44 dependencies, 13 dev dependencies
- **Backend:** 24 dependencies, 15 dev dependencies

---

## Known Issues & Technical Debt

### 1. Duplicate Routes
- `/tarifas` route defined twice in router (lines 80, 84)
- `/tipo-persona` route defined twice (lines 302, 472)

### 2. Database Synchronization
- `synchronize: false` requires manual migrations
- No migration system in place
- Schema changes require manual SQL

### 3. CORS Configuration
- Extensive origin whitelist (development)
- Should be environment-based for production
- Some hardcoded IPs in main.ts

### 4. Environment Variables
- No `.env.example` file
- Environment configuration not documented
- Some defaults in code

### 5. Type Safety
- Some `any` types may exist
- Optional chaining could be improved
- Null checks needed in some areas

---

## Business Logic Highlights

### Meter Reading Flow
1. User navigates to consumption page
2. Selects installation (meter)
3. Enters reading with GPS coordinates
4. System calculates consumption (current - previous)
5. Data saved locally (offline) or to server
6. Real-time update broadcast to all clients
7. Marked for billing when processed

### Inventory Adjustment Flow
1. User creates adjustment record
2. Selects adjustment type
3. Enters item and quantity
4. System updates inventory levels
5. Adjustment history tracked
6. Multiple items supported (multiple adjustment page)

### Billing Calculation
1. Consumption record created
2. Customer's strata determined
3. Strata-specific tariff applied
4. Additional concepts added (taxes, fees)
5. Deferred payments applied if applicable
6. Invoice generated (PDF)
7. Status updated to `facturada: true`

---

## Conclusion

**Acueducto V3** is a well-structured, feature-rich water utility management system with:

✅ **Strengths:**
- Modern tech stack (Vue 3, NestJS, TypeScript)
- Offline-first architecture
- Real-time synchronization
- Comprehensive business modules
- Mobile app support
- Multi-tenant architecture

⚠️ **Areas for Growth:**
- Testing coverage
- Database migration system
- Enhanced error handling
- Performance optimization
- Security hardening
- CI/CD pipeline

The codebase demonstrates good architectural patterns, clear separation of concerns, and a solid foundation for continued development. The offline-first approach and real-time capabilities make it suitable for field operations in areas with unreliable connectivity.

---

**Analysis Date:** 2025-01-27  
**Repository Version:** V3  
**Analysis Scope:** Complete codebase review

