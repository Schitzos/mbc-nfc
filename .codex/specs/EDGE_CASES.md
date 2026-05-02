# MBC Offline NFC Edge Cases

This document is the product-owner edge-case register for the MBC parking MVP. It complements `REQUIREMENTS.md`, `DESIGN.md`, `CARD_DATA_SECURITY_LEDGER_SPEC.md`, `TEST_PLAN.md`, and `E2E_TEST_CASES.md`.

## 1. PO Edge-Case Verdict

| Area                                        | Status                                |
| ------------------------------------------- | ------------------------------------- |
| Parking MVP core flow                       | Covered                               |
| NFC source-of-truth behavior                | Covered                               |
| SQLite local reporting boundary             | Covered                               |
| Production-grade Silent Shield requirement  | Covered                               |
| Offline local tariff change after APK build | Added in this revision                |
| Hardware/card capacity                      | Still TBD until device/card selection |

## 2. Required Edge Cases

| ID     | Edge case                                           | Required behavior                                                                                                                                                                           | Current coverage                                                                          |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| EC-001 | Tariff changes after APK is already built           | Authorized Station/Admin staff can update active tariff locally without backend/API or APK rebuild.                                                                                         | `REQUIREMENTS.md` FR-014, `CARD_DATA_SECURITY_LEDGER_SPEC.md` Section 9, `E2E-TARIFF-001` |
| EC-002 | Offline devices have different tariff values        | App displays active tariff before deduction; operational process requires all devices to be manually configured with the same tariff.                                                       | `REQUIREMENTS.md` FR-014, `DESIGN.md`, `PO_FINAL_GO_NO_GO_CHECKLIST.md`                   |
| EC-003 | User taps Gate twice                                | Reject second check-in with double-check-in/active-session error.                                                                                                                           | Existing requirements/tests                                                               |
| EC-004 | User taps Terminal twice                            | Reject checkout when no active visit exists.                                                                                                                                                | Existing requirements/tests                                                               |
| EC-005 | Insufficient balance at checkout                    | Do not deduct or clear check-in; show top-up guidance.                                                                                                                                      | Existing requirements/tests                                                               |
| EC-006 | Top-up while checked-in                             | Allow Station top-up without clearing visit; Terminal retry can succeed.                                                                                                                    | Existing requirements/tests                                                               |
| EC-007 | Checkout time is earlier/equal to check-in time     | Reject with `INVALID_TIME` / `INVALID_DURATION` before deduction.                                                                                                                           | Existing requirements/tests                                                               |
| EC-008 | Gate simulation enters future time                  | Reject future simulation timestamp; only past timestamps are allowed.                                                                                                                       | Added in this revision                                                                    |
| EC-009 | NFC write partially succeeds or cannot be verified  | Perform write-readback verification; do not show success unless expected counter/state is verified.                                                                                         | Existing requirements plus clarified in this revision                                     |
| EC-010 | Card removed too early                              | Treat as failed/unverified write and show recovery guidance.                                                                                                                                | Added in this revision                                                                    |
| EC-011 | Payload exceeds NFC tag capacity                    | Block write with `CARD_CAPACITY_INSUFFICIENT` and keep previous state.                                                                                                                      | Existing requirements/tests                                                               |
| EC-012 | Card has more than five logs                        | Keep newest five logs only.                                                                                                                                                                 | Existing requirements/tests                                                               |
| EC-013 | SQLite/local report data is lost                    | Card remains source of truth; local reports may be incomplete and must not override card state.                                                                                             | Added in this revision                                                                    |
| EC-014 | Same card is used across multiple offline devices   | Member state travels with card; reports remain split per device; tariff consistency is manual.                                                                                              | Existing ledger rule plus tariff update in this revision                                  |
| EC-015 | Phone clock is wrong                                | Gate/Terminal show device time; invalid duration is rejected; operator must verify time before writing.                                                                                     | Added in this revision                                                                    |
| EC-016 | Wrong role attempts sensitive action                | Non-admin roles cannot change tariff; Station/Admin authorization required.                                                                                                                 | Added in this revision                                                                    |
| EC-017 | Registering an already registered card              | Reject overwrite unless future reset flow is explicitly added.                                                                                                                              | Existing requirements/tests                                                               |
| EC-018 | Unknown/non-MBC card tapped                         | Reject with unsupported/unregistered card guidance.                                                                                                                                         | Existing requirements/tests                                                               |
| EC-019 | Tampered card payload                               | Silent Shield decrypt/HMAC validation fails; block operation.                                                                                                                               | Existing security requirements/tests                                                      |
| EC-020 | Future/unsupported card schema version              | Reject unsupported version safely.                                                                                                                                                          | Existing codec/security tests                                                             |
| EC-021 | Tariff changes while a member is already checked in | The tariff used at check-in is locked as a compact tariff snapshot on the card. Existing checked-in members keep their check-in tariff even if local active tariff changes before checkout. | Added in this patch                                                                       |

## 3. Local Tariff Management Decision

Because the app is offline and the APK may already be deployed, the active parking tariff must not depend only on build-time config.

Rules:

- Default MVP tariff is Rp 2.000 per started hour.
- Authorized Station/Admin staff can update active tariff locally, for example to Rp 3.000 per started hour.
- The active tariff is stored locally using SQLite or secure storage.
- Gate check-in reads the current active tariff from local storage and writes a compact tariff snapshot into the active visit state on the NFC card.
- Terminal checkout calculates the fee using the tariff snapshot stored on the active visit, not the current local tariff setting.
- Terminal displays the visit tariff snapshot before deduction.
- Changing tariff on one device does not update other devices.
- All active offline devices must be manually configured with the same tariff before operation.
- Future enhancement may use a signed Tariff Config NFC card to distribute tariff offline.

## 4. Final Remaining Non-Document Blockers

These edge cases are documented, but final assessment proof still depends on implementation and hardware:

- Select actual NFC card/tag type.
- Confirm encrypted payload capacity fits the card/tag.
- Confirm real Android NFC read/write/readback behavior.
- Confirm iOS support or explicitly defer it.
- Validate Silent Shield with a generic NFC reader app.
- Run local tariff update E2E and verify Terminal uses the updated tariff.

## 5. Tariff Snapshot at Check-In

When the active tariff changes while some members are already checked in, the app must not unexpectedly charge those members using the newer tariff.

Required rule:

- The tariff is locked at successful Gate check-in.
- Gate writes a compact tariff snapshot into the NFC card active visit state.
- Terminal checkout uses the card's tariff snapshot for fee calculation.
- Local active tariff changes only affect new check-ins after the change.
- If a legacy/demo card is checked in but has no tariff snapshot, Terminal may fall back to the current local active tariff only with a clear warning before deduction.

Example:

| Member | Check-in tariff | Admin changes tariff before checkout? | Checkout tariff |
| ------ | --------------: | ------------------------------------- | --------------: |
| A      |   Rp 2.000/hour | Changed to Rp 3.000/hour              |   Rp 2.000/hour |
| B      |   Rp 3.000/hour | No later change                       |   Rp 3.000/hour |

Compact active visit fields should include at minimum:

```text
ci.tr = rate per started hour
ci.tv = tariff version
ci.rm = rounding mode, if not globally fixed
```

The snapshot must remain small because NFC payload capacity is limited.
