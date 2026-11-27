---
name: fg-db
description: The safe procedure for any database change in FireGuard — adding or changing a table, column, enum or index in packages/db/src/schema.ts, and generating its migration. Use whenever the schema needs to change.
argument-hint: "[what to change]"
---

Database change: $ARGUMENTS

Follow every step. Committed migrations are protected by a hook and must
never be edited.

1. **Plan first.** State the change, why, and what happens to existing rows in
   production. Prefer additive changes: new nullable column or one with a
   default, new table, new index. Avoid drop, rename and type changes; if one is
   needed, propose a two-step migration (add new, backfill, remove old later)
   and wait for the user's OK.
2. **Enums** come from `packages/shared/src/enums.ts`. Change the list there,
   not in the schema.
3. **Edit** `packages/db/src/schema.ts` only. Keep the shared columns
   (`...base`) on every new table. Add indexes for the queries that will use it.
4. **Generate**: run `pnpm db:generate`. Read the new SQL file in
   `packages/db/drizzle/` and show it to the user with a one-line explanation
   of each statement.
5. **Tablet-written tables**: if the table or column is written from tablets,
   update the zod schema in `packages/shared/src/sync.ts`, `UPLOADABLE_TABLES`,
   `apps/api/src/tables.ts`, and the PowerSync local schema and sync rules.
6. **Seed and fixtures**: update `seedSite()` and `test-data` if needed.
7. **Test**: add or update tests that run the migration on `createTestDb()`
   and use the new column or table. Run `pnpm check`.
8. **Review**: ask the sync-data-reviewer subagent to review the change before
   it is committed.
9. Never run `drizzle-kit push`, and never run migrations against staging or
   production from a session; that happens through CI and the runbooks.
