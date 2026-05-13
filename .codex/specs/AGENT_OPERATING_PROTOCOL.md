# MBC Agent Operating Protocol

This is the single source of truth for all agent behavior, routing, and workflow rules.

## 1. Session Start

At the start of every new Kiro session, load this file. All spawned agents must follow it.

## 2. Agent Alias Mapping

- "@FE" / "senior frontend" / "senior FE" / "FE engineer" → mbc-senior-react-native-fe
- "@architect" / "software architect" → mbc-software-architect
- "@QA" / "senior QA" → mbc-senior-qa
- "@PM" / "project manager" → mbc-project-manager
- "@PO" / "product owner" → mbc-product-owner
- "@SA" / "system analyst" → mbc-system-analyst
- "@TW" / "tech writer" / "technical writer" → mbc-technical-writer
- "@NFC" / "NFC specialist" → mbc-nfc-native-specialist
- "@security" / "pentester" → mbc-security-pentester
- "@test" / "test automation" / "test engineer" → mbc-test-automation-engineer
- "@UI" / "@UX" / "UI/UX" / "designer" → mbc-ui-ux-designer
- "@release" / "release engineer" / "demo engineer" → mbc-demo-release-engineer
- "@prof" / "professor" → professor

## 3. Routing Rules

1. When the user mentions an agent alias, spawn a subagent with the matching role.
2. Every spawned agent must follow this protocol.
3. Report results back to user after completion.
4. If NO agent alias is mentioned, kiro_default handles the request directly — no subagent spawned.

## 4. Task Workflow (Mandatory for ALL Worker Agents)

Worker agents: @FE, @architect, @SA, @PO, @TW, @NFC, @security, @test, @UI/@UX, @release.

When a task is routed to ANY worker agent, the orchestrator MUST execute the full workflow as a **single subagent pipeline** (one `subagent` call with multiple stages connected by `depends_on`). Do NOT spawn separate subagent calls for each step.

### Pipeline Structure

```
Stage 1: pm-create-issue (mbc-project-manager)
Stage 2: worker-implement (target worker role) — depends_on: [pm-create-issue]
Stage 3: qa-validate (mbc-senior-qa) — depends_on: [worker-implement]
```

### Stage 1 — @PM Creates the Issue and Updates TASKS.md (MANDATORY)

@PM (mbc-project-manager) must:

1. Read `.codex/specs/TASKS.md` to determine the next available task ID in the relevant phase/section.
2. **Append the new task entry to `.codex/specs/TASKS.md`** in the correct phase/section with:
   - Task ID following the `T-SECTION-NNN` pattern
   - Owner
   - Acceptance criteria
   - Status (initially blank/in-progress)
3. Create a GitHub Issue with the **exact title pattern**: `[T-SECTION-NNN] Descriptive task title`
   - Examples: `[T-UI-STATION-003] Change Register button to black`, `[T-FE-GATE-001] Implement gate scan flow`
   - The prefix MUST match the pattern from TASKS.md (e.g., `T-UI-STATION`, `T-FE-GATE`, `T-NFC`, `T-SEC`, etc.)
   - NEVER use freeform titles like `[UI] some description` — this violates the protocol.
4. Use this exact command format:
   ```bash
   gh issue create \
     --title "[T-SECTION-NNN] Task title" \
     --body "Acceptance criteria and context here" \
     --project "Assessment NFC"
   ```
5. After creation, immediately set the issue status to **Todo** on the project board:
   ```bash
   # Get the item ID from the project
   ITEM_ID=$(gh project item-list 2 --owner Schitzos --format json | jq -r '.items[] | select(.content.number == ISSUE_NUMBER) | .id')
   # Set status to Todo
   gh project item-edit --project-id PVT_kwHOAc4Zgc4BW8lN --id $ITEM_ID --field-id PVTSSF_lAHOAc4Zgc4BW8lNzhSM7_Q --single-select-option-id f75ad846
   ```
