# SwiftLine target architecture

## Decision

SwiftLine is maintained in one repository but deployed as three processes:

1. The React web application serves public, attendee, and organizer experiences.
2. The ASP.NET Core API owns authentication, queue commands, queries, and SignalR.
3. The .NET Worker owns queue progression, email delivery, and anonymous-account cleanup.

PostgreSQL remains the system of record. The API and worker share the existing Domain, Application, and Infrastructure projects.

The worker must remain continuously available and must not be implemented as a request-scoped or serverless web function. Until distributed coordination is implemented, exactly one worker replica may run.

## Runtime topology

```text
Browser / installable web app
          |
          +---- HTTPS ---- ASP.NET Core API ---- PostgreSQL
          |                    |
          +-- WebSocket -------+---- SignalR
                               |
                         .NET Worker
                         |    |     |
                       queue email cleanup
```

The first production deployment may keep the existing Azure App Service for the API. The worker can run as a continuous WebJob or an independently hosted worker with a minimum of one replica. Horizontal API scaling requires Azure SignalR Service or another supported backplane. Horizontal worker scaling additionally requires distributed leases or atomic row claiming.

## Migration gates

### Gate 1: contract and authorization

- Every frontend endpoint matches the OpenAPI contract.
- Queue mutations derive identity from authenticated claims.
- Organizer mutations verify event ownership.
- Shared event and queue-management URLs survive a page reload.

### Gate 2: queue integrity

- Concurrent joins cannot exceed capacity or create duplicate active memberships.
- Serve and leave transitions are idempotent and transactional.
- New timestamps are stored as UTC.
- Worker retries cannot double-send or double-serve work.

### Gate 3: attendee vertical slice

- A user can open a shared event link, authenticate or join anonymously when permitted, enter the queue, reconnect, receive position updates, and leave or be served.
- Loading, empty, offline, reconnecting, paused, and error states are explicit and accessible.

### Gate 4: organizer vertical slice

- An organizer can create an event with all current backend settings, manage its live queue, and view analytics.
- Unauthorized users cannot inspect or mutate another organizer's queue.

### Gate 5: production cutover

- Database backup and explicit migration procedure are tested.
- API, worker, database, and SignalR health are observable.
- Critical attendee and organizer journeys pass automated browser tests.
- The previous deployment remains available for rollback during cutover.

## Contract strategy

The ASP.NET Core OpenAPI document is authoritative. The web application should consume a generated TypeScript client rather than manually composing endpoint URLs or reading unvalidated response shapes. Breaking API changes require a versioned contract or a compatibility period.

## Deferred decisions

- Whether to migrate the web runtime from Vite to Next.js after the stabilized attendee slice.
- Whether Azure SignalR Service is needed at current connection volume.
- Whether PostgreSQL row claiming is sufficient for outbound email and push delivery or a dedicated message broker is warranted.
