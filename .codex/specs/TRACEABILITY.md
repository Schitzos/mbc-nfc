# KDX Membership Benefit Card Traceability Matrix

This document maps requirements to design sections, implementation tasks, and verification activities.

## Business and System Coverage

| Requirement Group        | Coverage                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BR-001 to BR-006         | Covered by offline card architecture, four-role model, and reusable activity flow.                                                                     |
| BR-007                   | Covered by required parking MVP tariff rule.                                                                                                           |
| BR-008                   | Covered by guest flow out-of-scope decision and Rp 50.000/hour manual guest context note.                                                              |
| BR-009                   | Covered by Silent Shield design and security tests.                                                                                                    |
| BR-010                   | Covered by assessment deliverable tasks and release checklist.                                                                                         |
| BR-011                   | Covered by local SQLite ledger design, Station summary UI, and ledger verification tasks.                                                              |
| BR-012                   | Covered by local tariff setting requirements, Station/Admin tariff UI, Gate tariff snapshot, Terminal visit tariff snapshot display, and tariff tests. |
| SR-001 to SR-015         | Covered by functional requirements FR-001 to FR-015, NFC availability handling, and their task/test mappings below.                                    |
| Agent operating protocol | Covered by `.codex/specs/AGENT_OPERATING_PROTOCOL.md`.                                                                                                 |

## Delivery Role Coverage

| Role                                       | Covered In                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX Designer                             | T-021 to T-026C, M3/M5 release checks, NFR-004, NFR-010.                                                                              |
| NFC/Mobile Native Specialist               | T-003, T-004, T-018, T-028, M4 release checks, NFR-006.                                                                               |
| Technical Writer / Presentation Specialist | T-026D, T-029, T-030, presentation brief, submission definition of done, FR-011.                                                      |
| Test Automation Engineer                   | T-017, T-027, T-027A, M2/M5 release checks, NFR-008, NFR-013, NFR-014, NFR-016, E2E automation mapping in `E2E_TEST_CASES.md`.        |
| Senior QA                                  | T-027, T-028, acceptance confidence, device matrix integrity, manual E2E evidence in `E2E_TEST_CASES.md`.                             |
| Demo/Release Engineer                      | T-000, T-000B, T-027A, T-029, T-030, Git/repository readiness, GitHub governance, demo readiness checklist, FR-011, NFR-015, NFR-016. |

## Traceability Matrix

