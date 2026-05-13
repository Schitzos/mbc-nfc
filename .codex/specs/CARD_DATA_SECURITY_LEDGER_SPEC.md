# MBC Card Data, Silent Shield, and Local Ledger Specification

## 1. Authority and Scope

This document is the implementation authority for NFC card payload shape, Silent Shield integrity protection, write-counter behavior, and the local SQLite ledger boundary.

Core rule:

```text
NFC card = operational source of truth for member balance and check-in/activity state.
SQLite ledger = device-local reporting and audit store only.
```

SQLite must never override card balance, card status, active activity state, or check-in timestamp. It records transactions processed on the current app/device so Station users can count transactions, income, and audit activity processed by that device.

## 2. NFC Card Payload v1 — NTAG215 Compact MVP

The MVP target NFC tag is **NTAG215**. NTAG215 provides 504 bytes raw user memory, but the effective NDEF-writable capacity is **480 bytes** after accounting for CC bytes, lock bytes, and internal overhead. The app's `assertSupportedTag()` uses 480 bytes (NDEF capacity) as the minimum acceptance threshold. Constants: `NTAG215_RAW_MEMORY = 504`, `NTAG215_NDEF_CAPACITY = 480`.

The MBC card payload must be compact, capacity-tested, and protected before every write. Logical examples below are for domain/testing only; the NFC tag must store the Silent Shield protected envelope, not plain JSON.

### 2.1 Required data that must stay on card

The payload must keep these original requirement items:

- card/member identity reference;
- current balance;
- active visit/check-in status and timestamp;
- latest 5 card transactions;
- schema/version and write counter for validation.

Do **not** remove identity, balance, active visit state, or the required latest 5 transaction records to fit NTAG215. If capacity is tight, first reduce optional/profile/debug data and compact the encoding/field names.

### 2.2 Compact logical schema

Use short keys and compact values before encryption. The app may expose readable DTOs internally, but the protected card payload should stay compact.

```json
{
  "v": 1,
  "c": "C000001",
  "m": "M000001",
  "b": 50000,
  "i": { "a": 1, "t": "2026-05-06T10:00:00+07:00" },
  "x": [
    ["R", 0, "2026-05-06T09:00:00+07:00"],
    ["U", 50000, "2026-05-06T09:05:00+07:00"],
    ["I", 0, "2026-05-06T10:00:00+07:00"]
  ],
  "n": 3
}
```

### 2.3 Compact field meaning

| Compact field | Meaning                         | Required                   | Notes                                                                                                    |
| ------------- | ------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `v`           | Payload schema version          | Yes                        | Initial value `1`.                                                                                       |
| `c`           | Card ID/reference               | Yes                        | Short internal ID, not full profile data.                                                                |
| `m`           | Member ID/reference             | Yes                        | Short generated member ID/reference.                                                                     |
| `b`           | Balance in rupiah               | Yes                        | Integer, never negative.                                                                                 |
| `i`           | Active visit state              | Yes                        | Use `null` when not checked in, or object when checked in. Visit status is derived from presence of `i`. |
| `i.a`         | Active visit flag               | Yes when `i` object exists | `1` checked in. If checked out, prefer `i:null`.                                                         |
| `i.t`         | Check-in time                   | Yes when checked in        | ISO timestamp is allowed for MVP readability if protected payload fits NTAG215.                          |
| `x`           | Latest card transaction records | Yes                        | Max 5, FIFO rolling window, stored oldest-to-newest among retained records.                              |
| `n`           | Monotonic write counter         | Yes                        | Increment after every successful card-state write.                                                       |

Do not store `name`, raw member profile, device reference, debug fields, or tariff snapshot fields on the MVP card payload. The MVP tariff is fixed at Rp2.000 per started hour and does not need to be stored on NTAG215.

### 2.4 Compact transaction record

Each transaction entry in `x` is a tuple matching the PDF requirement of **nominal, time, and activity**:

```text
[activity, nominal, isoTime]
```

Activity mapping:

| Activity | Meaning            | Nominal rule                               |
| -------- | ------------------ | ------------------------------------------ |
| `R`      | REGISTER           | `0` or initial registration amount if any. |
| `U`      | TOPUP              | Top-up amount.                             |
| `I`      | CHECKIN / tap-in   | `0`.                                       |
| `O`      | CHECKOUT / tap-out | Parking fee deducted.                      |

