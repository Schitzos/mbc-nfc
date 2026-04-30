# MBC QA Map

Primary QA docs:

- `specs/REQUIREMENTS.md`
- `specs/TEST_PLAN.md`
- `specs/TRACEABILITY.md`
- `specs/DONE.md`
- `specs/SECURITY.md`
- `specs/DEVICE_TEST_MATRIX.md`
- `specs/RISKS.md`

High-risk behaviors:

- Incorrect balance deduction.
- Double check-in or double check-out.
- Insufficient balance clearing active status.
- Scout accidentally writing card state.
- Sensitive identity or balance readable in plain text.
- Implementation becoming parking-only.
- Demo relying on NFC hardware that is not yet available.
