# KDX MBC — Presentation Slide Outline

> Maps the 6 KDX assessment sections to specific project evidence, screenshots, and documentation.
> Last updated: 2025-05-07 | Phases 0–9 complete | Phase 10 pending (T-029, T-030)

---

## Slide 0 — Title and Context

| Item       | Content                                                                                |
| ---------- | -------------------------------------------------------------------------------------- |
| Title      | KDX Membership Benefit Card (MBC) — Parking MVP                                        |
| Subtitle   | One app · Four roles · One NFC card as source of truth                                 |
| Key fact   | Offline-first cooperative membership system validated on ASUS ROG Phone 9 FE + NTAG215 |
| Scope note | Parking is the first demo activity, not the product limit                              |

---

## Section 1 — UI/UX Design

### Slide 1.1: Design System and Approach

| Evidence                        | Location                          |
| ------------------------------- | --------------------------------- |
| Signal UI Guide                 | `.codex/specs/SIGNAL_UI_GUIDE.md` |
| Low-fi E2E Figma flow           | T-026A deliverable                |
| Hi-fi implementation screens    | T-026B deliverable                |
| Visual polish pass              | T-026C deliverable                |
| Signal-inspired styling in code | `src/presentation/theme/`         |

Talking points:

- Signal-inspired design system: clean, accessible, minimal chrome
- Current in-app styling is sufficient for submission — no Figma token extraction needed
- Consistent color tokens, spacing, and typography across all role screens
- NfcActionSheet bottom sheet provides scan/success/error/confirm feedback on all screens

### Slide 1.2: Role-Based UX

| Evidence        | Location                                             |
| --------------- | ---------------------------------------------------- |
| Role Switcher   | T-021 — `src/presentation/screens/`                  |
| Station screen  | T-022 — register, top-up, ledger summary             |
| Gate screen     | T-023 — check-in flow                                |
| Terminal screen | T-024 — checkout with fee display                    |
| Scout screen    | T-025 — read-only inspection                         |
| Screenshots     | `docs/qa-evidence/` or `.codex/specs/test-evidence/` |

Talking points:

- One app, four cooperative roles — no separate installs
- Each role has isolated state; switching does not corrupt flow
- NFC action feedback via shared NfcActionSheet component
- Staff does not type member ID — system generates it
- Scout is strictly read-only (never mutates card)

### Slide 1.3: User Journey

| Evidence           | Location                         |
| ------------------ | -------------------------------- |
| E2E test cases     | `.codex/specs/E2E_TEST_CASES.md` |
| Low-fi flow        | T-026A Figma deliverable         |
| Edge case handling | `.codex/specs/EDGE_CASES.md`     |

Talking points:

- Happy path: Register → Top-up → Check-in → Check-out → Inspect
- Error states: NFC disabled, insufficient balance, double tap, tampered card
- All flows use real NFC — no simulation mode or mock scenario selectors remain

---

## Section 2 — Software Design

### Slide 2.1: Architecture

| Evidence            | Location                              |
| ------------------- | ------------------------------------- |
| Architecture doc    | `.codex/specs/DESIGN.md`              |
| UML diagrams        | `.codex/specs/UML_SYSTEM_DIAGRAMS.md` |
| Traceability matrix | `.codex/specs/TRACEABILITY.md`        |
| Decision records    | `.codex/specs/DECISIONS.md`           |

Talking points:

- Clean Architecture: Domain → Application → Infrastructure → Presentation
- Domain layer has zero framework dependencies
- Repository interface pattern enables mock ↔ real NFC swap
- NFC card is source of truth; SQLite is audit-only (never overrides card)

### Slide 2.2: Domain Model

| Evidence              | Location                            |
| --------------------- | ----------------------------------- |
| Domain entities       | T-005 — `src/domain/entities/`      |
| Repository interfaces | T-006 — `src/domain/repositories/`  |
| Tariff calculator     | T-007 — `src/domain/services/`      |
| State policy          | T-008 — activity state transitions  |
| Log policy            | T-009 — latest-five transaction log |

Talking points:

- Card stores: identity, balance, status, 5 transaction logs
- Fixed Rp 2.000/started-hour tariff (parking MVP)
- State machine prevents double check-in, double checkout, insufficient balance
- Architecture supports future activities without structural changes

### Slide 2.3: Key Design Decisions

