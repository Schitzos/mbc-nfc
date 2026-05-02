# KDX Membership Benefit Card — Codex Task Plan

Task details for Codex/dev execution. `EXECUTION_ORDER.md` defines the official phase sequence.

## 0. Codex Operating Rules

1. Build **parking MVP only**. Do not build non-parking runtime flows.
2. Keep extension seams through tariff/activity/domain interfaces.
3. NFC card is source of truth for balance, active visit, tariff snapshot, and latest 5 card logs.
4. SQLite is device-local audit/reporting plus local tariff setting only.
5. Silent Shield requires production-grade authenticated encryption/integrity.
6. Every successful NFC/card write needs post-write readback verification before success.
7. Tariff is locally editable by authorized Station/Admin staff.
8. Gate locks tariff at check-in by writing a compact tariff snapshot to the card.
9. Terminal calculates checkout fee from the card-stored tariff snapshot, not current local tariff.
10. For every changed executable source file, create/update the nearest unit test and preserve ≥90% coverage.
11. Work one task only. Change only files needed for that task. Return changed files, tests, commands, coverage, and limitations.

## 1. Source-of-Truth Hierarchy

1. `REQUIREMENTS.md` — business behavior.
2. `CARD_DATA_SECURITY_LEDGER_SPEC.md` — NFC payload, Silent Shield, card logs, tariff snapshot, SQLite ledger.
3. `SECURITY.md` — security rules.
4. `DESIGN.md` — architecture and boundaries.
5. `UNIT_TEST_COVERAGE_POLICY.md` — changed-file unit tests and 90% coverage.
6. `EXECUTION_ORDER.md` — task sequence.
7. `TEST_PLAN.md` / `E2E_TEST_CASES.md` — validation.

If this file conflicts with those docs, follow the higher-priority source doc and patch `TASKS.md` later.

## 2. Compact Codex Prompt Template

```txt
Read `.codex/specs/TASKS.md` task <TASK_ID> and its source docs.
Implement only <TASK_ID> for parking MVP.
Do not add non-MVP/non-parking flows.
Preserve NFC card as source of truth and SQLite as local audit/tariff storage only.
For every changed source file, create/update nearest unit test and keep coverage >=90%.
Run focused tests/coverage when practical; otherwise explain exact blocker.
Return changed files, test files, commands run, coverage status, and limitations.
```

## Phase 0 — Baseline, Governance, and Platform Readiness

### T-000A — Create UML and System Design Diagrams

Owner: Software Architect, System Analyst, Technical Writer
Do: create/update component, use-case, sequence, and activity diagrams for Station, Gate, Terminal, Scout, local ledger, Silent Shield, and tap-in/tap-out.
Done: diagrams match parking MVP and are usable for review/presentation.

### T-000 — Set Up Git Repository and Submission Baseline

Owner: Demo/Release Engineer, PM, Security
Do: initialize Git if needed; add `.gitignore`; add/update `README.md` with setup, run, mock mode, NFC requirements, known limitations, submission notes; document branch rules `feature/* → develop → main`; document commit convention; verify no secrets/build artifacts/raw NFC dumps are staged.
Done: repo baseline is clean or deferred with reason; README/rules exist.

### T-000B — Configure Repository Governance

Owner: Demo/Release Engineer, PM, PO
Do: configure branch protection for `develop`/`main` when remote exists; require PR/MR review; add `CODEOWNERS` or reviewer mapping; document manual fallback until CI.
Done: governance rules or fallback instructions are documented.

### T-001 — Create React Native TypeScript Project

Owner: Senior React Native FE
Do: create RN CLI TypeScript app; configure Jest, lint, format, Husky, lint-staged, commit-message validation; add `DESIGN.md` folder structure.
Done: skeleton launches; baseline tests run; hooks configured.

### T-002 — Install Core Dependencies

Owner: Senior React Native FE
Do: install NFC, SQLite, navigation, state, testing, crypto/security, and coverage dependencies; prefer real-device compatible libraries; run audit and document exceptions.
Done: project builds; dependency choices documented; audit clean or exceptions documented.

### T-000C — Configure Unit Test and Coverage Gate

