# Product Owner Alignment Summary

This bundle has been aligned against `KDX#1 - Membership Benefit Card (MBC).pdf` as the source of truth.

## Key Alignment Decisions

| Area            | Fixed rule                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| MVP activity    | Parking is required. Non-parking activity support is future-friendly design only.                                                                |
| Source of truth | NFC card remains the member-state source of truth.                                                                                               |
| SQLite          | SQLite is device-local reporting and audit only. No disclaimer label required in UI.                                                             |
| Ledger coverage | `REGISTER`, `TOPUP`, and `CHECKOUT` write local ledger rows after successful card-state operations. CHECKIN does NOT append a ledger row.        |
| Income reports  | Only money-related rows count as income (`TOPUP` and `CHECKOUT`).                                                                                |
| Registration    | Station registration rejects valid already registered MBC cards.                                                                                 |
| Silent Shield   | v1 requires production-grade authenticated encryption plus integrity validation. Plain JSON, Base64-only, or weak obfuscation is not acceptable. |
| NFC safety      | Real writes require capacity guard. writeNdefMessage throws on failure (no post-write readback).                                                 |
| Logs            | Card transaction logs are newest-first, max five entries.                                                                                        |
| Checkout        | Invalid duration/time is rejected before deduction.                                                                                              |
| Recovery        | Insufficient balance keeps checked-in state; Station top-up then Terminal retry must succeed.                                                    |
| Signal UI       | Signal UI direction is required; exact token extraction is a final hardening dependency.                                                         |

## Files Updated

- `REQUIREMENTS.md`
- `CARD_DATA_SECURITY_LEDGER_SPEC.md`
- `DESIGN.md`
- `TASKS.md`
- `EXECUTION_ORDER.md`
- `TEST_PLAN.md`
- `E2E_TEST_CASES.md`
- `TRACEABILITY.md`
- `SECURITY.md`
- `SIGNAL_UI_GUIDE.md`
- `PROJECT_OWNER_READING_ORDER.md`
- `AGENT_OPERATING_PROTOCOL.md`
- `UML_SYSTEM_DIAGRAMS.md`

## Archive Notes

- `CHANGELOG.md` is intentionally maintained outside this archive per PO decision; references to it remain valid.
- `__MACOSX/` metadata is ignored as Mac archive metadata and has no product/spec meaning.

## Current PO Scope Decision

Generic/non-parking activity is not part of MVP implementation or acceptance testing. The code must remain extendable by keeping tariff rule, activity definitions, use cases, and UI options isolated, but Codex must build and test parking only for this delivery.