| Decision                   | Rationale                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| NFC card = source of truth | Offline-first; no backend needed                                        |
| SQLite = audit only        | Device-local reporting; never overrides card                            |
| One app, four roles        | Simpler deployment; role switcher controls access                       |
| NTAG215 target             | 504 bytes writable; compact codec fits (362 bytes worst-case encrypted) |
| Parking first              | Assessment requirement; architecture is activity-agnostic               |

---

## Section 3 — Software Construction

### Slide 3.1: Technology Stack

| Evidence          | Location                                    |
| ----------------- | ------------------------------------------- |
| Project setup     | T-001, T-002                                |
| Package manifest  | `package.json`                              |
| TypeScript config | `tsconfig.json`                             |
| NFC integration   | `react-native-nfc-manager`                  |
| Crypto            | `react-native-quick-crypto` (native-backed) |

Talking points:

- React Native CLI (not Expo) — full native module access
- TypeScript throughout — type safety for card codec and domain
- Feature-by-feature delivery (not layer-by-layer)
- Each feature branch includes unit tests for changed files

### Slide 3.2: Implementation Highlights

| Feature             | Tasks          | Key Implementation                                      |
| ------------------- | -------------- | ------------------------------------------------------- |
| NFC Card Repository | T-018          | Real read/write with session cleanup and error handling |
| MBC Card Codec      | T-019          | Compact binary payload v1, NTAG215 capacity guard       |
| Silent Shield       | T-020          | AES-256-GCM via react-native-quick-crypto               |
| Ledger Integration  | T-017A, T-020A | SQLite append after card write success only             |
| Use Cases           | T-012–T-016    | Register, top-up, check-in, checkout, inspect           |

### Slide 3.3: Development Process

| Evidence          | Location                                   |
| ----------------- | ------------------------------------------ |
| Execution order   | `.codex/specs/EXECUTION_ORDER.md`          |
| Branch strategy   | `.codex/specs/RELEASE_PLAN.md`             |
| Commit convention | Enforced via Husky hooks                   |
| Agent protocol    | `.codex/specs/AGENT_OPERATING_PROTOCOL.md` |

Talking points:

- `feature/*` → `develop` → `main` branching model
- PR-based review with QA screenshot evidence gate
- Commit-message convention enforced by Git hooks
- 10 phases executed sequentially with PO confirmation gates

---

## Section 4 — Software Quality

### Slide 4.1: Test Coverage

| Evidence        | Location                                    |
| --------------- | ------------------------------------------- |
| Test suite      | T-027 — `__tests__/`, `src/**/*.test.ts`    |
| Coverage policy | `.codex/specs/UNIT_TEST_COVERAGE_POLICY.md` |
| Test plan       | `.codex/specs/TEST_PLAN.md`                 |
| E2E cases       | `.codex/specs/E2E_TEST_CASES.md`            |

Talking points:

- 194+ automated unit tests
- 97%+ line coverage (policy minimum: 90%)
- Every changed executable source file requires unit test update
- Domain, use cases, codec, Silent Shield, state policy all covered

### Slide 4.2: Static Analysis and CI

| Evidence          | Location                        |
| ----------------- | ------------------------------- |
| SonarCloud config | T-027A                          |
| Quality gate      | SonarCloud dashboard            |
| Dependency audit  | `npm audit` = 0 vulnerabilities |
| Lint/format       | ESLint + Prettier via Husky     |

### Slide 4.3: QA Evidence

| Evidence            | Location                             |
| ------------------- | ------------------------------------ |
| QA policy           | `.codex/specs/QA_EVIDENCE_POLICY.md` |
| Screenshot evidence | `.codex/specs/test-evidence/`        |
| Device test matrix  | `.codex/specs/DEVICE_TEST_MATRIX.md` |
| Device validated    | ASUS ROG Phone 9 FE + NTAG215        |

Talking points:

- Feature PR QA screenshot evidence gate (T-027C)
- Real device validation on ASUS ROG Phone 9 FE
- NTAG215 physical card read/write confirmed
- Edge cases tested: tampered card, oversized payload, NFC disabled

---

## Section 5 — Software Deployment

### Slide 5.1: CI/CD Pipeline

| Evidence                | Location                                      |
| ----------------------- | --------------------------------------------- |
| GitHub Actions workflow | `.github/workflows/build.yml`                 |
| Firebase setup          | `.codex/specs/FIREBASE_DISTRIBUTION_SETUP.md` |
| Release plan            | `.codex/specs/RELEASE_PLAN.md`                |

Talking points:

