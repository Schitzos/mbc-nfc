# KDX Membership Benefit Card Test Plan

## 1. Purpose

This document defines the testing strategy for the MBC React Native NFC frontend assessment.

## 2. Test Levels

| Level          | Purpose                                                                                                            | Runs On                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Unit           | Validate activity tariff, activity state, logs, and codec helpers                                                  | Local machine / CI               |
| Application    | Validate Station, Gate, Terminal, and Scout use cases with mocked NFC card repository and local ledger integration | Local machine / CI               |
| Infrastructure | Validate NFC repository and card codec behavior                                                                    | Local / real device where needed |
| Presentation   | Validate role screens, forms, loading, success, and error states                                                   | Local machine / CI               |
| Device         | Validate real NFC read/write behavior                                                                              | Physical iOS and Android devices |
| Security       | Validate Silent Shield and redaction controls                                                                      | Local / manual review            |

## 3. Test Ownership

| Role                         | Test Responsibility                                                          |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Test Automation Engineer     | Unit, application, mocked repository, and presentation automation.           |
| Senior QA                    | Manual acceptance, exploratory, edge-case, and regression review.            |
| NFC/Mobile Native Specialist | Real-device NFC read/write, Android/iOS setup, and tag compatibility.        |
| Security Pentester           | Silent Shield, tamper handling, privacy, and role-abuse tests.               |
| UI/UX Designer               | Signal UI alignment, screen-state clarity, and operator usability review.    |
| Demo/Release Engineer        | Demo smoke test, run instructions, capture readiness, and known limitations. |

Both Senior QA and Test Automation Engineer must maintain detailed E2E case documentation in `.codex/specs/E2E_TEST_CASES.md` using a standard test-case format with screenshot evidence references.

Quality targets:

- Automated unit-test coverage target across the whole executable repository source is at least 90%.
- Coverage results should be exported in a format that can be consumed by SonarCloud.

## 4. Unit Test Scope

Must test:

- `ActivityTariffCalculator`
- `ActivityStatePolicy`
- `TransactionLogPolicy`
- `MbcCardCodec`
- `DataRedactor`

Required cases:

- Parking demo activity: 1 hour charges Rp 2.000.
- Parking demo activity: 1 hour 5 minutes 1 second charges Rp 4.000.
- Activity tariff accepts an activity rule instead of hardcoding parking everywhere.
- Double check-in is rejected.
- Double check-out is rejected.
- Starting a second activity while one is active is rejected.
- Insufficient balance does not mutate card state.
- Top-up amount must be positive.
- Latest five logs are retained.
- Malformed payload fails safely.
- Sensitive fields are redacted in logs.

Coverage expectation:

- The test suite should be expanded until the whole executable repository source reaches at least 90% automated coverage.

## 5. Application Test Scope

Must test:

- `RegisterMemberCardUseCase`
- `TopUpMemberCardUseCase`
- `CheckInActivityUseCase`
- `CheckOutActivityUseCase`
- `InspectMemberCardUseCase`
- `GetStationLedgerSummaryUseCase`

Required cases:

- Check NFC availability returns supported, unsupported, and disabled/unavailable states where platform support allows.
- Real card actions are blocked with guidance when NFC is unsupported or disabled.
- Station registration writes initial card payload.
- Station registration generates internal member ID automatically.
- Station registration does not require typed member ID input.
- Station, Gate, Terminal, and Scout presentation states do not expose the full internal member ID.
- Station top-up increases balance and adds log.
- Gate check-in sets activity ID/type, status, and timestamp.
- Gate simulation mode writes past timestamp.
- Terminal checkout deducts correct activity fee and clears status.
- Terminal insufficient balance returns top-up guidance and keeps checked-in status.
- Successful register, Station top-up, and Terminal checkout actions append local ledger entries.
- Station local ledger summary returns expected totals.
- Scout reads card without writing.

## 6. Presentation Test Scope

Must test:

- Role switcher.
- NFC requirement message before or during real card actions.
- Unsupported or disabled NFC guidance.
- Station registration does not require typed member ID or human-readable profile input in the first implementation round.
- Station top-up validation.
- Station local ledger summary panel displays local totals clearly.
- Gate simulation mode indicator.
- Terminal fee and insufficient balance display.
- Terminal missing card/scan timeout recovery guidance.
- Scout one-tap balance, status, and transaction log display.
- NFC loading, success, and error states.
- Signal UI direction is applied consistently enough for assessment/demo review.

