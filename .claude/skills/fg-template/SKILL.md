---
name: fg-template
description: Create a new inspection template or a new version of one (fire alarm, extinguisher, emergency lighting, exit signs) for a province, in packages/templates. Use when adding a discipline, a province, or fixing wording in a published template.
argument-hint: "[discipline] [province] [new|next-version]"
---

Template work: $ARGUMENTS

Templates are legal-record forms. Wording comes from the user and a senior
technician, never invented.

1. Read `docs/decisions/0006-templates-in-code.md` and the schema in
   `packages/engine/src/template.ts`. Use `packages/templates/src/fe-sk-v1.json`
   as the shape to follow.
2. **New version of an existing template**: copy the latest file to
   `<discipline>-<province>-v<N+1>.json` (lowercase file name), set `version`
   and `id` to match, set `status` to `"draft"`, remove `approvedBy`. Never
   edit a published file (a hook blocks it).
3. **New discipline or province**: ask the user for, or have them paste, the
   exact questions, device fields, device checks, the governing standard and
   edition, and which questions or checks should suggest a deficiency. If any
   wording is missing, leave a clear `TODO:` in the text and list it in your
   reply; do not invent code requirements.
4. Keys are `lower_snake_case` and unique. Every check that is a life-safety
   issue gets an `onFail` with severity `life_safety`.
5. Register the file in `RAW_TEMPLATES` in `packages/templates/src/index.ts`.
6. Add a test in `packages/templates/src/templates.test.ts` that the template
   loads and has the expected question keys.
7. Run `pnpm check`.
8. Tell the user: the template is a draft; a senior technician must review the
   wording, then the user sets `status` to `"published"` and `approvedBy` to
   the reviewer's name in a separate commit.
