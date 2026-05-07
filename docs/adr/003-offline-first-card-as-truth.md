# ADR-003: Offline-First with NFC Card as Source of Truth

## Status

Accepted

## Context

The cooperative operates in areas with unreliable internet. We needed to decide where member state lives:

- Central server (requires internet)
- Device-local database (requires sync)
- NFC card itself (portable, offline)

## Decision

The NFC card is the operational source of truth for member balance, visit status, and recent transactions. SQLite is used only for device-local audit/reporting.

## Rationale

- **Zero infrastructure**: No server, no database, no internet required
- **Portable state**: Member carries their state — works across any device
- **Simplicity**: No sync conflicts, no eventual consistency problems
- **Resilience**: Device wipe doesn't lose member data (card still works)

## Consequences

- SQLite ledger must NEVER override card state
- Reports are per-device only (not global)
- Card capacity limits what can be stored (max 5 transaction logs)
- Device clock accuracy matters for duration calculations