`x` must keep exactly the latest available transaction records up to a maximum of 5. FIFO behavior is required: when adding a sixth transaction, remove the oldest record and append the newest record. UI/Scout screens may convert compact activity codes into readable labels.

## 2A. NTAG215 Capacity Budget

NTAG215 is the MVP target tag. The implementation must treat capacity as a first-class requirement.

Rules:

- Use NTAG215 user memory as the target card capacity.
- Keep a conservative project payload budget until measured on the chosen NTAG215 card/sticker.
- Prefer a raw byte or binary NDEF MIME/external-type record with a Silent Shield AES-GCM envelope when the NFC library supports it.
- Use Base64URL/NDEF text only as a compatibility fallback if the NFC library requires text payloads. Base64 is encoding only, not security, and adds size overhead.
- Estimate final encrypted/protected byte length before every write.
- If the payload does not fit, block the write with `CARD_CAPACITY_INSUFFICIENT` and keep the previous card state unchanged.
- If the encrypted payload cannot fit NTAG215, reduce optional/verbose formatting first.
- Do not remove identity, balance, active visit, or the required latest 5 transactions.
- Remove optional fields first: display name, raw profile, device reference, debug data, unused activity metadata.

## 3. Field Definitions

The authoritative field definitions for MVP are the compact fields in Section 2.3. Developer-facing DTOs may use verbose names, but all NFC-write logic must normalize into the compact payload before Silent Shield encryption.

Normalization rules:

- Checked-out state should use `i:null`.
- Checked-in state must use `i:{"a":1,"t":"<ISO timestamp>"}`.
- ISO timestamp strings may be used by default for readability if the final protected payload fits NTAG215.
- `x` must never exceed five entries.
- `x` uses FIFO latest-five behavior: remove oldest, append newest.
- Payload must not include tariff-management fields. MVP tariff is fixed and lives in app logic only.

## 4. Transaction Log Rules

Allowed card transaction activities are `R`, `U`, `I`, and `O`, mapped to Register, Top-Up, Check-In/tap-in, and Check-Out/tap-out.

Rules:

- `x` stores only the latest five entries.
- Store retained records oldest-to-newest so FIFO behavior is explicit.
- When appending the sixth entry, remove the oldest entry first, then append the newest entry.
- `nominal` is positive for top-up and checkout fee amount; check-in may use `0`.
- Each record must contain only activity, nominal, and time.
- Card transaction logs are a compact recent-history display, not the reporting database.
- SQLite keeps richer device-local audit/reporting records if needed.

## 5. Silent Shield v1 Production-Grade Requirement

Silent Shield v1 must provide assessor-testable confidentiality and integrity for the NFC card payload. It is not enough to store plain JSON, Base64 JSON, or lightly encoded data. Generic NFC reader apps must not be able to reveal member identity, balance, check-in state, or transaction values as readable fields.

Production-grade v1 implementation model:

```text
canonicalPayload = StableJson(compactPayload)
protectedEnvelope = AES-256-GCM-Encrypt(canonicalPayload, ENC_KEY, AAD)
nfcRecord = BinaryNdefRecord("application/vnd.mbc.v1", envelopeHeader + iv + ciphertext + authTag)
# Base64URL may be used only if the NFC library requires text/NDEF payload encoding; prefer raw bytes/binary NDEF when supported.
```

Envelope header must include at minimum:

| Field   | Description                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| `magic` | Fixed binary marker such as `MBC1` so the app can detect supported payloads without exposing business data. |
| `v`     | Shield/envelope version.                                                                                    |
| `kid`   | Key identifier for future key rotation. It must not reveal the actual key.                                  |
| `alg`   | Algorithm identifier, for example `A256GCM`.                                                                |

Key requirements:

