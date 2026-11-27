---
name: fg-spec
description: Write a new feature spec in docs/specs from an idea, or refine an outline spec into an approved one before its phase starts ("/fg-spec refine docs/specs/p2-extinguishers.md"). Use before building anything that is not already specified in detail.
argument-hint: "[feature idea] or [refine <spec file>]"
---

Spec work: $ARGUMENTS

## Refine mode (arguments start with "refine")

Turn an `outline` spec into an `approved` one, using what earlier phases taught us.

1. Read the spec, `docs/product/vision.md`, `docs/architecture.md`,
   `docs/roadmap.md`, `docs/STATUS.md` (notes on finished tasks), the previous
   phase's gate report in `docs/gates/` if it exists, and the code the phase
   will touch.
2. For each task, add: the files and tables it touches, the engine functions
   it needs, screens and their states (empty, offline, syncing, error), tests
   by name, and anything the user must do. Split any task bigger than 3 days.
3. List what is now known to be wrong or missing in the outline, and propose
   changes. Never drop a gate criterion without saying so.
4. Ask the user up to 5 short questions, all in one message, and wait.
5. Update the spec, set `Status: approved`, add the task rows to
   `docs/STATUS.md`, on a branch `spec/<phase>-refine`. Suggest `/fg-ship`.

## New spec mode (anything else)

1. Read `docs/specs/_template.md`, `CLAUDE.md`, `docs/roadmap.md` and the
   specs that already exist, so the new one does not overlap or contradict them.
2. Ask the user up to 5 short questions, all in one message, about anything
   the template needs that the idea does not say: who uses it and when, what
   they see, offline behaviour, what data changes, what is out of scope. Wait
   for the answers.
3. Write `docs/specs/<phase>-<short-name>.md` from the template. Be concrete:
   name tables and columns, engine functions, screens and states.
4. Give each task an id in the phase it belongs to (next free number), and
   split the work into tasks of 1–3 days each, every task ending with
   `pnpm check` green.
5. Fill "Done when" with checks a technician could verify on a tablet.
6. Show the user the spec and list open questions at the top. Do not start
   building. Add the tasks to `docs/STATUS.md` only after the user approves.
