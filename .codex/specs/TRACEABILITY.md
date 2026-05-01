# KDX Membership Benefit Card Traceability Matrix

This document maps requirements to design sections, implementation tasks, and verification activities.

## Business and System Coverage

| Requirement Group        | Coverage                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| BR-001 to BR-006         | Covered by offline card architecture, four-role model, and reusable activity flow.                                  |
| BR-007                   | Covered by parking demo activity tariff rule.                                                                       |
| BR-008                   | Covered by guest flow out-of-scope decision and Rp 50.000/hour manual guest context note.                           |
| BR-009                   | Covered by Silent Shield design and security tests.                                                                 |
| BR-010                   | Covered by assessment deliverable tasks and release checklist.                                                      |
| BR-011                   | Covered by local SQLite ledger design, Station summary UI, and ledger verification tasks.                           |
| SR-001 to SR-013         | Covered by functional requirements FR-001 to FR-013, NFC availability handling, and their task/test mappings below. |
| Agent operating protocol | Covered by `.codex/specs/AGENT_OPERATING_PROTOCOL.md`.                                                              |

## Delivery Role Coverage

| Role                                       | Covered In                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| UI/UX Designer                             | T-021 to T-026C, M3/M5 release checks, NFR-004, NFR-010.                                                                     |
| NFC/Mobile Native Specialist               | T-003, T-004, T-018, T-028, M4 release checks, NFR-006.                                                                      |
| Technical Writer / Presentation Specialist | T-026D, T-029, T-030, presentation brief, submission definition of done, FR-011.                                             |
| Test Automation Engineer                   | T-017, T-027, T-027A, M2/M5 release checks, NFR-008, NFR-013, NFR-014, E2E automation mapping in `E2E_TEST_CASES.md`.        |
| Senior QA                                  | T-027, T-028, acceptance confidence, device matrix integrity, manual E2E evidence in `E2E_TEST_CASES.md`.                    |
| Demo/Release Engineer                      | T-000, T-000B, T-027A, T-029, T-030, Git/repository readiness, GitHub governance, demo readiness checklist, FR-011, NFR-015. |

## Traceability Matrix

