# MBC Improvements Not Explicitly Explained in the Original Requirement

## Purpose

This document lists the improvements, product decisions, architecture clarifications, and delivery controls that were added during Product Owner review but were **not explicitly described in the original `KDX#1 - Membership Benefit Card (MBC).pdf` requirement**.

These additions are intended to make the requirement implementable, testable, secure, and clear for System Analyst, Software Architect, developers, QA, and Codex execution.

## Source-of-Truth Reminder

The original PDF remains the business source of truth for the required MBC assessment scope:

- One app with four roles: Station, Gate, Terminal, Scout.
- NFC card stores identity, balance, visit status, and last 5 transaction logs.
- Offline-first operation without central database/API dependency.
- Parking member tariff defaults to Rp2.000 per started hour.
- Sequential loop: no double tap-in or double tap-out.
- Gate simulation mode for past entry time.
- Silent Shield: sensitive identity and balance must not be plainly readable by other NFC apps.
- Guest flow is out of scope.

The improvements below do **not replace** the original requirement. They clarify how the team should implement it safely.

---

# 1. Product Scope Improvements

| Improvement                            | Not explicitly in original PDF                                                          | Why we added it                                                         | Current treatment                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Parking-only MVP decision              | PDF focuses on parking but does not explicitly discuss future activity types            | Prevents Codex/team from overbuilding generic benefit/activity modules  | MVP must implement parking only; generic activity is extension-ready design only                |
| Future activity extensibility boundary | PDF mentions membership benefits generally but only defines parking flow                | Allows future features without polluting MVP                            | Code should isolate tariff/session/use-case boundaries, but no non-parking runtime flow for MVP |
| Explicit guest exclusion               | PDF says guest mode is out of scope, but docs now repeat it across implementation files | Prevents accidental guest tariff implementation                         | Guest/non-member parking must not be built                                                      |
| PO GO/NO-GO checklist                  | PDF asks for deliverables but not formal gate criteria                                  | Helps PM/PO decide readiness for Codex, NFC phase, and final submission | Required project management artifact                                                            |
| Edge case register                     | PDF gives core flow and assumptions, not a complete edge-case list                      | Gives QA/dev a shared list of expected failure states                   | Required support doc for QA and implementation                                                  |

---

# 2. Offline Tariff Management Improvements

| Improvement                            | Not explicitly in original PDF                                                | Why we added it                                                            | Current treatment                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Local editable tariff setting          | PDF states Rp2.000/hour but does not explain tariff changes after APK release | Offline app cannot fetch config from backend, and APK may already be built | Authorized Station/Admin can update tariff locally without APK rebuild          |
| Tariff stored locally on-device        | PDF does not define local config storage                                      | Needed because no backend/API exists                                       | Store active tariff in SQLite or secure local storage                           |
| Device-local tariff limitation         | PDF does not discuss multiple offline devices with different local configs    | Avoids inconsistent charging across Station/Gate/Terminal phones           | All operational devices must be manually configured with the same active tariff |
| Active tariff display before deduction | PDF says Terminal deducts balance, but not that tariff must be shown          | Prevents hidden charging mistakes                                          | Terminal must show tariff used before checkout deduction                        |
| Tariff update authorization            | PDF does not define admin setting permissions                                 | Prevents unauthorized tariff manipulation                                  | Only authorized Station/Admin staff may update active tariff                    |
| Future signed Tariff Config NFC card   | PDF does not mention config distribution                                      | Offline-friendly way to sync tariff across devices later                   | Future enhancement, not MVP                                                     |

## Important tariff decision added by PO review

Tariff must be **locked at successful Gate check-in**.

This means:

| Scenario                                         | Expected behavior                                          |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Member checks in when tariff is Rp2.000/hour     | Card stores Rp2.000/hour tariff snapshot                   |
| Admin later changes local tariff to Rp3.000/hour | Existing checked-in member still pays Rp2.000/hour         |
| New member checks in after change                | New card visit stores Rp3.000/hour snapshot                |
| Terminal checkout                                | Uses card-stored tariff snapshot, not current local tariff |

