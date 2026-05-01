# MBC Agent Operating Protocol

## 1. Source of Truth

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
- `.codex/specs/RISKS.md`
- `.codex/specs/DONE.md`
- `.codex/specs/RELEASE_PLAN.md`
- `.codex/specs/DEVICE_TEST_MATRIX.md`

Agents must not invent product behavior, architecture, acceptance criteria, security claims, release status, or test obligations that are not supported by the specs.

Execution note:

- `.codex/specs/TASKS.md` is the full task inventory.
- `.codex/specs/EXECUTION_ORDER.md` is the practical feature-based execution sequence.

## 2. Escalation Rule

When an agent needs information that is missing, ambiguous, or contradictory:

| Missing Need                                                                    | Escalate To        |
| ------------------------------------------------------------------------------- | ------------------ |
| Product value, MVP scope, priority, acceptance criteria                         | Product Owner      |
| Business/system requirement, user flow, assumption, traceability                | System Analyst     |
| Architecture, module boundary, domain model, payload strategy, technical design | Software Architect |

The receiving owner must update or request updates to the relevant `.codex/specs/` document before downstream implementation continues.

## 3. Agent Responsibilities

| Agent                                      | Responsibility                                                                                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner                              | MVP scope, product value, acceptance criteria, and scope decisions.                                                                                                                                         |
| Project Manager                            | Milestones, task sequencing, delivery tracking, blockers, and readiness.                                                                                                                                    |
| System Analyst                             | Requirements, flows, assumptions, edge cases, and traceability.                                                                                                                                             |
| Software Architect                         | Architecture, domain boundaries, payload strategy, and technical decisions.                                                                                                                                 |
| Senior React Native FE                     | React Native implementation, role screens, state management, UI integration, and feature-branch delivery into `develop`.                                                                                    |
| UI/UX Designer                             | Signal UI alignment, role UX, screen states, and usability.                                                                                                                                                 |
| NFC/Mobile Native Specialist               | Android/iOS NFC setup, card/tag behavior, and native lifecycle.                                                                                                                                             |
| Test Automation Engineer                   | Automated tests, mocked repository coverage, and CI-friendly regression.                                                                                                                                    |
| Senior QA                                  | Manual QA, acceptance validation, edge cases, and release confidence.                                                                                                                                       |
| Security Pentester                         | Silent Shield, tamper handling, NFC payload abuse cases, and privacy checks.                                                                                                                                |
| Technical Writer / Presentation Specialist | README, docs, demo script, assumptions, limitations, and presentation.                                                                                                                                      |
| Demo/Release Engineer                      | Demo flow, capture, run instructions, known limitations, GitHub Actions distribution pipeline, merge review into `develop`, submission package, and dependency audit enforcement for newly added libraries. |

## 4. Work Rule

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

## 5. Non-Negotiables

- One app, four roles: Station, Gate, Terminal, Scout.
- NFC card is the offline source of truth.
- Device-local SQLite ledger is allowed only for offline reporting and audit, not as member-state truth.
- Parking is the first demo activity, not the full product boundary.
- Guest flow remains out of scope.
- Scout is read-only.
- Silent Shield protects identity and balance from plain NFC reads and includes tamper/integrity validation.
- Mock card repository must support progress before real NFC hardware is available.
- Real NFC findings must be recorded in `.codex/specs/DEVICE_TEST_MATRIX.md`.

## 6. Branching and Promotion Rule

- Day-to-day implementation uses feature branches plus `develop` and `main`.
- Each feature task must be implemented in a separate feature branch.
- Senior React Native FE opens a merge request from the feature branch into `develop` when the feature is ready.
- Demo/Release Engineer reviews the code and merges into `develop` when the branch satisfies project rules.
- Demo/Release Engineer prepares the promotion merge request from `develop` to `main`.
- Project Owner performs the final merge into `main`.
- Merging into `main` must trigger GitHub Actions to build and publish the APK to app distribution.
- When a task adds or changes libraries, Demo/Release Engineer must confirm `npm audit` reports 0 known vulnerabilities before the branch is treated as ready.

## 7. Anti-Ambiguity Rule

- If a behavior is not stated in `.codex/specs/`, agents must not invent it.
- If a task seems to imply a missing rule, the agent must escalate instead of filling the gap with assumption.
- If `TASKS.md` and `EXECUTION_ORDER.md` seem to conflict, follow `EXECUTION_ORDER.md` for sequence and `TASKS.md` for scope/acceptance.
- If a support document conflicts with `REQUIREMENTS.md`, `DECISIONS.md`, or `DESIGN.md`, escalate before implementation continues.
