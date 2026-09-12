# SwiftLine Next API

The production API for theSwiftLine: Next.js route handlers on Vercel, backed by Neon PostgreSQL.

## Features

- Public event discovery and details.
- Password login, logout, refresh rotation, signup, and one-time email verification.
- Google OAuth server-side start/callback foundation with CSRF state validation; browser code exchange remains to be wired.
- Organiser event CRUD and protected queue controls.
- Authenticated and anonymous queue joins, leave, pause/resume, serve, and polling status.
- Protected outbox processing at `POST /api/internal/email/process`.

## Email delivery

Email rows live in `EmailDeliveryRequests`. The processor uses PostgreSQL `SKIP LOCKED`, leases, retry/dead-letter state, and an advisory lock. GitHub Actions calls one bounded batch every ten minutes using `CRON_SECRET`.

SMTP stays in Vercel. Delivery is at-least-once, so provider acceptance immediately before a timeout/crash can produce a duplicate.

## Migrations

    node --env-file=../../.env scripts/apply-migrations.mjs

Applied production migrations:

- `20260910_email_delivery_leases.sql`
- `20260911_auth_sessions.sql`
- `20260912_auth_verification_and_oauth.sql`

## Checks

    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run build

Copy `.env.example` to `.env.local`; configure PostgreSQL, JWT, Turnstile, application URL, SMTP, Google OAuth, and cron values. Keep secrets server-only.
