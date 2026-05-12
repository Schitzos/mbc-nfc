# NTAG215 Compact Payload Guide

## Purpose

This guide explains the MVP decision to use **NTAG215** as the target NFC tag and how the MBC payload should stay small enough while preserving the original PDF requirement.

## Decision

NTAG215 is the MVP target tag. NTAG215 has 504 bytes raw user memory, but the effective NDEF-writable capacity is **480 bytes** (the 24-byte difference accounts for CC bytes, lock bytes, and internal overhead). The app's `assertSupportedTag()` validates against 480 bytes NDEF capacity as the acceptance threshold.

The card payload must be compact and capacity-tested before write. If the encrypted/protected payload cannot fit NTAG215, reduce optional/verbose formatting first. Do not reduce Silent Shield security and do not remove identity, balance, active visit, or the required latest 5 transaction records.

## Required card data

The card must still support:

- card ID and member ID only;
- current balance;
- active visit/check-in timestamp;
- latest 5 transaction records;
- schema version and write counter;
- Silent Shield protection using AES-256-GCM or equivalent authenticated encryption.

Do not store member name on the card.

## Slim payload strategy

Use compact NFC DTOs separate from readable UI/domain DTOs.

Recommended compact fields:

| Field | Meaning                       |
| ----- | ----------------------------- |
| `v`   | schema version                |
| `c`   | card ID/ref                   |
| `m`   | member ID/ref                 |
| `b`   | balance                       |
| `i`   | active visit object or `null` |
| `x`   | latest 5 transaction tuples   |
| `n`   | write counter                 |

Recommended transaction tuple:

```text
[activity, nominal, isoTime]
```

This matches the PDF requirement: **nominal, time, and activity**.

Activity mapping:

- `R` = register
- `U` = top-up
- `I` = check-in / tap-in
- `O` = checkout / tap-out

## Timestamp rule

ISO timestamp strings are allowed by default for readability:

```text
2026-05-06T10:00:00+07:00
```

If the encrypted/protected payload does not fit NTAG215, reduce optional/verbose formatting first before changing timestamp representation. Required data must remain.

## Transaction FIFO rule

Card transaction history must keep a rolling latest-5 list:

1. If there are fewer than 5 records, append the new transaction.
2. If there are already 5 records, remove the oldest record first.
3. Append the newest record.
4. Keep only the 5 newest records.

The retained records should be stored oldest-to-newest to make FIFO behavior explicit.

## What must not be stored on NTAG215 MVP payload

- member name;
- long profile data;
- device reference;
- debug/raw payload dumps;
- tariff-management fields;
- tariff snapshot fields;
- duplicate readable transaction labels.

## Security rule

Use AES-256-GCM or equivalent authenticated encryption for Silent Shield. Plain JSON, Base64-only data, or weak obfuscation is not allowed. Base64 may be used only as an encoding if the NFC library requires text/NDEF payloads; it is not security.

## Failure rule

If protected payload size exceeds NTAG215 NDEF capacity (480 bytes), block write with:

```text
CARD_CAPACITY_INSUFFICIENT
```

Do not write partial card data.

## Final implementation decisions

- AES-256-GCM or equivalent authenticated encryption is required for Silent Shield.
- For assessment MVP, an app-bundled demo AES key is acceptable only when clearly labeled as demo-only. Production must use secure provisioning and/or Android hardware-backed Keystore.
- Prefer raw byte or binary NDEF MIME/external-type payloads for the encrypted envelope. Use Base64URL/NDEF text only if the NFC library requires text payloads.
- Android is the required MVP NFC read/write platform. iOS is out of MVP or best-effort/read-only unless validated later.
