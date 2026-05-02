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

- The logical payload includes schema version, compact member/card fields, parking check-in state, latest five transactions, write counter, and signature.
- The logical payload is canonicalized with stable key ordering.
- The payload is signed with HMAC-SHA256 using a signing key that is separate from the encryption key.
- The signed logical payload is encrypted using authenticated encryption, preferably AES-256-GCM.
- The NFC card stores only the protected Silent Shield envelope, for example an `mbc1` envelope containing version, key ID, IV/nonce, ciphertext, and authentication tag.
- Every card read must decrypt and verify integrity before any Station, Gate, Terminal, or Scout action is allowed.
- Generic NFC apps must not reveal member identity, balance, parking status details, or transaction amounts as readable fields.
- Any decrypt/authentication/HMAC failure means the card is tampered/corrupted and must be rejected.
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
- Never log encryption or signing secrets.
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

## 7A. Tariff Snapshot Security

- The active visit tariff snapshot affects the amount deducted from member balance and must be protected by Silent Shield.
- Snapshot fields such as rate and version must be encrypted/authenticated with the rest of the card payload.
- Generic NFC tools must not be able to edit the stored tariff snapshot without causing card authentication failure.
- Terminal must reject tampered snapshots with `CARD_TAMPERED` / authentication failure.
- Terminal may only fallback when the snapshot is genuinely absent due to legacy/demo data, not when snapshot verification fails.

## 8. Local Tariff Security

- Local tariff setting is operationally sensitive because it affects member charges.
- Only authorized Station/Admin staff may update active tariff.
- MVP may use a simple admin PIN or equivalent local authorization for assessment, but it must be documented as demo-level unless stronger authentication is implemented.
- Do not store admin PINs or local authorization secrets in plain text.
- Every tariff change should record version, updatedAt, and updatedBy role/reference in local storage and/or local ledger.
- Terminal must display the card-stored visit tariff snapshot before deduction. Station/Admin settings must display the current local active tariff so staff can detect incorrectly configured offline devices before new check-ins.
- Because the app is offline, tariff consistency across multiple devices is an operational process, not automatic security enforcement.

## 9. Security Checklist

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
- Tariff update authorization secrets are not stored in plain text.
- Unauthorized roles cannot change active tariff.

## 10. Remaining Production Hardening

The NFC payload confidentiality/integrity requirement is production-grade for assessment. Before a real cooperative production rollout, still add:

- Fleet-grade key provisioning and rotation.
- Backend audit and reconciliation.
- Stronger physical card authenticity verification.
- Operator authentication and authorization.
- App integrity protections.
- Privacy policy, retention rules, and incident response.
