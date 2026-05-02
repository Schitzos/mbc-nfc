# PO Final GO / NO-GO Checklist

Last PO review status for the current merged specification bundle.

## 1. Final PO Verdict

| Gate                        | Verdict        | Reason                                                                                                                                                                                |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex implementation start  | GO             | The required MBC parking MVP flow, local ledger rule, NFC card source-of-truth rule, and production-grade Silent Shield requirement are documented clearly enough for implementation. |
| Mock-first development      | GO             | Hardware/card TBD items do not block domain logic, UI, mock repository, SQLite ledger, tests, or parking tariff implementation.                                                       |
| Real NFC implementation     | CONDITIONAL GO | Can start after Android/iOS/card assumptions are chosen, but real validation remains incomplete until device/card matrix is filled.                                                   |
| Final assessment submission | NOT GO YET     | Final submission still needs real NFC evidence, card capacity proof, Silent Shield verification using a generic NFC reader, Signal UI evidence, and completed device matrix.          |

## 2. Current PO Decisions Applied

| Decision                                                               | Status        | Notes                                                                                                                           |
| ---------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `CHANGELOG.md` may live outside archive                                | ACCEPTED      | Current docs may reference external changelog. This is not a blocker.                                                           |
| `__MACOSX/` archive metadata is ignored                                | ACCEPTED      | Mac-generated metadata is not product/spec content. It should not be considered a blocker.                                      |
| MVP activity is parking only                                           | ACCEPTED      | No non-parking runtime flow, tariff fixture, or E2E path is required for MVP.                                                   |
| Future activity extensibility remains required as architecture quality | ACCEPTED      | Code should keep tariff/session/use-case boundaries extensible, but not build generic activity behavior now.                    |
| Silent Shield must be production-grade                                 | ACCEPTED      | Plain JSON, Base64-only, or weak obfuscation is not acceptable. Use authenticated encryption such as AES-256-GCM or equivalent. |
| Device/card matrix remains TBD                                         | ACCEPTED RISK | Does not block mock-first implementation, but blocks final assessment readiness.                                                |

## 3. Source Requirement Alignment Checklist

| Check                                     | Status                              | Current evidence                                                                                                                     |
| ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| One mobile app with role switcher         | PASS                                | Covered in `REQUIREMENTS.md`, `DESIGN.md`, `TASKS.md`, `TRACEABILITY.md`.                                                            |
| Station registers member card             | PASS                                | Covered in requirements, tasks, tests, and E2E.                                                                                      |
| Station tops up card balance              | PASS                                | Covered in requirements, tasks, tests, and E2E.                                                                                      |
| Gate writes entry/check-in timestamp      | PASS                                | Covered in requirements, tasks, tests, and E2E.                                                                                      |
| Gate supports simulated past entry time   | PASS                                | Covered in requirements and E2E simulation case.                                                                                     |
| Terminal calculates duration              | PASS                                | Covered in tariff and checkout requirements.                                                                                         |
| Terminal deducts balance                  | PASS                                | Covered in checkout requirements, tasks, and E2E.                                                                                    |
| Terminal clears active parking status     | PASS                                | Covered in checkout requirements and E2E.                                                                                            |
| Scout reads balance/status/history        | PASS                                | Covered in requirements, tasks, and E2E.                                                                                             |
| Card stores identity                      | PASS                                | Covered in card payload spec.                                                                                                        |
| Card stores balance                       | PASS                                | Covered in card payload spec.                                                                                                        |
| Card stores visit/parking status          | PASS                                | Covered in card payload spec.                                                                                                        |
| Card stores last 5 transactions           | PASS                                | Covered in card payload spec and requirements.                                                                                       |
| Tariff is Rp 2.000 per started hour       | PASS                                | Covered in requirements, design, tasks, tests.                                                                                       |
| Double check-in rejected                  | PASS                                | Covered in requirements and E2E.                                                                                                     |
| Double check-out rejected                 | PASS                                | Covered in requirements and E2E.                                                                                                     |
| Guest flow out of scope                   | PASS                                | Covered in requirements and RFID/NFC primer.                                                                                         |
| Offline/no backend dependency             | PASS                                | Covered in requirements, design, and card/ledger spec.                                                                               |
| Identity and balance not plainly readable | PASS WITH IMPLEMENTATION DEPENDENCY | Docs require production-grade authenticated encryption, but actual proof requires implementation and external NFC reader validation. |

## 4. Internal Document Alignment Checklist

