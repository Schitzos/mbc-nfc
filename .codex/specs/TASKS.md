# KDX Membership Benefit Card — Codex Task Plan Lite

> Current status: 444+ tests | 65 suites | 100% line coverage | jest.config.js thresholds: 99% statements/lines/branches, 96% functions

Purpose: compact, Codex-friendly task cards. Execute task order from `EXECUTION_ORDER.md`. Use detailed docs only when the task references them.

## Source-of-Truth Order

1. `REQUIREMENTS.md` — business behavior.
2. `SECURITY.md` — Silent Shield and secrets.
3. `DESIGN.md` — architecture boundaries.
4. `UNIT_TEST_COVERAGE_POLICY.md` — changed-file tests and 90% coverage.
5. `QA_EVIDENCE_POLICY.md` / `TEST_PLAN.md` — QA proof and validation.
6. `EXECUTION_ORDER.md` — official PM sequence.

## Codex Rules

- Work on one task ID only.
- Build parking MVP only; no non-parking runtime flow.
- Keep future extension possible through interfaces.
- Capacity guard enforced before every write. writeNdefMessage throws on failure.
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

### T-000A — UML and System Diagrams ✅ DONE

Owner: Architect / SA / Writer  
Refs: `UML_SYSTEM_DIAGRAMS.md`, `DESIGN.md`  
Done: Diagrams match parking MVP and are presentation-ready.

### T-000 — Repository Baseline ✅ DONE

Owner: Release Engineer / PM  
Refs: `RELEASE_PLAN.md`, `SECURITY.md`  
Do: Verify Git, `.gitignore`, README, branch rules, commit convention, and no secrets/artifacts/raw NFC dumps staged.  
Done: Clean baseline and setup notes exist.

### T-000B — Repository Governance ✅ DONE

Owner: Release Engineer / PM / PO  
Refs: `RELEASE_PLAN.md`, `AGENT_OPERATING_PROTOCOL.md`  
Do: Configure or document branch protection, PR review, reviewer/CODEOWNERS mapping, and deferred CI checks.  
Done: Merge rules are clear.

### T-000C — Unit Test Coverage Gate ✅ DONE

Owner: Test Automation / Release Engineer / Architect  
Refs: `UNIT_TEST_COVERAGE_POLICY.md`  
Do: Configure Jest/coverage scripts, 90% threshold for executable `src/**`, and changed-file unit-test rule.  
Done: Coverage command works or deferral is documented.

---

## Phase 1 — App Foundation

### T-001 — React Native TypeScript Project ✅ DONE

Owner: Senior RN FE  
Refs: `DESIGN.md`  
Do: Create RN CLI TypeScript app, base folder structure, Jest, lint/format, and hooks if feasible.  
Done: App launches and baseline tests run.

### T-002 — Core Dependencies ✅ DONE

Owner: Senior RN FE  
Refs: `DESIGN.md`, `SECURITY.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Install NFC, SQLite, navigation, state, test, crypto, and coverage dependencies; document audit exceptions.  
Done: Project builds with selected dependencies.

---

## Phase 2 — Platform NFC Setup

### T-003 — iOS NFC Deferral Note ✅ DONE

Owner: NFC/Mobile Specialist  
Refs: `DEVICE_TEST_MATRIX.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Document iOS NFC write as out of MVP / best-effort read-only unless validated later. Do not block Android MVP on iOS.  
Done: iOS status is recorded honestly as deferred/out of MVP.

### T-004 — Android NFC Configuration ✅ DONE

Owner: NFC/Mobile Specialist  
Refs: `DEVICE_TEST_MATRIX.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Add Android NFC permission/feature config and verify NFC availability/card detection on Android 9 FE with NTAG215.  
Done: Android 9 FE NFC detection/readiness is documented.

---

## Phase 3 — Domain Layer

### T-005 — MBC Domain Entities ✅ DONE

Owner: Architect  
Refs: `DESIGN.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Create card, member, visit, transaction, tariff rule, status, and parking activity types independent from RN/NFC/SQLite.  
Done: Domain compiles and supports parking MVP only.

### T-006 — Repository Interfaces ✅ DONE

Owner: Architect  
Refs: `DESIGN.md`  
Done: Mock/real implementations can be swapped.

### T-007 — Parking Tariff Calculator ✅ DONE