6. Provide delegation context to the worker agent (issue number, item ID, which files to change, acceptance criteria).

### Stage 2 — Worker Agent Implements (MANDATORY)

The target worker agent MUST:

1. **BEFORE writing any code**, move the GitHub Issue to **In Progress** on the project board:
   ```bash
   gh project item-edit --project-id PVT_kwHOAc4Zgc4BW8lN --id $ITEM_ID --field-id PVTSSF_lAHOAc4Zgc4BW8lNzhSM7_Q --single-select-option-id 47fc9ee4
   ```
2. Confirm the move succeeded (check command output).
3. Only THEN proceed with implementation.
4. This step is NON-NEGOTIABLE. If the board move fails, retry or report the error. Do NOT skip it.

### Stage 3 — @QA Validates (MANDATORY)

@QA (mbc-senior-qa) must:

1. **Runtime Emulator Validation (NON-NEGOTIABLE)**: Before any pass/fail decision, QA must verify the change visually on a running Android emulator:
   - Run `npm run start` to start Metro bundler.
   - Run `npm run android` to build and launch the app on the emulator.
   - Navigate to the affected screen(s) and confirm the change renders correctly at runtime.
   - If the app fails to build, crashes, or the change is not visible at runtime, the task is **FAIL** regardless of unit test results.
2. Validate the deliverable against acceptance criteria (code review + runtime confirmation).
3. If **PASS**: move the issue to **Done** on the project board:
   ```bash
   gh project item-edit --project-id PVT_kwHOAc4Zgc4BW8lN --id $ITEM_ID --field-id PVTSSF_lAHOAc4Zgc4BW8lNzhSM7_Q --single-select-option-id 98236657
   ```
4. If **FAIL**: issue stays In Progress, report issues back to worker agent, notify PM of blocker.
5. The Done move is NON-NEGOTIABLE on pass. QA must execute the command and confirm it succeeded.
6. If **PASS**: update the task entry in `.codex/specs/TASKS.md` to mark status as `✅ DONE`.

### Workflow Violation = Task Rejection

If any agent skips or fails to execute Stages 1–3 correctly:

- The task output is considered INVALID.
- The orchestrator must reject the result and re-run the workflow correctly.
- Specifically: no freeform issue titles, no skipped board moves, no "assumed done" without the actual `gh project item-edit` command execution, no missing TASKS.md entry.

### Project Board Reference

| Field                 | ID                             |
| --------------------- | ------------------------------ |
| Project Number        | 2                              |
| Project Node ID       | PVT_kwHOAc4Zgc4BW8lN           |
| Owner                 | Schitzos                       |
| Status Field ID       | PVTSSF_lAHOAc4Zgc4BW8lNzhSM7_Q |
| Todo Option ID        | f75ad846                       |
| In Progress Option ID | 47fc9ee4                       |
| Done Option ID        | 98236657                       |

### Anti-Loop Rule

- @PM → goes directly to `mbc-project-manager`. No PM-spawns-PM.
- @prof → goes directly to `professor`. No PM or board item needed.
- All other agents ALWAYS go through PM first.
- Never spawn the same agent recursively.

## 5. Source of Truth

All agents must treat the `.codex/specs/` folder as the project source of truth.

Primary specs:

- `.codex/specs/REQUIREMENTS.md`
- `.codex/specs/RFID_NFC_REACT_NATIVE_101.md`
- `.codex/specs/DESIGN.md`
- `.codex/specs/TASKS.md`
- `.codex/specs/EXECUTION_ORDER.md`
- `.codex/specs/TEST_PLAN.md`
- `.codex/specs/TRACEABILITY.md`
- `.codex/specs/SECURITY.md`
- `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md`
- `.codex/specs/RISKS.md`
- `.codex/specs/DONE.md`
- `.codex/specs/RELEASE_PLAN.md`
- `.codex/specs/DEVICE_TEST_MATRIX.md`
- `.codex/specs/UNIT_TEST_COVERAGE_POLICY.md`

