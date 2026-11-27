---

name: start-feature
description: Start work on a task from a spec in docs/specs, for example "/start-feature p1-walking-skeleton task 2". Reads the rules and the spec, creates a branch, and proposes a plan without editing code.
argument-hint: "[spec-file] task [number]"
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git status) Bash(git checkout -b *) Bash(git switch -c *) Bash(git branch *)
---

Start work on: $ARGUMENTS

1. Run `git status`. If there are uncommitted changes, stop and ask the user
   what to do with them.
2. Read `CLAUDE.md`, then the spec in `docs/specs/` named in the arguments,
   then every decision record in `docs/decisions/` the spec or the task touches.
3. Create a branch named `<phase>/<task>-<short-name>`, for example
   `p1/task-2-job-screen`, from an up-to-date `main`.
4. Explore only the code this task touches. Do not edit any file yet.
5. Reply with a plan in this shape, then stop and wait for the user's OK:

   **Goal** — one sentence from the spec.
   **Files** — each file to create or change, with one line on why.
   **Schema or sync changes** — none, or exactly what (if any: the
   sync-data-reviewer subagent must review before merge).
   **Tests** — the behaviours that will be tested, by name.
   **Offline check** — how this will be tested in airplane mode.
   **Questions** — anything in the spec that is unclear or contradicts the code.
   **Steps** — the order of small commits, each one leaving `pnpm check` green.