| Requirement                                 | Design Reference                                                                               | Task Reference                                                   | Verification                                                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| FR-001 Role Switching                       | `DESIGN.md` Section 10                                                                         | T-021, T-026A, T-026B, T-026C                                    | Presentation test for role switcher                                                                                           |
| FR-002 Station Registration                 | `DESIGN.md` Sections 5, 7, 8                                                                   | T-012, T-017, T-018, T-019, T-022, T-026A, T-026B, T-026C        | Use-case test; mock demo; NFC device registration test                                                                        |
| FR-003 Station Top-Up                       | `DESIGN.md` Sections 5, 8                                                                      | T-013, T-017, T-022, T-026A, T-026B, T-026C                      | Use-case test; mock demo; NFC top-up test                                                                                     |
| FR-004 Gate Check-In                        | `DESIGN.md` Sections 8, 10                                                                     | T-014, T-017, T-023, T-026A, T-026B, T-026C                      | Use-case test; NFC activity check-in test                                                                                     |
| FR-005 Gate Simulation Mode                 | `DESIGN.md` Section 10                                                                         | T-014, T-023, T-026A, T-026B, T-026C                             | Use-case test with past timestamp; UI indicator test                                                                          |
| FR-006 Terminal Check-Out                   | `DESIGN.md` Sections 8, 10                                                                     | T-015, T-017, T-017B, T-024, T-026A, T-026B, T-026C              | Card-stored visit tariff snapshot test; NFC activity checkout test                                                            |
| FR-007 Insufficient Balance                 | `DESIGN.md` Section 8                                                                          | T-008, T-015, T-017, T-024, T-026A, T-026B, T-026C               | Use-case test; UI guidance test                                                                                               |
| FR-008 Scout Card Inspection                | `DESIGN.md` Section 10                                                                         | T-016, T-017, T-025, T-026A, T-026B, T-026C                      | Read-only use-case test; presentation test                                                                                    |
| FR-009 Transaction Logs                     | `DESIGN.md` Section 8                                                                          | T-009, T-012 to T-016, T-026A, T-026B, T-026C                    | Unit test for latest five logs and Card Payload v1 FIFO rule                                                                  |
| FR-010 Silent Shield                        | `DESIGN.md` Section 9; `CARD_DATA_SECURITY_LEDGER_SPEC.md`                                     | T-019, T-020                                                     | Authenticated encryption test; integrity/tamper check; generic NFC read check                                                 |
| FR-011 Assessment Deliverables              | `DESIGN.md` Section 12                                                                         | T-000, T-000B, T-026D, T-029, T-030                              | Repository readiness, governance readiness, task presentation brief, and submission package review                            |
| FR-012 Extension Readiness                  | `DESIGN.md` Sections 5, 8, 10                                                                  | T-005, T-007, T-008, T-014, T-015, T-026A, T-026B, T-026C, T-027 | Optional design review proving parking MVP is not hardcoded across layers; no generic runtime fixture required                |
| FR-014 Local Offline Tariff Management      | `REQUIREMENTS.md` FR-014; `DESIGN.md` Section 8; `CARD_DATA_SECURITY_LEDGER_SPEC.md` Section 9 | T-007, T-017B, T-022, T-024, T-027                               | Local tariff repository tests; Station/Admin update E2E; Gate tariff snapshot E2E; Terminal visit tariff snapshot display E2E |
| FR-015 Operational Edge Case Handling       | `REQUIREMENTS.md` FR-015; `DESIGN.md` Section 8; `EDGE_CASES.md`                               | T-014, T-018, T-019, T-020, T-023, T-024, T-027, T-028           | Future timestamp rejection, invalid duration, write-readback failure, capacity, and recovery tests                            |
| XFR-001 NFC Capacity and Write Verification | `CARD_DATA_SECURITY_LEDGER_SPEC.md` Sections 2A, 10; `DESIGN.md` Section 8                     | T-018, T-019, T-020, T-028                                       | Capacity guard, write-readback verification, device matrix evidence                                                           |
| XFR-002 Registration Overwrite Protection   | `REQUIREMENTS.md` FR-002; `CARD_DATA_SECURITY_LEDGER_SPEC.md` Section 10                       | T-012, T-027                                                     | Already registered card rejection tests                                                                                       |
| XFR-003 Invalid Time and Recovery Flow      | `REQUIREMENTS.md` FR-006, FR-007, FR-015; `E2E_TEST_CASES.md`                                  | T-015, T-027                                                     | Invalid duration and insufficient-balance recovery tests                                                                      |
| FR-013 Local Offline Ledger and Reporting   | `DESIGN.md` Sections 2, 7, 8, 10; `CARD_DATA_SECURITY_LEDGER_SPEC.md`                          | T-017A, T-020A, T-022, T-027                                     | Local ledger summary test; Station reporting display test; privacy/audit verification                                         |
| NFR-001 Offline Support                     | `DESIGN.md` Sections 1, 7                                                                      | T-005 to T-020                                                   | Airplane-mode/manual offline demo                                                                                             |
| NFR-002 Integrity                           | `DESIGN.md` Section 8                                                                          | T-008, T-014, T-015                                              | Double action tests                                                                                                           |
| NFR-003 Reliability                         | `DESIGN.md` Section 7                                                                          | T-018                                                            | Cancel/error cleanup test                                                                                                     |
| NFR-004 Usability                           | `DESIGN.md` Section 10                                                                         | T-022 to T-026C                                                  | Presentation review                                                                                                           |
| NFR-005 Maintainability                     | `DESIGN.md` Sections 1, 3, 4                                                                   | T-001, T-005, T-006                                              | Dependency direction review                                                                                                   |
| NFR-006 Portability                         | `DESIGN.md` Section 2                                                                          | T-003, T-004, T-028                                              | iOS and Android device testing                                                                                                |
| NFR-007 Privacy                             | `DESIGN.md` Section 9; `CARD_DATA_SECURITY_LEDGER_SPEC.md`                                     | T-019, T-020                                                     | Silent Shield security tests                                                                                                  |
| NFR-008 Testability                         | `DESIGN.md` Sections 1, 7, 8                                                                   | T-005 to T-017, T-027                                            | Unit/use-case tests without NFC hardware, plus standard E2E documentation and evidence tracking                               |
| NFR-009 Quality                             | `DESIGN.md` Sections 10, 11                                                                    | T-017, T-021 to T-030                                            | Demo smoke test                                                                                                               |
| NFR-010 UI System                           | `DESIGN.md` Sections 10, 12                                                                    | T-026, T-026A, T-026B, T-026C, T-029                             | Signal UI review and demo capture                                                                                             |
| NFR-011 Device Clarity                      | `DESIGN.md` Section 10                                                                         | T-011, T-021 to T-026C, T-028                                    | NFC unsupported/disabled presentation test; device availability test                                                          |
| NFR-012 Data separation                     | `DESIGN.md` Sections 1, 8                                                                      | T-017A, T-020A                                                   | Card member truth remains separate from device-local audit/reporting data                                                     |
| NFR-013 Coverage target                     | `DESIGN.md` Section 11                                                                         | T-027                                                            | Coverage report shows at least 90% automated unit-test coverage for the whole executable repository source                    |
| NFR-014 Static quality gate                 | `DESIGN.md` Section 11                                                                         | T-027A                                                           | SonarCloud analysis and passing quality gate                                                                                  |
| NFR-015 Branching and release automation    | `DESIGN.md` Section 11                                                                         | T-000, T-000B, T-027A, T-027B, T-030                             | Branch protection, reviewer routing, and `main`-triggered Firebase App Distribution review                                    |
| NFR-016 Dependency vulnerability gate       | `DESIGN.md` Section 11                                                                         | T-002, T-027A, T-030                                             | `npm audit` reports 0 known vulnerabilities after dependency changes and for the release candidate                            |

