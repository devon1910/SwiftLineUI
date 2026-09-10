# SwiftLine

SwiftLine is a virtual queue-management product for attendees and event organizers. This repository is being migrated into a single product workspace while retaining separately deployable web, API, and background-worker processes.

## Repository layout

- `src/` — current React/Vite web application
- `services/swiftline/SwiftLine.API/` — ASP.NET Core HTTP API and SignalR hub
- `services/swiftline/SwiftLine.Worker/` — long-running queue, email, and cleanup jobs
- `services/swiftline/Application/` — application services
- `services/swiftline/Domain/` — domain models and contracts
- `services/swiftline/Infrastructure/` — EF Core, PostgreSQL, notifications, and background-job implementations
- `docs/` — architecture and migration decisions

## Local prerequisites

- Node.js and npm
- .NET 9 SDK
- PostgreSQL

The web app reads `VITE_API_URL` and `VITE_API_SIGNALR_URL` from an untracked `.env` file. The .NET services read credentials and connection strings from environment variables or .NET user-secrets. Never commit production credentials.

## Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run build

dotnet build services\swiftline\SwiftLine.sln
dotnet test services\swiftline\SwiftLine.sln
```

See [docs/architecture.md](docs/architecture.md) for the target topology and migration gates.
