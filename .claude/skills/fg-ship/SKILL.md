---
name: fg-ship
description: Finish the current task — run all checks, get independent reviews, commit, push and open a pull request with gh. Only when the user types /fg-ship.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(pnpm check) Bash(git status) Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git add *) Bash(git commit *)
---

Ship the current branch. Notes from the user: $ARGUMENTS

1. Run `git status` and `git diff main...HEAD --stat`. If on `main`, stop: work
   must be on a branch.
2. Run `pnpm check`. If anything fails, fix it (or explain why you cannot)
   before going on.
3. Get independent reviews with fresh context:
   - always the **code-reviewer** subagent;
   - the **sync-data-reviewer** subagent if anything changed in
     `packages/db`, `packages/shared/src/sync.ts`, `apps/api/src/sync-upload.ts`,
     sync rules, or the PowerSync connector;
   - the **field-ux-reviewer** subagent if anything changed in `apps/mobile`.
     Fix every Blocking finding and every Should-fix you agree with. List any you
     disagree with and why.
4. If the branch is a task branch (`p<N>/...`), update `docs/STATUS.md`: set
   this task to `done`, fill in the branch, and add a one-line note of anything
   left undone or learned. On other branches (`chore/*`, `fix/*`, `gate/*`,
   `spec/*`), do not mark any task done. If the work
   changed what later tasks need, add a line to that phase's spec under a
   heading "Notes from earlier tasks". Then commit any remaining changes with a
   message in the form `<area>: <what changed>` (for example
   `api: refuse close with untested devices`).
5. Ask the user to confirm, then `git push -u origin <branch>`.
6. Open a pull request with `gh pr create`, filling in
   `.github/pull_request_template.md`: the spec and task, what changed, how it
   was tested (including airplane mode if it touches the tablet), reviewer
   verdicts, and anything left undone.
7. Run `gh pr checks --watch` and report the CI result. Do not merge; the user
   merges after reading the pull request.