Owner: Senior RN FE / Test Automation  
Refs: `REQUIREMENTS.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Done: Isolated tests cover rounding, invalid duration, and started-hour examples.

### T-008 — Activity State Policy ✅ DONE

Owner: Architect / Test Automation  
Refs: `EDGE_CASES.md`  
Do: Enforce valid check-in/checkout transitions and reject double tap, second active visit, invalid duration, insufficient balance.  
Done: State-transition tests cover valid and invalid flows.

### T-009 — Card Transaction Log Policy ✅ DONE

Owner: Architect  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Add card logs for register/top-up/check-in/checkout and keep latest five in defined order.  
Done: Sixth log drops oldest and count stays five.

---

## Phase 4 — Application Use Cases

### T-010 — Presentation DTOs ✅ DONE

Owner: Senior RN FE  
Refs: `DESIGN.md`  
Do: Create safe DTOs for card summary, role result, errors, and statuses; do not expose raw payloads.  
Done: UI can render from DTOs only.

### T-011 — NFC Availability Use Case ✅ DONE

Owner: Senior RN FE / NFC Specialist  
Refs: `RFID_NFC_REACT_NATIVE_101.md`  
Do: Return supported/unsupported/disabled/unavailable/timeout states with user guidance.  
Done: Screens can show clear NFC readiness messages.

### T-012 — Register Card Use Case ✅ DONE

Owner: Senior RN FE  
Refs: `REQUIREMENTS.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`, `SECURITY.md`  
Do: Reject existing MBC overwrite, generate member ID, initialize balance/status/log, write protected card, confirm write success, then append ledger.  
Done: Registration creates valid protected card and rejects overwrite.

### T-013 — Top-Up Use Case ✅ DONE

Owner: Senior RN FE  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Validate card/amount, increase balance, add top-up log, preserve active visit, write card with capacity/error handling (`writeNdefMessage` throws on failure), append ledger.  
Done: Top-up works for normal and checked-in cards.

### T-014 — Gate Check-In Use Case ✅ DONE

Owner: Senior RN FE  
Refs: `REQUIREMENTS.md`, `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`

Do: Read registered card, reject double check-in, write active visit timestamp/status, confirm write success. CHECKIN does NOT append a local ledger row.  
Done: Gate check-in works with real NFC repository path and unit tests.

### T-015 — Terminal Check-Out Use Case ✅ DONE

Owner: Senior RN FE  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Read checked-in card, calculate duration and fee using fixed Rp 2.000 per started hour, reject insufficient balance without mutation, deduct/clear/log/write with capacity/error handling (`writeNdefMessage` throws on failure), append ledger.  
Done: Checkout uses fixed MVP tariff and unit tests cover rounding/insufficient balance.

### T-016 — Scout Inspect Use Case ✅ DONE

Owner: Senior RN FE  
Refs: `REQUIREMENTS.md`, `SECURITY.md`  
Done: Scout is read-only.

---

## Phase 5 — Infrastructure

### T-017 — Mock Card Repository ✅ DONE

Owner: Senior RN FE / Test Automation  
Refs: `DESIGN.md`, `EDGE_CASES.md`  
Do: Implement mock card repository with fixtures for unregistered, registered, low balance, checked-in, tampered, oversized.  
Done: Test doubles are available for automated tests only; production runtime uses real NFC repository.

### T-017A — SQLite Ledger Repository ✅ DONE

Owner: Senior RN FE / Architect  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Store local register/top-up/check-in/checkout entries separately from card state; mask sensitive refs; never override card state.  
Done: Station shows transaction count/income for operations processed on this device.

### T-018 — Real NFC Card Repository ✅ DONE

Owner: NFC/Mobile Specialist  
Refs: `RFID_NFC_REACT_NATIVE_101.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Implement NFC read/write/cancel/session cleanup, handle errors, and handle write errors.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Supported cards read/write safely on tested devices.

### T-019 — MBC Card Codec ✅ DONE

Owner: Architect / Security  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Implement compact NTAG215 payload v1 validation/codec, validate core fields/log tuples/counter, enforce size guard.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Tests cover valid, invalid, legacy, oversized, unsupported version.

### T-020 — Silent Shield ✅ DONE