## 7. Device Test Matrix

| Platform | Device | OS Version | NFC Tag Type          | Expected Result                                                      |
| -------- | ------ | ---------- | --------------------- | -------------------------------------------------------------------- |
| Android  | TBD    | TBD        | Writable NFC card/tag | Register, top-up, activity check-in, activity checkout, inspect work |
| iOS      | TBD    | TBD        | Writable NFC card/tag | Supported read/write flows are recorded                              |

## 8. NFC Device Test Cases

| ID       | Scenario                 | Steps                                                   | Expected                                                             |
| -------- | ------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------- |
| NFC-001  | NFC supported            | Open app on NFC-capable phone                           | App shows NFC available                                              |
| NFC-001A | NFC unsupported          | Open app on non-NFC device or mocked unsupported state  | App explains that real card operations require an NFC-capable device |
| NFC-001B | NFC disabled             | Open app with NFC disabled where platform can detect it | App asks user to enable NFC before scanning                          |
| NFC-002  | Register card            | Station registers card                                  | Card can be inspected by Scout                                       |
| NFC-003  | Top-up                   | Station tops up card                                    | Balance increases and log is added                                   |
| NFC-004  | Activity check-in        | Gate checks in card                                     | Activity status becomes checked in                                   |
| NFC-005  | Simulation check-in      | Gate checks in with past timestamp                      | Past entry time is stored                                            |
| NFC-006  | Activity checkout        | Terminal checks out card                                | Fee is deducted and status clears                                    |
| NFC-007  | Double check-in          | Gate checks in same card twice                          | Second action is rejected                                            |
| NFC-008  | Double check-out         | Terminal checks out unchecked card                      | Action is rejected                                                   |
| NFC-009  | Insufficient balance     | Terminal checks out card with low balance               | User is told to top up                                               |
| NFC-010  | Scout inspect            | Scout reads card                                        | Balance, status, and logs appear                                     |
| NFC-011  | One-tap Scout            | Member taps card once in Scout                          | Card content appears without write action                            |
| NFC-012  | Missing card at checkout | Terminal scan times out or no card is available         | User is directed to Station/manual recovery                          |

## 9. End-to-End Documentation Standard

- E2E cases must be maintained in `.codex/specs/E2E_TEST_CASES.md`.
- Each case must include: ID, feature, objective, preconditions, test data, steps, expected result, priority, type, owner, status, and evidence.
- Screenshot evidence is required for executed scenarios and must reference file paths under `.codex/specs/test-evidence/`.
- Senior QA owns manual execution evidence; Test Automation Engineer owns automation mapping and CI references.

## 10. Security Test Cases

| ID      | Scenario             | Expected                                                                              |
| ------- | -------------------- | ------------------------------------------------------------------------------------- |
| SEC-001 | Plain NFC read       | Identity and balance are not plainly readable                                         |
| SEC-002 | Debug logging        | Sensitive decoded data is not printed                                                 |
| SEC-003 | Payload tampering    | Invalid payload is rejected safely                                                    |
| SEC-004 | Codec validation     | Unsupported payload version is rejected                                               |
| SEC-005 | Read-only Scout      | Scout does not write or mutate card data                                              |
| SEC-006 | Local ledger privacy | Ledger uses masked/short references instead of full sensitive identity where possible |

## 11. Entry Criteria

- Requirements match the MBC assessment brief.
- Design has card repository, codec, use-case, and role boundaries.
- Tasks are traceable to requirements.
- Writable NFC cards/tags and real devices are available for device tests.

## 12. Exit Criteria

- Unit tests pass.
- Application tests pass.
- Presentation tests pass for key screens.
- Real NFC read/write demo succeeds where platform support allows.
- Station, Gate, Terminal, and Scout flows are demo-ready.
- Silent Shield security checklist passes for prototype scope.
- Local SQLite ledger is validated for reporting/audit behavior.
- Coverage report meets the documented 90% target for the whole executable repository source.
- SonarCloud analysis passes the configured quality gate.
- Demo capture, documentation, and presentation material are ready.