## Coverage Rules

- Every Must requirement must map to at least one design section, one task, and one test.
- Every card write requirement must include capacity validation, write-readback verification, and a failure path.
- Every security requirement must include a Silent Shield or redaction verification.
- Every NFC requirement must include real-device verification where hardware support allows.
- Parking requirements are the only MVP acceptance path. Future activity abstraction must stay architectural only and must not add required non-parking runtime tests.

## Change Control

When a requirement changes:

1. Update `.codex/specs/REQUIREMENTS.md`.
2. Update the relevant design section in `.codex/specs/DESIGN.md`.
3. Update implementation tasks in `.codex/specs/TASKS.md`.
4. Update this traceability matrix.
5. Add a note to the external `CHANGELOG.md` when the changelog is maintained outside the archive.

## Tariff Snapshot Traceability Addendum

| Requirement                         | Requirement doc           | Design/spec                                                                             | Task              | Test/E2E                                                                         |
| ----------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| FR-014A Tariff Snapshot at Check-In | `REQUIREMENTS.md` FR-014A | `DESIGN.md` Tariff Snapshot at Check-In; `CARD_DATA_SECURITY_LEDGER_SPEC.md` Section 9A | `TASKS.md` T-017C | `TEST_PLAN.md` TARIFF-SNAPSHOT-001..006; `E2E_TEST_CASES.md` E2E-TARIFF-003..005 |

## Unit Test Coverage Traceability Addendum

| Requirement                                    | Requirement doc                                         | Design/spec                                                                     | Task                                               | Test/E2E                                        |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| NFR-017 Changed-file unit-test rule            | `REQUIREMENTS.md` Software Quality Requirement Addendum | `UNIT_TEST_COVERAGE_POLICY.md`; `DONE.md` Quality Definition of Done            | `TASKS.md` T-000C, T-027; all implementation tasks | `TEST_PLAN.md` Changed-File Unit Test Policy    |
| NFR-018 90% executable-source coverage         | `REQUIREMENTS.md` Software Quality Requirement Addendum | `UNIT_TEST_COVERAGE_POLICY.md`; `RELEASE_PLAN.md` Release Quality Gate Addendum | `TASKS.md` T-000C, T-027, T-027A                   | Coverage report / CI quality gate               |
| NFR-019 No feature push without matching tests | `REQUIREMENTS.md` Software Quality Requirement Addendum | `AGENT_OPERATING_PROTOCOL.md` Test Obligation Rule                              | All feature tasks in `EXECUTION_ORDER.md`          | Merge review checklist and task result evidence |

## QA and Release Automation Traceability Addendum

| Requirement                                          | Source                                                          | Tasks                | Evidence                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| NFR-020 Feature PR QA Evidence Gate                  | `REQUIREMENTS.md`; `QA_EVIDENCE_POLICY.md`                      | T-027C               | PR QA screenshots, pass/fail note, defect/retest evidence           |
| NFR-021 Final QA Use-Case Evidence Package           | `REQUIREMENTS.md`; `QA_EVIDENCE_POLICY.md`; `E2E_TEST_CASES.md` | T-027C, T-029, T-030 | Final QA evidence package with screenshots per core use case        |
| NFR-022 Firebase App Distribution Release Automation | `REQUIREMENTS.md`; `RELEASE_PLAN.md`                            | T-027B, T-030        | GitHub Actions workflow and Firebase App Distribution release proof |