Owner: Security / Architect  
Refs: `SECURITY.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Canonicalize compact payload, AES-256-GCM encrypt/authenticate, store opaque `MBC1`, use demo-only bundled AES key for assessment or secure config, prefer raw/binary NFC payload with Base64URL fallback only if required, reject tamper, redact logs.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Generic NFC reader cannot plainly read identity, balance, status, or logs.

### T-020A — Ledger Flow Integration ✅ DONE

Owner: Senior RN FE / Architect  
Refs: `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Append ledger only after card write success for register/top-up/check-in/checkout; warn if ledger fails after card success.  
Done: Local reports reflect successful operations processed on this device.

---

## Phase 6 — Presentation Layer

### T-021 — Role Switcher ✅ DONE

Owner: Senior RN FE / UI Designer  
Refs: `DESIGN.md`  
Do: Implement Station, Gate, Terminal, Scout switching with isolated role state.  
Done: Switching roles does not corrupt flow state.

### T-022 — Station Screen ✅ DONE

Owner: Senior RN FE / UI Designer  
Refs: `REQUIREMENTS.md`, `EDGE_CASES.md`  
Do: Implement register, top-up, and local ledger summary UI.  
Done: Station supports required MVP actions without extra pricing settings.

### T-023 — Gate Screen ✅ DONE

Owner: Senior RN FE / UI Designer  
Refs: `REQUIREMENTS.md`, `EDGE_CASES.md`  
Do: Implement check-in using real device time only.

### T-024 — Terminal Screen ✅ DONE

Owner: Senior RN FE / UI Designer  
Refs: `EDGE_CASES.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`  
Do: Implement checkout UI showing fixed tariff, charged hours, calculated fee, insufficient balance guidance, and result state.  
Done: Fee source is unambiguous and follows fixed tariff rule.

### T-025 — Scout Screen ✅ DONE

Owner: Senior RN FE / UI Designer  
Refs: `REQUIREMENTS.md`, `SECURITY.md`  
Done: Scout never mutates card.

### T-026 — Signal UI Direction ✅ DONE

Owner: UI Designer / Senior RN FE  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Apply Signal UI guidance and isolated theme tokens; keep provisional tokens replaceable.  
Done: Main screens are consistent, readable, demo-ready.

### T-026A — Low-Fi E2E Figma Flow ✅ DONE

Owner: UI Designer / PM  
Refs: `SIGNAL_UI_GUIDE.md`, `E2E_TEST_CASES.md`  
Do: Create/update low-fi flow for role selection, all roles, happy path, and key errors.  
Status: **DONE** — PO confirmed 2025-05-07.  
Done: FE and QA understand the MVP journey.

### T-026B — Hi-Fi Screens ✅ DONE

Owner: UI Designer / Senior RN FE / SA  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Create/update hi-fi role and NFC/error screens; remove typed member ID; document component/token mapping.  
Status: **DONE** — PO confirmed 2025-05-07.  
Done: FE can implement without new product decisions.

### T-026C — Visual Polish ✅ DONE

Owner: UI Designer / Senior RN FE / PO / SA / Architect  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Polish spacing, buttons, badges, bottom sheets, icons, hierarchy; do not add scope.  
Status: **DONE** — PO confirmed 2025-05-07.  
Done: Screens are clean and demo-ready.

### T-026E — NFC Log Panel and Toggle ✅ DONE

Owner: Senior RN FE / Software Architect / System Analyst / Product Owner  
Refs: `REQUIREMENTS.md`, `DESIGN.md`, `SECURITY.md`  
Do: Add shared NFC operational log panel in Station/Gate/Terminal/Scout with toggle on/off and clear action; ensure safe redaction/no sensitive payload disclosure.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Operator can enable/disable log panel, see timestamped NFC events, clear current lines, and run core flows without business-state side effects.

---

## Phase 7 — Quality, Release, and Submission

### T-026D — Presentation Task Brief ✅ DONE

Owner: Writer / PM  
Refs: `TASK_PRESENTATION_BRIEF.md`, `EXECUTION_ORDER.md`  
Do: Keep task brief aligned with current order, owner, output, and presentation value.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Brief matches task file and execution order.

### T-027 — Unit and Use-Case Tests ✅ DONE

Owner: Test Automation / Senior RN FE  
Refs: `UNIT_TEST_COVERAGE_POLICY.md`, `TEST_PLAN.md`  
Do: Test changed executable files and cover domain, tariff, state/log policy, use cases, repos, codec, Silent Shield, presentation, NFC edge cases.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Changed-file rule is met and full executable-source coverage is >=90%.

