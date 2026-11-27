# 0003 — PostgreSQL with Drizzle; PGlite in tests

Date: 2026-11-26 · Status: accepted

## Decision

- PostgreSQL is the server database (managed service in production).
- Drizzle ORM defines the schema in TypeScript (`packages/db/src/schema.ts`)
  and generates SQL migrations with `drizzle-kit` that we review and commit.
- Tests run against PGlite (Postgres compiled to WebAssembly, in memory), so
  tests need no Docker and CI needs no database service.

## Why Drizzle over Prisma

Drizzle's schema reads close to SQL, generates plain SQL migrations we can
read, and runs on PGlite for fast tests.

## Consequences

- Never edit a committed migration; add a new one.
- CI checks that the schema and the migrations agree.