Owner: Test Automation Engineer, Demo/Release Engineer, Software Architect
Depends on: T-001, T-002
Do: add/verify `npm run test:coverage`; collect coverage for executable `src/**`; set 90% threshold; reference `UNIT_TEST_COVERAGE_POLICY.md` in contribution/PR workflow; configure CI failure when available.
Done: unit and coverage commands work; 90% threshold is configured; policy is referenced.

### T-003 — Configure iOS NFC

Owner: NFC/Mobile Native Specialist
Do: enable NFC capability/usage description; document iOS read/write limits; test real NFC-capable iPhone if available.
Done: iOS NFC tested or explicitly deferred in `DEVICE_TEST_MATRIX.md`.

### T-004 — Configure Android NFC

Owner: NFC/Mobile Native Specialist
Do: add Android NFC permission/hardware feature; verify NFC availability and card detection on real Android NFC device.
Done: Android can detect NFC support and scan supported card.

## Phase 1 — Core Business Foundation

### T-005 — Create MBC Domain Entities

Owner: Software Architect
Do: create `MbcCard`, `MemberProfile`, `TransactionLog`, `ActivitySession`, `ParkingTariffRule`, `TariffSnapshot`, visit status, and parking activity type; keep future activity extension possible through interfaces.
Done: domain types compile with no React Native, SQLite, or NFC imports.

### T-006 — Create Repository Interfaces

Owner: Software Architect
Do: create `MbcCardRepository` read/write/cancel/availability contract plus ledger and tariff setting contracts.
Done: use cases depend on interfaces, not concrete NFC/SQLite implementations.

### T-007 — Create Parking Tariff Calculator

Owner: Senior React Native FE, Test Automation Engineer
Do: calculate fee from supplied tariff rule/snapshot; default Rp2.000/started hour; round partial hours up; reject zero/negative duration; no hardcoded `2000` in Terminal; no non-parking tariff implementation.
Tests: 1h→Rp2.000; 1h5m1s→Rp4.000; zero/negative rejects; Rp3.000 snapshot calculates correctly.
Done: isolated tariff logic with tests.

### T-008 — Create Activity State Policy

Owner: Software Architect, Test Automation Engineer
Do: allow check-in only from `NOT_CHECKED_IN`; checkout only from `CHECKED_IN`; reject double check-in/out, second active activity, invalid duration, insufficient balance; insufficient balance must not mutate card state.
Done: state-transition tests cover valid/invalid flows.

### T-009 — Create Transaction Log Policy

Owner: Software Architect
Do: add card logs for register/top-up/check-in/checkout; keep latest 5 newest-first logs.
Done: sixth log drops oldest and count remains 5.

### T-010 — Create DTOs

Owner: Senior React Native FE
Do: create presentation-safe DTOs (`CardSummaryDto`, `RoleActionResultDto`, status/error DTOs); avoid raw protected payload/domain leakage.
Done: screens can render from DTOs only.

### T-011 — Create Check NFC Availability Use Case

Owner: Senior React Native FE, NFC Specialist
Do: return supported, unsupported, disabled, unavailable, timeout, and mock/demo states with user guidance.
Done: UI can show clear NFC readiness messages.

## Phase 2 — Station Feature

### T-012 — Register Member Card Use Case

Owner: Senior React Native FE
Do: validate unregistered/safe card; reject existing valid MBC overwrite; generate internal member ID; create initial balance/status/logs; write+readback; append local ledger after verified write.
Done: valid protected card is created without typed member ID; overwrite rejected.

### T-013 — Top-Up Member Card Use Case

Owner: Senior React Native FE
Do: read/validate card; validate positive amount; increase balance; add top-up card log; write+readback; append ledger after verified write; preserve active visit/tariff snapshot if checked in.
Done: top-up works for normal and checked-in cards without clearing active visit.

### T-017 — Implement Mock Card Repository

Owner: Senior React Native FE, Test Automation Engineer
Do: implement mock `MbcCardRepository` for dev/demo; include fixtures: unregistered, registered, low balance, checked-in with snapshot, legacy checked-in without snapshot, tampered, capacity-risk.
Done: all role flows run before real NFC hardware.

### T-017A — Implement Local SQLite Ledger Repository

Owner: Senior React Native FE, Software Architect
Do: store register/top-up/check-in/checkout local entries; separate schema from card payload; never override card state; mask member references.
Done: Station shows current-device/current-installation transaction count and income summary; repository is testable.

### T-017B — Implement Local Tariff Settings Repository