### T-027A — SonarCloud / CI Quality Analysis ✅ DONE

Owner: Test Automation / Release Engineer  
Refs: `RELEASE_PLAN.md`, `UNIT_TEST_COVERAGE_POLICY.md`  
Do: Configure tests, coverage publication, static analysis, audit, and build in CI where feasible; document deferred checks.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Quality gate runs or manual/deferred plan is documented.

### T-027B — Firebase App Distribution Pipeline ✅ DONE

Owner: Release Engineer  
Refs: `RELEASE_PLAN.md`, `DONE.md`  
Do: Maintain single GitHub Actions workflow (`.github/workflows/build.yml`) where PR to `develop` runs validation gates and push/merge to `main` builds APK and uploads to Firebase App Distribution with secrets/tester notes documented.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: `main` trigger distributes build or has documented dry-run evidence.

### T-027C — QA Screenshot Evidence Gate ✅ DONE

Owner: Senior QA / PM  
Refs: `QA_EVIDENCE_POLICY.md`, `TEST_PLAN.md`, `E2E_TEST_CASES.md`  
Do: Require QA validation before feature PR merge and final use-case screenshot evidence pack.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: PR/final delivery has screenshots and QA result notes.

### T-028 — Device Tests ✅ DONE

Owner: NFC Specialist / Senior QA  
Refs: `DEVICE_TEST_MATRIX.md`, `RFID_NFC_REACT_NATIVE_101.md`  
Do: Test Android 9 FE with NTAG215; record exact OS/API level, NFC status, tag form factor/vendor, payload byte size, read/write result, limitations. iOS is optional/deferred.  
Status: **DONE** — PO confirmed physical validation complete 2025-05-07.  
Done: Android 9 FE real-device evidence is recorded honestly.

### T-UI-STATION-001 — Register Button Green ✅ DONE

Owner: Senior RN FE  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Change Register button in Station screen from red (primary) to green (success variant using `#008E53`).  
Status: **DONE**  
Done: Register button renders green; secondary button unchanged; all tests pass.

### T-UI-STATION-002 — Register Button Purple

Owner: Senior RN FE  
Refs: `SIGNAL_UI_GUIDE.md`  
Do: Change Register button in Station screen from green (`#008E53`) to purple.  
Done: Register button renders purple; secondary buttons unchanged; all tests pass.

### T-UI-APP-001 — Change app header to rainbow gradient ✅ DONE

