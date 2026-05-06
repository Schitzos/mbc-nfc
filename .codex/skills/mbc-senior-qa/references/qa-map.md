# MBC QA Map

Primary QA docs:

- `.codex/specs/REQUIREMENTS.md`
- `.codex/specs/TEST_PLAN.md`
- `.codex/specs/TRACEABILITY.md`
- `.codex/specs/DONE.md`
- `.codex/specs/SECURITY.md`
- `.codex/specs/DEVICE_TEST_MATRIX.md`
- `.codex/specs/RISKS.md`

High-risk behaviors:

- Incorrect balance deduction.
- Double check-in or double check-out.
- Insufficient balance clearing active status.
- Scout accidentally writing card state.
- Sensitive identity or balance readable in plain text.
- Implementation becoming parking-only.
- Demo relying on NFC hardware that is not yet available.