Owner: Senior React Native FE, Software Architect
Do: store active parking tariff locally in SQLite/secure storage; seed Rp2.000, `IDR`, `CEIL_TO_STARTED_HOUR`; store version, updated time, updated-by role/reference; validate positive IDR amount; return `TARIFF_NOT_CONFIGURED` when invalid/missing.
Done: authorized Station/Admin can update tariff without APK rebuild; value persists; UI/docs state device-local/manual sync limitation.

### T-017C — Implement Tariff Snapshot at Check-In

Owner: Senior React Native FE, Software Architect, NFC Specialist
Depends on: T-007, T-014, T-017B, T-019, T-020
Do: store compact snapshot in card active visit during check-in: rate/hour, tariff version, currency/rounding if payload budget allows; protect inside Silent Shield; ensure Terminal uses snapshot; allow legacy fallback only with visible warning; re-check payload size.
Done: user checked in at Rp2.000 is charged Rp2.000 after tariff changes to Rp3.000; new check-ins use Rp3.000; capacity guard works.

### T-020A — Integrate Ledger Writes Into Role Flows

Owner: Senior React Native FE, Software Architect
Do: append ledger only after successful write-readback; cover register/top-up/check-in amount `0`/checkout; if ledger write fails after card success, show explicit warning and keep card as source of truth.
Done: local reports include successful operations from this device only; ledger failure is testable.

### T-022 — Build Station Screen

Owner: Senior React Native FE, UI/UX Designer
Do: implement register, top-up, authorized tariff setting, local ledger summary, active tariff display, NFC states, result states; do not require typed member ID.
Done: Station supports register/top-up/tariff update/local report; non-admin cannot change tariff.

## Phase 3 — Gate Feature

### T-014 — Check-In Activity Use Case

Owner: Senior React Native FE
Do: read/validate card; read current local active parking tariff; validate tariff; support optional past simulation timestamp only; set checked-in status/timestamp/parking activity/tariff snapshot; add check-in log; write+readback; append ledger amount `0`.
Done: check-in locks tariff snapshot; repeated check-in/future timestamp rejected.

### T-023 — Build Gate Screen

Owner: Senior React Native FE, UI/UX Designer
Do: implement parking check-in, optional past-time simulation, current device time, active tariff display, and result/error states; show tariff to be locked before write.
Done: Gate writes timestamp and tariff snapshot; future simulation timestamp rejected.

## Phase 4 — Terminal Feature

### T-015 — Check-Out Activity Use Case

Owner: Senior React Native FE
Do: read/validate card; calculate duration; calculate fee from card-stored tariff snapshot; for legacy missing snapshot, allow current local tariff fallback only after visible warning; validate balance; deduct, clear active visit, add checkout log; write+readback; append ledger.
Done: checkout uses check-in tariff; insufficient balance keeps checked-in state; legacy fallback is explicit/testable.

### T-024 — Build Terminal Screen

Owner: Senior React Native FE, UI/UX Designer
Do: implement checkout; display card-stored tariff snapshot before deduction; optionally display current local tariff as reference only; show duration, charged hours, fee, balance impact, remaining balance, insufficient balance guidance, scan recovery, and legacy warning.
Done: fee source is unambiguous; missing/invalid snapshot follows spec.

## Phase 5 — Scout Feature

### T-016 — Inspect Member Card Use Case

Owner: Senior React Native FE
Do: read card and return masked member reference, balance, status, tariff snapshot if checked in, and latest logs; never write card.
Done: Scout read-only behavior is preserved.

### T-025 — Build Scout Screen

Owner: Senior React Native FE, UI/UX Designer
Do: implement one-tap read-only inspection with masked member reference, balance, visit status, tariff snapshot, and last five logs; no write CTA.
Done: Scout never mutates card.

## Phase 6 — Shared App Experience

### T-021 — Build Role Switcher

Owner: Senior React Native FE, UI/UX Designer
Do: allow switching Station/Gate/Terminal/Scout with isolated role state.
Done: role switching does not corrupt card/screen state.

### T-026 — Apply Signal UI Direction

Owner: UI/UX Designer, Senior React Native FE
Do: apply `SIGNAL_UI_GUIDE.md`; isolate theme tokens in `src/presentation/theme/`; keep provisional tokens replaceable.
Done: main role screens are consistent, readable, and demo-ready.

