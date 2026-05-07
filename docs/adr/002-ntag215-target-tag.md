# ADR-002: NTAG215 as MVP Target NFC Tag

## Status

Accepted

## Context

Multiple NFC tag types exist (NTAG213, NTAG215, NTAG216, Mifare Classic). We needed a tag that balances capacity, availability, and cost for the parking MVP.

## Decision

Use NTAG215 as the MVP target tag.

## Rationale

- **Capacity**: 504 bytes usable memory — fits our worst-case encrypted payload (362 bytes) with margin
- **Compatibility**: NFC Forum Type 2 Tag, works with `react-native-nfc-manager`
- **Availability**: Widely available as stickers and cards
- **Cost**: Affordable for cooperative deployment
- **Validation**: Confirmed working on ASUS ROG Phone 9 FE (Android 14+)

## Consequences

- Payload must stay compact (short keys, tuple logs, no verbose data)
- Capacity guard enforced before every write
- Future activities may need payload optimization if fields grow
