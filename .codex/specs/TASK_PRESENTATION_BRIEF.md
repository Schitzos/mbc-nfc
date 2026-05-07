# MBC Task Presentation Brief

> Last updated: 2025-05-07 | Phases 0–9 complete | Phase 10 pending (T-029, T-030 only) | 194 tests | 97%+ coverage | SonarCloud + Firebase configured

This brief explains the KDX Membership Benefit Card project in a format suitable for assessment presentation slides, stakeholder updates, and technical reviewers.

---

## Executive Summary

One mobile app. Four cooperative roles. One NFC card as the portable source of truth.

| Fact         | Value                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| App type     | Single React Native app with role switcher                                 |
| Roles        | Station · Gate · Terminal · Scout                                          |
| Card truth   | NFC card stores identity, balance, status, 5 logs                          |
| Local DB     | SQLite — device-local audit only, never overrides card                     |
| Target tag   | NTAG215                                                                    |
| Tariff       | Fixed Rp 2.000 per started hour (parking MVP)                              |
| Security     | Silent Shield — AES-256-GCM authenticated encryption                       |
| Architecture | Clean Architecture (Domain → Application → Infrastructure → Presentation)  |
| Tests        | 194 automated tests, 97%+ line coverage                                    |
| CI/CD        | Single `build.yml`: PR validation gates + `main` Firebase App Distribution |
| Offline      | All core flows work without internet or backend                            |

---

## How To Read This Brief

| Field              | Meaning                                            |
| ------------------ | -------------------------------------------------- |
| Purpose            | Why the task matters                               |
| Owner              | Main role responsible for delivery or confirmation |
| Output             | What exists after the task is done                 |
| Presentation Value | How to explain the task to reviewers or users      |

---

## Current Phase Status

| Phase | Name                     | Status                         |
| ----- | ------------------------ | ------------------------------ |
| 0     | Project Baseline         | ✅ Complete                    |
| 1     | Core Business Foundation | ✅ Complete                    |
| 2     | Station Feature          | ✅ Complete                    |
| 3     | Gate Feature             | ✅ Complete                    |
| 4     | Terminal Feature         | ✅ Complete                    |
| 5     | Scout Feature            | ✅ Complete                    |
| 6     | Shared App Experience    | ✅ Complete                    |
| 7     | Quality and Verification | ✅ Complete                    |
| 8     | Real NFC Integration     | ✅ Complete                    |
| 9     | Design Hardening         | ✅ Complete                    |
| 10    | Demo and Submission      | ⏳ Pending (T-029, T-030 only) |

### Phase 10 Detail

| Task                     | Status                                                    |
| ------------------------ | --------------------------------------------------------- |
| T-029 Demo Capture       | ⏳ Pending — capture Station/Gate/Terminal/Scout evidence |
| T-030 Submission Package | ⏳ Pending — final packaging for PO GO/NO-GO review       |

---

## Presentation Section Mapping

Use this table to find which tasks support each required presentation section:

| Presentation Section  | Relevant Tasks                         | Key Talking Points                                                   |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| UI/UX Design          | T-021, T-022–T-025, T-026, T-026A–C    | Signal UI system, role-based screens, one app four roles             |
| Software Design       | T-005–T-009, T-006, T-019              | Clean Architecture, domain entities, repository contracts, SOLID     |
| Software Construction | T-001–T-002, T-012–T-016, T-017–T-020A | TypeScript, React Native CLI, feature-by-feature delivery            |
| Software Quality      | T-027, T-027A, T-027C                  | 194 tests, 97%+ coverage, SonarCloud gate, QA evidence               |
| Software Deployment   | T-027B, T-029, T-030                   | GitHub Actions, Firebase App Distribution, APK delivery              |
| Software Security     | T-020, T-019, T-004                    | Silent Shield AES-256-GCM, NTAG215 binary envelope, tamper detection |

---

## Project Setup

| Task                                  | Purpose                                                          | Owner                           | Output                                                   | Presentation Value                                                  |
| ------------------------------------- | ---------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| T-000 Git Repository Baseline         | Make the project safe and ready for GitHub submission            | Demo/Release Engineer           | Git repo, `.gitignore`, README, clean baseline           | Shows the project is reviewable and submission-ready from the start |
| T-000B GitHub Repository Governance   | Enforce branch, review, and approval rules                       | Demo/Release Engineer / PM / PO | Branch protection, reviewer routing, CODEOWNERS          | Shows delivery process is controlled by GitHub rules, not memory    |
| T-001 React Native TypeScript Project | Create the mobile app foundation                                 | Senior React Native FE          | React Native CLI app with TypeScript, Jest, base folders | Shows implementation starts from a maintainable mobile foundation   |
| T-002 Core Dependencies               | Install required libraries for navigation, NFC, state, and tests | Senior React Native FE          | Working dependency setup                                 | Shows the app has the tools needed for NFC role flows               |

