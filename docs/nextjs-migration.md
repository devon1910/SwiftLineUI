# Next.js and Node email-worker migration runbook

## Scope and honest status

This runbook covers the bounded first slice. It is not a claim that production has been migrated.

The current repository contains:

- The React/Vite client as the existing web baseline.
- The ASP.NET Core API as the only .NET executable.
- Next App Router handlers for the two public event reads. They query the shared PostgreSQL database directly.
- A checked-in additive SQL migration for email leases.
- Node email-worker modules, a built-in SMTP adapter, and a dedicated Dockerfile.worker. The worker must not be started until the .NET API is deployed/restarted with `Workers__EmailDeliveryEnabled=false` and the email consumer is verified unregistered.

The first cutover is exactly:

1. GET /api/v1/Event/GetEvent?eventId={long}
2. GET /api/v1/Event/SearchEvents?Page={int}&Size={int}&Query={string}
3. Node email delivery for rows already written to EmailDeliveryRequests.

Authentication, all queue mutations, SignalR, organizer writes, queue management, LineManager auto-serving, AccountsCleanup, push notifications, and all other API behavior remain on .NET.

## Current code facts

The .NET route base is api/v1/[controller]/[action]. The two public event routes are:

    GET /api/v1/Event/GetEvent?eventId=123
    GET /api/v1/Event/SearchEvents?Page=1&Size=20&Query=clinic

The Next handlers are at:

    apps/swiftline-next/src/app/api/v1/Event/GetEvent/route.ts
    apps/swiftline-next/src/app/api/v1/Event/SearchEvents/route.ts

They use direct SQL against public.Events and public.AspNetUsers, map public DTO-shaped values, and return the legacy data/message/status envelope. The current scaffold also contains lowercase route aliases; those aliases are not part of this cutover and must not become the advertised contract.

The Next server configuration currently requires:

    DATABASE_URL
    DB_POOL_MAX
    DB_IDLE_TIMEOUT_MS
    DB_CONNECTION_TIMEOUT_MS
    JWT_ISSUER
    JWT_AUDIENCE
    JWT_ALGORITHM
    JWT_SECRET

Anonymous reads still load the shared configuration because optional bearer-token verification is used to calculate viewer state and canManage. A public route is not permission to omit server configuration.

The .NET API runs these hosted services in its own process:

- LineManager: queue progression and automatic serving/skipping.
- EmailDeliveryJob: polling and SMTP delivery of EmailDeliveryRequests, conditionally registered when `Workers:EmailDeliveryEnabled` is `true` (the default).
- AccountsCleanup: anonymous-account cleanup.

`Workers:EmailDeliveryEnabled` is evaluated when the API starts. Set the environment-variable form, `Workers__EmailDeliveryEnabled`, to `false` and deploy/restart the API to leave EmailDeliveryJob unregistered while keeping LineManager and AccountsCleanup active.

There is no SwiftLine.Worker project. The Node process described here is an email worker only.

## Contract gate

The Next handlers must be compared with captured .NET responses before ingress changes. Record fixtures for:

- an existing event;
- a missing event;
- an empty search;
- a populated search with pagination;
- invalid eventId, Page, Size, and Query values;
- a database or upstream failure.

Compare HTTP status, query parameter behavior, JSON field names, the data/message/status envelope, and the public DTO fields. Pay particular attention to bigint identifiers, time strings, organizer fallback, canManage, viewer queue state, and empty-page totalPages.

Do not add authentication to these reads. Do not move queue writes, organizer writes, or direct event mutation into Next as part of this slice. Do not silently rename the routes to lowercase or change the response shape to a new API version.

## Low-cost deployment topology