- Use AES-256-GCM or equivalent authenticated encryption for confidentiality and integrity.
- Do not commit real secrets to the repository.
- Provide `.env.example` or documented secure configuration placeholders only.
- For assessment MVP, a clearly labeled app-bundled demo AES key is allowed only for the assessment build.
- Production must move key handling to secure provisioning and/or Android hardware-backed Keystore.
- Do not commit production secrets to the repository.
- iOS Keychain support is not required because iOS NFC write is out of MVP.
- Never log keys, IVs with secrets, decrypted payloads, or raw sensitive payloads.
- Use a fresh random IV/nonce for every AES-GCM encryption operation.
- Include envelope version, key ID, and card ID reference in AES-GCM additional authenticated data where feasible.
- Optional defense-in-depth HMAC may be added only if capacity allows and a separate MAC key is used.

Read flow:

1. Read NFC record.
2. Verify supported `MBC1` envelope marker and envelope version.
3. Decode envelope.
4. Decrypt/authenticate with AES-256-GCM using the key identified by `kid`.
5. If decrypt/authentication fails, reject with `CARD_TAMPERED`.
6. Parse compact logical payload.
7. Validate schema, counter, status, balance, active visit, transaction FIFO rules, timestamp, and max-5 history before role use.
8. If optional HMAC is implemented and validation fails, reject with `CARD_TAMPERED`.

Write flow:

1. Build compact logical payload.
2. Normalize checked-out state as `i:null`.
3. Enforce transaction FIFO latest-5 rule.
4. Canonicalize with stable key order.
5. Encrypt/authenticate with AES-256-GCM or equivalent authenticated encryption.
6. Write only the protected `MBC1` envelope to NFC.
7. `writeNdefMessage` throws on failure; no post-write readback is performed.

Failure message:

```text
Card data is invalid or modified. Please go to Station.
```

Hard rejection rules:

- Plain JSON on card is not allowed.
- Base64-only storage is not allowed.
- XOR/custom reversible obfuscation is not allowed.
- HMAC without encryption is not enough for this assessment because the assessor may inspect the card using generic NFC tools.
- Any invalid decrypt/authentication result, malformed schema, negative balance, invalid status, invalid timestamp, or invalid check-in structure must block the role action.

## 6. Generic NFC Reader Security Acceptance

Security acceptance must be demonstrable using at least one external/generic NFC reader app or tool.

Minimum passing evidence:

- Generic NFC reader does not show plain card ID/member ID, balance, check-in timestamp, or transaction amount values.
- Raw record appears as an opaque Silent Shield binary envelope, not readable business JSON.
- Editing one byte of the stored payload causes decrypt/authentication failure.
- Copying an old card image over a newer card is caught by Silent Shield AES-256-GCM integrity validation (counter regression detection is not a separate requirement — see Section 7).
- App logs and SQLite reports never expose decrypted raw payloads or encryption secrets.

## 7. Write Counter and Replay Handling

`ctr` increments by `1` after each successful card-state write.

> **Removed Requirement:** Counter regression detection (warning when `card.ctr < local_cached_ctr`) has been removed from the spec. Silent Shield's AES-256-GCM authenticated encryption already catches any card tampering or replay via integrity validation (`CARD_TAMPERED`), making counter regression detection redundant. The write counter remains in the payload as a monotonic sequence number for operational traceability but is not used for security validation.

## 8. Local SQLite Ledger

SQLite is required for Station reporting and audit on the current device/current app installation only. It is not a central database and does not provide global cooperative reporting across multiple phones.

Table schema:

```sql
CREATE TABLE IF NOT EXISTS station_ledger_entries (
  id TEXT PRIMARY KEY NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  masked_member_reference TEXT,
  activity_type TEXT,
  amount INTEGER,
  occurred_at TEXT NOT NULL,
  device_id TEXT
);
```

Privacy rule:

- Member references are stored masked (`MEM-***-XXX` format) — never raw member IDs.
- Do not store raw secrets or the raw undecoded protected NFC payload in logs.
- No balance snapshots or raw card debug data are stored in the ledger.

Ledger write rules:

- Append a row after every successful card-state operation: `REGISTER`, `TOPUP`, and `CHECKOUT`.
- Check-in (CHECKIN) does NOT append a local ledger row.
- Income reports must filter/sum money-related rows, especially `TOPUP` and `CHECKOUT`.
- Station UI must label reports as local-device summaries.

Reporting examples:

