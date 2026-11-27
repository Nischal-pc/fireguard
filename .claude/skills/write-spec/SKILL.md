---

name: write-spec
description: Turn an idea or a request from a technician or coordinator into a feature spec in docs/specs, using the spec template. Use before building anything that is not already specified.
argument-hint: "[feature idea]"
---

Write a spec for: $ARGUMENTS

1. Read `docs/specs/_template.md`, `CLAUDE.md`, and the specs that already
   exist, so the new one does not overlap or contradict them.
2. Ask the user up to 5 short questions, all in one message, about anything
   the template needs that the idea does not say: who uses it and when, what
   they see, offline behaviour, what data changes, what is out of scope. Wait
   for the answers.
3. Write `docs/specs/<phase>-<short-name>.md` from the template. Be concrete:
   name tables and columns, engine functions, screens and states.
4. Split the work into tasks of 1–3 days each, every task ending with
   `pnpm check` green.
5. Fill "Done when" with checks a technician could verify on a tablet.
6. Show the user the spec and list any open questions at the top. Do not
   start building.