Use one small always-on Linux host or low-cost container host, a private PostgreSQL service, and a TLS reverse proxy:

    Internet
       |
    TLS ingress / reverse proxy
       |-- /api/v1/Event/GetEvent       -> Next.js
       |-- /api/v1/Event/SearchEvents   -> Next.js
       |-- /api/v1/* (all other paths)  -> .NET API
       +-- /queueHub (WebSocket)        -> .NET API

    Private network
       |-- PostgreSQL
       |-- .NET API, one replica
       |-- Next.js web, one or more stateless replicas as needed
       +-- Node email worker, one replica

The Next read routes and the worker share the same database as the .NET API. PostgreSQL must not be publicly reachable. If PostgreSQL is on the application host to save money, treat that as one failure domain and require encrypted off-host backups plus a successful restore test. A managed database is preferable when the cost is acceptable.

The repository does not identify the live Azure subscription, App Service name, database provider, DNS owner, or current replica count. Verify those separately before changing hosting resources. Azure package references in the .NET project are not a live-resource inventory.

The Compose example intentionally does not include an API service: this scope does not add a .NET API Dockerfile. Run the current API separately for local development or supply its existing deployment origin to the ingress.

## API and worker separation

Next.js handles the bounded public read process. Its route handlers are short-lived request handlers and are not the queue worker.

The Node email worker:

- reads only eligible rows from EmailDeliveryRequests;
- claims work in PostgreSQL;
- sends through the built-in SMTP adapter or an injected provider adapter;
- acknowledges or schedules failure only when its lease owner still matches;
- records health and structured events;
- releases owned leases on graceful shutdown;
- does not serve queue members, change event state, authenticate users, or publish SignalR messages.

The .NET API remains the producer of email rows. For example, authentication and queue-notification paths can enqueue rows while the Node process is the only delivery consumer after handoff.

## Additive email lease migration

The checked-in migration is:

    apps/swiftline-next/migrations/20260910_email_delivery_leases.sql

It adds nullable LeaseOwner, LeaseUntil, LastAttemptAt, NextAttemptAt, LastError, and DeadLetteredAt columns to public.EmailDeliveryRequests, initializes NextAttemptAt for existing rows, makes NextAttemptAt non-null with a default, and adds a partial claim index. It does not rename or remove the legacy table.

Apply it only after a backup and restore test. Treat it as a reviewed production migration, not an application-startup side effect:

    psql "$DATABASE_URL" --set=ON_ERROR_STOP=1 --file=apps/swiftline-next/migrations/20260910_email_delivery_leases.sql

The Node claim transaction uses PostgreSQL row locks with SKIP LOCKED, stamps LeaseOwner and LeaseUntil, and increments RetryCount. Mail is sent after the transaction commits. Acknowledge and failure updates include the row ID and lease owner so a stale worker cannot overwrite a newer claim.

The worker also uses a PostgreSQL advisory lock. Keep exactly one email-worker replica during this first cut. The advisory lock is a defense against duplicate leaders, not a reason to skip deployment-level replica limits. If the process crashes, an unexpired lease can delay recovery; after expiry, another worker may claim the row.

### SMTP delivery semantics

Delivery is at-least-once, not exactly-once. If an SMTP provider accepts a message and the worker dies before the acknowledgement update, the row can be retried after lease expiry. This can produce a duplicate email. A database lease cannot undo an accepted SMTP message.

If the selected mail provider supports idempotency keys, use the email row ID as the provider key and document the provider guarantee. Otherwise monitor duplicate reports, retry rate, dead-letter count, unsent-row age, and lease expiry. Do not describe this system as exactly-once.

### Disable the .NET email consumer first

The .NET EmailDeliveryJob reads rows with IsSent = false and RetryCount < 3 without considering the new lease columns. It is conditionally registered through `Workers:EmailDeliveryEnabled`, but the setting defaults to `true` for backward compatibility. The additive migration therefore does not make concurrent consumers safe while the .NET consumer is enabled.

Before Node is enabled:

1. Set `Workers__EmailDeliveryEnabled=false` on the .NET API. Do not omit the setting: the corresponding `Workers:EmailDeliveryEnabled` configuration key defaults to `true`.
2. Deploy/restart the .NET API so the startup registration check leaves EmailDeliveryJob unregistered.
3. Keep LineManager and AccountsCleanup enabled.
4. Confirm through logs and process metrics that EmailDeliveryJob is not polling.
5. Confirm that .NET continues to create new email rows.
6. Start one Node email-worker replica.

Never run the legacy .NET consumer and Node worker concurrently. The legacy query can select a row leased by Node and cause duplicate delivery.

## Worker image and mailer transport

`apps/swiftline-next/Dockerfile.worker` builds the worker and built-in SMTP adapter, then runs `worker-entrypoint.mjs`. Setting `SWIFTLINE_EMAIL_MAILER_MODULE` replaces the built-in adapter with a module exporting `createMailer()` or `default.send()`.

The worker health check reads the atomic health file written by the worker. Treat a missing or stale health file as unhealthy. A healthy worker process is not proof that SMTP is accepting messages; alert on delivery outcomes separately.

## Environment contract

### Next web process

    NODE_ENV=production
    DATABASE_URL=postgresql://...
    DB_POOL_MAX=10
    DB_IDLE_TIMEOUT_MS=30000
    DB_CONNECTION_TIMEOUT_MS=5000
    JWT_ISSUER=swiftline-api
    JWT_AUDIENCE=swiftline-web
    JWT_ALGORITHM=HS256
    JWT_SECRET=<server-only secret, at least 32 characters>
    SWIFTLINE_EVENT_TIME_ZONE=Africa/Lagos

The current public-read code does not use NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_SIGNALR_URL for its data path. Do not add those values to the client bundle unless a later UI slice needs them.

### Node email worker

Core worker settings currently accepted by the worker config include:

    DATABASE_URL
    DB_POOL_MAX
    DB_IDLE_TIMEOUT_MS
    DB_CONNECTION_TIMEOUT_MS
    EMAIL_WORKER_ID
    EMAIL_WORKER_LOCK_KEY
    EMAIL_WORKER_BATCH_SIZE
    EMAIL_WORKER_POLL_MS
    EMAIL_WORKER_STANDBY_MS
    EMAIL_WORKER_ERROR_BACKOFF_MS
    EMAIL_WORKER_LEASE_MS
    EMAIL_WORKER_HEARTBEAT_MS
    EMAIL_WORKER_MAX_ATTEMPTS
    EMAIL_WORKER_RETRY_BASE_MS
    EMAIL_WORKER_RETRY_MAX_MS
    EMAIL_WORKER_RETRY_JITTER_MS
    WORKER_HEALTH_FILE
    WORKER_HEALTH_STALE_MS
    SWIFTLINE_WORKER_MODULE
    SWIFTLINE_EMAIL_MAILER_MODULE

The built-in adapter consumes `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL`. A custom injected adapter may define additional provider variables.

### Existing .NET API

Keep these on .NET until their capabilities are deliberately migrated:

    ConnectionStrings__Database
    JWT__secret
    JWT__ValidIssuer
    JWT__ValidAudience
    Authentication__Google__ClientId
    Authentication__Google__ClientSecret
    Smtp__FromEmail
    Smtp__Host
    Smtp__Port
    Smtp__Username
    Smtp__Password
    SwiftLineBaseUrl
    Vapid_PublicKey
    Vapid_PrivateKey
    Workers__EmailDeliveryEnabled

The .NET API currently has hard-coded CORS origins. Add and verify the final Next origin before authenticated browser flows. This first cut is public reads only and does not solve CORS or SignalR migration.

## Local deployment commands

From the repository root:

    docker compose -f apps/swiftline-next/compose.example.yml up -d postgres
    docker compose -f apps/swiftline-next/compose.example.yml config

Run the current .NET API in Development to create the schema, then run the Next foundation:

    cd apps/swiftline-next
    npm.cmd ci
    npm.cmd run lint
    npm.cmd run typecheck
    npm.cmd run test
    npm.cmd run build
    npm.cmd run dev

The Next container profile is:

    docker compose -f apps/swiftline-next/compose.example.yml --profile web up --build

The email-worker profile is:

    docker compose -f apps/swiftline-next/compose.example.yml --profile email-worker up --build

Do not start the email-worker profile until the lease SQL is applied, the .NET API is deployed/restarted with `Workers__EmailDeliveryEnabled=false`, EmailDeliveryJob is verified unregistered, and SMTP/provider credentials are configured. The Compose postgres service starts an empty local database; it is not a substitute for applying the existing SwiftLine EF schema.

## Phased cutover

### Phase 0: inventory and baseline

- Record the current Vite artifact, .NET API artifact, public API origin, SignalR origin, database endpoint, SMTP provider, DNS/ingress rules, and real replica counts.
- Capture fixtures for both public GET routes.
- Record event count, active line count, UsersInQueue invariants, unsent email count, retry/dead-letter count, API errors, SignalR disconnects, and current worker logs.
- Verify a backup can be restored to an isolated PostgreSQL database.

### Phase 1: additive database migration

- Restore a production-like database into staging.
- Apply 20260910_email_delivery_leases.sql with ON_ERROR_STOP.
- Verify existing .NET reads and email-row producers.
- Verify claim, lease expiry, token-guarded acknowledgement, failure, dead-letter, and concurrent-claim behavior against PostgreSQL. An in-memory EF provider is not sufficient.
- Do not start Node yet.

### Phase 2: email consumer handoff

- Set `Workers__EmailDeliveryEnabled=false` and deploy/restart .NET; the setting is `true` by default, so an explicit `false` is required for handoff.
- Confirm EmailDeliveryJob is not registered/polling before starting Node.
- Confirm LineManager, AccountsCleanup, queue commands, Identity, organizer paths, and SignalR remain active.
- Start one Node worker with a canary mailer recipient.
- Verify worker health, advisory lock ownership, claim count, acknowledgement count, retry/dead-letter behavior, SMTP outcomes, and unsent-row age.
- Keep one API replica and one worker replica through the soak period.

### Phase 3: public event-read cutover

- Build and deploy the Next web image.
- Route only the exact Event/GetEvent and Event/SearchEvents paths to Next.
- Keep every other api/v1 path and /queueHub on .NET.
- Compare fixtures and test missing, empty, invalid, and database-error behavior.
- Keep the prior Vite artifact and .NET route available throughout the soak period.

### Phase 4: later work

Authenticated Next pages, organizer writes, queue mutations, a Node queue worker, push delivery, and a SignalR replacement each require separate contract, authorization, concurrency, observability, and rollback gates. They are not implied by this slice.

## Rollback

### Public event reads

1. Stop routing the two exact public GET paths to Next.
2. Route them back to the retained Vite/.NET path or direct .NET API.
3. Leave every protected route and /queueHub on .NET.
4. Re-run the captured fixtures and shared-link smoke tests.

This first read cutover should not require a schema rollback.

### Email worker

1. Stop Node and prevent automatic restart.
2. Wait for the configured lease duration plus the maximum SMTP timeout, or reconcile active leases.
3. Inspect rows that might have been accepted by SMTP but not acknowledged. Accept the possibility of duplicates.
4. Set `Workers__EmailDeliveryEnabled=true` (or remove the override to use the default) and deploy/restart the .NET API to re-register EmailDeliveryJob only after Node is stopped and the handoff is recorded.
5. Keep the additive lease columns. Do not run a down migration during an incident.

The configuration switch is a precondition for enabling Node; never improvise a rollback by running both consumers concurrently.

### Database

Do not use an EF down migration as the default incident rollback. Stop writers, take an incident backup, assess data loss, and restore a verified backup only under an explicit recovery decision. The lease change is additive so application rollback should not require schema rollback.

## PostgreSQL backup and migration gates

Backups contain identity, queue, and email data. Store them encrypted with restricted access and a retention policy.

Before each production schema change:

1. Take the provider snapshot or verify the point-in-time recovery marker.
2. Take a custom-format logical dump:

       pg_dump --format=custom --no-owner --no-acl --file=swiftline-precutover.dump "$DATABASE_URL"
       pg_restore --list swiftline-precutover.dump

3. Restore it into an isolated database with pg_restore --exit-on-error --no-owner.
4. Compare counts and invariants for Events, active Lines, AspNetUsers, and unsent EmailDeliveryRequests.
5. Record the backup identifier, checksum, restore target, operator, and time.

For self-hosted PostgreSQL, use encrypted off-host copies and WAL/PITR when the chosen RPO requires it. For managed PostgreSQL, verify the provider retention policy instead of assuming it.

The current API applies EF migrations automatically only in Development. Apply existing production EF migrations as a reviewed one-off operation, using the actual secret-store connection:

    dotnet ef database update --project services/swiftline/Infrastructure/Infrastructure.csproj --startup-project services/swiftline/SwiftLine.API/SwiftLine.API.csproj --context SwiftLineDatabaseContext --connection "$DATABASE_URL"

Apply the email lease SQL separately as described above, unless it is first converted into the reviewed EF migration stream. Run both against the restore clone first. Require additive/backward-compatible changes while the Vite/.NET rollback release remains live.

The current API also invokes DbSeeder.SeedData(app) during startup in every environment. That seeder contains a default-admin path for an empty database. Do not point a fresh production database at the current API without separately reviewing that behavior and its credentials.

## Final acceptance

- [ ] The exact two public event GET routes match captured .NET fixtures.
- [ ] The Next web image builds from a lockfile and passes its lint, typecheck, test, and build gates.
- [ ] The additive lease SQL has been restored-tested and applied.
- [ ] .NET was deployed/restarted with `Workers__EmailDeliveryEnabled=false`, and EmailDeliveryJob is verified unregistered/stopped before Node starts.
- [ ] The selected SMTP/provider adapter is configured and its delivery behavior is monitored.
- [ ] PostgreSQL claim, acknowledgement, failure, expiry, retry, dead-letter, and concurrent-claim tests pass.
- [ ] At-least-once SMTP semantics and duplicate risk are documented.
- [ ] One API replica and one Node email-worker replica are enforced.
- [ ] Identity, queue mutations, organizer writes, SignalR, LineManager, cleanup, and push remain on .NET.
- [ ] WebSocket upgrade works for /queueHub.
- [ ] Backup restore and migration dry-run gates pass.
- [ ] Vite/.NET artifacts and ingress rollback rules are retained.
