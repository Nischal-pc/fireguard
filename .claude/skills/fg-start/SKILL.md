---
name: fg-start
description: Start work on one task from the roadmap, for example "/fg-start P1.3" or "/fg-start P2.7". Reads the rules, the status and the spec, creates a branch, and proposes a plan without editing code.
argument-hint: "[task id, e.g. P1.3] [optional notes]"
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git status) Bash(git status *) Bash(git checkout -b *) Bash(git switch -c *) Bash(git branch *) Bash(git pull) Bash(git pull *) Bash(git switch main) Bash(git checkout main)
---

Start work on: $ARGUMENTS

1. Run `git status`. If there are uncommitted changes, stop and ask the user
   what to do with them. If not on `main`, ask whether to finish the current
   branch first.
2. Read `CLAUDE.md`, `docs/STATUS.md`, `docs/roadmap.md`, and the spec in
   `docs/specs/` that contains the task id. Read `docs/architecture.md` and
   every decision record in `docs/decisions/` the task touches.
3. Refuse to start, and say why, if:
   - the spec's status is `outline` (tell the user to run
     `/fg-spec refine <spec file>` first), unless the spec itself says the
     task may start;
   - the task is `blocked` in `docs/STATUS.md`;
   - the previous phase's gate is not passed (tell the user to run `/fg-gate`),
     unless the note under that gate in `docs/STATUS.md`, or the task's spec,
     says this phase may run in parallel;
   - any other gate that the `docs/STATUS.md` note or the task's spec says
     must pass first is not passed.
4. Switch to an up-to-date `main` (`git pull`), then create a branch named
   `<phase>/<task-id>-<short-name>` in lowercase, for example
   `p1/p1.3-powersync-local`.
5. Explore only the code this task touches. Do not edit any file yet.
6. Reply with a plan in this shape, then stop and wait for the user's OK:

   **Task** — id and one sentence from the spec.
   **Files** — each file to create or change, with one line on why.
   **Schema or sync changes** — none, or exactly what (if any: use the
   `/fg-db` steps, and the sync-data-reviewer must review before merge).
   **Tests** — the behaviours that will be tested, by name.
   **Offline check** — how this will be tested in airplane mode.
   **What the user must do** — anything only the user can do (accounts,
   `.env` values, tablet tests), with exact instructions.
   **Questions** — anything unclear or contradicting the code or the spec.
   **Steps** — the order of small commits, each one leaving `pnpm check` green.

7. When the user approves, make the first commit set the task to
   `in progress` in `docs/STATUS.md` with the branch name.