```sql
SELECT action, COUNT(*) AS total_count, SUM(amount) AS total_amount
FROM station_ledger_entries
GROUP BY action;
```

```sql
SELECT activity_type, COUNT(*) AS total_checkout, SUM(amount) AS income
FROM station_ledger_entries
WHERE action = 'CHECK_OUT'
GROUP BY activity_type;
```

## 9. Fixed Parking MVP Tariff

Rules:

- Fee calculation uses Rp 2.000 per started hour.
- Duration is rounded up to the next started hour.
- The rate should live in one isolated tariff module/constant so future requirement changes can be refactored later without scattering magic numbers.

## 10. Operation Ordering

### Station Registration

```text
1. Read target card if possible and reject a valid already registered MBC card with `ALREADY_REGISTERED_CARD`.
2. Build initial card payload.
3. Set balance and NOT_CHECKED_IN state.
4. Add REGISTER transaction.
5. Increment ctr.
6. Sign/protect payload with Silent Shield.
7. Write card (`writeNdefMessage` throws on failure).
8. Insert SQLite ledger record for the successful registration.
```

### Station Top-Up

```text
1. Read and validate card.
2. Reject invalid/tampered/blocked card.
3. Add top-up amount to balance.
4. Add TOPUP transaction.
5. Increment ctr.
6. Sign/protect payload with Silent Shield.
7. Write card (`writeNdefMessage` throws on failure).
8. Insert SQLite ledger record for the successful top-up.
```

### Gate Check-In

```text
1. Read and validate card.
2. Reject invalid/tampered/blocked card.
3. Reject if already checked in.
4. Set active parking context and check-in timestamp.
5. Add CHECKIN transaction.
6. Increment ctr.
7. Sign/protect payload with Silent Shield.
8. Write card (`writeNdefMessage` throws on failure).
```

### Terminal Check-Out

```text
1. Read and validate card.
2. Reject invalid/tampered/blocked card.
3. Reject if not checked in.
4. Calculate charged started hours from check-in and checkout time.
5. Calculate fee using the fixed MVP tariff Rp 2.000 per started hour.
6. Reject if balance is insufficient.
7. Deduct fee.
8. Clear active check-in state.
9. Add CHECKOUT transaction.
10. Increment ctr.
11. Sign/protect payload with Silent Shield.
12. Write card (`writeNdefMessage` throws on failure).
13. Display tariff, charged hours, and calculated fee immediately after successful checkout tap.
14. Insert SQLite ledger record for the successful checkout.
```

If card write succeeds but ledger write fails, the member operation remains successful because the card is the operational source of truth. The app must show or record a clear local reporting warning so the reporting gap is not hidden.

## 11. Required Tests

Add or maintain tests for:

- Valid v1 payload encode/decode.
- Invalid version rejection.
- Missing required field rejection.
- Negative balance rejection.
- Invalid check-in structure rejection.
- Transaction FIFO behavior after more than five entries.
- AES-GCM authentication/decrypt success.
- AES-GCM authentication/decrypt failure after tampering with balance, identity, check-in state, transaction log, or counter.
- Counter increments after successful writes.
- Counter value is present in payload for traceability (no separate regression validation — covered by AES-GCM integrity).
- SQLite ledger insert after successful register, top-up, and checkout (not check-in).
- SQLite ledger does not override card balance/status/activity state.

Additional required validation tests:

- Registration rejects already registered valid MBC cards.
- Encoded protected payload size is checked against selected NFC tag/card capacity.
- `CARD_CAPACITY_INSUFFICIENT` blocks write and keeps prior card state.
- Every real NFC write relies on `writeNdefMessage` throwing on failure. No post-write readback is performed (codec does not preserve all fields round-trip).
- SQLite ledger inserts after successful `REGISTER`, `TOPUP`, and `CHECKOUT` (CHECKIN does NOT insert a ledger row).
- Station ledger summary shows totals for operations processed on this device.
- Checkout rejects invalid duration/time before balance deduction.
- Gate writes active visit state at check-in; Terminal calculates checkout fee using the fixed Rp 2.000 per started hour tariff.
- Insufficient balance recovery works: top-up while checked-in, then checkout succeeds.
- If `writeNdefMessage` throws, the error is surfaced to the user and success is not shown.