This protects fairness and prevents users who already tapped in from being charged a newer tariff unexpectedly.

---

# 3. NFC Card and Data Model Improvements

| Improvement                        | Not explicitly in original PDF                                         | Why we added it                                                | Current treatment                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Compact versioned payload schema   | PDF says card stores data but not exact schema/versioning              | Needed for implementation consistency and future compatibility | Card payload includes schema/version fields                                                       |
| Short field names for card payload | PDF mentions limited memory but not exact data packing strategy        | NFC cards/tags may have very limited writable capacity         | Compact logical fields are used for card storage                                                  |
| NFC capacity budget rule           | PDF mentions memory is limited but does not define acceptance behavior | Prevents implementation that cannot fit on real tags           | Real card readiness requires selected tag capacity and payload size proof                         |
| `CARD_CAPACITY_INSUFFICIENT` error | PDF does not define this error                                         | Required when encrypted payload cannot fit selected card       | Must block write and show clear error                                                             |
| Post-write readback verification   | PDF does not specify write verification                                | NFC writes can fail or be partial                              | After every successful write, app must read back and verify expected state before showing success |
| Write counter / replay handling    | PDF does not mention replay protection                                 | Helps detect stale/tampered payload writes                     | Included as security/integrity hardening                                                          |
| Schema version compatibility rule  | PDF does not discuss future payload versions                           | Avoids crashing on old/future cards                            | Reject unsupported future schema safely; support known versions where feasible                    |
| Registration overwrite protection  | PDF says Station registers cards, but not re-registration behavior     | Prevents accidental overwrite of valid cards                   | Existing MBC card registration must be rejected unless reset flow exists                          |

---

# 4. Security Improvements

| Improvement                                    | Not explicitly in original PDF                                      | Why we added it                                              | Current treatment                                              |
| ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Production-grade Silent Shield definition      | PDF only says identity and balance must not be plainly readable     | Assessors may inspect the card with generic NFC apps         | Use authenticated encryption such as AES-256-GCM or equivalent |
| HMAC/integrity validation                      | PDF does not specify tamper detection method                        | Prevents modified payload/balance/status from being accepted | Validate integrity before any role action                      |
| Reject Base64-only/obfuscation-only protection | PDF does not specify implementation detail                          | Base64 can be easily decoded and would fail security intent  | Plain JSON, Base64-only, or weak obfuscation is not allowed    |
| Key ID/envelope version                        | PDF does not mention key lifecycle                                  | Supports safer evolution of card codec                       | Include envelope marker/version and key ID where feasible      |
| Generic NFC reader security acceptance         | PDF says data must not be plainly readable, but not how to prove it | Provides assessor-testable evidence                          | Generic NFC app must not reveal member ID or balance plainly   |
| Secure logging rule                            | PDF does not discuss app logs                                       | Prevents decrypted card data/secrets leaking through logs    | Logs and SQLite must not expose raw decrypted payload or keys  |
| Tariff snapshot integrity                      | PDF does not mention tariff snapshot                                | Prevents tampering with check-in tariff                      | Snapshot is protected inside Silent Shield payload             |

---

# 5. SQLite Local Ledger Improvements

| Improvement                                | Not explicitly in original PDF                                                            | Why we added it                                                       | Current treatment                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Device-local SQLite ledger                 | PDF says no central DB and card carries data, but does not define local reporting storage | Station users need transaction counts/income/reporting on each device | SQLite allowed only for local reporting/audit                                                                  |
| Ledger is not member state source of truth | PDF says card stores state, but docs now enforce this boundary                            | Prevents SQLite from overriding card balance/status                   | NFC card remains source of truth for member state                                                              |
| Ledger event coverage                      | PDF says card stores 5 logs, but not local operational reports                            | Gives Station a richer audit report without growing card data         | Local ledger records successful REGISTER, TOPUP, CHECKIN, CHECKOUT                                             |
| Local-device reporting limitation          | PDF does not discuss multi-device aggregation                                             | Offline devices cannot share logs automatically                       | Reports are current-device/current-installation only                                                           |
| Income calculation boundary                | PDF does not define accounting/reporting rules                                            | Avoids treating check-in as revenue                                   | Income reports should sum money-related events only, especially top-up and checkout deduction where applicable |

