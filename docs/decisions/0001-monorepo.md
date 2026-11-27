# 0001 — One repository for everything

Date: 2026-11-26 · Status: accepted

## Context

One builder, working with Claude, needs to change the database, API, tablet
app and portal together, and test them together.

## Decision

A single repository (monorepo) using pnpm workspaces and Turborepo. Shared
code lives in `packages/*`; runnable apps in `apps/*`. Internal packages point
`main` at their TypeScript source, so there is no build step between them.

## Consequences

- One pull request can change schema, API and app in step.
- CI runs everything on every change; Turborepo caches unchanged work.
- Packages must stay free of platform-specific code (`engine`, `shared`) so
  they run on the tablet, the server and in tests.
