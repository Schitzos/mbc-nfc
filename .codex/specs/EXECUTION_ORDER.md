# KDX Membership Benefit Card Execution Order

## 1. Purpose

This document defines the practical execution sequence for the project.

Use it together with:

- `.codex/specs/TASKS.md` for the full task inventory, owners, and acceptance.
- `.codex/specs/RELEASE_PLAN.md` for milestone readiness.
- `.codex/specs/UNIT_TEST_COVERAGE_POLICY.md` for changed-file unit-test and 90% coverage rules.

Rule:

- `TASKS.md` is the source of all tasks.
- `EXECUTION_ORDER.md` is the order we execute them in day-to-day work.

## 2. Working Mode

- Work feature by feature, not layer by layer.
- Each implementation task must include matching unit-test updates for changed executable source files.
- Complete one task at a time.
- After each task finishes, stop and confirm with the user before moving to the next task.
- Technical Writer / Presentation Specialist documents task completion and important delivery notes as work progresses.

## 3. Execution Sequence

### Phase 0 Project Baseline

Goal:

- Make the workspace ready for implementation and submission tracking.

Order:

1. `T-000A` Create UML and System Design Diagrams
2. `T-000` Set Up Git Repository and Submission Baseline
3. `T-000B` Configure GitHub Repository Governance
4. `T-001` Create React Native TypeScript Project
5. `T-002` Install Core Dependencies
6. `T-000C` Configure Unit Test and Coverage Gate
7. `T-003` Configure iOS NFC
8. `T-004` Configure Android NFC

Expected outcome:

- Core UML/system diagrams are ready for team alignment and presentation use.
- Repo baseline, branch workflow, and GitHub governance are ready.
- App skeleton runs.
- Core libraries, tests, local Git hooks, coverage output, analysis prerequisites, and platform NFC configuration are prepared.

Branch rule for all later phases:

- Every implementation task must be done in its own `feature/*` branch.
- Finished feature work is proposed by merge request into `develop`.
- Demo/Release Engineer reviews and merges approved work into `develop`.
- Promotion from `develop` to `main` is prepared by Demo/Release Engineer and merged by the Project Owner.
- Merge to `main` is the controlled trigger for GitHub Actions APK distribution publishing.

### Phase 1 Core Business Foundation

Goal:

- Build the reusable business rules that every role depends on.

Order:

1. `T-005` Create MBC Domain Entities
2. `T-006` Create Repository Interfaces
3. `T-007` Create Parking Tariff Calculator
4. `T-008` Create Activity State Policy
5. `T-009` Create Transaction Log Policy
6. `T-010` Create DTOs
7. `T-011` Create Check NFC Availability Use Case

Expected outcome:

- Core domain rules are stable and reusable.
- No UI or NFC implementation depends on ad hoc business logic.

### Phase 2 Station Feature

Goal:

- Deliver the first usable admin feature: register, top up, local tariff management, and local reporting.

Order:

1. `T-012` Create Register Member Card Use Case
2. `T-013` Create Top-Up Member Card Use Case
3. `T-017` Implement Mock Card Repository
4. `T-017A` Implement Local SQLite Ledger Repository
5. `T-017B → T-017C` Implement Local Tariff Settings Repository
6. `T-020A` Integrate Ledger Writes Into Role Flows
7. `T-022` Build Station Screen

Expected outcome:

- Station can register cards, top up balances, manage active local parking tariff, and show local device-side reporting using mock data before real NFC hardware is available.

### Phase 3 Gate Feature

Goal:

- Deliver entry/check-in flow.

Order:

1. `T-014` Create Check-In Activity Use Case
2. `T-023` Build Gate Screen

Expected outcome:

- Gate can check members into the required parking MVP activity and support simulation mode.

### Phase 4 Terminal Feature

Goal:

- Deliver exit/checkout flow and fee deduction.

Order:

