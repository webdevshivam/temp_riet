# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack education management system ("EduTrack") built with React (client), Express (server), and MongoDB (database). The application provides government dashboard analytics, school management, student/teacher tracking, attendance verification (with face recognition), blockchain-based result verification, anonymous complaints, scholarship evaluation, and online courses.

## Development Commands

### Running the Application
- **Development mode**: `npm run dev` - Starts the server with tsx in development mode (includes Vite dev server for client)
- **Production build**: `npm run build` - Builds both client (Vite) and server (esbuild) to `dist/`
- **Production start**: `npm start` - Runs the production build from `dist/index.cjs`
- **Type checking**: `npm run check` - Runs TypeScript compiler in check mode (no emit)

### Environment Variables
- `PORT` - Server port (default: 3000, Replit uses 5000)
- `HOST` - Server host (default: localhost)
- `MONGODB_URI` - MongoDB connection string (default embedded in `server/db.ts`)
- `MONGODB_DB` - Database name (default: `riet`)
- `SESSION_SECRET` - Express session secret (default: `dev-secret`)

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
- `server/index.ts` - Express app setup, middleware (sessions via memorystore), and HTTP server
- `server/routes.ts` - API route handlers, `requireGov` auth middleware, and database seeding logic
- `server/db.ts` - Mongoose connection and all Mongoose schema definitions (User, School, Student, Teacher, Attendance, Complaint, Course, BlockchainResult, ScholarshipRule)
- `server/storage.ts` - Data access layer implementing `IStorage` interface via `DatabaseStorage` class
- `server/services/face-recognition.ts` - Face comparison service (simplified pixel-based, not production-ready)
- `server/vite.ts` - Vite middleware for development mode
- `server/static.ts` - Static file serving for production

**Development vs Production:**
- Development: Uses Vite middleware for HMR (`server/vite.ts`)
- Production: Serves pre-built static files from `dist/public/` (`server/static.ts`)

**Authentication:**
- Session-based auth using `express-session` with `memorystore`
- Login auto-creates users if username doesn't exist (for demo/testing)
- `requireGov` middleware in `server/routes.ts` guards admin-only endpoints (user management, reports export)
- Sessions stored in `req.session.userId`; cookie max-age is 7 days

**Database:**
- MongoDB via Mongoose
- Auto-incrementing integer IDs (not ObjectIds) for all entities — `nextId()` helper in `storage.ts`
- `cleanDoc()` / `cleanDocs()` helpers strip `_id` and `__v` from Mongoose results
- Connection is lazy — `connectToDatabase()` called at start of every storage method

**Data Models:**
User, School, Student, Teacher, Attendance, Complaint, Course, BlockchainResult, ScholarshipRule

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
- Session-based auth via `useAuth()` hook (`client/src/hooks/use-auth.ts`)
- Roles: `gov_admin`, `school_admin`, `teacher`, `student`
- `ProtectedRoute` component redirects unauthenticated users to `/login`
- Sidebar and dashboard page adapt based on user role
- Login has mock fallback for demo if backend is unavailable

### API Contract System

The `shared/routes.ts` file defines a type-safe API contract:
- Each endpoint specifies method, path, input schema, and response schemas
- Example usage: `api.schools.create.path`, `api.schools.create.input.parse()`
- Both client and server import from this single source of truth
- Zod schemas provide runtime validation and TypeScript types
- `buildUrl()` helper replaces `:param` placeholders in paths
- `apiRequest()` in `client/src/lib/queryClient.ts` is the standard mutation helper; queries use TanStack Query's `queryKey` as the fetch URL

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
- Automatic seeding runs on server startup if database is empty (checks `schools.length === 0`)
- Seed data includes: 1 school (Springfield High), 3 users (admin/teacher/student, all password: `password`), 1 teacher, 1 student, 1 complaint, 1 course, 1 blockchain result
- Located in `server/routes.ts` in `seedDatabase()` function
- ScholarshipRule also has lazy-init defaults (minMarks: 85, minAttendance: 90) created on first access

### Error Handling
- Server: Express error middleware catches all errors
- Client: React Query handles API errors
- All API responses return JSON

### Logging
- Custom `log()` function in `server/index.ts`
- Logs all API requests with method, path, status, duration, and response body
- Format: `HH:MM:SS AM/PM [express] MESSAGE`

## Testing

No test framework is currently configured. `tsconfig.json` already excludes `**/*.test.ts` files.