---

# 6. UX and Operational Safety Improvements

| Improvement                   | Not explicitly in original PDF                                           | Why we added it                                       | Current treatment                                                          |
| ----------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Clear active tariff display   | PDF says Terminal calculates/deducts, not that tariff must be displayed  | Helps operator/member verify charge before deduction  | Terminal shows tariff, duration, and fee before write/deduction            |
| Device time visibility        | PDF requires simulation mode but not clock validation                    | Offline fee calculation depends on local device clock | Gate/Terminal should show current device time; invalid duration rejected   |
| Invalid duration handling     | PDF says simulation supports past time, but not future/wrong clock cases | Prevents negative duration and wrong fee              | Checkout rejects if exit time is earlier than entry time                   |
| Keep-card-near-phone behavior | PDF does not describe NFC UX                                             | Prevents incomplete write due to early card removal   | App should not show success until write-readback verification passes       |
| Unsupported card handling     | PDF assumes NFC card, but not unknown card behavior                      | Prevents crash on random NFC tags/cards               | Show clear unsupported/invalid card error                                  |
| Low balance recovery flow     | PDF says top-up if saldo kurang, but not exact state behavior            | Ensures member can top up while still checked in      | Top-up must not clear active visit; checkout succeeds after enough balance |

---

# 7. Architecture and Engineering Improvements

| Improvement                      | Not explicitly in original PDF                                            | Why we added it                                                                    | Current treatment                                                                |
| -------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Clean Architecture layering      | PDF does not prescribe architecture                                       | Makes Codex/dev implementation maintainable and testable                           | Domain, application, infrastructure, and presentation boundaries are documented  |
| Repository interfaces            | PDF does not define code structure                                        | Allows mock-first development before real NFC hardware                             | `CardRepository`, ledger repository, and tariff repository abstractions are used |
| Mock card repository             | PDF expects working app but does not discuss development strategy         | Enables development/testing before physical NFC card is ready                      | Mock-first implementation is allowed and recommended                             |
| Android-first real NFC target    | PDF does not specify platform priority                                    | iOS NFC writes can be restrictive; Android is usually more flexible for assessment | Android is first real NFC target; iOS support depends on capability/constraints  |
| Platform NFC configuration tasks | PDF asks for app but not platform setup details                           | Prevents missing Android/iOS permissions/config                                    | Android and iOS NFC setup tasks are listed                                       |
| UML/system diagrams              | PDF asks presentation includes software design, but not specific diagrams | Helps SA/architect/dev team understand flow                                        | UML/system diagrams included as handoff material                                 |
| Agent operating protocol         | PDF does not discuss Codex execution                                      | Prevents Codex from following conflicting files or overbuilding                    | Defines source-of-truth and execution rules for AI-assisted implementation       |

---

# 8. Quality, Release, and Governance Improvements

| Improvement                 | Not explicitly in original PDF                            | Why we added it                                      | Current treatment                                                      |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Execution order file        | PDF lists deliverables but not implementation sequence    | Gives PM/dev/Codex a single delivery sequence        | `EXECUTION_ORDER.md` is official build sequence                        |
| Detailed task list          | PDF does not break work into tasks                        | Makes implementation actionable                      | `TASKS.md` provides task-level detail                                  |
| E2E test cases              | PDF gives acceptance behavior but not test scripts        | Ensures demo scenarios are repeatable                | `E2E_TEST_CASES.md` documents flows and evidence                       |
| Test plan                   | PDF does not define test levels                           | Supports software quality deliverable                | Unit/application/presentation/device/security tests defined            |
| Traceability matrix         | PDF does not require matrix but deliverables include docs | Shows every business requirement maps to tasks/tests | `TRACEABILITY.md` used for requirement coverage                        |
| Definition of Done          | PDF says working app/no crash but not DoD                 | Creates shared completion standard                   | `DONE.md` defines task, requirement, security, and submission DoD      |
| Release plan                | PDF asks source/demo but not release stages               | Helps PM control milestones                          | `RELEASE_PLAN.md` defines milestone flow                               |
| GitHub governance/branching | PDF asks repository link but not governance               | Helps avoid unstable submission branch               | Branching, merge, and main-trigger delivery are documented             |
| SonarCloud/quality gate     | PDF asks software quality in presentation but not tooling | Strengthens assessment evidence                      | Added as engineering quality enhancement, not core product requirement |