## Phase 7 — Quality and Verification

### T-027 — Unit and Use-Case Tests

Owner: Test Automation Engineer, Senior React Native FE
Depends on: T-005 to T-026
Do: add/update tests for every changed executable source file; cover domain, tariff, state policy, logs, use cases, repositories, codec, Silent Shield helpers, and presentation behavior; include tariff settings/snapshot and NFC error/capacity/readback cases; run focused tests and full coverage before merge/phase completion.
Done: changed-file test rule satisfied; executable-source coverage ≥90%; exceptions approved by Software Architect.

### T-027A — Integrate SonarCloud Quality Analysis

Owner: Test Automation Engineer, Demo/Release Engineer
Do: configure SonarCloud/static analysis when repo access exists; publish coverage format; add CI workflow for tests, audit, build where feasible; document secrets/deferred checks.
Done: quality gate runs or manual/deferred plan is documented.

### T-026D — Maintain Presentation-Friendly Task Brief

Owner: Technical Writer, PM
Do: keep `TASK_PRESENTATION_BRIEF.md` aligned with task order/scope.
Done: brief matches `TASKS.md` and `EXECUTION_ORDER.md`.

## Phase 8 — Real NFC Integration

### T-018 — Implement NFC Card Repository

Owner: NFC/Mobile Native Specialist
Do: implement real NFC read/write/cancel/session cleanup; handle cancel, timeout, unsupported card, malformed payload, IO errors; verify write by readback before success.
Done: real NFC repository safely reads/writes supported cards and cleans sessions.

### T-019 — Implement MBC Card Codec

Owner: Software Architect, Security
Do: implement card payload v1 from `CARD_DATA_SECURITY_LEDGER_SPEC.md`; validate version, required fields, balance, status, active visit, tariff snapshot, counter, latest-five logs; enforce payload capacity; fail safely on malformed/unsupported data.
Done: codec tests cover valid, invalid, legacy, oversized, unsupported version payloads.

### T-020 — Implement Silent Shield

Owner: Security, Software Architect
Do: canonicalize stable payload; HMAC-SHA256; AES-256-GCM/equivalent authenticated encryption; store only opaque `mbc1` envelope; load secrets from secure config; never commit real keys; verify auth before role action; redact sensitive logs/errors; verify generic NFC reader cannot read identity, balance, status, tariff snapshot, or transaction values plainly.
Done: tamper blocks operations; no real secrets committed; sensitive NFC data is not plain-readable.

### T-028 — Device Tests

Owner: NFC Specialist, Senior QA
Do: test Android NFC first; test iOS if available/supported; record device, OS, card/tag type, capacity, read/write result, and limitations in `DEVICE_TEST_MATRIX.md`.
Done: real-device evidence is recorded honestly.

## Phase 9 — Design Hardening

### T-026A — Create Low-Fi E2E Figma Flow

Owner: UI/UX Designer, PM
Do: create/update low-fi mobile flow for role selection, Station, Gate, Terminal, Scout, happy path, and major errors; keep parking as only MVP activity.
Done: flow is understandable for FE and QA.

### T-026B — Create Hi-Fi Implementation-Ready Figma Screens

Owner: UI/UX Designer, Senior React Native FE, System Analyst
Do: create/update hi-fi screens for all roles and NFC/error states; remove typed member ID; document component/token mapping.
Done: FE can implement screens without new product decisions.

### T-026C — Polish Hi-Fi Spacing, Icons, and Visual QA

Owner: UI/UX Designer, Senior React Native FE, PO, SA, Architect
Do: fix spacing, borders, buttons, badges, bottom sheets, icons, hierarchy; confirm polish adds no scope.
Done: screens are visually clean and demo-ready.

## Phase 10 — Demo and Submission

### T-029 — Demo Capture

Owner: Demo/Release Engineer, Technical Writer, UI/UX Designer
Do: capture Station/Gate/Terminal/Scout flows; include tariff-change snapshot scenario if possible; prepare APK/reviewer distribution notes.
Done: demo evidence supports assessment submission.

### T-030 — Prepare Submission Package

Owner: Demo/Release Engineer, Technical Writer, PM
Do: confirm repo, docs, tests, demo evidence, APK distribution notes, known limitations, presentation sections, branch/publish workflow, and parking-MVP scope.
Done: package is ready for final PO GO/NO-GO review.
