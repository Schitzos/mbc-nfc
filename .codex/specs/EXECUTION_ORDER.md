# KDX Membership Benefit Card Execution Order

## 1. Purpose

This document defines the practical execution sequence for the project.

Use it together with:

- `.codex/specs/TASKS.md` for the full task inventory, owners, and acceptance.
- `.codex/specs/RELEASE_PLAN.md` for milestone readiness.
- `.codex/specs/UNIT_TEST_COVERAGE_POLICY.md` for changed-file unit-test and 90% coverage rules.
- `.codex/specs/QA_EVIDENCE_POLICY.md` for feature PR screenshot evidence and final QA proof.

Rule:

- `TASKS.md` is the source of all tasks.
- `EXECUTION_ORDER.md` is the order we execute them in day-to-day work.

## 2. Working Mode

- Work feature by feature, not layer by layer.
- Each implementation task must include matching unit-test updates for changed executable source files.
- Complete one task at a time.
- After each task finishes, stop and confirm with the user before moving to the next task.
- Senior QA validates each feature PR with Android simulator/device screenshots before merge.
- Technical Writer / Presentation Specialist documents task completion and important delivery notes as work progresses.

## 3. Execution Sequence

### Phase 0 Project Baseline ✅ COMPLETE

Goal:

- Make the workspace ready for implementation and submission tracking.

Order:

1. `T-000A` Create UML and System Design Diagrams ✅ DONE
2. `T-000` Set Up Git Repository and Submission Baseline ✅ DONE
3. `T-000B` Configure GitHub Repository Governance ✅ DONE
4. `T-001` Create React Native TypeScript Project ✅ DONE
5. `T-002` Install Core Dependencies ✅ DONE
6. `T-000C` Configure Unit Test and Coverage Gate ✅ DONE
7. `T-003` Configure iOS NFC ✅ DONE
8. `T-004` Configure Android NFC ✅ DONE

Expected outcome:

- Core UML/system diagrams are ready for team alignment and presentation use.
- Repo baseline, branch workflow, and GitHub governance are ready.
- App skeleton runs.
- Core libraries, tests, local Git hooks, coverage output, analysis prerequisites, and platform NFC configuration are prepared.

PO confirmed all Phase 0 tasks complete 2025-05-07.

Branch rule for all later phases:

- Every implementation task must be done in its own `feature/*` branch.
- Finished feature work is proposed by merge request into `develop`.
- Demo/Release Engineer reviews and merges approved work into `develop`.
- Promotion from `develop` to `main` is prepared by Demo/Release Engineer and merged by the Project Owner.
- Merge to `main` is the controlled trigger for GitHub Actions APK distribution publishing.

### Phase 1 Core Business Foundation ✅ COMPLETE

Goal:

- Build the reusable business rules that every role depends on.

Order:

1. `T-005` Create MBC Domain Entities ✅ DONE
2. `T-006` Create MBC Repository Interface ✅ DONE
3. `T-007` Create Activity Tariff Calculator ✅ DONE
4. `T-008` Create Activity State Policy ✅ DONE
5. `T-009` Create Transaction Log Policy ✅ DONE
6. `T-010` Create Card DTOs ✅ DONE
7. `T-011` Create Check NFC Availability Use Case ✅ DONE

Expected outcome:

- Core domain rules are stable and reusable.
- No UI or NFC implementation depends on ad hoc business logic.

PO confirmed all Phase 1 tasks complete 2025-05-07.

### Phase 2 Station Feature ✅ COMPLETE

Goal:

Order:

1. `T-012` Create Register Member Card Use Case ✅ DONE
2. `T-013` Create Top-Up Member Card Use Case ✅ DONE
3. `T-017` Implement Mock Card Repository ✅ DONE
4. `T-017A` Implement Local SQLite Ledger Repository ✅ DONE
5. `T-020A` Integrate Ledger Writes Into Role Flows ✅ DONE
6. `T-022` Build Station Screen ✅ DONE

Expected outcome:

- Station can register cards, top up balances, and show local device-side reporting on real NFC devices.

PO confirmed all Phase 2 tasks complete 2025-05-07.

### Phase 3 Gate Feature ✅ COMPLETE

Goal:

- Deliver entry/check-in flow.

Order:

1. `T-014` Create Check-In Activity Use Case ✅ DONE
2. `T-023` Build Gate Screen ✅ DONE

Expected outcome:

- Gate can check members into the required parking MVP activity using real device time.

PO confirmed all Phase 3 tasks complete 2025-05-07.

### Phase 4 Terminal Feature ✅ COMPLETE

Goal:

- Deliver exit/checkout flow and fee deduction.

Order:

1. `T-015` Create Check-Out Activity Use Case ✅ DONE
2. `T-024` Build Terminal Screen ✅ DONE

