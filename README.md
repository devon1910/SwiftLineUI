# SwiftLine

theSwiftLine is a virtual queue-management product for attendees and event organizers.

The repository is in a bounded migration. The existing React/Vite client and ASP.NET Core API remain the production baseline. The Next.js service now contains a public-event-read foundation and an email-worker foundation, but neither has been cut over in production.

## Repository state

- src/ is the current React/Vite web client.
- services/swiftline/SwiftLine.API/ is the only executable project in the .NET solution. It exposes the REST API and the /queueHub SignalR hub.
- services/swiftline/Infrastructure/BackgroundServices/ contains the current LineManager, EmailDeliveryJob, and AccountsCleanup loops. LineManager and AccountsCleanup run inside the API process; EmailDeliveryJob is conditionally registered there through `Workers:EmailDeliveryEnabled`, which defaults to `true`. There is no SwiftLine.Worker project in the solution.
- services/swiftline/Infrastructure/ owns the EF Core PostgreSQL context and migrations.
- apps/swiftline-next/ contains the Next.js App Router foundation, direct PostgreSQL public-event reads, the additive email lease SQL, and Node email-worker code.
- apps/swiftline-next/Dockerfile is the Next web image template. apps/swiftline-next/Dockerfile.worker builds the separate worker image.
- The worker includes a built-in SMTP mailer by default and supports an optional provider module through `SWIFTLINE_EMAIL_MAILER_MODULE`.
- vercel.json is the current Vite SPA rewrite. It is not evidence that the Next.js service is deployed.

## Bounded first slice

Only these anonymous legacy public event GET contracts are eligible for the first web cutover:

    GET /api/v1/Event/GetEvent?eventId={id}
    GET /api/v1/Event/SearchEvents?Page={page}&Size={size}&Query={query}

The current Next handlers read the shared PostgreSQL schema directly and return the legacy Result envelope with public DTO-shaped data. Their route and schema compatibility must be proven against .NET fixtures before ingress changes.

The only worker responsibility in this slice is delivery of rows from EmailDeliveryRequests. Identity, JWT and refresh/revocation, all queue mutations, organizer writes and queue management, SignalR, push notifications, LineManager auto-serving, AccountsCleanup, event/email-row production, and PostgreSQL ownership remain on .NET. Before enabling Node, explicitly set `Workers__EmailDeliveryEnabled=false` on the .NET API and deploy/restart it; the corresponding `Workers:EmailDeliveryEnabled` setting defaults to `true` when omitted.

See docs/architecture.md for ownership and docs/nextjs-migration.md for the cutover runbook.

## Prerequisites

- Node.js and npm.
- .NET 9 SDK.
- Docker Desktop with Compose, or PostgreSQL plus the PostgreSQL client tools.
- pg_dump, pg_restore, and psql for backup and migration gates.

Never commit production credentials. Next server and worker database, JWT, and SMTP values are server-only. Do not put them in NEXT_PUBLIC_* variables.

## Run the current API and Vite client

Start a local PostgreSQL container. This creates an empty database; run the current .NET API in Development first so its existing development migration hook can create the schema.

    docker compose -f apps\swiftline-next\compose.example.yml up -d postgres

The checked-in root .env.example still uses port 5000. The current .NET launch profile listens on http://localhost:5267, so use:

    VITE_API_URL=http://localhost:5267/api/v1/
    VITE_API_SIGNALR_URL=http://localhost:5267/

Then:

    npm.cmd install
    npm.cmd run dev

For a local API using the Compose database, provide the required settings before starting .NET. The Google and SMTP values below are placeholders and do not provide working external login or email delivery.

    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ConnectionStrings__Database = "Host=localhost;Port=5432;Database=swiftline;Username=swiftline;Password=local-development-only"
    $env:JWT__secret = "local-only-secret-at-least-32-characters"
    $env:JWT__ValidIssuer = "swiftline-api"
    $env:JWT__ValidAudience = "swiftline-web"
    $env:Authentication__Google__ClientId = "local-placeholder"
    $env:Authentication__Google__ClientSecret = "local-placeholder"
    $env:Smtp__FromEmail = "noreply@example.test"
    $env:Smtp__Host = "localhost"
    $env:Smtp__Port = "1025"
    $env:Smtp__Username = "local"
    $env:Smtp__Password = "local"
    $env:SwiftLineBaseUrl = "http://localhost:5173/"

    dotnet run --project services\swiftline\SwiftLine.API --launch-profile http

## Run the Next foundation locally

The Next service needs the same populated PostgreSQL schema. From apps/swiftline-next:

    npm.cmd ci
    npm.cmd run lint
    npm.cmd run typecheck
    npm.cmd run test
    npm.cmd run build
    npm.cmd run dev

Copy apps/swiftline-next/.env.example to a local environment file and replace the database and JWT placeholders. The Next public-read routes require DATABASE_URL and the JWT contract even when a request is anonymous because optional-token verification loads the shared configuration.

The email worker is a separate process, not a Next request handler. Its image is built from Dockerfile.worker and starts through worker-entrypoint.mjs. It uses the built-in SMTP adapter by default; `SWIFTLINE_EMAIL_MAILER_MODULE` is only needed when replacing it with a compatible module exporting `createMailer()` or `default.send()`.

## Verification

    npm.cmd run lint
    npm.cmd run build

    dotnet build services\swiftline\SwiftLine.sln --no-restore
    dotnet test services\swiftline\SwiftLine.sln --no-build

    git diff --check

The deployment, backup, lease handoff, SignalR gap, and rollback gates are documented in docs/nextjs-migration.md.
