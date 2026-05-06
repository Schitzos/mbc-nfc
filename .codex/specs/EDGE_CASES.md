# MBC MVP Edge Cases

## Core Edge Cases

| ID     | Edge case                                  | Expected handling                                                                                                                                     |
| ------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| EC-001 | User taps Gate twice                       | Reject second tap with `DOUBLE_CHECK_IN`; do not overwrite active visit.                                                                              |
| EC-002 | User taps Terminal twice                   | Reject second checkout with `DOUBLE_CHECK_OUT`; do not deduct twice.                                                                                  |
| EC-003 | Balance is insufficient at checkout        | Reject checkout, keep card checked in, show required fee/top-up guidance.                                                                             |
| EC-004 | Top-up while checked in                    | Allow top-up and keep active visit unchanged so checkout can continue later.                                                                          |
| EC-005 | Checkout time is before check-in time      | Reject with `INVALID_DURATION`.                                                                                                                       |
| EC-006 | Gate simulation uses future time           | Allowed — simulation is for testing purposes and may use any timestamp.                                                                               |
| EC-007 | Card removed during write                  | Do not show success; return `WRITE_FAILED` or `WRITE_VERIFY_FAILED`.                                                                                  |
| EC-008 | Post-write readback mismatch               | Return `WRITE_VERIFY_FAILED`; operator must retry safely.                                                                                             |
| EC-009 | Protected payload exceeds NTAG215 capacity | Use compact payload/tuple logs and remove optional data first. If still too large, return `CARD_CAPACITY_INSUFFICIENT`; do not write partial payload. |
| EC-010 | More than five card logs                   | Keep latest five logs on card; older history may remain only in local ledger.                                                                         |
| EC-011 | SQLite ledger is deleted                   | Card remains source of truth; reporting history for that device is lost.                                                                              |
| EC-012 | Card used across multiple offline devices  | Card state travels with card; reports remain device-local.                                                                                            |
| EC-013 | Device clock is wrong                      | Reject invalid duration at checkout (exit ≤ entry).                                                                                                   |
| EC-014 | Existing card is registered again          | Show reset confirmation. If user confirms, erase and re-register. If user declines, cancel without modification.                                      |
| EC-015 | Unknown/non-MBC card tapped                | Return `CARD_UNSUPPORTED` or `CARD_UNREGISTERED`.                                                                                                     |
| EC-016 | Tampered payload                           | Show reset confirmation at Station. If user confirms, erase and re-register. Other roles reject with `CARD_TAMPERED`.                                 |
| EC-017 | Unsupported schema version                 | Reject unsupported future versions safely.                                                                                                            |

## Fixed MVP Tariff Rule

## NTAG215 Payload Fit Risk

NTAG215 is the MVP target tag. The card must still store identity, balance, active visit state, and latest 5 transactions. To fit this requirement:

- use compact field names;
- use ISO timestamp strings by default if the encrypted/protected payload still fits NTAG215;
- store transaction history as compact tuples;
- avoid display name, profile data, debug fields, tariff-management fields, and verbose ISO strings on card;
- prefer binary Silent Shield envelope instead of Base64 text when writing to NFC;
- never reduce Silent Shield security before reducing optional payload size.