Expected outcome:

- Terminal delivers exit/checkout flow with fee deduction using fixed MVP tariff.

PO confirmed all Phase 4 tasks complete 2025-05-07.

### Phase 5 Scout Feature ✅ COMPLETE

Goal:

- Deliver read-only card inspection.

Order:

1. `T-016` Create Inspect Member Card Use Case ✅ DONE
2. `T-025` Build Scout Screen ✅ DONE

Expected outcome:

- Scout provides one-tap read-only inspection for balance, status, and logs.

PO confirmed all Phase 5 tasks complete 2025-05-07.

### Phase 6 Shared App Experience ✅ COMPLETE

Goal:

- Make the app operable as one multi-role experience.

Order:

1. `T-021` Build Role Switcher ✅ DONE
2. `T-026` Apply Signal UI Direction ✅ DONE

Expected outcome:

- All four roles can be accessed in one app and the shared UI direction is in place.

PO confirmed all Phase 6 tasks complete 2025-05-07.

### Phase 7 Quality And Verification ✅ COMPLETE

Goal:

- Reach the required confidence level before real-card integration and submission.

Order:

1. `T-027` Unit and Use-Case Tests ✅ DONE
2. `T-027A` Integrate SonarCloud Quality Analysis ✅ DONE
3. `T-027B` Configure GitHub Actions Firebase App Distribution ✅ DONE
4. `T-027C` Enforce Feature PR QA Screenshot Evidence ✅ DONE
5. `T-026D` Maintain Presentation-Friendly Task Brief ✅ DONE

PO confirmed physical validation complete 2025-05-07.

Expected outcome:

- Automated coverage reaches the target.
- SonarCloud quality gate is integrated.
- GitHub Actions is prepared so `main` publishes the APK to Firebase App Distribution.
- Feature PRs have QA screenshot evidence or approved exceptions.
- Presentation-friendly task documentation stays current.

### Phase 8 Real NFC Integration ✅ COMPLETE

Goal:

- Deliver real card interaction on target NFC hardware and finalize device validation.

Dependency:

- ~~Requires real NFC card/tag details and supported Android test device.~~ Resolved — PO confirmed physical validation complete 2025-05-07.

Order:

1. `T-018` Implement NFC Card Repository ✅ DONE
2. `T-019` Implement MBC Card Codec ✅ DONE
3. `T-020` Implement Silent Shield ✅ DONE
4. `T-028` Device Tests ✅ DONE

PO confirmed physical validation complete 2025-05-07.

Expected outcome:

- Real Android NFC flows work where supported.
- Payload, privacy, and device behavior are validated honestly.

### Phase 9 Design Hardening ✅ COMPLETE

Goal:

- Improve implementation fidelity once Figma inputs are ready.

Dependency:

- ~~Requires Figma refinement and design access.~~ Resolved — PO confirmed all Figma tasks DONE 2025-05-07.

Order:

1. `T-026A` Create Low-Fi E2E Figma Flow ✅ DONE
2. `T-026B` Create Hi-Fi Implementation-Ready Figma Screens ✅ DONE
3. `T-026C` Polish Hi-Fi Spacing, Icons, and Visual QA ✅ DONE

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

~~Usually blocked or limited~~ — **Resolved: PO confirmed DONE 2025-05-07.**

- ~~`T-026A`~~ ✅ DONE
- ~~`T-026B`~~ ✅ DONE
- ~~`T-026C`~~ ✅ DONE

### Real NFC tag/card-dependent work

~~Usually blocked or limited~~ — **Resolved: PO confirmed physical validation complete 2025-05-07.**

- ~~`T-018`~~ ✅ DONE
- ~~`T-019`~~ ✅ DONE
- ~~`T-020`~~ ✅ DONE
- ~~`T-028`~~ ✅ DONE

### GitHub-dependent work

Usually blocked or limited:

- Remote/repository sharing steps inside `T-000`
- Final SonarCloud repository wiring in `T-027A`
- Final GitHub Actions Firebase App Distribution workflow in `T-027B`
- Final submission packaging in `T-030`

## 5. Execution Rule For This Thread

For this project thread:

1. Pick the next task from this execution order.
2. Complete only that task.
3. Update docs if the task changes project truth.
4. Report the result.
5. Wait for user confirmation before moving to the next task.

## Phase Exit Quality Gate

Before a phase is considered complete:

- All changed executable source files in the phase must have created or updated unit tests.
- Focused tests for changed files must pass.
- Full unit coverage must remain at least 90% for executable repository source.
- Any exception must be documented and approved by the Software Architect.
- The Project Manager should not move to the next phase until the quality gate is satisfied or explicitly waived.