## Platform NFC

| Task                               | Purpose                                       | Owner                        | Output                                                         | Presentation Value                                          |
| ---------------------------------- | --------------------------------------------- | ---------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| T-003 iOS NFC Status Documentation | Document iOS as out of MVP/best-effort        | NFC/Mobile Native Specialist | iOS limitation note                                            | Shows honest platform scope and avoids blocking Android MVP |
| T-004 Android NFC Configuration    | Prepare Android NFC permissions and detection | NFC/Mobile Native Specialist | Android 9 FE NFC permission, feature declaration, device check | Shows Android 9 FE is the MVP real-card demo path           |

## Domain Layer

| Task                         | Purpose                                     | Owner                                    | Output                                                                  | Presentation Value                                              |
| ---------------------------- | ------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| T-005 Domain Entities        | Define the core MBC data model              | Software Architect                       | Card, member, activity session, tariff, log types                       | Shows the card stores identity, balance, status, and logs       |
| T-006 Repository Interface   | Hide NFC details behind a clean contract    | Software Architect                       | `MbcCardRepository` interface                                           | Shows business logic can work with mock or real NFC             |
| T-007 Tariff Calculator      | Calculate member parking fees correctly     | Senior React Native FE / Test Automation | Rp 2.000 started-hour parking rule with isolated tariff logic           | Shows the required parking MVP works while remaining extendable |
| T-008 Activity State Policy  | Prevent invalid check-in/check-out behavior | Software Architect / Test Automation     | State rules for check-in, checkout, double action, insufficient balance | Shows balance/status integrity is protected                     |
| T-009 Transaction Log Policy | Keep recent card history compact            | Software Architect                       | Latest-five transaction log rule                                        | Shows the NFC card keeps useful history within limited memory   |

## Application Layer

| Task                            | Purpose                                      | Owner                                   | Output                                                        | Presentation Value                                           |
| ------------------------------- | -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| T-010 Card DTOs                 | Shape domain data for screens                | Senior React Native FE                  | Screen-safe DTOs without exposing internals                   | Shows UI does not depend on raw card payload                 |
| T-011 NFC Availability Use Case | Tell the UI whether real NFC actions can run | Senior React Native FE / NFC Specialist | Supported, unsupported, disabled guidance                     | Shows users are informed that real card operations need NFC  |
| T-012 Register Member Card      | Create a valid member card                   | Senior React Native FE                  | Generated member ID, initial card state, register log         | Shows staff does not type member ID; the system generates it |
| T-013 Top-Up Member Card        | Add balance safely                           | Senior React Native FE                  | Positive top-up validation, balance update, top-up log        | Shows cooperative staff can manage member balance offline    |
| T-014 Parking Check-In          | Start the parking session                    | Senior React Native FE                  | Parking activity type, entry time, checked-in status, log     | Shows Gate writes member entry state to the card             |
| T-015 Parking Check-Out         | End the parking session and deduct fee       | Senior React Native FE                  | Duration, charged hours, fee, balance deduction, status clear | Shows Terminal calculates fee and updates card state         |
| T-016 Inspect Member Card       | Read card without modifying it               | Senior React Native FE                  | Balance, status, and latest logs                              | Shows Scout is one-tap and read-only                         |

## Infrastructure Layer

| Task                            | Purpose                                                     | Owner                                       | Output                                                     | Presentation Value                                                          |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| T-017 Mock Card Repository      | Enable development without real NFC hardware                | Senior React Native FE / Test Automation    | In-memory card fixtures for normal and edge states         | Shows demo and tests can progress before physical cards arrive              |
| T-017A Local SQLite Ledger      | Add device-side audit and reporting storage                 | Senior React Native FE / Software Architect | Local ledger repository and summary queries                | Shows the app can report offline income and audit data on the device        |
| T-018 NFC Card Repository       | Connect app use cases to real NFC read/write                | NFC/Mobile Native Specialist                | Real NFC read/write implementation with cleanup            | Shows the app can move from mock mode to real card operations               |
| T-019 MBC Card Codec            | Encode and decode compact card payloads                     | Software Architect / Security Pentester     | Versioned payload codec and validator                      | Shows card data format is controlled and evolvable                          |
| T-020 Silent Shield             | Protect sensitive card data                                 | Security Pentester / Software Architect     | Protected identity/balance, integrity check, redacted logs | Shows sensitive member data is not plain NFC text and tampering is detected |
| T-020A Ledger Write Integration | Record successful business actions into local audit storage | Senior React Native FE / Software Architect | Ledger append behavior and failure handling                | Shows offline reporting stays connected to real card operations             |

## Presentation Layer

