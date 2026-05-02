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

## 3A. Changed-File Unit Test Policy

Every changed executable source file must have a matching unit test created or updated in the same task/branch.

Minimum expectation for every feature branch:

- List changed source files.
- Add or update the closest unit test for each changed source file.
- Run focused tests for the changed scope.
- Run full coverage before merge or phase completion.
- Keep executable-source unit coverage at least 90%.
- Document any exception with reason, impacted file, and follow-up.

Allowed exceptions are generated files, static assets, documentation-only changes, pure type-only files with no runtime behavior, and platform config validated by integration/device testing.

See `.codex/specs/UNIT_TEST_COVERAGE_POLICY.md`.

## 4. Unit Test Scope

Must test:

- `ActivityTariffCalculator`
- `ActivityStatePolicy`
- `TransactionLogPolicy`
- `MbcCardCodec`
- `DataRedactor`

Required cases:

- Parking MVP default tariff: 1 hour charges Rp 2.000.
- Parking MVP default tariff: 1 hour 5 minutes 1 second charges Rp 4.000.
- Local active tariff changed to Rp 3.000: 1 hour charges Rp 3.000 and 1 hour 5 minutes 1 second charges Rp 6.000.
- Activity tariff accepts a tariff rule from local tariff settings instead of hardcoding parking everywhere.
- Double check-in is rejected.
- Double check-out is rejected.
- Starting a second activity while one is active is rejected.
- Insufficient balance does not mutate card state.
- Top-up amount must be positive.
- Latest five logs are retained newest-first.
- Malformed payload fails safely.
- Sensitive fields are redacted in logs.
- Encoded payload size validation returns `CARD_CAPACITY_INSUFFICIENT` when payload cannot fit selected tag/card capacity.
- Local tariff setting rejects zero, negative, non-integer, or unsupported currency values.
- Gate simulation rejects future timestamps.

Coverage expectation:

- Changed-file unit-test policy must pass for every implementation task.
- The test suite should be expanded until the whole executable repository source reaches at least 90% automated coverage.

## 5. Application Test Scope

Must test:

- `RegisterMemberCardUseCase`
- `TopUpMemberCardUseCase`
- `CheckInActivityUseCase`
- `CheckOutActivityUseCase`
- `InspectMemberCardUseCase`
- `GetStationLedgerSummaryUseCase`
- `GetActiveParkingTariffUseCase`
- `UpdateActiveParkingTariffUseCase`

Required cases:

- Check NFC availability returns supported, unsupported, and disabled/unavailable states where platform support allows.
- Real card actions are blocked with guidance when NFC is unsupported or disabled.
- Station registration writes initial card payload.
- Station registration rejects already registered valid MBC cards.
- Station registration generates internal member ID automatically.
- Station registration does not require typed member ID input.
- Station, Gate, Terminal, and Scout presentation states do not expose the full internal member ID.
- Station top-up increases balance and adds log.
- Gate check-in sets activity ID/type, status, and timestamp.
- Gate check-in appends a local ledger audit row with amount `0`.
- Gate simulation mode writes past timestamp and rejects future timestamp.
- Station/Admin can update local active tariff without APK rebuild.
- Gate check-in reads active tariff from local tariff repository and stores a card tariff snapshot. Terminal checkout reads the card-stored snapshot, displays it before deduction, deducts correct parking fee, and clears status.
- Terminal checkout rejects invalid duration/time before deduction.
- Terminal insufficient balance returns top-up guidance and keeps checked-in status.
- Insufficient-balance recovery works after Station top-up and Terminal retry.
- Successful register, Station top-up, Gate check-in, and Terminal checkout actions append local ledger entries.
- Station local ledger summary returns expected current-device/current-installation totals and labels the scope clearly.
- Scout reads card without writing.

## 6. Presentation Test Scope

Must test:

- Role switcher.
- NFC requirement message before or during real card actions.
- Unsupported or disabled NFC guidance.
- Station registration does not require typed member ID or human-readable profile input in the first implementation round.
- Station top-up validation.
- Station local tariff setting is admin-only and validates positive tariff amount.
- Station local ledger summary panel displays local totals clearly.
- Gate simulation mode indicator.
- Terminal visit tariff snapshot, fee, and insufficient balance display.
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

| ID       | Scenario                 | Steps                                                   | Expected                                                                             |
| -------- | ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| NFC-001  | NFC supported            | Open app on NFC-capable phone                           | App shows NFC available                                                              |
| NFC-001A | NFC unsupported          | Open app on non-NFC device or mocked unsupported state  | App explains that real card operations require an NFC-capable device                 |
| NFC-001B | NFC disabled             | Open app with NFC disabled where platform can detect it | App asks user to enable NFC before scanning                                          |
| NFC-002  | Register card            | Station registers card                                  | Card can be inspected by Scout and registration rejects overwrite on same valid card |
| NFC-003  | Top-up                   | Station tops up card                                    | Balance increases and log is added                                                   |
| NFC-004  | Activity check-in        | Gate checks in card                                     | Activity status becomes checked in                                                   |
| NFC-005  | Simulation check-in      | Gate checks in with past timestamp                      | Past entry time is stored                                                            |
| NFC-006  | Activity checkout        | Terminal checks out card                                | Fee is deducted, status clears, and write-readback verification passes               |
| NFC-007  | Double check-in          | Gate checks in same card twice                          | Second action is rejected                                                            |
| NFC-008  | Double check-out         | Terminal checks out unchecked card                      | Action is rejected                                                                   |
| NFC-009  | Insufficient balance     | Terminal checks out card with low balance               | User is told to top up; card remains checked in; after top-up checkout can retry     |
| NFC-010  | Scout inspect            | Scout reads card                                        | Balance, status, and logs appear                                                     |
| NFC-011  | One-tap Scout            | Member taps card once in Scout                          | Card content appears without write action                                            |
| NFC-012  | Missing card at checkout | Terminal scan times out or no card is available         | User is directed to Station/manual recovery                                          |