Agents must not invent product behavior, architecture, acceptance criteria, security claims, release status, or test obligations that are not supported by the specs.

Execution note:

- `.codex/specs/TASKS.md` is the full task inventory.
- `.codex/specs/EXECUTION_ORDER.md` is the practical feature-based execution sequence.

## 6. Escalation Rule

When an agent needs information that is missing, ambiguous, or contradictory:

| Missing Need                                                                    | Escalate To        |
| ------------------------------------------------------------------------------- | ------------------ |
| Product value, MVP scope, priority, acceptance criteria                         | Product Owner      |
| Business/system requirement, user flow, assumption, traceability                | System Analyst     |
| Architecture, module boundary, domain model, payload strategy, technical design | Software Architect |

The receiving owner must update or request updates to the relevant `.codex/specs/` document before downstream implementation continues.

## 7. Agent Responsibilities

| Agent                                      | Responsibility                                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner                              | MVP scope, product value, acceptance criteria, and scope decisions.                                                                                 |
| Project Manager                            | Milestones, task sequencing, delivery tracking, blockers, and readiness.                                                                            |
| System Analyst                             | Requirements, flows, assumptions, edge cases, and traceability.                                                                                     |
| Software Architect                         | Architecture, domain boundaries, payload strategy, and technical decisions.                                                                         |
| Senior React Native FE                     | React Native implementation, role screens, state management, UI integration, and feature-branch delivery into `develop`.                            |
| UI/UX Designer                             | Signal UI alignment, role UX, screen states, and usability.                                                                                         |
| NFC/Mobile Native Specialist               | Android/iOS NFC setup, card/tag behavior, and native lifecycle.                                                                                     |
| Test Automation Engineer                   | Automated tests, repository test-double coverage, and CI-friendly regression.                                                                       |
| Senior QA                                  | Manual QA, acceptance validation, edge cases, and release confidence.                                                                               |
| Security Pentester                         | Silent Shield, tamper handling, NFC payload abuse cases, and privacy checks.                                                                        |
| Technical Writer / Presentation Specialist | README, docs, demo script, assumptions, limitations, and presentation.                                                                              |
| Demo/Release Engineer                      | Demo flow, capture, run instructions, known limitations, GitHub Actions distribution pipeline, merge review into `develop`, and submission package. |

## 8. Work Rule

Before starting work, each agent must:

1. Read the relevant `.codex/specs/` files for its role.
2. Check `.codex/specs/EXECUTION_ORDER.md` to confirm the currently active task.
3. Open the matching task section in `.codex/specs/TASKS.md`.
4. Confirm there is a requirement, task, test, or done criterion for the requested work.
5. Read the task `Coverage`, `Tasks`, and `Acceptance` blocks before acting.
6. Raise missing or unclear items to Product Owner, System Analyst, or Software Architect.
7. Proceed only after the needed spec guidance is served.

Task execution rule:

- Agents work only on the active task from `.codex/specs/EXECUTION_ORDER.md`, unless explicitly asked to review, clarify, or prepare a dependency for that task.
- Agents must not jump ahead to future tasks on their own.
- After the active task is complete, agents stop and wait for user confirmation before the next task begins.

Co-owner rule:

- If a task has multiple owners, the first listed owner is the primary driver.
- Additional listed owners are required contributors, reviewers, or approvers for that same task.
- No co-owner may change scope, acceptance, or architecture alone; spec changes must follow the escalation rule.

Minimum agent self-check before claiming a task is clear:

1. I know why this task exists.
2. I know what file or deliverable should change.
3. I know the acceptance criteria.
4. I know whether I am the driver or reviewer.
5. I know which owner to escalate to if the spec is unclear.

## 9. Non-Negotiables

