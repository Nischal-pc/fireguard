# 0004 — Fastify for the API (instead of NestJS)

Date: 2026-11-26 · Status: accepted · Changes the engineering plan

## Context

The engineering plan named NestJS. NestJS suits larger teams that want
enforced structure, but brings decorators, dependency injection and extra
boilerplate that one builder has to learn and maintain.

## Decision

Use Fastify with zod validation. Routes are plain functions; the server is
built by `buildServer({ db })` so tests can inject an in-memory database.

## Consequences

- Less to learn, less code, fast tests with `app.inject()`.
- We keep structure by convention instead: one file per area
  (`sync-upload.ts`, `close-check.ts`), business rules in `packages/engine`.
- Revisit if the team grows past three developers.
