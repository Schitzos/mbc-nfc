# KDX Membership Benefit Card — Codex Task Plan Lite

Purpose: compact, Codex-friendly task cards. Execute task order from `EXECUTION_ORDER.md`. Use detailed docs only when the task references them.

## Source-of-Truth Order

1. `REQUIREMENTS.md` — business behavior.
2. `CARD_DATA_SECURITY_LEDGER_SPEC.md` — NFC/card/tariff snapshot/SQLite behavior.
3. `SECURITY.md` — Silent Shield and secrets.
4. `DESIGN.md` — architecture boundaries.
5. `UNIT_TEST_COVERAGE_POLICY.md` — changed-file tests and 90% coverage.
6. `QA_EVIDENCE_POLICY.md` / `TEST_PLAN.md` — QA proof and validation.
7. `EXECUTION_ORDER.md` — official PM sequence.

## Codex Rules

- Work on one task ID only.
- Build parking MVP only; no non-parking runtime flow.
- Keep future extension possible through interfaces.
- NFC card is source of truth; SQLite is local audit/reporting and local tariff settings only.
- Tariff is locally editable but locked on card at Gate check-in.
- Terminal checkout uses card-stored tariff snapshot, not current local tariff.
- Verify every successful card write by readback.
- For every changed executable source file, create/update unit tests.
- Keep executable-source coverage >=90% or document approved exception.

## Compact Codex Prompt

```txt
Implement only <TASK_ID> from TASKS.md.
Read referenced docs only as needed.
Do not add non-MVP scope.
For every changed source file, create/update unit tests.
Keep coverage >=90%.
Run focused tests; if unable, explain why and list local commands.
Return changed files, test files, commands run, coverage status, and risks.
```

---

## Phase 0 — Project Control

### T-000A — UML and System Diagrams

Owner: Architect / SA / Writer  
Refs: `UML_SYSTEM_DIAGRAMS.md`, `DESIGN.md`  
Do: Create/update component, use-case, sequence, and activity diagrams for Station, Gate, Terminal, Scout, NFC, Silent Shield, SQLite, tariff snapshot.  
Done: Diagrams match parking MVP and are presentation-ready.

### T-000 — Repository Baseline

Owner: Release Engineer / PM  
Refs: `RELEASE_PLAN.md`, `SECURITY.md`  
Do: Verify Git, `.gitignore`, README, branch rules, commit convention, and no secrets/artifacts/raw NFC dumps staged.  
Done: Clean baseline and setup notes exist.

### T-000B — Repository Governance

Owner: Release Engineer / PM / PO  
Refs: `RELEASE_PLAN.md`, `AGENT_OPERATING_PROTOCOL.md`  
Do: Configure or document branch protection, PR review, reviewer/CODEOWNERS mapping, and deferred CI checks.  
Done: Merge rules are clear.

### T-000C — Unit Test Coverage Gate

Owner: Test Automation / Release Engineer / Architect  
Refs: `UNIT_TEST_COVERAGE_POLICY.md`  
Do: Configure Jest/coverage scripts, 90% threshold for executable `src/**`, and changed-file unit-test rule.  
Done: Coverage command works or deferral is documented.

---

## Phase 1 — App Foundation

### T-001 — React Native TypeScript Project

Owner: Senior RN FE  
Refs: `DESIGN.md`  
Do: Create RN CLI TypeScript app, base folder structure, Jest, lint/format, and hooks if feasible.  
Done: App launches and baseline tests run.

### T-002 — Core Dependencies

Owner: Senior RN FE  
Refs: `DESIGN.md`, `SECURITY.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Install NFC, SQLite, navigation, state, test, crypto, and coverage dependencies; document audit exceptions.  
Done: Project builds with selected dependencies.

---

## Phase 2 — Platform NFC Setup

### T-003 — iOS NFC Configuration

Owner: NFC/Mobile Specialist  
Refs: `DEVICE_TEST_MATRIX.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Enable iOS NFC capability/usage description where supported; document limitations/test status.  
Done: iOS NFC status is recorded honestly.

