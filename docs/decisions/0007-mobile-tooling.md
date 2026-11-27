# 0007 — Mobile app tooling (Expo SDK 58)

Date: 2026-11-26 · Status: accepted

## Context

P1 task 2 creates `apps/mobile` with Expo. The rest of the repository uses
TypeScript 7. Expo SDK 58 pins the versions of the libraries it is tested
with, and `expo install` chose TypeScript ~6.0 for the app.

## Decision

- `apps/mobile` uses Expo SDK 58 (React Native 0.88, React 19.3) and the
  versions `expo install` picks. Add native libraries with
  `pnpm exec expo install <pkg>` (run inside `apps/mobile`), not `pnpm add`, so they match the SDK.
- `apps/mobile` has its own `typescript` ~6.0 dev dependency and its
  `tsconfig.json` extends `expo/tsconfig.base`. Every other package keeps
  TypeScript 7 from the repository root.
- pnpm keeps its default isolated installs. Expo has supported them since
  SDK 54, so there is no `node-linker=hoisted` and no `metro.config.js`.
- During P1 task 2–3 the app runs in Expo Go. From task 4 (PowerSync, which
  has native code) the app needs an Expo development build instead.

## Consequences

- Two TypeScript versions in the repo. Only `apps/mobile` uses 6.0; move
  it to 7 when an Expo SDK supports it (`expo install --check` will say).
- Shared packages imported by the app (`engine`, `shared`, `ui-tokens`)
  must type-check under both versions. They are plain TypeScript, so this
  should hold; `pnpm check` proves it on every change.
- If isolated installs ever break Metro, the fallback is
  `nodeLinker: hoisted` in `pnpm-workspace.yaml`, recorded in a new ADR.
