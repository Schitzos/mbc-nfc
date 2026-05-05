# Change Note — Final Android 9 FE / NTAG215 MVP Decisions

This patch applies the final platform/security/device decisions after the NTAG215 payload discussion.

## Decisions applied

- MVP real NFC write/read focus is Android.
- Primary MVP test device is **Android 9 FE**.
- MVP target NFC tag is **NTAG215**.
- iOS NFC write is out of MVP and may be documented as deferred or best-effort/read-only unless separately validated later.
- Silent Shield uses AES-256-GCM or equivalent authenticated encryption.
- Assessment MVP may use a clearly labeled app-bundled demo AES key.
- Production must replace demo key handling with secure provisioning and/or Android hardware-backed Keystore.
- NFC writer should prefer raw byte/binary NDEF payloads; Base64URL/NDEF text is fallback only if the library requires text payloads.
- Card transaction history keeps latest 5 records with FIFO behavior and stores only activity, nominal, and ISO time.

## Files changed

- `DEVICE_TEST_MATRIX.md`
- `REQUIREMENTS.md`
- `CARD_DATA_SECURITY_LEDGER_SPEC.md`
- `SECURITY.md`
- `TEST_PLAN.md`
- `E2E_TEST_CASES.md`
- `PO_FINAL_GO_NO_GO_CHECKLIST.md`
- `RFID_NFC_REACT_NATIVE_101.md`
- `TASKS.md`
- `TRACEABILITY.md`
- `RISKS.md`
- `TASK_PRESENTATION_BRIEF.md`
