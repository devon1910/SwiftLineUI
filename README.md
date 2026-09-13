# theSwiftLine

theSwiftLine is a virtual queue platform for attendees and event organisers. Create an event, share it, let people join the line, and manage the queue from one responsive web app.

## Highlights

- Search active events, view event details, capacity, location, and opening hours.
- Create, edit, delete, pause, and manage organiser-owned events.
- Join, monitor, and leave queues with position and wait-time polling.
- Support anonymous joining with an individual revocable session — never a shared anonymous password.
- Serve attendees and manage active/past members from the organiser dashboard.
- Password signup with one-time email verification, secure ASP.NET Identity-compatible hashes, and rotating refresh sessions.
- Password login/logout, installable PWA support, and a consistent dark interface.
- Immediate SMTP verification delivery after signup, backed by a PostgreSQL outbox with leases, bounded retries, and a free GitHub Actions recovery trigger.

## Production architecture

The React/Vite UI runs on Vercel at `https://www.theswiftline.com`. Its `/api/next/*` requests are rewritten to the Next.js API at `https://swiftline-olive.vercel.app`, which connects directly to Neon PostgreSQL.

    Browser -> Vite UI (Vercel) -> Next.js API (Vercel) -> Neon PostgreSQL
                                                  -> SMTP provider
    Signup -> immediate protected email batch -> Neon outbox
    GitHub Actions (at :07, :22, :37, :52) -> retry email batch -> Neon outbox

`services/swiftline/` is the legacy .NET implementation retained as a database/behaviour reference; it is not required by the active Vercel + Neon path.

## Repository map

- `src/` — React/Vite application.
- `apps/swiftline-next/` — Next API, auth, queue/event commands, migrations, and outbox processor.
- `.github/workflows/email-outbox.yml` — scheduled email delivery.
- `services/swiftline/` — legacy .NET reference.

## Local development

Set server values in `apps/swiftline-next/.env.local` from `.env.example`, then:

    cd apps/swiftline-next
    npm.cmd ci
    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run dev

In a second terminal, run the Vite UI from the repository root with `VITE_NEXT_API_URL=http://localhost:3000/api/v1/`.

## Production configuration

Vercel project `swiftline` requires `DATABASE_URL`, JWT values, `SWIFTLINE_APP_URL`, Google OAuth credentials, SMTP values, and `CRON_SECRET`. Add the same `CRON_SECRET` as a GitHub Actions secret. Never expose secrets with a `VITE_*` or `NEXT_PUBLIC_*` name.

Verification mail is attempted during signup so users do not wait for a scheduler. The committed outbox row remains available when SMTP is temporarily unavailable, and `.github/workflows/email-outbox.yml` retries pending messages four times per hour. A successful signup is therefore not rolled back solely because the mail provider is temporarily down.

To diagnose delivery, inspect `EmailDeliveryRequests` without exposing recipients: `IsSent = false` with `RetryCount = 0` means the row is waiting to be claimed; a non-empty `LastError` records a provider failure; and `DeadLetteredAt` marks a row that exhausted bounded retries. Also check the “Process SwiftLine email outbox” GitHub Actions workflow and the `/api/internal/email/process` runtime logs in the Vercel `swiftline` project.

## Checks

    cd apps/swiftline-next
    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run build

    cd ../..
    npm.cmd run build

## Optional remaining legacy work

Google OAuth browser handoff, feedback, push notifications, WordChain, automatic queue advancement, and account cleanup remain unfinished migration work.
