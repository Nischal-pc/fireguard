# FireGuard Pro — rules for working in this repository

FireGuard Pro replaces the Softrend Foundation 3000 field app for a fire
protection company (8 branches, 15 technicians, SK/AB/BC). Technicians inspect
fire alarm (FA), fire extinguisher (FE), emergency lighting (EL) and exit sign
(EX) systems on tablets, often with no signal. Read this file fully before
making changes.

## Start here every session

1. `docs/STATUS.md` — where the project is: current phase, task statuses, gates.
2. `docs/roadmap.md` — the order of phases P0–P7, Stage 2 and Stage 3, and
   their gates. Task ids look like `P1.3`, `P2.7`, `S2.1`.
3. The current phase's spec in `docs/specs/`.
4. `docs/product/vision.md` (why) and `docs/architecture.md` (the target
   system) when planning anything new.

The user types `/fg-next` to get this briefing. Work only on the task the user
started with `/fg-start <task id>`; never start the next task on your own.

## The one rule that matters most

**The tablet is the source of truth during an inspection; the network is only a
background courier.** Every tap writes to local SQLite first and never waits on
the server. Any change that makes a technician wait on the network is wrong.

## Map

| Path                 | What                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `apps/api`           | Fastify API: job packs, sync upload (`/sync/upload`)                   |
| `apps/mobile`        | Technician app, React Native + Expo (created in P1.2)                  |
| `apps/portal`        | Coordinator portal, Next.js (created in P2.2)                          |
| `packages/shared`    | Enums, ids, upload schemas (zod). Used everywhere                      |
| `packages/engine`    | Inspection engine. Pure TypeScript, no UI, no I/O                      |
| `packages/templates` | Inspection templates as JSON, one file per discipline/province/version |
| `packages/db`        | Drizzle schema, migrations (`drizzle/`), seed, PGlite test helper      |
| `packages/ui-tokens` | Bone & Fire colours, type, spacing                                     |
| `test-data`          | Fictional fixtures only. Never real customer data                      |
| `docs/decisions`     | Architecture decision records. Read before changing a decision         |
| `docs/specs`         | One spec per feature. Build from the spec; ask if it is unclear        |

## Commands

```bash
pnpm install            # install everything
pnpm db:up              # start local Postgres (Docker)
pnpm db:migrate         # apply migrations
pnpm db:seed            # load test-data/sample-site.json
pnpm --filter @fireguard/api dev   # API on http://localhost:3000
pnpm check              # lint + typecheck + all tests (run before every commit)
pnpm db:generate        # after editing packages/db/src/schema.ts
pnpm make:big-site      # 1,000-device fixture for performance tests
```

## Conventions

- TypeScript strict. No `any` (Biome enforces it); if unavoidable, add a
  `biome-ignore` comment explaining why.
- Validate every input from outside (tablet uploads, Softrend data, forms) with
  zod schemas from `packages/shared`.
- Ids are UUID v7 from `newId()`, created on the device that creates the row.
- Never hard-delete. Set `deleted_at`. Queries filter `deleted_at is null`.
- Every table has `created_at`, `updated_at`, `deleted_at`, `version`.
- Tablet and API rows use snake_case keys; Drizzle uses camelCase properties.
- Business rules (progress, pass/fail, can-close) live in `packages/engine`
  only. The app and the API both call it; never duplicate a rule elsewhere.
- Templates: never edit a published template. Copy it to a new version.
- Plain, short names. Comments explain _why_, not _what_.

## Database rules

- Change the schema only in `packages/db/src/schema.ts`, then `pnpm db:generate`.
- Never edit a migration file that has been committed to `main`.
- A migration that drops or rewrites data needs a human review before merge.
- CI fails if the schema changed without a matching migration.

## Data ownership

- From Softrend (read-only in the platform until Stage 3): customers, sites,
  work order headers, schedule, assigned techs.
- Owned by the platform: devices (after first import), inspections, answers,
  device results, deficiencies, photos, signatures, time entries, parts used.
- Tablets may only upload the tables listed in `UPLOADABLE_TABLES`
  (`packages/shared/src/sync.ts`).

## Testing

- Every change comes with tests. Engine and sync logic need thorough unit tests.
- API tests use `createTestDb()` from `@fireguard/db/testing` (PGlite, in
  memory). Never point tests at a real database.
- Performance budgets (see the engineering plan): a tap must update the screen
  in under 50 ms; a 1,000-device list must scroll smoothly. Test with
  `test-data/big-site.json`, not the 40-device sample.

## Security

- Never put secrets, tokens or passwords in code or in git. Use `.env` locally
  (git-ignored) and the cloud secrets manager in staging/production.
- The `x-user-id` header in `apps/api/src/server.ts` is a development stand-in
  for sign-in. It must be replaced by Entra ID token checks before anything is
  deployed beyond a developer's machine.

## How to work on a task

1. Read `docs/STATUS.md`, the spec in `docs/specs/` and any decision records
   it links to.
2. Propose a short plan (files, schema changes, tests) and wait for approval.
3. Make small commits. Run `pnpm check` before saying a task is done.
4. Keep `docs/STATUS.md` true inside the branch: `in progress` when work
   starts, `done` when shipped. Never mark a gate passed without `/fg-gate` and
   the user's confirmation.
5. Summarise what changed, how it was tested, and anything left undone.

## Lifecycle of the project

`/fg-next` → `/fg-start <id>` → build → test on tablet → `/fg-ship` → user
merges → repeat. When a phase's tasks are done: `/fg-gate <phase>`. Before the
first task of an `outline` spec: `/fg-spec refine <spec file>`, unless the
spec says which tasks may start earlier. New ideas
from technicians or coordinators: `/fg-spec <idea>`, placed in a phase.

## Claude Code helpers in this repository

- **Skills** (type `/name`): `/fg-next`, `/fg-start`, `/fg-spec`,
  `/fg-db`, `/fg-template`, `/fg-ship`, `/fg-gate`. Use `/fg-db` for every schema change and
  `/fg-template` for every template change.
- Claude Code has its own built-in commands, such as `/ship` and `/code-review`.
  In this repository always use the `fg-` versions (`/fg-ship`): they run our
  reviewers, keep `docs/STATUS.md` true, and never merge.
- **Subagents** (independent reviewers with fresh context): `code-reviewer`,
  `sync-data-reviewer`, `field-ux-reviewer`, `test-writer`. `/fg-ship` runs the
  reviewers that apply.
- **Hooks**: every edited file is formatted by Biome; committed migrations,
  published templates, `.env` files and `pnpm-lock.yaml` cannot be edited.
  If a hook blocks you, follow its message instead of working around it.
- **Library docs**: when the Context7 MCP server is available, use it for
  current Expo, React Native, PowerSync, Drizzle, Fastify and Next.js docs
  instead of relying on memory. Versions in this repo are newer than most
  training data.
