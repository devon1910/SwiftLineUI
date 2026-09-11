# SwiftLine Next.js and email-worker slice

## Status

This directory contains the bounded first-slice implementation foundation. It is not a production cutover:

- Next.js exposes the exact legacy public event GET paths and reads the shared PostgreSQL schema directly.
- The email worker claims rows from EmailDeliveryRequests using PostgreSQL leases and an advisory leader lock.
- The email worker ships with an SMTP adapter; a provider-specific module may be injected when stronger delivery semantics are available.
- The .NET API remains the owner of Identity, queue mutations, organizer writes, SignalR, push notifications, LineManager, AccountsCleanup, email-row creation, and schema migrations.
- The .NET EmailDeliveryJob is conditionally registered through `Workers:EmailDeliveryEnabled` and defaults to enabled (`true`). Before the Node worker starts, deploy/restart .NET with `Workers__EmailDeliveryEnabled=false` and verify that email polling has stopped.

## Files and processes

- Dockerfile builds the Next.js web process and uses the `/api/health` liveness and `/api/health/ready` readiness checks.
- Dockerfile.worker is the existing separate worker image template. It runs worker-entrypoint.mjs and checks the worker health file.
- compose.example.yml starts local PostgreSQL and provides opt-in web and email-worker profiles.
- migrations/20260910_email_delivery_leases.sql is additive and must be applied after a backup/restore gate.

The worker image uses the built-in SMTP adapter by default. `SWIFTLINE_EMAIL_MAILER_MODULE` may point to a module exporting `createMailer()` or `default.send()` to replace it.

## Exact public routes

    GET /api/v1/Event/GetEvent?eventId={long}
    GET /api/v1/Event/SearchEvents?Page={int}&Size={int}&Query={string}

These are the only routes in the first cut. Preserve their casing, query parameters, HTTP status behavior, JSON field names, and data/message/status envelope. The lowercase route aliases in the scaffold are not part of the release surface.

## Local PostgreSQL

From the repository root:

    docker compose -f apps/swiftline-next/compose.example.yml up -d postgres
    docker compose -f apps/swiftline-next/compose.example.yml ps

The defaults are development-only:

    host: localhost
    port: 5432
    database: swiftline
    user: swiftline
    password: local-development-only

The Compose database starts empty. Run the current ASP.NET Core API in Development against it so the existing EF migration hook creates the SwiftLine schema. Do not use that startup migration behavior as a production deployment procedure.

## Run the Next web foundation

From this directory:

    Copy-Item .env.example .env.local
    npm.cmd ci
    npm.cmd run lint
    npm.cmd run typecheck
    npm.cmd run test
    npm.cmd run build
    npm.cmd run dev

The Next server requires DATABASE_URL, DB pool settings, and the current JWT issuer/audience/algorithm/secret contract. The JWT secret is server-only and must be at least 32 characters. SWIFTLINE_EVENT_TIME_ZONE defaults to Africa/Lagos for event-hour calculations.

To build/run the web container after the local package and source checks pass:

    docker build -t swiftline-next:local .
    docker compose -f compose.example.yml --profile web up --build

The web image is stateless apart from its database reads. It does not own queue commands or SignalR.

## Run the email worker

Apply the lease migration only after taking and restoring a PostgreSQL backup:

    psql "$DATABASE_URL" --set=ON_ERROR_STOP=1 --file=migrations/20260910_email_delivery_leases.sql

Before starting Node, set `Workers__EmailDeliveryEnabled=false` on the .NET API, deploy/restart it, and verify that EmailDeliveryJob is not registered/polling. The corresponding `Workers:EmailDeliveryEnabled` setting defaults to `true`, so do not rely on omission. This leaves queue progression and account cleanup enabled.

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM_EMAIL`, and optional SMTP credentials, then:

    docker compose -f compose.example.yml --profile email-worker up --build

The core worker configuration accepts `EMAIL_WORKER_*` values for batch size, polling, leases, heartbeats, retries, advisory-lock key, and health freshness. The built-in adapter consumes `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL`, plus the optional positive-millisecond `SMTP_CONNECTION_TIMEOUT_MS` and `SMTP_SEND_TIMEOUT_MS` settings. They default to 15 seconds for TCP/SMTP greeting and 60 seconds for the complete send. A send timeout closes the active Nodemailer transport and is recorded through the existing retry/dead-letter path; it does not change queue semantics. SMTP can still accept a message immediately before a process failure or timeout, so delivery remains at-least-once and duplicates remain possible. Compose defaults are local placeholders, not production credentials.

Run one email-worker replica in the first cut. The advisory lock and row lease protect against stale/concurrent claims, but SMTP remains at-least-once: a crash after provider acceptance and before acknowledgement can produce a duplicate.

## Deployment topology

    TLS ingress
       |-- exact public Event GET routes -> Next web
       |-- all other /api/v1 routes   -> .NET API
       +-- /queueHub WebSocket         -> .NET API

    Private PostgreSQL
       |-- .NET API, one replica while hosted loops remain there
       |-- Next web
       +-- Node email worker, one replica

The Compose example omits the .NET API because this scope does not add a .NET Dockerfile. Keep PostgreSQL private, forward WebSocket upgrades for /queueHub, and retain the existing Vite/.NET deployment for rollback.

See ../../docs/nextjs-migration.md for backup, migration, cutover, worker handoff, SignalR, and rollback gates.
