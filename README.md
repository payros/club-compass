# Club Compass - An Adventurers Club app for Directors and Staff

A CMS app for managing your club — keeping track of children, parents, staff, awards, events, and club years. Built to make life easier for director staff, and open source so other Adventurer/Pathfinder Clubs can use it too!

---

## 🚀 Getting Started (Dev)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Google OAuth setup (instructions below)
- A `.env` file at the repo root (see `.env` example below)

### 1. Set up your `.env` file

Create a `.env` file at the root of the repo with the following variables:

```env
# Database (container-to-container URL used by the Next.js app)
DATABASE_URL=postgresql://adv_db_user:yourpassword@postgres:5432/adv_db
POSTGRES_PASSWORD=yourpassword # DEV ONLY
POSTGRES_USER=adv_db_user # DEV ONLY
POSTGRES_DATABASE=adv_db # DEV ONLY

# Atlas migration URL (host-to-container, used by the Atlas CLI on your machine)
ATLAS_DB_URL=postgres://adv_db_user:yourpassword@localhost:5433/adv_db?search_path=adv_db&sslmode=disable

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Whitelisted users — comma-separated emails allowed to sign in
ALLOWED_EMAILS=you@example.com,colleague@example.com

# Club display name
NEXT_PUBLIC_CLUB_NAME=Your Club Name

# Cloudflare R2 image storage (optional — omit to use local disk in dev)
# R2_ENDPOINT is the S3-compatible API URL from your R2 bucket settings, including the bucket name
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com/<bucket-name>
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
```

### 2. Install Atlas CLI

```bash
curl -sSf https://atlasgo.sh | sh
```

### 3. Start the dev server

```bash
# Start without sample data (normal usage)
./dev.sh

# Start with sample data pre-loaded (first time setup, or after a reset)
./dev.sh --sample-data
# Short form:
./dev.sh -s
```

That's it! This script will:
- Stop any existing containers
- Create the `my_network` Docker network (if it doesn't exist)
- Build and start the app + PostgreSQL via `docker-compose.dev.yml`
- Wait for PostgreSQL to be ready
- Apply all pending Atlas migrations (schema + seed data)
- Optionally load dev sample data (with `--sample-data`)
- Follow container logs (Ctrl+C detaches; containers keep running)

> **Hot reloading:** Source files in `club-compass/src/` are volume-mounted into the container, so your edits take effect immediately without needing to rebuild.

> **Stopping containers:** Ctrl+C detaches from logs but leaves containers running. Run `docker compose -f docker-compose.dev.yml down` to stop them, or just run `./dev.sh` again (it kills all containers at the start).

### 4. Sign in

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

### File Storage

Files such as award patch images and other documents can be stored either on local disk (dev default) or in **Cloudflare R2** (recommended for production).

**How it works:**
- The database stores a storage key (e.g. `awards/42/patch.webp`), never a public URL.
- When the API returns an award, the server generates a short-lived **presigned URL** (1 hour) that the browser uses to load the image directly from R2. The bucket stays private.
- In development with no R2 credentials set, images are written to `public/img/patches/` and served as static files.

**Setting up Cloudflare R2:**

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and go to **R2 Object Storage**.
2. Click **Create bucket** and give it a name (e.g. `club-compass-app`). Leave it **private** (do not enable public access).
3. Inside the bucket, go to **Settings → S3 API** and copy the **S3 API endpoint** (format: `https://<account_id>.r2.cloudflarestorage.com`).
4. Go to **R2 → Manage R2 API Tokens** (top-right of the R2 overview page) and create a new API token with **Object Read & Write** permissions scoped to your bucket.
5. Copy the **Access Key ID** and **Secret Access Key** shown — they are only displayed once.
6. Add the following to your `.env` (append the bucket name to the endpoint):

```env
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com/<bucket-name>
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
```

When these variables are present, R2 is used automatically. Remove or leave them unset to fall back to local disk.

---

## 🏭 Production Build

The app is meant to be built as a single docker container in production with a separate service being used for the database. 

1. Use the prod.Dockerfile for the web app. 

2. Connect to the database through the DATABASE_URL env variable.

---

## 🗄️ Database

Schema and migrations are managed by [Atlas](https://atlasgo.io/). All changes go through versioned migration files committed to git.

### File layout

| Path | Purpose |
|---|---|
| `postgres/01-configuration.sql` | One-time DB setup (schema, user, grants). Runs on Docker init only. |
| `db/schema.sql` | DDL-only desired state. Atlas diffs this to generate new migrations. |
| `db/sample-data.sql` | Dev-only data. Applied with `./dev.sh --sample-data`. Never runs in prod. |
| `db/migrations/` | Versioned migration files managed by Atlas. Committed to git. |
| `atlas.hcl` | Atlas environment config (dev + prod). |

### Dev

PostgreSQL runs in its own Docker container. On every `./dev.sh` run the volume is wiped and Atlas reapplies all migrations from scratch, giving you a clean database every time.

### Prod

Migrations are applied automatically to production by the GitHub Actions workflow (`.github/workflows/migrate.yml`) on every push to `main`. The workflow uses the `ATLAS_DB_URL` repository secret.

**One-time prod database setup:** When provisioning a new production database, run `postgres/01-configuration.sql` manually against it once (e.g. via `psql`). After that, GitHub Actions handles everything.

The `ATLAS_DB_URL` secret must include the schema in the connection string:
```
postgres://user:pass@host:5432/dbname?search_path=adv_db&sslmode=require
```

---

## 🔄 Making Database Changes

### Schema change (add a column, new table, etc.)

1. Edit `db/schema.sql` to reflect the desired end state
2. Generate the migration: `atlas migrate diff <descriptive_name> --env dev`
3. Review the generated file in `db/migrations/`
4. Check for safety issues: `atlas migrate lint --env dev --latest 1`
5. Apply locally: `atlas migrate apply --env dev` (or `./dev.sh` for a full reset)
6. Commit both `db/schema.sql` **and** the new migration file
7. Push to `main` — GitHub Actions applies the migration to production automatically

### Seed data change (new awards, lookup data, etc.)

1. Create a blank migration file: `atlas migrate new add_<descriptive_name> --env dev`
2. Write your `INSERT` statements in the generated file
3. Check for safety issues: `atlas migrate lint --env dev --latest 1`
4. Apply locally: `atlas migrate apply --env dev`
5. Commit the new migration file and push to `main`