- One app, four roles: Station, Gate, Terminal, Scout.
- NFC card is the offline source of truth.
- Device-local SQLite ledger is allowed only for offline reporting and audit, not as member-state truth.
- Parking is the required MVP activity, not the full future product boundary.
- Guest flow remains out of scope.
- Scout is read-only.
- Silent Shield protects identity and balance from plain NFC reads and includes tamper/integrity validation.
- Mock card repository must support progress before real NFC hardware is available.
- Registration must reject already registered valid MBC cards.
- Real NFC writes must include capacity guard. writeNdefMessage throws on failure (no post-write readback).
- Real NFC findings must be recorded in `.codex/specs/DEVICE_TEST_MATRIX.md`.
- Every changed executable source file must have a created or updated unit test unless an approved exception is documented.
- Feature work must preserve at least 90% automated unit-test coverage for executable source.

## 10. Branching and Promotion Rule

- Day-to-day implementation uses feature branches plus `develop` and `main`.
- Each feature task must be implemented in a separate feature branch.
- Senior React Native FE opens a merge request from the feature branch into `develop` when the feature is ready.
- Demo/Release Engineer reviews the code and merges into `develop` when the branch satisfies project rules.
- Demo/Release Engineer prepares the promotion merge request from `develop` to `main`.
- Project Owner performs the final merge into `main`.
- Merging into `main` must trigger GitHub Actions to build and publish the APK to app distribution.

## 11. Anti-Ambiguity Rule

- If a behavior is not stated in `.codex/specs/`, agents must not invent it.
- If a task seems to imply a missing rule, the agent must escalate instead of filling the gap with assumption.
- If `TASKS.md` and `EXECUTION_ORDER.md` seem to conflict, follow `EXECUTION_ORDER.md` for sequence and `TASKS.md` for scope/acceptance.
- If a support document conflicts with `REQUIREMENTS.md`, `DECISIONS.md`, or `DESIGN.md`, escalate before implementation continues.

## 12. Test Obligation Rule

Senior React Native FE and Codex implementation agents must treat tests as part of the feature, not as a later cleanup task.

For every implementation task, the task result must include:

- Changed source files.
- Created/updated test files.
- Test commands run.
- Coverage status or exact reason coverage could not be run.
- Any approved exception.

## 13. QA Screenshot Evidence Protocol

Senior QA must validate each feature PR before merge using an Android simulator/device and attach screenshot evidence.

Senior Frontend Engineer should not consider a feature ready for merge until:

- relevant automated tests pass,
- changed-file unit-test obligations are satisfied,
- QA evidence is attached or an approved exception is recorded.

The final project handoff must include QA use-case testing evidence with screenshots proving the delivered app satisfies the requirements.

## 14. Firebase App Distribution Protocol

Demo/Release Engineer owns the GitHub Actions workflow that publishes Android builds to Firebase App Distribution.

Required behavior:

- controlled push/merge to `main` triggers the workflow,
- workflow builds Android release APK/AAB,
- workflow uploads the build to Firebase App Distribution,
- secrets and tester group configuration are documented,
- failures are visible in GitHub Actions logs.

## 15. Coding Style Rules

Ternary usage:

- Simple single-line ternaries are allowed (e.g., `condition ? 'a' : 'b'`).
- Multi-line ternaries with different properties per branch are PROHIBITED. Use `if/else` with early return instead.
- Nested ternaries (ternary inside ternary) are PROHIBITED. Extract to a helper function or use `if/else`.
- In error-handling blocks, always use explicit `if` branches — never ternaries for error code or message selection.

General readability:

- Prefer `Number.parseInt` over global `parseInt`.
- Prefer `Buffer.subarray()` over deprecated `Buffer.slice()`.
- Mark React component props as `Readonly<>`.
- Do not use bare array index as React `key` — use a stable string key.
- Every test case must contain at least one `expect()` assertion.
- Helper functions that return union types must declare the exact union return type, not `string`.
