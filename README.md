# SwiftLine

SwiftLine is a virtual queue-management product for attendees and event organizers.

The production web client is React/Vite on Vercel. Its API requests are rewritten to a Next.js service on Vercel, which uses the shared Neon PostgreSQL database. The former ASP.NET Core API is retained in the repository only as a compatibility reference while the remaining external integrations are migrated.

## Repository state

- src/ is the current React/Vite web client.
- services/swiftline/ is the legacy .NET implementation and database-history reference; it is not needed to run the Vercel production path.
- apps/swiftline-next/ is the Next.js API: public event reads, password login/refresh/logout, organizer event management, queue commands, anonymous queue sessions, and polling queue views.
- apps/swiftline-next/Dockerfile is the Next web image template. apps/swiftline-next/Dockerfile.worker builds the separate worker image.
- The worker includes a built-in SMTP mailer by default and supports an optional provider module through `SWIFTLINE_EMAIL_MAILER_MODULE`.
- `vercel.json` rewrites `/api/next/*` from the Vite project to `https://swiftline-olive.vercel.app/api/*`, so the browser has a same-origin API path.

## Production architecture

The active Next API routes include the legacy public event reads:

    GET /api/v1/Event/GetEvent?eventId={id}
    GET /api/v1/Event/SearchEvents?Page={page}&Size={size}&Query={query}

It also owns authenticated organizer event CRUD, queue joins/leaves/serving/pause, and polling queue reads. Anonymous-enabled queues receive a newly generated anonymous Identity user plus rotating database session; no shared anonymous password is used. The Vite UI polls every 15 seconds while visible instead of depending on SignalR.

The repository has an email outbox worker implementation, but it is deliberately not run by Vercel because Vercel functions are request-bound. Email signup/verification and Google OAuth remain the only user-facing flows that require external provider credentials before their .NET endpoints can be retired.

See docs/architecture.md for ownership and docs/nextjs-migration.md for the cutover runbook.

## Prerequisites

- Node.js and npm.
- .NET 9 SDK.
- Docker Desktop with Compose, or PostgreSQL plus the PostgreSQL client tools.
- pg_dump, pg_restore, and psql for backup and migration gates.

Never commit production credentials. Next server and worker database, JWT, and SMTP values are server-only. Do not put them in NEXT_PUBLIC_* variables.

## Run locally

Set `DATABASE_URL` to a populated PostgreSQL/Neon database and configure the matching JWT values in `.env`. Start both applications:

    cd apps\swiftline-next

    npm.cmd ci
    npm.cmd run test
    npm.cmd run build
    npm.cmd run dev

In a second terminal, run the Vite UI from the repository root with `VITE_NEXT_API_URL=http://localhost:3000/api/v1/`.

The email worker is a separate process, not a Next request handler. Its image is built from Dockerfile.worker and starts through worker-entrypoint.mjs. It uses the built-in SMTP adapter by default; `SWIFTLINE_EMAIL_MAILER_MODULE` is only needed when replacing it with a compatible module exporting `createMailer()` or `default.send()`.

## Verification

    npm.cmd run lint
    npm.cmd run build

    dotnet build services\swiftline\SwiftLine.sln --no-restore
    dotnet test services\swiftline\SwiftLine.sln --no-build

    git diff --check

For Vercel, configure `DATABASE_URL`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ALGORITHM`, `JWT_SECRET`, `TURNSTILE_SECRET_KEY`, and `VITE_NEXT_API_URL=https://www.theswiftline.com/api/next/v1/` (on the Vite project). Do not put server secrets in `VITE_*` variables.
