# Target your exact production database version
FROM postgres:17-alpine

# Only run the one-time configuration script on container init.
# Schema and seed data are managed by Atlas migrations (see db/migrations/).
COPY 01-configuration.sql /docker-entrypoint-initdb.d/