| Task                              | Purpose                                         | Owner                                     | Output                                                          | Presentation Value                                            |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| T-021 Role Switcher               | Let one app play four roles                     | Senior React Native FE / UI UX Designer   | Station, Gate, Terminal, Scout selection                        | Shows the assessment runs as one multi-role app               |
| T-022 Station Screen              | Register, top up, and review local summaries    | Senior React Native FE / UI UX Designer   | Registration, top-up, ledger summary, NFC action, result states | Shows cooperative staff workflow plus offline reporting value |
| T-023 Gate Screen                 | Check in members to parking                     | Senior React Native FE / UI UX Designer   | Parking activity indicator, check-in, result states             | Shows entry flow with real device time                        |
| T-024 Terminal Screen             | Check out and deduct balance                    | Senior React Native FE / UI UX Designer   | Fee summary, balance result, insufficient balance guidance      | Shows exit flow and fee calculation                           |
| T-025 Scout Screen                | Inspect card safely                             | Senior React Native FE / UI UX Designer   | Read-only summary, balance, status, latest logs                 | Shows members can inspect card state without mutation         |
| T-026 Signal UI Direction         | Apply the selected design system                | UI UX Designer / Senior React Native FE   | Signal tokens, components, and role screen styling              | Shows the app follows the required Signal UI direction        |
| T-026A Low-Fi E2E Figma Flow      | Map all screens and edge cases before coding UI | UI UX Designer / Project Manager          | Low-fi Figma flow                                               | Shows the complete user journey is designed first             |
| T-026B Hi-Fi Figma Screens        | Provide implementation-ready visual guidance    | UI UX Designer / FE / System Analyst      | Hi-fi mobile screens and validation board                       | Shows what the final demo should look like                    |
| T-026C Hi-Fi Polish and Visual QA | Fix spacing, buttons, icons, and overlap issues | UI UX Designer / FE / PO / SA / Architect | Hi-fi V2 polish plan and updated Figma when available           | Shows design quality is reviewed before implementation        |
| T-026D Task Presentation Brief    | Keep task explanations ready for slides         | Technical Writer / Project Manager        | This presentation brief                                         | Shows progress can be explained clearly to stakeholders       |

## Verification and Demo

| Task                                            | Purpose                                        | Owner                                            | Output                                                                  | Presentation Value                                                        |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| T-027 Unit and Use-Case Tests                   | Prove business logic works                     | Test Automation Engineer / Senior QA             | 194 tests, 97%+ coverage, `E2E_TEST_CASES.md` with evidence paths       | Shows quality is not only manual demo and has traceable evidence          |
| T-027A SonarCloud Quality Gate                  | Keep automated quality visible and enforceable | Test Automation Engineer / Demo/Release Engineer | SonarCloud setup, coverage import, quality-gate result                  | Shows code quality is measured continuously, not judged only by demo feel |
| T-027B GitHub Actions Firebase App Distribution | Controlled APK delivery from `main`            | Demo/Release Engineer                            | GitHub Actions workflow → Firebase App Distribution                     | Shows the project has a controlled APK delivery path for reviewers        |
| T-027C Feature PR QA Screenshot Evidence        | Prove each feature works visually              | Senior QA / Test Automation Engineer             | Screenshot evidence per feature PR                                      | Shows each feature is checked by QA before merge                          |
| T-028 Device Tests                              | Validate real NFC behavior                     | NFC Specialist / Senior QA                       | Android + NTAG215 device matrix; iOS optional/deferred                  | Shows real hardware behavior is recorded honestly                         |
| T-029 Demo Capture                              | Prepare evidence for assessment review         | Demo/Release Engineer / Technical Writer         | Images or short video of key flows plus APK distribution notes          | Shows the app working through all four roles                              |
| T-030 Submission Package                        | Package the final assessment deliverables      | Demo/Release Engineer / Technical Writer / PM    | Repository, docs, presentation, run instructions, APK distribution plan | Shows the project is ready for reviewer handoff                           |

---

## Slide Grouping Suggestion

| Slide                     | Use These Tasks            |
| ------------------------- | -------------------------- |
| Problem and Scope         | T-000 to T-002             |
| NFC and Device Strategy   | T-003, T-004, T-011, T-018 |
| Core Business Logic       | T-005 to T-016             |
| Security and Card Payload | T-019, T-020               |
| UI and Experience         | T-021 to T-026C            |
| Quality and Demo          | T-027 to T-030             |

---

## Key Architecture Decisions (for Software Design slide)