| Check                                                                      | Status | Notes                                                                |
| -------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| `REQUIREMENTS.md` and `DESIGN.md` agree on parking MVP                     | PASS   | Parking is MVP; future activities are extension-only.                |
| `DESIGN.md` and `CARD_DATA_SECURITY_LEDGER_SPEC.md` agree on Silent Shield | PASS   | Both require authenticated encryption and integrity validation.      |
| `SECURITY.md` matches card security spec                                   | PASS   | Security doc aligns with AES-GCM/authenticated encryption direction. |
| `TASKS.md` and `EXECUTION_ORDER.md` are compatible                         | PASS   | Platform NFC setup and real NFC integration are represented.         |
| `TEST_PLAN.md` and `E2E_TEST_CASES.md` are compatible                      | PASS   | Required tests focus on MBC parking flow and security.               |
| `TRACEABILITY.md` maps major PDF requirements                              | PASS   | Major source requirements are mapped to docs/tasks/tests.            |
| Non-parking activity is not required for MVP                               | PASS   | Current bundle treats it as future extension readiness only.         |
| SQLite is local reporting/audit only                                       | PASS   | Docs state it is not global source of truth.                         |
| NFC card remains source of truth                                           | PASS   | Repeated across requirements/design/card spec.                       |
| External changelog handling is clear                                       | PASS   | External changelog is acceptable and not a blocker.                  |

## 5. Implementation Readiness Checklist

| Check                                                 | Status      | Notes                                                                                                                                                                                     |
| ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain logic can be implemented now                   | PASS        | Mock-first implementation can begin.                                                                                                                                                      |
| UI screens can be implemented now                     | PASS        | Role screens and user flows are specified.                                                                                                                                                |
| SQLite ledger can be implemented now                  | PASS        | Local-device scope and events are defined.                                                                                                                                                |
| Parking tariff can be implemented now                 | PASS        | Default Rp 2.000 per started hour is clear, and active tariff is now local-device configurable for post-APK changes.                                                                      |
| Local tariff management can be implemented now        | PASS        | Authorized Station/Admin staff can update active tariff locally; Gate locks the active tariff snapshot at check-in, and Terminal displays/uses the card-stored snapshot before deduction. |
| Mock NFC/card repository can be implemented now       | PASS        | Required for development before hardware.                                                                                                                                                 |
| Production-grade Silent Shield can be implemented now | CONDITIONAL | Requires library/key-handling selection during implementation.                                                                                                                            |
| Real NFC read/write can be implemented now            | CONDITIONAL | Requires target device/card/tag decisions.                                                                                                                                                |
| Payload capacity can be finalized now                 | NOT READY   | Card/tag model and writable capacity are still TBD.                                                                                                                                       |
| iOS NFC behavior can be finalized now                 | NOT READY   | iOS support decision/device behavior is still TBD.                                                                                                                                        |
| Final demo evidence can be finalized now              | NOT READY   | Needs real device, card, security, and UI evidence.                                                                                                                                       |

## 6. Final Submission Blockers

| Blocker                                                            | Owner/action                                                                 |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Choose Android test device                                         | Fill `DEVICE_TEST_MATRIX.md`.                                                |
| Choose iOS test device or explicitly defer iOS real-write support  | Fill `DEVICE_TEST_MATRIX.md` and release notes.                              |
| Choose NFC card/tag type                                           | Fill card model and capacity in `DEVICE_TEST_MATRIX.md`.                     |
| Confirm encrypted payload fits chosen tag/card                     | Add result to card/security docs or test evidence.                           |
| Confirm all operational offline devices use the same active tariff | Manual pre-demo/pre-operation checklist item because tariff is device-local. |
| Validate local tariff update flow                                  | Run `E2E-TARIFF-001` and `E2E-TARIFF-002`.                                   |
| Select crypto library and key handling approach                    | Document in `SECURITY.md` or implementation notes.                           |
| Verify generic NFC reader cannot reveal sensitive fields           | Add evidence/screenshot/result to final demo package.                        |
| Confirm Signal UI reference/tokens or acceptable approximation     | Finalize `SIGNAL_UI_GUIDE.md`.                                               |
| Run full E2E demo path                                             | Station → Gate → Terminal → Scout, including insufficient balance recovery.  |

## 7. PO Final Statement

Current status:

```txt
GO for Codex implementation.
GO for mock-first development.
CONDITIONAL GO for real NFC implementation.
NOT GO YET for final assessment submission.
```

Reason:

The documentation is aligned enough to build the required parking MVP now. The remaining risks are not requirement-alignment problems; they are hardware, payload capacity, security proof, and final-demo evidence items.

## Tariff Snapshot PO Gate

- [ ] Gate check-in stores compact tariff snapshot on the card active visit.
- [ ] Terminal checkout uses the stored visit tariff snapshot, not current local active tariff, when snapshot exists.
- [ ] Existing checked-in member keeps Rp 2.000/hour if tariff changes to Rp 3.000/hour before checkout.
- [ ] New check-ins after tariff change use Rp 3.000/hour.
- [ ] Snapshot is protected by Silent Shield and cannot be tampered with using generic NFC tools.
- [ ] Missing legacy/demo snapshot shows warning before fallback.

## Software Quality GO / NO-GO Addendum

Before Codex/dev feature work is considered complete:

- [ ] Changed-file unit-test policy passes for every implementation task.
- [ ] Every changed executable source file has a created or updated unit test, or an approved documented exception.
- [ ] Focused tests for changed files pass.
- [ ] Full coverage report shows at least 90% executable-source unit coverage.
- [ ] Feature branch result includes changed source files, changed test files, commands run, and coverage status.

Final assessment submission remains **NO-GO** if the 90% coverage gate is not met or if major feature changes lack matching tests.
