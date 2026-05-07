# ADR-001: Use AES-256-GCM for Card Payload Protection

## Status
Accepted

## Context
The assessment requires that sensitive member data (identity, balance, status) is not readable by generic NFC reader apps. We needed to choose between:
- Base64 encoding (not security)
- HMAC-only (integrity but no confidentiality)
- AES-256-GCM (confidentiality + integrity)

## Decision
Use AES-256-GCM authenticated encryption via `react-native-quick-crypto`.

## Rationale
- **Confidentiality**: Generic NFC readers see only opaque binary data
- **Integrity**: GCM auth tag detects any byte modification
- **Standard**: Well-understood, widely supported algorithm
- **Library**: `react-native-quick-crypto` provides native performance
- **Capacity**: 35-byte overhead fits within NTAG215's 504 bytes

## Consequences
- Demo AES key is bundled for assessment (clearly labeled)
- Production would require Android Keystore integration
- Fresh random IV per write prevents pattern analysis