| Decision                     | Rationale                                                             |
| ---------------------------- | --------------------------------------------------------------------- |
| NFC card is source of truth  | Offline-first: no backend needed for core flows                       |
| SQLite is audit-only         | Device-local reporting; never overrides card state                    |
| Clean Architecture layers    | Domain has zero framework dependencies; testable without NFC hardware |
| Repository interface pattern | Swap mock ↔ real NFC without changing business logic                  |
| One app, four roles          | Simpler deployment; role switcher controls access                     |
| Parking as first activity    | Required by assessment; architecture supports future activities       |
| NTAG215 target               | Widely available, 504-byte writable; compact binary payload fits      |

---

## Security Posture (for Software Security slide)

| Layer            | Protection                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| Card payload     | AES-256-GCM authenticated encryption (Silent Shield)                     |
| Envelope format  | Binary `mbc1` — not readable by generic NFC apps                         |
| Tamper detection | GCM authentication tag; any modification → `CARD_TAMPERED`               |
| Key handling     | Demo key bundled (documented as demo-only); production requires Keystore |
| Logging          | Identity and balance redacted from all logs                              |
| Write safety     | writeNdefMessage throws on failure; capacity guard enforced before write |
| Capacity guard   | Payload checked against NTAG215 limit before every write                 |

### Prototype vs Production — Honest Separation

| Capability             | Prototype (this build)                | Production (future)                           |
| ---------------------- | ------------------------------------- | --------------------------------------------- |
| Encryption             | AES-256-GCM with app-bundled demo key | Hardware-backed Keystore + fleet key rotation |
| Operator auth          | None (role switcher only)             | PIN/biometric per operator                    |
| Backend reconciliation | None (offline-only)                   | Server audit trail                            |
| Card authenticity      | Payload integrity only                | Physical card verification                    |
| Key rotation           | Not implemented                       | Remote provisioning                           |

---

## Quality Evidence (for Software Quality slide)

| Metric           | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Automated tests  | 194                                                         |
| Line coverage    | 97%+                                                        |
| Coverage policy  | ≥90% for all executable source                              |
| Static analysis  | SonarCloud quality gate integrated                          |
| Dependency audit | `npm audit` = 0 vulnerabilities                             |
| QA evidence      | Screenshot proof per feature PR (T-027C)                    |
| CI pipeline      | Single `build.yml`: PR validates, `main` builds + publishes |

### Quality Improvement Beyond Requirements

The implementation requires every changed executable source file to have a created or updated unit test. The 90%+ coverage target and SonarCloud integration are architecture-driven quality improvements beyond the original PDF requirement.

---

## Deployment Path (for Software Deployment slide)

```
feature/* branch → develop (integration) → main (release trigger)
                                              ↓
                                    GitHub Actions workflow
                                              ↓
                                    Build Android APK
                                              ↓
                                    Firebase App Distribution
                                              ↓
                                    Testers/Reviewers install
```

---

## Offline-First Value Proposition

Why offline matters for a village cooperative:

- Internet is unstable in rural cooperative locations
- NFC card carries member state — no server round-trip needed
- Balance, identity, activity status, and 5 transaction logs live on the card
- SQLite provides device-local audit without network dependency
- Core flows (register, top-up, check-in, check-out, inspect) work with zero connectivity

---

## Scope Boundaries

### In Scope (Prototype)

- Parking as the required MVP activity and demo scenario
- Four roles in one app: Station, Gate, Terminal, Scout
- NFC card as portable source of truth
- Offline-first operation for all core flows
- Silent Shield authenticated encryption
- Local SQLite audit/reporting (device-only)
- Signal UI design system

### Out of Scope

- Guest flow and guest tariff (separate manual process per PDF)
- Backend API or central database
- Cloud sync
- Payment gateway
- Gate/barrier hardware integration
- Non-parking activities (design-ready but not implemented)
- iOS NFC write (deferred; Android is MVP target)

### Parking Is the First Demo Activity, Not the Product Limit

The architecture uses reusable activity abstractions (activity type, tariff rule interface, state policy). Parking is the required assessment scenario and the only implemented activity. The same check-in/check-out flow can support future cooperative activities without architectural changes.

---

## Remaining Work

| Phase | What's Needed            | Blocker          |
| ----- | ------------------------ | ---------------- |
| 10    | T-029 Demo capture       | Execution time   |
| 10    | T-030 Submission package | T-029 completion |

All other phases (0–9) are complete. PO confirmed 2025-05-07.

---

## UI Styling Note

The current Signal-inspired styling implemented in the app is sufficient for assessment submission. No Figma token extraction or additional design system migration is needed. The in-code theme tokens (colors, spacing, typography) already deliver a clean, consistent, demo-ready experience across all role screens. PO confirmed 2025-05-07.

---

## Document Governance

- Source of truth: `.codex/specs/` directory
- This brief does not invent product promises or presentation claims
- Prototype limits are stated honestly (see Security Posture table above)
- All facts traceable to REQUIREMENTS.md, DESIGN.md, SECURITY.md, or EXECUTION_ORDER.md
