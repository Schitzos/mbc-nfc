# Change Note — Final Cross-Document Alignment Patch

This patch contains changed documents only.

## Reason

A final PM/documentation audit found a small but important wording inconsistency after the tariff snapshot decision:

- Some docs still implied Terminal checkout should read or display the current local active tariff.
- The final agreed rule is that Gate reads the local active tariff at check-in and writes a compact tariff snapshot to the NFC card. Terminal checkout must calculate and display fee using the card-stored visit tariff snapshot, except for documented legacy/demo fallback with visible warning.
- Some docs still used older wording like "parking demo activity". The final agreed scope is "required parking MVP activity".

## Updated Alignment Rule

- Station/Admin can update the current local active tariff.
- Gate check-in reads the current local active tariff and stores a compact tariff snapshot on the card.
- Terminal checkout uses the card-stored tariff snapshot, not the current local active tariff.
- Local active tariff changes affect only new check-ins.
- Existing checked-in cards keep the tariff snapshot captured at check-in.
- Legacy/demo checked-in cards without a snapshot may fallback to current local tariff only after a visible warning.

## Files Updated

- `AGENT_OPERATING_PROTOCOL.md`
- `CARD_DATA_SECURITY_LEDGER_SPEC.md`
- `DECISIONS.md`
- `DESIGN.md`
- `E2E_TEST_CASES.md`
- `EXECUTION_ORDER.md`
- `IMPROVEMENTS_NOT_EXPLAINED_IN_ORIGINAL_REQUIREMENT.md`
- `PO_FINAL_GO_NO_GO_CHECKLIST.md`
- `REQUIREMENTS.md`
- `RFID_NFC_REACT_NATIVE_101.md`
- `SECURITY.md`
- `TEST_PLAN.md`
- `TRACEABILITY.md`

## Audit Result After Patch

- No missing task IDs were found.
- `TASKS.md` remains compact and Codex-friendly at 340 lines with 45 task IDs.
- `EXECUTION_ORDER.md` references the same task IDs.
- Parking remains the only MVP runtime activity.
- Generic/non-parking activity remains future extension only.
- SQLite remains local audit/reporting only.
- NFC card remains member state source of truth.
- Production-grade Silent Shield remains required.
- QA screenshot evidence and Firebase App Distribution release rules remain covered.

## Known Accepted Items

- `CHANGELOG.md` may be maintained outside the archive, per PO decision.
- `__MACOSX/` metadata may appear when zipped from macOS and can be ignored.
- NFC card/tag model, device model, and payload capacity proof remain TBD until real hardware testing.
