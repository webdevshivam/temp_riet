# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack education management system built with React (client), Express (server), and MongoDB (database). The application provides government dashboard analytics, school management, student/teacher tracking, attendance verification (with face recognition), blockchain-based result verification, anonymous complaints, and online courses.

## Development Commands

### Running the Application
- **Development mode**: `npm run dev` - Starts the server with tsx in development mode (includes Vite dev server for client)
- **Production build**: `npm run build` - Builds both client (Vite) and server (esbuild) to `dist/`
- **Production start**: `npm start` - Runs the production build from `dist/index.cjs`
- **Type checking**: `npm run check` - Runs TypeScript compiler in check mode (no emit)

### Port Configuration
- Default port: 3000 (configurable via `PORT` environment variable)
- Replit deployment: Port 5000 (configured in `.replit`)

## Architecture

### Monorepo Structure
The codebase uses a monorepo pattern with three main directories:

1. **`client/`** - React SPA built with Vite
   - Entry point: `client/index.html` → `client/src/main.tsx` → `client/src/App.tsx`
   - Path alias: `@/*` maps to `client/src/*`
   - Build output: `dist/public/`

2. **`server/`** - Express API server
   - Entry point: `server/index.ts`
   - Build output: `dist/index.cjs` (CommonJS bundle with minification)

3. **`shared/`** - Shared code between client and server
   - `shared/schema.ts` - Zod schemas and TypeScript types
   - `shared/routes.ts` - API route definitions with type-safe contracts
   - Path alias: `@shared/*` maps to `shared/*`

### Server Architecture

**Core files:**
- `server/index.ts` - Express app setup, middleware, and HTTP server
- `server/routes.ts` - API route handlers and database seeding logic
- `server/db.ts` - Mongoose connection and schema definitions
- `server/storage.ts` - Data access layer implementing `IStorage` interface
- `server/vite.ts` - Vite middleware for development mode
- `server/static.ts` - Static file serving for production

**Development vs Production:**
- Development: Uses Vite middleware for HMR (`server/vite.ts`)
- Production: Serves pre-built static files from `dist/public/` (`server/static.ts`)

**Database:**
- MongoDB via Mongoose
- Auto-incrementing integer IDs (not ObjectIds) for all entities
- Connection managed by `connectToDatabase()` in `server/db.ts`
- Default connection string embedded in `server/db.ts` (override with `MONGODB_URI` env var)
- Database name: `riet` (override with `MONGODB_DB` env var)

**Data Models:**
User, School, Student, Teacher, Attendance, Complaint, Course, BlockchainResult

### Client Architecture

**Routing:**
- Uses `wouter` for client-side routing (not React Router)
- Routes defined in `client/src/App.tsx`

**State Management:**
- TanStack Query (React Query) for server state
- Query client configured in `client/src/lib/queryClient.ts`
- Custom `apiRequest` helper for mutations with automatic error handling
- Query options: no refetch on window focus, no retries, stale time infinity

**UI:**
- Radix UI component primitives (dialogs, dropdowns, etc.)
- Tailwind CSS with custom configuration
- shadcn/ui-style component patterns in `client/src/components/ui/`
- Layout components in `client/src/components/layout/`
- Pages in `client/src/pages/`

**Key pages:**
- GovDashboard - Analytics overview
- SchoolsList - School management
- FaceVerification - Attendance with face recognition
- BlockchainVerify - Result verification
- Complaints - Anonymous complaint system
- Courses - Online course catalog

**Role-based UI:**
- Simple role state (no full authentication implemented in client)
- Roles: `gov_admin`, `school_admin`, `teacher`, `student`
- Sidebar component adapts based on role

### API Contract System

The `shared/routes.ts` file defines a type-safe API contract:
- Each endpoint specifies method, path, input schema, and response schemas
- Example usage: `api.schools.create.path`, `api.schools.create.input.parse()`
- Both client and server import from this single source of truth
- Zod schemas provide runtime validation and TypeScript types

### Build System

**Client build (Vite):**
- Processes `client/` directory as root
- TypeScript + React with Fast Refresh
- Outputs to `dist/public/`
- Configured in `vite.config.ts`

**Server build (esbuild):**
- Bundles `server/index.ts` to single CommonJS file
- Bundles allowlisted dependencies (mongoose, express, etc.) for faster cold starts
- Externalizes other dependencies
- Minifies in production
- Configured in `script/build.ts`

## Important Conventions

### Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### TypeScript Configuration
- Strict mode enabled
- Module resolution: bundler
- No emit (handled by build tools)
- Shared tsconfig for client, server, and shared code

### Database Seeding
- Automatic seeding runs on server startup if database is empty
- Seed data includes default users (admin/password, teacher/password, student/password)
- Located in `server/routes.ts` in `seedDatabase()` function

### Error Handling
- Server: Express error middleware catches all errors
- Client: React Query handles API errors
- All API responses return JSON

### Logging
- Custom `log()` function in `server/index.ts`
- Logs all API requests with method, path, status, duration, and response body
- Format: `HH:MM:SS AM/PM [express] MESSAGE`

## Testing

No test framework is currently configured. When adding tests, update `tsconfig.json` to exclude test files.

## MongoDB Connection

The application expects MongoDB to be available. Connection details:
- Default URI embedded in `server/db.ts` (MongoDB Atlas cluster)
- Override with `MONGODB_URI` environment variable
- Database name: `riet` (override with `MONGODB_DB`)
- Connection is lazy - only connects when first database operation occurs