### T-004 — Android NFC Configuration

Owner: NFC/Mobile Specialist  
Refs: `DEVICE_TEST_MATRIX.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Add Android NFC permission/feature config and verify NFC availability/card detection when hardware exists.  
Done: Android NFC detection works or limitation is documented.

---

## Phase 3 — Domain Layer

### T-005 — MBC Domain Entities

Owner: Architect  
Refs: `DESIGN.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Create card, member, visit, transaction, tariff rule/snapshot, status, and parking activity types independent from RN/NFC/SQLite.  
Done: Domain compiles and supports parking MVP only.

### T-006 — Repository Interfaces

Owner: Architect  
Refs: `DESIGN.md`  
Do: Create card, ledger, and tariff settings repository interfaces; use cases depend on interfaces only.  
Done: Mock/real implementations can be swapped.

### T-007 — Parking Tariff Calculator

Owner: Senior RN FE / Test Automation  
Refs: `REQUIREMENTS.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Calculate fee from supplied tariff snapshot/rule using started-hour rounding; reject zero/negative duration; test Rp2.000 and Rp3.000 rates.  
Done: Isolated tests cover rounding, invalid duration, and rate changes.

### T-008 — Activity State Policy

Owner: Architect / Test Automation  
Refs: `EDGE_CASES.md`  
Do: Enforce valid check-in/checkout transitions and reject double tap, second active visit, invalid duration, insufficient balance.  
Done: State-transition tests cover valid and invalid flows.

### T-009 — Card Transaction Log Policy

Owner: Architect  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Add card logs for register/top-up/check-in/checkout and keep latest five in defined order.  
Done: Sixth log drops oldest and count stays five.

---

## Phase 4 — Application Use Cases

### T-010 — Presentation DTOs

Owner: Senior RN FE  
Refs: `DESIGN.md`  
Do: Create safe DTOs for card summary, role result, errors, and statuses; do not expose raw payloads.  
Done: UI can render from DTOs only.

### T-011 — NFC Availability Use Case

Owner: Senior RN FE / NFC Specialist  
Refs: `RFID_NFC_REACT_NATIVE_101.md`  
Do: Return supported/unsupported/disabled/unavailable/timeout/mock states with user guidance.  
Done: Screens can show clear NFC readiness messages.

### T-012 — Register Card Use Case

Owner: Senior RN FE  
Refs: `REQUIREMENTS.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`, `SECURITY.md`  
Do: Reject existing MBC overwrite, generate member ID, initialize balance/status/log, write protected card, verify readback, then append ledger.  
Done: Registration creates valid protected card and rejects overwrite.

### T-013 — Top-Up Use Case

Owner: Senior RN FE  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Validate card/amount, increase balance, add top-up log, preserve active visit/snapshot, verify write, append ledger.  
Done: Top-up works for normal and checked-in cards.

### T-014 — Gate Check-In Use Case

Owner: Senior RN FE  
Refs: `REQUIREMENTS.md`, `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Read card/local tariff, reject invalid state/future simulation time, write entry timestamp + parking activity + tariff snapshot, verify readback, append CHECKIN amount `0`.  
Done: Check-in locks tariff snapshot and rejects invalid check-in.

### T-015 — Terminal Check-Out Use Case

Owner: Senior RN FE  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Read checked-in card, calculate duration and fee from card-stored snapshot, warn on legacy fallback, reject insufficient balance without mutation, deduct/clear/log/write/verify/append ledger.  
Done: Users keep check-in tariff even after local tariff changes.

### T-016 — Scout Inspect Use Case

Owner: Senior RN FE  
Refs: `REQUIREMENTS.md`, `SECURITY.md`  
Do: Read card and show masked member ref, balance, status, tariff snapshot, latest logs; never write.  
Done: Scout is read-only.

