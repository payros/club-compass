# Adventurer's Club App

A CMS app for managing an Adventurers Club — keeping track of children, parents, staff, awards, events, and club years. Built to make life easier for director staff, and open source so other Adventurer/Pathfinder Clubs can use it too!

---

## 🚀 Getting Started (Dev)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A `.env` file at the repo root (see `.env` example below)

### 1. Set up your `.env` file

Create a `.env` file at the root of the repo with the following variables:

```env
# Database
DATABASE_URL=postgresql://adv_db_user:yourpassword@postgres:5432/adv_db
POSTGRES_PASSWORD=yourpassword # DEV ONLY
POSTGRES_USER=adv_db_user # DEV ONLY
POSTGRES_DATABASE=adv_db # DEV ONLY

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Whitelisted users — comma-separated emails allowed to sign in
ALLOWED_EMAILS=you@example.com,colleague@example.com
```

### 2. Start the dev server

```bash
./dev.sh
```

That's it! This script will:
- Stop any existing containers
- Create the `my_network` Docker network (if it doesn't exist)
- Build and start the app + PostgreSQL via `docker-compose.dev.yml`

The app will be available at **http://localhost:3000**.

> **Hot reloading:** Source files in `adventurers-app/src/` are volume-mounted into the container, so your edits take effect immediately without needing to rebuild.

### 3. Sign in

The app uses **Google OAuth** for authentication. Only emails listed in `ALLOWED_EMAILS` are permitted to sign in.
Note: To get the google client ID and secret, follow the [instructions outlined by Better Auth documentation](https://better-auth.com/docs/authentication/google).

---

## 🏗️ How the App Works

### Navigation & Routing

The app has two routing contexts:

- **`/[club_year_label]/...`** — Pages scoped to a specific club year (e.g. `/2025-2026/dashboard`). Covers adventurers, classes, events, and the dashboard.
- **`/...` (root)** — Global directories not tied to a year: children, parents, staff, awards, club years, and users.

When you visit `/`, you're automatically redirected to the latest club year's dashboard. If no club years exist yet, you'll be sent to `/club-years/new` to create one.

### Core Concepts

| Concept | Description |
|---|---|
| **Club Year** | A season of the club (e.g. `2025-2026`). Most data is scoped to a club year. |
| **Children** | The club members (Adventurers). |
| **Parents** | Parents/guardians linked to children. |
| **Staff** | Club leaders and helpers. |
| **Awards** | Badges/achievements tracked per child. |
| **Events** | Meetings, field trips, or award ceremonies. |
| **Classes** | Groups or class sessions within a club year. |

### Events & Awards

Events have two modes controlled by an **Award Ceremony** flag:

- **Regular event** — When a child attends, any awards linked to the event are **added** to their record.
- **Award ceremony** — When a child attends, linked awards have their `awarded_on` date **stamped** (officially granting the patch).

### Authentication & Access

- Sign-in is handled via **Google OAuth** (powered by [Better Auth](https://www.better-auth.com/)).
- All routes are protected — unauthenticated users are redirected to `/login`.
- Access is restricted to emails listed in the `ALLOWED_EMAILS` environment variable.

---

## 🏭 Production Build

The app is meant to be built as a single docker container in production with a separate service being used for the database. 

1. Use the prod.Dockerfile for the web app. 

2. Connect to the database through the DATABASE_URL env variable.

---

## 🗄️ Database

### Dev
PostgreSQL runs in its own container and is initialized automatically on first start using scripts in `postgres/`:

1. `01-configuration.sql` — DB configuration
2. `02-schema.sql` — Table definitions
3. `03-seed-data.sql` — Required seed data
4. `04-sample-data.sql` — Optional sample data for development

### Prod
You should ran the following scripts manually to setup your database:

1. `01-configuration.sql` — DB configuration
2. `02-schema.sql` — Table definitions
3. `03-seed-data.sql` — Required seed data

Database migration support (for app updates) coming soon.