---

# 9. Documentation and Handoff Improvements

| Improvement                 | Not explicitly in original PDF                                     | Why we added it                                              | Current treatment                                                                            |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Project Owner reading order | PDF does not define how to read docs                               | Helps PM/SA/architect/dev/QA start in correct order          | `PROJECT_OWNER_READING_ORDER.md` included                                                    |
| PO alignment summary        | PDF does not summarize decisions                                   | Captures review decisions and scope boundaries               | `PO_ALIGNMENT_SUMMARY.md` included                                                           |
| Change notes                | PDF does not require change log style notes                        | Helps manual patching and review                             | `CHANGE_NOTE.md` included in patch packages                                                  |
| Final GO/NO-GO checklist    | PDF does not define gate states                                    | Helps decide development start vs final submission readiness | Codex/dev start is GO; final submission remains conditional until hardware/security evidence |
| Device test matrix          | PDF does not ask for explicit matrix                               | Needed because NFC behavior depends on device/card           | Required before real NFC/final assessment readiness                                          |
| Signal UI guide             | PDF requires Signal UI but does not provide implementation mapping | Helps translate Signal UI into screens/states                | Guide created; token/source confirmation remains final hardening dependency                  |

---

# 10. Improvements That Are Deliberately Future Enhancements

These are valuable but should **not** block the parking MVP unless the assessor explicitly asks for them.

| Future enhancement                                          | Why not MVP                                                                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Generic/non-parking activity runtime flow                   | Original PDF only requires parking flow; building generic activity now risks scope creep |
| Tariff history/effective-date schedule                      | Offline complexity is high; tariff snapshot at check-in solves fairness for MVP          |
| Signed Tariff Config NFC card                               | Useful for offline tariff distribution, but adds admin-card security and extra flows     |
| Central/global reporting                                    | Contradicts offline/no central DB spirit unless added as a later sync feature            |
| Production-grade staff authentication beyond demo/admin PIN | Important for real production but may exceed assessment scope                            |
| Full key management/HSM/backend key rotation                | Stronger production security, but no backend is allowed in assessment MVP                |

---

# 11. PO Classification

| Category                      | Status                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Original PDF must-have        | Must implement for MVP                                                                  |
| Improvements in this document | Required clarifications or quality improvements unless marked future                    |
| Future enhancements           | Keep design extensible, but do not implement for MVP                                    |
| Hardware/card TBD items       | Do not block mock-first development; must be completed before final real-NFC submission |

---

# 12. Recommended Team Usage

System Analyst should use this document to understand which requirements are derived from PO/architecture review rather than directly stated in the PDF.

Software Architect should use this document to keep the implementation extensible without adding non-MVP runtime scope.

Developers/Codex should treat these improvements as guardrails when implementing the MVP.

QA should convert the edge-case and security improvements into regression and E2E checks.

Project Manager should use this document together with `PO_FINAL_GO_NO_GO_CHECKLIST.md` to separate:

- GO for Codex/development
- Conditional GO for real NFC integration
- NOT GO yet for final submission until evidence is complete

---

# 13. Final PO Statement

The original requirement explains **what** the MBC assessment must demonstrate.

The improvements in this document explain **how** the team will make that requirement implementable, fair, secure, testable, and ready for team handoff.

These improvements are acceptable because they support the original requirement without changing the MVP scope away from the required parking membership flow.