- Single `build.yml` workflow handles both validation and distribution
- PR to `develop` → runs lint, tests, coverage, audit
- Push/merge to `main` → builds APK → uploads to Firebase App Distribution
- Testers/reviewers install via Firebase invitation link

### Slide 5.2: Deployment Flow Diagram

```
feature/* → develop (PR validation gates)
                ↓
             main (release trigger)
                ↓
        GitHub Actions workflow
                ↓
        Build Android APK
                ↓
        Firebase App Distribution
                ↓
        Testers/Reviewers install
```

### Slide 5.3: Distribution Evidence

| Evidence                  | Location                 |
| ------------------------- | ------------------------ |
| Firebase App Distribution | T-027B deliverable       |
| APK build output          | GitHub Actions artifacts |
| Tester notes              | Firebase release notes   |
| Demo capture              | T-029 (pending)          |

---

## Section 6 — Software Security

### Slide 6.1: Silent Shield — Card Encryption

| Evidence       | Location                                                |
| -------------- | ------------------------------------------------------- |
| Security spec  | `.codex/specs/SECURITY.md`                              |
| Card data spec | `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md`        |
| Implementation | T-020 — `src/infrastructure/security/`                  |
| Crypto library | `react-native-quick-crypto` (native-backed AES-256-GCM) |

Talking points:

- AES-256-GCM authenticated encryption (Silent Shield)
- Generic NFC reader cannot read identity, balance, status, or logs
- GCM authentication tag detects any tampering → `CARD_TAMPERED` rejection
- Compact card codec fits NTAG215 (362 bytes worst-case encrypted)
- Binary `MBC1` envelope — not readable by generic NFC apps

### Slide 6.2: Security Layers

| Layer            | Protection                                                    |
| ---------------- | ------------------------------------------------------------- |
| Card payload     | AES-256-GCM authenticated encryption                          |
| Envelope format  | Binary `MBC1` — opaque to generic readers                     |
| Tamper detection | GCM auth tag; modification → rejection                        |
| Write safety     | `writeNdefMessage` throws on failure; capacity guard enforced |
| Logging          | Identity and balance redacted from all logs                   |
| Key handling     | Demo key bundled (documented); production requires Keystore   |

### Slide 6.3: Prototype vs Production — Honest Separation

| Capability        | Prototype (this build)            | Production (future)                     |
| ----------------- | --------------------------------- | --------------------------------------- |
| Encryption        | AES-256-GCM with bundled demo key | Hardware-backed Keystore + key rotation |
| Operator auth     | Role switcher only                | PIN/biometric per operator              |
| Backend           | None (offline-only)               | Server audit trail                      |
| Card authenticity | Payload integrity only            | Physical card verification              |
| Key rotation      | Not implemented                   | Remote provisioning                     |

Talking points:

- Honest about prototype limits vs production requirements
- Demo key is documented as assessment-only; production path is designed
- Security architecture is real — only key management is simplified for demo

---

## Appendix — Evidence Index

| Document        | Purpose                   | Path                                             |
| --------------- | ------------------------- | ------------------------------------------------ |
| Requirements    | Business behavior         | `.codex/specs/REQUIREMENTS.md`                   |
| Design          | Architecture              | `.codex/specs/DESIGN.md`                         |
| Security        | Silent Shield spec        | `.codex/specs/SECURITY.md`                       |
| Card Spec       | Codec and ledger          | `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md` |
| Signal UI Guide | Design system             | `.codex/specs/SIGNAL_UI_GUIDE.md`                |
| Test Plan       | QA strategy               | `.codex/specs/TEST_PLAN.md`                      |
| Device Matrix   | Hardware validation       | `.codex/specs/DEVICE_TEST_MATRIX.md`             |
| Release Plan    | Deployment strategy       | `.codex/specs/RELEASE_PLAN.md`                   |
| UML Diagrams    | System design visuals     | `.codex/specs/UML_SYSTEM_DIAGRAMS.md`            |
| Traceability    | Requirement → task → test | `.codex/specs/TRACEABILITY.md`                   |
| Decisions       | ADR log                   | `.codex/specs/DECISIONS.md`                      |
| NFC 101         | Platform reference        | `.codex/specs/RFID_NFC_REACT_NATIVE_101.md`      |

---

## Document Governance

- Source of truth: `.codex/specs/` directory
- This outline does not invent product promises or presentation claims
- Prototype limits are stated honestly
- All facts traceable to REQUIREMENTS.md, DESIGN.md, SECURITY.md, or EXECUTION_ORDER.md