| NFC-013 | Payload capacity | Write payload to selected NFC tag/card | Oversized payload is blocked with `CARD_CAPACITY_INSUFFICIENT` |
| NFC-014 | Write readback failure | Mock or simulate write then failed readback validation | App reports `WRITE_VERIFY_FAILED` and does not show success |
| NFC-015 | Invalid checkout time | Terminal checkout with exit time before/equal entry | App blocks checkout with `INVALID_TIME` / `INVALID_DURATION` |

## 9. End-to-End Documentation Standard

- E2E cases must be maintained in `.codex/specs/E2E_TEST_CASES.md`.
- Each case must include: ID, feature, objective, preconditions, test data, steps, expected result, priority, type, owner, status, and evidence.
- Screenshot evidence is required for executed scenarios and must reference file paths under `.codex/specs/test-evidence/`.
- Senior QA owns manual execution evidence; Test Automation Engineer owns automation mapping and CI references.

## 10. Security Test Cases

| ID      | Scenario                      | Expected                                                                                                                                          |
| ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001 | Plain NFC read                | Generic NFC reader cannot reveal member identity, balance, parking status details, or transaction values                                          |
| SEC-002 | Debug logging                 | Sensitive decoded data is not printed                                                                                                             |
| SEC-003 | Payload tampering             | Invalid payload is rejected safely                                                                                                                |
| SEC-004 | Codec validation              | Unsupported payload version is rejected                                                                                                           |
| SEC-005 | Read-only Scout               | Scout does not write or mutate card data                                                                                                          |
| SEC-006 | Local ledger privacy          | Ledger uses masked/short references instead of full sensitive identity where possible                                                             |
| SEC-007 | Silent Shield decrypt success | Valid NFC Card Payload v1 decrypts with AES-GCM/equivalent authenticated encryption and then passes HMAC verification                             |
| SEC-008 | Silent Shield tamper failure  | Changing ciphertext, tag, balance, identity, check-in state, transaction log, or counter causes decrypt/authentication or HMAC validation failure |
| SEC-009 | Write counter                 | Counter increments after every successful card-state write                                                                                        |
| SEC-010 | Transaction FIFO              | Card keeps only the latest five transaction logs after more than five operations                                                                  |
| SEC-011 | SQLite authority boundary     | SQLite reporting data never overrides card balance, status, or activity state                                                                     |
| SEC-012 | Write readback verification   | Real NFC writes are verified by reading back expected counter/state/signature                                                                     |
| SEC-013 | Capacity guard                | Oversized protected payload is rejected before write                                                                                              |
| SEC-014 | Local report scope            | Station summary clearly states current-device/current-installation only                                                                           |

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
- Silent Shield security checklist passes production-grade assessment mode, including authenticated encryption and generic NFC reader validation.
- Local SQLite ledger is validated for reporting/audit behavior.
- Coverage report meets the documented 90% target for the whole executable repository source.
- SonarCloud analysis passes the configured quality gate.
- Demo capture, documentation, and presentation material are ready.

## Tariff Snapshot Tests

| ID                  | Area           | Scenario                                                                             | Expected Result                                                                               |
| ------------------- | -------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| TARIFF-SNAPSHOT-001 | Gate           | Active tariff is Rp 2.000 and user checks in                                         | Card active visit stores tariff snapshot Rp 2.000 and current tariff version.                 |
| TARIFF-SNAPSHOT-002 | Terminal       | User checked in at Rp 2.000, admin changes active tariff to Rp 3.000 before checkout | Checkout fee uses Rp 2.000 snapshot, not Rp 3.000 current local setting.                      |
| TARIFF-SNAPSHOT-003 | Gate/Terminal  | User checks in after tariff changed to Rp 3.000                                      | Checkout fee uses Rp 3.000 snapshot.                                                          |
| TARIFF-SNAPSHOT-004 | Terminal       | Checked-in legacy/demo card has no tariff snapshot                                   | App shows `TARIFF_SNAPSHOT_MISSING`; fallback to current tariff is allowed only with warning. |
| TARIFF-SNAPSHOT-005 | Security/Codec | Tariff snapshot is modified outside the app                                          | Silent Shield validation rejects the tampered card.                                           |
| TARIFF-SNAPSHOT-006 | Capacity       | Snapshot pushes protected payload over selected card capacity                        | Write is blocked with `CARD_CAPACITY_INSUFFICIENT`.                                           |

## QA Screenshot Evidence Gate

Every feature PR must include Senior QA validation evidence before merge unless an approved exception is documented.

Minimum PR evidence:

- Task/feature ID.
- Branch/build identifier.
- Android simulator/device name and OS/API level.
- Scenario tested.
- Screenshots proving the feature behavior.
- Pass/fail result.
- Defects and retest screenshots if applicable.

Final QA must provide a use-case testing evidence package with screenshots proving the project satisfies the required parking MVP flows.

Refer to `QA_EVIDENCE_POLICY.md` for the detailed evidence policy.
