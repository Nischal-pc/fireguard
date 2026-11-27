# FireGuard Pro

Offline-first fire inspection platform: technician tablet app, coordinator
portal, API, and the Softrend Bridge.

## First run

```bash
corepack enable             # once per computer, gives you the right pnpm
pnpm install
cp .env.example .env
pnpm check                  # lint, typecheck, tests (no database needed)
pnpm db:up                  # local Postgres in Docker
pnpm db:migrate
pnpm db:seed
pnpm --filter @fireguard/api dev
```

Then, in a second terminal:

```bash
curl http://localhost:3000/health
```

See `CLAUDE.md` for the rules of this repository and `docs/specs/` for what to
build next.