1. `T-015` Create Check-Out Activity Use Case
2. Confirm checkout uses the card-stored tariff snapshot created by `T-014` / `T-017C`
3. `T-024` Build Terminal Screen

Expected outcome:

- Terminal can display the card-stored tariff snapshot, calculate fee from that snapshot, deduct balance, and handle insufficient balance safely.

### Phase 5 Scout Feature

Goal:

- Deliver read-only card inspection.

Order:

1. `T-016` Create Inspect Member Card Use Case
2. `T-025` Build Scout Screen

Expected outcome:

- Scout provides one-tap read-only inspection for balance, status, and logs.

### Phase 6 Shared App Experience

Goal:

- Make the app operable as one multi-role experience.

Order:

1. `T-021` Build Role Switcher
2. `T-026` Apply Signal UI Direction

Expected outcome:

- All four roles can be accessed in one app and the shared UI direction is in place.

### Phase 7 Quality And Verification

Goal:

- Reach the required confidence level before real-card integration and submission.

Order:

1. `T-027` Unit and Use-Case Tests
2. `T-027A` Integrate SonarCloud Quality Analysis
3. `T-026D` Maintain Presentation-Friendly Task Brief

Expected outcome:

- Automated coverage reaches the target.
- SonarCloud quality gate is integrated.
- GitHub Actions is prepared so `main` can publish the APK to app distribution.
- Presentation-friendly task documentation stays current.

### Phase 8 Real NFC Integration

Goal:

- Replace mock-only behavior with real card interaction when hardware details are available.

Dependency:

- Requires real NFC card/tag details and supported Android test device.

Order:

1. `T-018` Implement NFC Card Repository
2. `T-019` Implement MBC Card Codec
3. `T-020` Implement Silent Shield
4. `T-028` Device Tests

Expected outcome:

- Real Android NFC flows work where supported.
- Payload, privacy, and device behavior are validated honestly.

### Phase 9 Design Hardening

Goal:

- Improve implementation fidelity once Figma inputs are ready.

Dependency:

- Requires Figma refinement and design access.

Order:

1. `T-026A` Create Low-Fi E2E Figma Flow
2. `T-026B` Create Hi-Fi Implementation-Ready Figma Screens
3. `T-026C` Polish Hi-Fi Spacing, Icons, and Visual QA

Expected outcome:

- UI is refined and implementable with stronger visual consistency.

### Phase 10 Demo And Submission

Goal:

- Package the project for review.

Order:

1. `T-029` Demo Capture
2. `T-030` Prepare Submission Package

Expected outcome:

- Demo evidence, repository, docs, presentation, and APK distribution path are ready.

## 4. Blocked-By Rules

### Figma-dependent work

Usually blocked or limited:

- `T-026A`
- `T-026B`
- `T-026C`

### Real NFC tag/card-dependent work

Usually blocked or limited:

- `T-018`
- `T-019`
- `T-020`
- `T-028`

### GitHub-dependent work

Usually blocked or limited:

- Remote/repository sharing steps inside `T-000`
- Final SonarCloud repository wiring in `T-027A`
- Final GitHub Actions publish workflow in `T-027A`
- Final submission packaging in `T-030`

## 5. Execution Rule For This Thread

For this project thread:

1. Pick the next task from this execution order.
2. Complete only that task.
3. Update docs if the task changes project truth.
4. Report the result.
5. Wait for user confirmation before moving to the next task.

## Tariff Snapshot Execution Note

`T-017C Implement Tariff Snapshot at Check-In` must be completed after local tariff settings and before final Terminal checkout E2E validation. Gate writes the snapshot; Terminal consumes it.

## Phase Exit Quality Gate

Before a phase is considered complete:

- All changed executable source files in the phase must have created or updated unit tests.
- Focused tests for changed files must pass.
- Full unit coverage must remain at least 90% for executable repository source.
- Any exception must be documented and approved by the Software Architect.
- The Project Manager should not move to the next phase until the quality gate is satisfied or explicitly waived.
