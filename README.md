# theSwiftLine

theSwiftLine is a virtual queue platform for attendees and event organisers. Create an event, share it, let people join the line, and manage the queue from one responsive web app.

## Highlights

- Search active events, view event details, capacity, location, and opening hours.
- Create, edit, delete, pause, and manage organiser-owned events.
- Join, monitor, and leave queues with position and wait-time polling.
- Support anonymous joining with an individual revocable session — never a shared anonymous password.
- Serve attendees and manage active/past members from the organiser dashboard.
- Password signup with Turnstile, one-time email verification, secure ASP.NET Identity-compatible hashes, and rotating refresh sessions.
- Password login/logout, PWA support, and light/dark UI.
- SMTP email outbox with PostgreSQL leases/retries and a free GitHub Actions delivery trigger.

## Production architecture

The React/Vite UI runs on Vercel at `https://www.theswiftline.com`. Its `/api/next/*` requests are rewritten to the Next.js API at `https://swiftline-olive.vercel.app`, which connects directly to Neon PostgreSQL.

    Browser -> Vite UI (Vercel) -> Next.js API (Vercel) -> Neon PostgreSQL
                                                  -> SMTP provider
    GitHub Actions (10 min) -> protected email batch -> Neon outbox

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

Vercel project `swiftline` requires `DATABASE_URL`, JWT values, `TURNSTILE_SECRET_KEY`, `SWIFTLINE_APP_URL`, Google OAuth credentials, SMTP values, and `CRON_SECRET`. Add the same `CRON_SECRET` as a GitHub Actions secret. Never expose secrets with a `VITE_*` or `NEXT_PUBLIC_*` name.

## Checks

    cd apps/swiftline-next
    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run build

    cd ../..
    npm.cmd run build

## Optional remaining legacy work

Google OAuth browser handoff, feedback, push notifications, WordChain, automatic queue advancement, and account cleanup remain unfinished migration work.
