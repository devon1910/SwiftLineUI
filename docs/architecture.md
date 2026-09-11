# SwiftLine bounded migration architecture

## Current state

The repository currently has three relevant runtime slices:

1. The React/Vite client in src/.
2. The ASP.NET Core API in services/swiftline/SwiftLine.API/.
3. A Next.js and Node foundation in apps/swiftline-next/.

The .NET solution has no SwiftLine.Worker executable. Program.cs registers LineManager and AccountsCleanup as hosted services inside the API and conditionally registers EmailDeliveryJob when `Workers:EmailDeliveryEnabled` is `true`; that setting defaults to `true`. The API also owns Identity, queue commands, organizer operations, SignalR, push notifications, email-row production, and EF Core migrations. The Next and worker code is not a production cutover by itself.

## First-cut topology

The first cut is public event reads plus email delivery only:

    Internet
       |
    TLS ingress / reverse proxy
       |-- /api/v1/Event/GetEvent       -> Next.js route -> PostgreSQL
       |-- /api/v1/Event/SearchEvents   -> Next.js route -> PostgreSQL
       |-- /api/v1/* (all other routes) -> ASP.NET Core API
       +-- /queueHub (WebSocket)        -> ASP.NET Core API

    Private network
       |-- PostgreSQL (shared system of record)
       |-- ASP.NET Core API, one replica
       |-- Next.js web process
       +-- Node email worker, one replica

This is a provider-neutral, low-cost shape for one small host or low-cost container host with a private PostgreSQL service. A managed database is preferred where its backup/PITR policy is affordable. A same-host database is a single failure domain and is acceptable only with encrypted off-host backups and a tested restore.

The current Next handlers read PostgreSQL directly. They are not a proxy to the .NET API and must therefore be tested against the same schema and public response fixtures before cutover. The current web foundation exposes a liveness/readiness route at /api/health and /api/health/ready.

## Ownership boundary

| Capability | First-cut owner | Notes |
| --- | --- | --- |
| GET /api/v1/Event/GetEvent?eventId= | Next.js | Exact legacy path and Result envelope; public DTO-shaped read from shared PostgreSQL |
| GET /api/v1/Event/SearchEvents?Page=&Size=&Query= | Next.js | Exact legacy path, pagination parameters, and public search shape |
| Identity, JWT, refresh/revocation, Google login, verification, Turnstile | .NET API | No Next auth cutover |
| Queue join, exit, serve, pause/resume, queue info, and organizer queue management | .NET API and SignalR | No queue mutation is in the first slice |
| Organizer event create/edit/delete | .NET API | No organizer write cutover |
| SignalR /queueHub and push notifications | .NET API | The ingress must forward WebSocket upgrades |
| LineManager auto-serving/skipping | .NET API | Still a hosted loop inside the API |
| AccountsCleanup | .NET API | Still a hosted loop inside the API |
| Email-row creation | .NET API | Node consumes delivery rows only |
| Email delivery | Node email worker after handoff | Set `Workers__EmailDeliveryEnabled=false` and deploy/restart .NET first; the `Workers:EmailDeliveryEnabled` setting defaults to `true` |
| Database schema and migration history | .NET/Infrastructure | The Next lease SQL is additive and operator-applied |

The lowercase Next route aliases in the current scaffold are not part of the first-cut public contract. Do not route or advertise them as replacements for the exact legacy-cased Event routes.

## Single-worker safety

The Node email worker claims rows from public.EmailDeliveryRequests using PostgreSQL row leases and an advisory leader lock. The lease migration adds LeaseOwner, LeaseUntil, LastAttemptAt, NextAttemptAt, LastError, and DeadLetteredAt plus a claim index. The lock and leases are defenses, not permission to scale the worker casually.

Run exactly one email-worker replica during the first cut. Keep the API at one replica too, because the current hosted loops would otherwise run more than once and the notifier stores user connections in an in-process dictionary. If the worker is later scaled, prove advisory-lock failover, lease expiry, graceful shutdown, and duplicate-send handling with PostgreSQL integration tests first.

SMTP is at-least-once. A process crash after provider acceptance and before the acknowledgement update can send the same message again. A lease prevents concurrent claims but cannot provide exactly-once SMTP.

## Realtime gap

The existing browser client connects to the .NET /queueHub endpoint and supplies its JWT as the SignalR access token. The first Next slice keeps that endpoint on .NET. Next.js route handlers and the Node email worker do not replace SignalR. Do not add API replicas until a supported SignalR backplane or managed SignalR service is selected and tested.

## Environment separation

The current Next server-side read foundation consumes DATABASE_URL, DB_POOL_MAX, DB_IDLE_TIMEOUT_MS, DB_CONNECTION_TIMEOUT_MS, JWT_ISSUER, JWT_AUDIENCE, JWT_ALGORITHM, JWT_SECRET, and optional SWIFTLINE_EVENT_TIME_ZONE. The worker consumes only database, EMAIL_WORKER_*, SMTP/provider, module override, and health settings; it does not receive the JWT secret.

The .NET API continues to own ConnectionStrings__Database, JWT__secret, JWT__ValidIssuer, JWT__ValidAudience, Authentication__Google__ClientId, Authentication__Google__ClientSecret, Smtp__FromEmail, Smtp__Host, Smtp__Port, Smtp__Username, Smtp__Password, SwiftLineBaseUrl, Vapid_PublicKey, Vapid_PrivateKey, and `Workers__EmailDeliveryEnabled`. Set the worker switch explicitly to `false` for the Node handoff; if omitted, it defaults to `true`. Do not expose any of these through a client bundle.

The existing .NET CORS policy contains hard-coded localhost and current-site origins. The final Next origin must be added and tested before authenticated browser flows; this documentation does not claim that it is already configured.

## Production gates

- Exact public event GET fixtures match the .NET behavior for found, missing, empty, invalid, and error cases.
- The additive email lease SQL has been applied to a restored staging copy and existing .NET email-row producers still work.
- .NET is deployed/restarted with `Workers__EmailDeliveryEnabled=false`, and EmailDeliveryJob is verified unregistered/stopped before Node is enabled.
- One API replica and one email-worker replica are enforced.
- PostgreSQL backup restore, migration, lease-claim, and concurrency tests pass.
- WebSocket upgrade works through ingress for /queueHub.
- The prior Vite artifact, .NET API deployment, ingress rules, and database recovery path remain available for rollback.
