# Change Note — PM Alignment and Codex Token-Saving Patch

This patch contains changed documents only.

## Why this patch exists

Project Manager review found several remaining wording/order issues that could confuse Codex or the dev team:

- `TASKS.md` phase numbering did not match `EXECUTION_ORDER.md`.
- Terminal wording in a few docs still implied checkout should use the current local tariff instead of the card-stored check-in tariff snapshot.
- Some wording still said "parking demo activity" instead of required parking MVP.
- `TASKS.md` was still longer and more layer-oriented than needed for per-phase execution.

## Key fixes

- Rewrote `TASKS.md` into the same phase order as `EXECUTION_ORDER.md`.
- Kept one compact Codex prompt template to reduce token usage.
- Kept every task ID, but grouped them by PM execution phase.
- Reinforced changed-file unit tests and >=90% coverage.
- Reinforced tariff snapshot rule: Gate locks tariff at check-in; Terminal uses card-stored snapshot.
- Updated related docs where wording conflicted with the tariff snapshot and MVP-scope decisions.

## PM verdict after patch

- GO for phase-by-phase execution.
- Use `EXECUTION_ORDER.md` as official sequence.
- Use revised `TASKS.md` for task-level Codex prompts.
- Use one task per Codex run to save tokens and reduce hallucination risk.
