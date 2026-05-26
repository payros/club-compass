env "dev" {
  # Desired state: DDL-only schema file used to compute migration diffs.
  src = "file://db/schema.sql"
  # Target database: localhost version of the dev DB (Atlas runs on the host, not in Docker).
  # Set ATLAS_DB_URL in your .env: postgres://user:pass@localhost:5433/dbname?search_path=adv_db&sslmode=disable
  url = getenv("ATLAS_DB_URL")
  # Scratch database Atlas uses to compute diffs. Spun up and torn down automatically.
  dev = "docker://postgres/17/atlas-dev?search_path=adv_db"
  migration {
    dir = "file://db/migrations"
  }
}

env "prod" {
  # Set ATLAS_DB_URL in GitHub Actions secrets.
  # Must include ?search_path=adv_db — e.g. postgres://user:pass@host:5432/db?search_path=adv_db&sslmode=require
  url = getenv("ATLAS_DB_URL")
  migration {
    dir             = "file://db/migrations"
    revisions_schema = "public"
  }
}