Owner: Senior RN FE  
Do: Replace solid pink (#EC4899) background in AppHeaderCard with a rainbow LinearGradient. Install react-native-linear-gradient.  
Done: AppHeaderCard renders rainbow gradient background; all tests pass.

### T-UI-APP-002 — Change app header to black ✅ DONE

Owner: Senior RN FE  
Do: Replace rainbow LinearGradient in AppHeaderCard with solid black View background. Remove react-native-linear-gradient import from this component.  
Status: **DONE** — QA validated 2026-05-08.  
Done: AppHeaderCard renders solid black background; all tests pass.

### T-UI-APP-003 — Change app header to rainbow gradient ✅ DONE

Owner: Senior RN FE  
Do: Replace solid black (#000000) background in AppHeaderCard with a rainbow LinearGradient using react-native-linear-gradient (already installed v2.8.3).  
Done: AppHeaderCard renders rainbow gradient background; all tests pass.

### T-UI-ROLE-001 — Change role selector icons per UI/UX recommendation ✅ DONE

Owner: @FE + @UI/UX  
Refs: `SIGNAL_UI_GUIDE.md`, `DESIGN.md`  
Do: Update Role Selector screen icons for Station, Gate, Terminal, and Scout based on UI/UX designer recommendation. Icons must be visually distinct and represent each role's function.  
Status: **DONE** — QA validated 2026-05-08. MaterialIcons applied (add-circle-outline, sensor-door, settings, search). 436 tests pass. Runtime verified on emulator.  
Done: Role selector icons updated per UI/UX recommendation; all tests pass.

### T-UI-APP-004 — Revert AppHeader to original dark blue and Register button to default ✅ DONE

Owner: Senior RN FE
Do: Revert AppHeaderCard from rainbow LinearGradient back to original solid dark blue (#001A41) View background. Remove LinearGradient import. Revert Register button in RegisterActions by removing variant="dark" prop.
Status: **DONE** — QA validated 2026-05-09. Code review passed, 65 suites / 436 tests pass, Android bundle verified.
Done: AppHeaderCard renders solid #001A41 background; Register button uses default variant; all tests pass.

### ✅ T-UI-LAYOUT-001 — Pin NfcLogPanel to bottom of screen on all role screens

Owner: Senior RN FE
Do: Move NfcLogPanel out of the inner content View (gap-4) and position it at the bottom of the screen content area using mt-auto on all 5 screens: Station, Gate, Scout, Terminal, RoleSwitcher.
Done: NfcLogPanel renders at the bottom of the screen on all role screens; all tests pass.

### T-UI-SCOUT-001 — Redesign Scout screen with circular centered Inspect button and visual enhancements ✅ DONE

Owner: Senior RN FE + UI/UX Designer
Refs: `SIGNAL_UI_GUIDE.md`
Do: Make the Inspect button circular and centered (vertically and horizontally) on the Scout screen. Enhance the Scout screen visual design to be more lively and demo-ready per UI/UX recommendation.
Status: **DONE** — QA validated 2026-05-09. Circular 120px button centered, pulse animation, purple theme. 65 suites / 436 tests pass. 100% coverage on Scout/index.tsx. Runtime verified on Pixel 7 Pro emulator (Android 16).
Done: Inspect button is circular and centered on screen; Scout screen has enhanced visual design; all tests pass.

### T-UI-SCOUT-002 — Enhance Scout screen visual design to be more alive and engaging ✅ DONE

Owner: Senior RN FE + UI/UX Designer
Refs: `SIGNAL_UI_GUIDE.md`
Do: Research NFC/card scanner app UI patterns for inspiration. Redesign Scout screen with richer visual elements — radar/sonar animation, gradient backgrounds, better typography hierarchy, status indicators, and polished card inspection feel. Keep the circular centered Inspect button but enhance the surrounding experience.
Status: **DONE** — QA validated 2026-05-09. Dark immersive theme (#001A41), 3 concentric radar rings with breathing animations, 360° sweep line, pulse rings, 140px cyan circular button with glow, results slide-in animation. 65 suites / 436 tests pass. Coverage 99.67%. Runtime verified on Pixel 7 Pro emulator (Android 16).
Done: Scout screen is visually rich and engaging; circular Inspect button retained; all tests pass.

### T-UI-RADAR-001 — Extract RadarZone as reusable component and add to Gate and Terminal screens ✅ DONE

Owner: Senior RN FE
Do: Extract the radar animation zone from Scout screen into a reusable `RadarZone` component under `src/presentation/components/RadarZone/`. The component accepts a `color` prop to dynamically change the radar ring/pulse/button colors. Add RadarZone to Gate and Terminal screens replacing their SignalButton with the radar button. Each screen uses its own color (Scout: cyan #00B4D8, Gate: blue #1D4ED8, Terminal: amber #D97706).
Done: RadarZone is a reusable component with color prop; Gate and Terminal screens use it; all tests pass.
QA: ✅ Validated 2026-05-09. 66 suites/440 tests pass. Coverage 99.78%. Visual validation deferred to T-029 demo capture.

### T-UI-STATION-003 — Revamp Station screen layout and add scanning animation to NfcActionSheet ✅ DONE

Owner: Senior RN FE + UI/UX Designer
Refs: `SIGNAL_UI_GUIDE.md`, `DESIGN.md`
Do: Refactor Station screen layout to fully align with Gate/Terminal/Scout pattern (RadarZone centered with absolute positioning, overlay cards on top/bottom with z-index layering, clean separation of concerns). Replace the plain ActivityIndicator in NfcActionSheet scanning phase with an animated radar/pulse scanning animation (concentric rings + sweep) consistent with the RadarZone visual language. Animation should be smooth and demo-ready.
Acceptance Criteria:

- Station screen layout matches Gate/Terminal/Scout structural pattern (RadarZone absolute center, overlays z-indexed)
- NfcActionSheet scanning phase shows animated radar/pulse instead of ActivityIndicator
- Scanning animation is smooth, visually consistent with RadarZone theme
- All existing tests pass (>=90% coverage maintained)
- No regression in Station register/top-up flows
  Status: **DONE** — QA validated 2026-05-09. 65 suites / 436 tests pass. 100% coverage. Station uses RadarZone with absolute centering (same as Gate/Terminal/Scout). NfcActionSheet has ScanningRings animation (3 concentric pulsing rings + center NFC icon breathe). Segmented control switches Register/Top-Up modes correctly. Runtime emulator validation deferred per user request.
  Done: Station screen aligned with Gate/Terminal/Scout pattern; NfcActionSheet has scanning animation; all tests pass.

### T-UI-TERMINAL-001 — Remove blank space above error cards on Terminal screen ✅ DONE

Owner: @FE (mbc-senior-react-native-fe)
Do: Remove blank space above InsufficientBalanceCard on Terminal screen. When insufficient balance or generic failure state is active, the error card should render at the top of the content area instead of being pushed to the bottom by mt-auto.
Acceptance Criteria:

- InsufficientBalanceCard and genericFailure card appear at the top of the grey content area with no large blank space above them
- RadarZone and TariffPreviewCard are hidden in error states
- File: src/presentation/screens/Terminal/index.tsx
  Status: **DONE** — QA validated 2026-05-12. Code review passed, 12 suites / 108 tests pass (Terminal+screens). mt-auto conditionally removed in error states; RadarZone and TariffPreviewCard hidden when insufficient or genericFailure.
  Done: Error cards render at top of content area without blank space above; all tests pass.

### T-UI-TERMINAL-002 — Refactor Terminal index.tsx — extract inline JSX to fragments ✅ DONE

Owner: @FE (mbc-senior-react-native-fe)
Refs: `SIGNAL_UI_GUIDE.md`, `DESIGN.md`
Do: Extract inline JSX blocks in `src/presentation/screens/Terminal/index.tsx` into dedicated fragment components under `fragments/` directory (e.g., `GenericFailureCard`). Improve readability without changing behavior.
Acceptance Criteria:

- Inline JSX blocks moved to fragment files under `src/presentation/screens/Terminal/fragments/`
- No behavioral changes — all existing tests pass
- Coverage remains >=90%
- Terminal screen renders identically before and after refactor
  Status: **DONE** — QA validated 2026-05-12. GenericFailureCard extracted to fragments/. 10/10 Terminal tests pass. Runtime verified on Pixel 7 Pro emulator (Android 16). No behavioral changes.
  Done: Terminal index.tsx is concise and readable; inline JSX extracted to fragments; all tests pass.

### T-UI-CODE-001 — Replace ternary-to-null with && operator in UI rendering ✅ DONE

Owner: @FE (mbc-senior-react-native-fe)
Refs: `SIGNAL_UI_GUIDE.md`, `DESIGN.md`
Do: Replace all `condition ? <JSX> : null` ternary patterns with `condition && <JSX>` for better readability. 10 instances across 4 files: Terminal/index.tsx (3), SignalBottomSheet/index.tsx (3), SignalTextField/index.tsx (3), SignalStatusBanner/index.tsx (1). Do NOT convert ternaries with actual else branches.
Acceptance Criteria:

- All 10 `condition ? <JSX> : null` patterns replaced with `condition && <JSX>`
- No behavioral changes — all existing tests pass
- Coverage remains >=90%
- No regression in any screen rendering
  Status: **DONE** — QA validated 2026-05-12. All 10 ternary-to-null patterns replaced with && operator across 4 files. 64 suites / 431 tests pass. Runtime verified on Pixel 7 Pro emulator (Android 16) — all 5 screens render correctly with no behavioral changes.
  Done: All ternary-to-null patterns replaced with && operator; all tests pass.

### T-029 — Demo Capture

Owner: Release Engineer / Writer / UI Designer  
Refs: `E2E_TEST_CASES.md`, `PO_FINAL_GO_NO_GO_CHECKLIST.md`  
Do: Capture Station, Gate, Terminal, Scout, Firebase reviewer notes.  
Done: Demo evidence supports assessment submission.

### T-030 — Submission Package

Owner: Release Engineer / Writer / PM  
Refs: `PO_FINAL_GO_NO_GO_CHECKLIST.md`, `RELEASE_PLAN.md`  
Do: Confirm repository, docs, tests, QA evidence, demo evidence, Firebase notes, known limitations, and parking MVP scope.  
Done: Package is ready for final PO GO/NO-GO review.
