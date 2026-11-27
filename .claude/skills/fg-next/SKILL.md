---
name: fg-next
description: Start-of-session briefing. Reads docs/STATUS.md, the roadmap and the current spec, reports where the project stands and what the next task is, and gives the exact command to start it. Use at the start of every session or when the user asks "what's next?".
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git status) Bash(git status *) Bash(git branch *) Bash(git log *) Bash(gh pr list *) Bash(gh pr view *)
---

Session briefing. Extra notes from the user: $ARGUMENTS

Do not edit any file. Read, then report.

1. Read `docs/STATUS.md`, `docs/roadmap.md`, and the spec of the current phase.
   Skim `docs/product/vision.md` if this is a new session.
2. Run `git status` and `git branch --show-current`. If there are uncommitted
   changes or the current branch is not `main`, say so first: the user should
   finish or ship that work before starting something new.
3. Run `gh pr list --state open` to see pull requests waiting for review or
   merge, and mention them.
4. Report in this shape, short and plain:

   **Where we are** — current phase, how many of its tasks are done, and any
   task `in progress`.
   **Waiting on people** — any `blocked` task and any outside dependency in
   `docs/roadmap.md` that is due soon.
   **Next task** — the first `todo` task in the current phase whose
   prerequisites are met, with one line on what it delivers.
   **Before you start** — anything needed first: a spec still in `outline`
   (then the next step is `/fg-spec refine <spec file>`), a gate not yet
   passed (then the next step is `/fg-gate <phase>`), an account, a decision.
   **Type this** — the exact command, for example
   `/fg-start P1.3` (in plan mode).

5. If every task in the current phase is `done` but the gate is not passed,
   the next step is `/fg-gate <phase>`, not a new task.
