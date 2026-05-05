# KDX Membership Benefit Card Security

## 1. Security Baseline

The MBC prototype follows a mobile security baseline inspired by OWASP MASVS, adapted for a frontend-only assessment.

Security focus:

- NFC card payload privacy.
- Offline state integrity.
- Safe logging.
- Safe read/write failure handling.

## 2. Security Principles

- Identity and balance are sensitive.
- Sensitive fields must not be stored as plain readable NFC text.
- The card is the local source of truth, so every activity write must validate state first.
- Do not rely on internet or backend validation for core flows.
- Do not log decoded sensitive data.
- Do not clear active activity state when checkout payment fails.
- Keep NFC and card codec logic inside infrastructure.

## 3. Silent Shield

Silent Shield is defined in `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md` and is the authority for card payload protection.

Security decision for this build:

```text
Production-grade assessment mode is required.
Do not implement Base64-only, plain JSON, or weak reversible obfuscation.
```

Required behavior:

- The logical payload includes schema version, compact member/card fields, balance, parking check-in state, latest five compact transactions, write counter, and authentication metadata.
- The logical payload is canonicalized with stable key ordering.
- The compact logical payload is encrypted/authenticated using AES-256-GCM or equivalent authenticated encryption.
- Optional HMAC may be added only as defense-in-depth if capacity allows and keys are separated.
- The NFC card stores only the protected Silent Shield binary envelope containing version, key ID, IV/nonce, ciphertext, and authentication tag. Base64/text envelopes are not preferred for NTAG215 because of capacity overhead.
- Every card read must decrypt and verify integrity before any Station, Gate, Terminal, or Scout action is allowed.
- Generic NFC apps must not reveal member identity, balance, parking status details, or transaction amounts as readable fields.
- Any decrypt/authentication failure means the card is tampered/corrupted and must be rejected.
- Keys must not be committed to the repository. Use secure configuration placeholders and platform secure storage where available.

Failure message:

```text
Card data is invalid or modified. Please go to Station.
```

Assessment security note:

This project should be implemented in production-grade assessment mode for NFC payload confidentiality and integrity. Remaining real-world production hardening, such as backend reconciliation, operator authentication, remote key rotation, and fleet key provisioning, is tracked separately and must not be falsely claimed as complete.

## 4. Data Handling

| Data                    | Card Rule                                                                                  | Logging Rule                               |
| ----------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Member identity         | Protect with Silent Shield                                                                 | Redact                                     |
| Internal member ID      | Generate by system, protect with Silent Shield, do not expose full value on normal screens | Redact or show masked/short reference only |
| Balance                 | Protect with Silent Shield                                                                 | Redact or aggregate only                   |
| Visit status            | May be readable if not sensitive                                                           | Allowed                                    |
| Check-in timestamp      | Validate before use                                                                        | Allowed if not tied to full identity       |
| Active activity ID/type | Validate before use                                                                        | Allowed if not tied to full identity       |
| Transaction logs        | Store latest five only                                                                     | Redact identity and balance                |
| Top-up amount           | Validate positive amount                                                                   | Allowed without identity                   |
| Local ledger entry      | Store audit/reporting fields only                                                          | Prefer masked reference over full identity |

## 5. Local Ledger Report Scope

Local ledger report scope:

- SQLite reports are current-device/current-installation only.
- UI and documentation must not present local summaries as global cooperative totals.
- Ledger rows must use masked/short member references where possible.

## 6. Secure Logging

Requirements:

- Never log full member identity.
- Never log or display the full internal member ID in normal operator/member flows.
- Never log raw sensitive card payload.
- Never log decoded balance with member identity.
- Never log encryption secrets.
- Disable verbose NFC logs in release builds.

## 7. Card Integrity

Every card read must validate:

- Payload version.
- Required fields.
- Balance is not negative.
- Visit status is valid.
- Check-in timestamp exists only when checked in.
- Active activity exists only when checked in.
- Transaction log length is at most five.
- Integrity check passes.

Every card write must:

- Re-read or validate latest known state.
- Apply only one role action.
- Append a transaction log.
- Preserve latest five logs.
- Fail safely if NFC write fails.

When a role flow requires local reporting/audit:

- Local ledger write outcome is handled explicitly.
- Ledger write failure must not silently appear as successful reporting.

## 8. Security Checklist## 8. Security Checklist

- Sensitive fields are not plain text on card.
- Internal member ID is generated by the system and is not typed by staff.
- Full internal member ID is hidden from Station, Gate, Terminal, and Scout screens unless a masked support reference is explicitly needed.
- Payload validation rejects malformed data.
- Tampered payloads are rejected safely.
- Double check-in and double check-out are blocked.
- Insufficient balance does not clear active activity status.
- Logs redact identity, balance, and raw payloads.
- Scout is read-only.
- NFC sessions are cleaned up after all outcomes.
- Assessment/demo secrets are not committed to the repository and are loaded through secure configuration.

## 10. Remaining Production Hardening

The NFC payload confidentiality/integrity requirement is production-grade for assessment. Before a real cooperative production rollout, still add:

- Fleet-grade key provisioning and rotation.
- Backend audit and reconciliation.
- Stronger physical card authenticity verification.
- Operator authentication and authorization.
- App integrity protections.
- Privacy policy, retention rules, and incident response.

## NTAG215 Security Capacity Rule

NTAG215 capacity limits must not weaken Silent Shield. If the protected payload is too large, reduce optional payload data and use compact binary encoding before reducing security. Plain JSON, Base64-only business data, or weaker obfuscation is not allowed as a capacity workaround.

## MVP Key Handling and NFC Write Format Decision

For assessment MVP, Silent Shield must use AES-256-GCM or equivalent authenticated encryption. An app-bundled demo AES key is acceptable only for the assessment build and must be clearly documented as demo-only. Production must replace this with secure provisioning and/or hardware-backed Android Keystore key handling.

The NFC writer should prefer raw byte or binary NDEF MIME/external-type payloads for the protected Silent Shield envelope. Base64URL/NDEF text may be used only as a compatibility fallback if the chosen NFC library requires text payloads. Base64 is not security and must not be described as encryption.

Android is the MVP NFC read/write target. iOS NFC write support is out of MVP or best-effort/read-only unless validated later on real hardware.

## MVP Platform and Key Handling Decisions

- Android 9 FE is the primary MVP real-device NFC read/write validation device.
- iOS NFC write is out of MVP and may be documented as deferred or best-effort/read-only unless separately validated later.
- For assessment MVP, an app-bundled demo AES key is acceptable only when clearly labeled as demo-only.
- Production must replace the demo key with secure provisioning and/or Android hardware-backed Keystore key handling.
- Prefer raw byte or binary NDEF MIME/external-type payloads for the encrypted Silent Shield envelope. Use Base64URL/NDEF text only if the selected NFC library requires text payloads.