| Requirement                               | Design Reference                 | Task Reference                                                   | Verification                                                                                       |
| ----------------------------------------- | -------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| FR-001 Role Switching                     | `DESIGN.md` Section 10           | T-021, T-026A, T-026B, T-026C                                    | Presentation test for role switcher                                                                |
| FR-002 Station Registration               | `DESIGN.md` Sections 5, 7, 8     | T-012, T-017, T-018, T-019, T-022, T-026A, T-026B, T-026C        | Use-case test; mock demo; NFC device registration test                                             |
| FR-003 Station Top-Up                     | `DESIGN.md` Sections 5, 8        | T-013, T-017, T-022, T-026A, T-026B, T-026C                      | Use-case test; mock demo; NFC top-up test                                                          |
| FR-004 Gate Check-In                      | `DESIGN.md` Sections 8, 10       | T-014, T-017, T-023, T-026A, T-026B, T-026C                      | Use-case test; NFC activity check-in test                                                          |
| FR-005 Gate Simulation Mode               | `DESIGN.md` Section 10           | T-014, T-023, T-026A, T-026B, T-026C                             | Use-case test with past timestamp; UI indicator test                                               |
| FR-006 Terminal Check-Out                 | `DESIGN.md` Sections 8, 10       | T-015, T-017, T-024, T-026A, T-026B, T-026C                      | Activity tariff test; NFC activity checkout test                                                   |
| FR-007 Insufficient Balance               | `DESIGN.md` Section 8            | T-008, T-015, T-017, T-024, T-026A, T-026B, T-026C               | Use-case test; UI guidance test                                                                    |
| FR-008 Scout Card Inspection              | `DESIGN.md` Section 10           | T-016, T-017, T-025, T-026A, T-026B, T-026C                      | Read-only use-case test; presentation test                                                         |
| FR-009 Transaction Logs                   | `DESIGN.md` Section 8            | T-009, T-012 to T-016, T-026A, T-026B, T-026C                    | Unit test for latest five logs                                                                     |
| FR-010 Silent Shield                      | `DESIGN.md` Section 9            | T-019, T-020                                                     | Codec/security test; integrity/tamper check; generic NFC read check                                |
| FR-011 Assessment Deliverables            | `DESIGN.md` Section 12           | T-000, T-000B, T-026D, T-029, T-030                              | Repository readiness, governance readiness, task presentation brief, and submission package review |
| FR-012 Activity Extensibility             | `DESIGN.md` Sections 5, 8, 10    | T-005, T-007, T-008, T-014, T-015, T-026A, T-026B, T-026C, T-027 | Generic activity fixture test                                                                      |
| FR-013 Local Offline Ledger and Reporting | `DESIGN.md` Sections 2, 7, 8, 10 | T-017A, T-020A, T-022, T-027                                     | Local ledger summary test; Station reporting display test; privacy/audit verification              |
| NFR-001 Offline Support                   | `DESIGN.md` Sections 1, 7        | T-005 to T-020                                                   | Airplane-mode/manual offline demo                                                                  |
| NFR-002 Integrity                         | `DESIGN.md` Section 8            | T-008, T-014, T-015                                              | Double action tests                                                                                |
| NFR-003 Reliability                       | `DESIGN.md` Section 7            | T-018                                                            | Cancel/error cleanup test                                                                          |
| NFR-004 Usability                         | `DESIGN.md` Section 10           | T-022 to T-026C                                                  | Presentation review                                                                                |
| NFR-005 Maintainability                   | `DESIGN.md` Sections 1, 3, 4     | T-001, T-005, T-006                                              | Dependency direction review                                                                        |
| NFR-006 Portability                       | `DESIGN.md` Section 2            | T-003, T-004, T-028                                              | iOS and Android device testing                                                                     |
| NFR-007 Privacy                           | `DESIGN.md` Section 9            | T-019, T-020                                                     | Silent Shield security tests                                                                       |
| NFR-008 Testability                       | `DESIGN.md` Sections 1, 7, 8     | T-005 to T-017, T-027                                            | Unit/use-case tests without NFC hardware, plus standard E2E documentation and evidence tracking    |
| NFR-009 Quality                           | `DESIGN.md` Sections 10, 11      | T-017, T-021 to T-030                                            | Demo smoke test                                                                                    |
| NFR-010 UI System                         | `DESIGN.md` Sections 10, 12      | T-026, T-026A, T-026B, T-026C, T-029                             | Signal UI review and demo capture                                                                  |
| NFR-011 Device Clarity                    | `DESIGN.md` Section 10           | T-011, T-021 to T-026C, T-028                                    | NFC unsupported/disabled presentation test; device availability test                               |
| NFR-012 Data separation                   | `DESIGN.md` Sections 1, 8        | T-017A, T-020A                                                   | Card member truth remains separate from device-local audit/reporting data                          |
| NFR-013 Coverage target                   | `DESIGN.md` Section 11           | T-027                                                            | Coverage report shows at least 90% automated unit/application coverage for implemented scope       |
| NFR-014 Static quality gate               | `DESIGN.md` Section 11           | T-027A                                                           | SonarCloud analysis and passing quality gate                                                       |
| NFR-015 Branching and release automation  | `DESIGN.md` Section 11           | T-000, T-000B, T-027A, T-030                                     | Branch protection, reviewer routing, and `main`-triggered release automation review                |

## Coverage Rules

- Every Must requirement must map to at least one design section, one task, and one test.
- Every card write requirement must include a validation and failure path.
- Every security requirement must include a Silent Shield or redaction verification.
- Every NFC requirement must include real-device verification where hardware support allows.
- Activity check-in/check-out requirements must avoid parking-only implementation unless explicitly testing the parking demo tariff.

## Change Control

When a requirement changes:

1. Update `.codex/specs/REQUIREMENTS.md`.
2. Update the relevant design section in `.codex/specs/DESIGN.md`.
3. Update implementation tasks in `.codex/specs/TASKS.md`.
4. Update this traceability matrix.
5. Add a note to `CHANGELOG.md` if the root changelog is still used, or add one to the active spec changelog if introduced later.
