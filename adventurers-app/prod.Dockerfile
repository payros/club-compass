# Step 1. Rebuild the source code only when needed
FROM node:20-alpine AS builder

WORKDIR /app

# Install psql for the DB reset script
RUN apk add --no-cache postgresql-client bash

# Install dependencies based on the preferred package manager
COPY adventurers-app/package.json adventurers-app/yarn.lock* adventurers-app/package-lock.json* adventurers-app/pnpm-lock.yaml* ./
# Omit --production flag for TypeScript devDependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  # Allow install without lockfile, so example works even without Node.js installed locally
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

COPY adventurers-app/src ./src
COPY adventurers-app/public ./public
COPY adventurers-app/next.config.js .
COPY adventurers-app/jsconfig.json .

# Copy DB init scripts and reset script
COPY postgres ./postgres
COPY reset-prod-db.sh ./reset-prod-db.sh
RUN chmod +x ./reset-prod-db.sh

# DATABASE_URL is needed at build time: the reset script runs during build,
# and Next.js may read it during `next build`.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Server-side vars read by Next.js / Better Auth at build time.
ARG BETTER_AUTH_SECRET
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

ARG BETTER_AUTH_URL
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# NEXT_PUBLIC_* vars are embedded into the client bundle at build time.
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}

ARG NEXT_PUBLIC_CLUB_NAME
ENV NEXT_PUBLIC_CLUB_NAME=${NEXT_PUBLIC_CLUB_NAME}

# Reset and re-initialise the production database
RUN ./reset-prod-db.sh

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else yarn build; \
  fi

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM node:20-alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Runtime environment variables are injected by Koyeb at container start —
# set them in the Koyeb dashboard under Environment Variables / Secrets.
# No ARG/ENV declarations needed here; baking secrets into the image is unsafe.

# Uncomment to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose/Koyeb will handle that
CMD node server.js
