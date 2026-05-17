# Copilot Instructions — Adventurers Club App

## Project Overview

A Next.js 14 (App Router) CMS for managing an Adventurers Club: children, parents, staff, awards, events, and club years. Runs fully containerized via Docker Compose (Next.js + PostgreSQL).

## Dev Workflow

- **Start dev environment:** run `./dev.sh` from the repo root (kills existing containers, creates `my_network`, builds and starts `docker-compose.dev.yml`).
- **Source files are volume-mounted** (`adventurers-app/src` → `/app/src`), so edits take effect without rebuilding.
- **Env vars** live in `.env` at repo root and are injected into the container via `docker-compose.dev.yml`.
- **Production build:** `./prod.sh` (multi-stage) or `./prod-without-multistage.sh`.

## Architecture

### Two-Context Routing

- **`/[club_year_label]/...`** — club-year-scoped pages (adventurers, classes, events, dashboard). The dynamic segment is always the club year label (e.g. `2025-2026`).
- **`/...` (root)** — global directories (children, parents, staff, awards, club-years, users) with no year context.
- **Root `/`** redirects to the latest club year's dashboard, or `/club-years/new` if none exist.

### Page → View Pattern

Every route has a `page.jsx` (Server Component, minimal) and a `view.jsx` (`"use client"` component with all the UI). Pages simply render `<View />`.

### Data Flow

```
Client (view.jsx)
  → hook (useXxx.js)  ← fetches from API, transforms data, handles loading state
    → /api/xxx/route.js  ← thin Next.js route handler
      → xxxService.js  ← SQL queries via `postgres.js` (tagged-template `sql\`...\``)
        → PostgreSQL (adv_db schema)
```

- Hooks transform snake_case DB fields to camelCase and handle display formatting (e.g. `fromSnakeCaseToTitleCase`, `fromDateOfBirthToAge`).
- Resource detail views (e.g. `children/[id]/view.jsx`) fetch directly with `useEffect` + `fetch()` instead of a dedicated hook.

### UI Components

Three reusable page-level templates in `src/components/pages/`:

- **`CollectionPage`** — table list of a resource (title, description, `headers`, `data`, `badge`, `onRowClick`).
- **`ResourcePage`** — detail view: info card (`fields`) + related `relatedCards` (TableCard arrays).
- **`DashboardPage`** — grid of multiple `TableCard`s with optional `extraContent`.

All wrap `PageLayout` → `AppHeader` + `Breadcrumbs`, and `PageTransition` for animation.

UI library is **Chakra UI v3** (`@chakra-ui/react`). Custom theme is in `src/lib/theme.js`.

### Events & Awards Business Logic

Events have an `award_ceremony` boolean flag that controls two distinct behaviors:

- **Regular event** (`award_ceremony = false`): When a child attends the event, any awards associated with the event are **added as new award records** for that child.
- **Award ceremony** (`award_ceremony = true`): When a child attends, the awards associated with the event have their **`awarded_on` timestamp updated** (i.e., the award is officially granted on that date) for each attending child.

This distinction is central to the awards tracking flow — always check `award_ceremony` before writing award-related service logic.

> Note: Role-based access control is not yet implemented but is planned. All authenticated + whitelisted users currently have full access.

### Authentication

- **Better Auth** with Google OAuth. Server config: `src/lib/auth.js`; client helper: `src/lib/auth-client.js`.
- Middleware (`src/middleware.js`) guards all routes except `/login`, `/api/auth/**`, `/img/`.
- Email whitelist enforced via `ALLOWED_EMAILS` env var (comma-separated). Logic in `src/utils/authUtils.js`.

### Database

- PostgreSQL in `adv_db` schema. Init scripts: `postgres/01-configuration.sql` → `02-schema.sql` → `03-seed-data.sql` → `04-sample-data.sql`.
- All services import `sql` from `src/lib/postgres.js` and use tagged-template literals for queries.

## Key Conventions

- **Services** export a plain object of async functions (e.g. `const awardsService = { list, getById }`).
- **Hooks** return `{ data, loading }` and handle all fetch + transform logic; views should not contain raw `fetch` calls unless it's a detail/resource page with multiple parallel fetches.
- **API routes** are thin: call one service method, return `NextResponse.json(result)`.
- **Path alias:** `@/` maps to `adventurers-app/src/` (configured in `jsconfig.json`).
- **Breadcrumbs** are built in the view and passed down through page templates.