---

## Phase 5 — Infrastructure

### T-017 — Mock Card Repository

Owner: Senior RN FE / Test Automation  
Refs: `DESIGN.md`, `EDGE_CASES.md`  
Do: Implement mock card repository with fixtures for unregistered, registered, low balance, checked-in with/without snapshot, tampered, oversized.  
Done: All role flows run without real NFC.

### T-017A — SQLite Ledger Repository

Owner: Senior RN FE / Architect  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Store local register/top-up/check-in/checkout entries separately from card state; mask sensitive refs; never override card state.  
Done: Station shows current-device transaction count/income.

### T-017B — Local Tariff Settings Repository

Owner: Senior RN FE / Architect  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Store active parking tariff locally, seed Rp2.000 IDR started-hour rule, track version metadata, validate positive IDR tariff.  
Done: Authorized Station/Admin can change tariff without APK rebuild.

### T-017C — Tariff Snapshot at Check-In

Owner: Senior RN FE / Architect / NFC Specialist  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Store compact tariff snapshot in card active visit, enforce Terminal snapshot usage, test legacy fallback and payload capacity.  
Done: Rp2.000 check-in remains Rp2.000 after tariff changes to Rp3.000.

### T-018 — Real NFC Card Repository

Owner: NFC/Mobile Specialist  
Refs: `RFID_NFC_REACT_NATIVE_101.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Implement NFC read/write/cancel/session cleanup, handle errors, and verify writes by readback.  
Done: Supported cards read/write safely on tested devices.

### T-019 — MBC Card Codec

Owner: Architect / Security  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Implement payload v1 validation/codec, validate core fields/logs/snapshot/counter, enforce size guard.  
Done: Tests cover valid, invalid, legacy, oversized, unsupported version.

### T-020 — Silent Shield

Owner: Security / Architect  
Refs: `SECURITY.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Canonicalize, HMAC-sign, AEAD-encrypt, store opaque `mbc1`, keep secrets out of repo, reject tamper, redact logs.  
Done: Generic NFC reader cannot plainly read identity, balance, status, tariff, or logs.

### T-020A — Ledger Flow Integration

Owner: Senior RN FE / Architect  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Append ledger only after card write-readback for register/top-up/check-in/checkout; warn if ledger fails after card success.  
Done: Local reports reflect successful operations on this device only.

---

## Phase 6 — Presentation Layer

### T-021 — Role Switcher

Owner: Senior RN FE / UI Designer  
Refs: `DESIGN.md`  
Do: Implement Station, Gate, Terminal, Scout switching with isolated role state.  
Done: Switching roles does not corrupt flow state.

### T-022 — Station Screen

Owner: Senior RN FE / UI Designer  
Refs: `REQUIREMENTS.md`, `EDGE_CASES.md`  
Do: Implement register, top-up, admin tariff setting, local ledger summary, active tariff display, and auth path for tariff change.  
Done: Station supports register/top-up/tariff update/local report safely.

### T-023 — Gate Screen

Owner: Senior RN FE / UI Designer  
Refs: `REQUIREMENTS.md`, `EDGE_CASES.md`  
Do: Implement check-in, optional past simulation, current time, active tariff display, and tariff-to-be-locked confirmation.  
Done: Gate writes timestamp and tariff snapshot clearly.

### T-024 — Terminal Screen

Owner: Senior RN FE / UI Designer  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Implement checkout UI with card-stored tariff snapshot, duration, charged hours, fee, balance impact, insufficient-balance guidance, legacy warning.  
Done: Fee source is unambiguous and follows snapshot rule.

### T-025 — Scout Screen

Owner: Senior RN FE / UI Designer  
Refs: `REQUIREMENTS.md`, `SECURITY.md`  
Do: Implement one-tap read-only inspection with masked member ref, balance, visit status, tariff snapshot, latest five logs.  
Done: Scout never mutates card.

### T-026 — Signal UI Direction

Owner: UI Designer / Senior RN FE  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Apply Signal UI guidance and isolated theme tokens; keep provisional tokens replaceable.  
Done: Main screens are consistent, readable, demo-ready.

### T-026A — Low-Fi E2E Figma Flow

Owner: UI Designer / PM  
Refs: `SIGNAL_UI_GUIDE.md`, `E2E_TEST_CASES.md`  
Do: Create/update low-fi flow for role selection, all roles, happy path, and key errors.  
Done: FE and QA understand the MVP journey.

### T-026B — Hi-Fi Screens

Owner: UI Designer / Senior RN FE / SA  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Create/update hi-fi role and NFC/error screens; remove typed member ID; document component/token mapping.  
Done: FE can implement without new product decisions.

### T-026C — Visual Polish

Owner: UI Designer / Senior RN FE / PO / SA / Architect  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Polish spacing, buttons, badges, bottom sheets, icons, hierarchy; do not add scope.  
Done: Screens are clean and demo-ready.

---

## Phase 7 — Quality, Release, and Submission

### T-026D — Presentation Task Brief

Owner: Writer / PM  
Refs: `TASK_PRESENTATION_BRIEF.md`, `EXECUTION_ORDER.md`  
Do: Keep task brief aligned with current order, owner, output, and presentation value.  
Done: Brief matches task file and execution order.

### T-027 — Unit and Use-Case Tests

Owner: Test Automation / Senior RN FE  
Refs: `UNIT_TEST_COVERAGE_POLICY.md`, `TEST_PLAN.md`  
Do: Test changed executable files and cover domain, tariff, state/log policy, use cases, repos, codec, Silent Shield, presentation, NFC edge cases.  
Done: Changed-file rule is met and full executable-source coverage is >=90%.

### T-027A — SonarCloud / CI Quality Analysis

Owner: Test Automation / Release Engineer  
Refs: `RELEASE_PLAN.md`, `UNIT_TEST_COVERAGE_POLICY.md`  
Do: Configure tests, coverage publication, static analysis, audit, and build in CI where feasible; document deferred checks.  
Done: Quality gate runs or manual/deferred plan is documented.

### T-027B — Firebase App Distribution Pipeline

Owner: Release Engineer  
Refs: `RELEASE_PLAN.md`, `DONE.md`  
Do: Configure GitHub Actions on `main` to build Android release artifact and upload to Firebase App Distribution with secrets/tester notes documented.  
Done: `main` trigger distributes build or has documented dry-run evidence.

### T-027C — QA Screenshot Evidence Gate

Owner: Senior QA / PM  
Refs: `QA_EVIDENCE_POLICY.md`, `TEST_PLAN.md`, `E2E_TEST_CASES.md`  
Do: Require QA validation before feature PR merge and final use-case screenshot evidence pack.  
Done: PR/final delivery has screenshots and QA result notes.

### T-028 — Device Tests

Owner: NFC Specialist / Senior QA  
Refs: `DEVICE_TEST_MATRIX.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Test Android NFC first, iOS if available; record device, OS, card/tag, capacity, read/write result, limitations.  
Done: Real-device evidence is recorded honestly.

### T-029 — Demo Capture

Owner: Release Engineer / Writer / UI Designer  
Refs: `E2E_TEST_CASES.md`, `PO_FINAL_GO_NO_GO_CHECKLIST.md`  
Do: Capture Station, Gate, Terminal, Scout, tariff-change snapshot scenario, and Firebase reviewer notes.  
Done: Demo evidence supports assessment submission.

### T-030 — Submission Package

Owner: Release Engineer / Writer / PM  
Refs: `PO_FINAL_GO_NO_GO_CHECKLIST.md`, `RELEASE_PLAN.md`  
Do: Confirm repository, docs, tests, QA evidence, demo evidence, Firebase notes, known limitations, and parking MVP scope.  
Done: Package is ready for final PO GO/NO-GO review.
