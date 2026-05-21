# Code Audit Report — Clean Architecture & SOLID Violations

**Task:** T-SA-AUDIT-001  
**Issue:** [#170](https://github.com/Schitzos/mbc-nfc/issues/170)  
**Date:** 2026-05-22  
**Auditor:** System Analyst

---

## Summary

| Category                               | Count  |
| -------------------------------------- | ------ |
| Clean Architecture Layer Violations    | 7      |
| SRP (Single Responsibility) Violations | 4      |
| OCP (Open/Closed) Violations           | 3      |
| DIP (Dependency Inversion) Violations  | 5      |
| ISP (Interface Segregation) Violations | 1      |
| LSP (Liskov Substitution) Violations   | 0      |
| **Total**                              | **20** |

---

## 1. Clean Architecture Layer Violations

### CA-01 — Domain factory imports `@shared/utils/create-random-id`

| Field       | Value                                                                                                                                                                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| File        | `src/domain/membership/factories/membership-card.factory.ts:6`                                                                                                                                                                                                                                                                                   |
| Type        | Clean Architecture — Dependency Rule                                                                                                                                                                                                                                                                                                             |
| Severity    | **High**                                                                                                                                                                                                                                                                                                                                         |
| Description | Domain layer imports `createRandomId` from `@shared/utils/create-random-id`. While `@shared` is technically allowed, this utility uses `Math.random()` and `Date.now()` — non-deterministic runtime dependencies. The domain factory should receive an ID generator via parameter injection to remain pure and testable without mocking globals. |

### CA-02 — Domain factory uses `new Date()` directly

| Field       | Value                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| File        | `src/domain/membership/factories/membership-card.factory.ts:9`                                                                                                                 |
| Type        | Clean Architecture — Domain Purity                                                                                                                                             |
| Severity    | **High**                                                                                                                                                                       |
| Description | `createInitialCard()` calls `new Date().toISOString()` directly. Domain entities/factories should not depend on system clock. The timestamp should be injected as a parameter. |

### CA-03 — Application DTO re-exports raw domain entity types

| Field       | Value                                                                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/application/dto/card-summary-dto.ts:1-4`                                                                                                                                                                                                                                   |
| Type        | Clean Architecture — DTO Boundary Leak                                                                                                                                                                                                                                          |
| Severity    | **Medium**                                                                                                                                                                                                                                                                      |
| Description | `CardSummaryDto` uses `ActivitySession` and `TransactionLog` domain types directly in its shape. DTOs should define their own flat structures to decouple presentation from domain entity changes. Any domain entity rename/restructure would cascade through the DTO boundary. |

### CA-04 — Application DTO is naked type alias of domain entity

| Field       | Value                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/application/dto/station-ledger-summary-dto.ts:3`                                                                                                                                                          |
| Type        | Clean Architecture — DTO Boundary Leak                                                                                                                                                                         |
| Severity    | **Medium**                                                                                                                                                                                                     |
| Description | `StationLedgerSummaryDto` is defined as `type StationLedgerSummaryDto = StationLedgerSummary` — a direct alias of the domain entity. This provides zero boundary protection; the DTO layer adds no value here. |

### CA-05 — Application DTO re-exports domain type

| Field       | Value                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/application/dto/check-nfc-availability-result-dto.ts:1`                                                                                                                                      |
| Type        | Clean Architecture — DTO Boundary Leak                                                                                                                                                            |
| Severity    | **Minor**                                                                                                                                                                                         |
| Description | `export type { NfcAvailabilityStatus } from '@domain/...'` re-exports a domain type directly from the DTO module. Consumers of this DTO now have a transitive dependency on the domain type path. |

### CA-06 — Presentation imports from `@app` composition root

| Field       | Value                                                                                                                                                                                                                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/presentation/context/service-context.tsx:8,16`                                                                                                                                                                                                                                                                                                                         |
| Type        | Clean Architecture — Layer Coupling                                                                                                                                                                                                                                                                                                                                         |
| Severity    | **Minor**                                                                                                                                                                                                                                                                                                                                                                   |
| Description | Presentation layer imports service type contracts from `@app/services-contract`. While `@app` is the composition root and this is a type-only import, it creates a bidirectional awareness: `@app/navigation.tsx` imports from `@presentation`, and `@presentation` imports from `@app`. Ideally, service contracts live in `@application` or a dedicated contracts module. |

### CA-07 — Presentation screens import navigation types from `@app`

| Field       | Value                                                                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/presentation/screens/RoleSwitcher/index.tsx:4`, `src/presentation/screens/Terminal/fragments/InsufficientBalanceCard.tsx:5`                                                                                                                                      |
| Type        | Clean Architecture — Layer Coupling                                                                                                                                                                                                                                   |
| Severity    | **Minor**                                                                                                                                                                                                                                                             |
| Description | Presentation screens import `RootStackParamList` from `@app/navigation`, creating a circular awareness between `@app` (which imports screens) and screens (which import from `@app`). Navigation types should be defined in a shared location or within presentation. |

---

## 2. SOLID — Single Responsibility Principle (SRP) Violations

### SRP-01 — `useStationActions.ts` handles too many concerns

| Field       | Value                                                                                                                                                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/presentation/screens/Station/useStationActions.ts` (247 lines)                                                                                                                                                                                                                                                                |
| Type        | SRP Violation                                                                                                                                                                                                                                                                                                                      |
| Severity    | **Medium**                                                                                                                                                                                                                                                                                                                         |
| Description | This hook manages 7+ distinct concerns: NFC availability check, ledger summary refresh, register flow (including wipe-and-re-register sub-flow), top-up flow, NFC sheet state, dismiss/cancel logic, and mode switching. Should be decomposed into smaller focused hooks (e.g., `useRegisterFlow`, `useTopUpFlow`, `useNfcSheet`). |

### SRP-02 — `real-mbc-card.repository.ts` handles too many concerns

| Field       | Value                                                                                                                                                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/infrastructure/nfc/real-mbc-card.repository.ts` (295 lines)                                                                                                                                                                                                                       |
| Type        | SRP Violation                                                                                                                                                                                                                                                                          |
| Severity    | **Medium**                                                                                                                                                                                                                                                                             |
| Description | This file handles: NFC session lifecycle management, tag type validation, NDEF message reading/parsing, NDEF message encoding/writing, error mapping/translation, and write counter management. The NFC session management and error mapping could be extracted into separate modules. |

### SRP-03 — `mbc-card-codec.ts` mixes encoding, decoding, and validation

| Field       | Value                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/infrastructure/nfc/mbc-card-codec.ts` (226 lines)                                                                                                                                                                                |
| Type        | SRP Violation                                                                                                                                                                                                                         |
| Severity    | **Minor**                                                                                                                                                                                                                             |
| Description | The codec file contains encode logic, decode logic, and three separate validation functions. While cohesive, the validation logic could be extracted for reuse and independent testing. Acceptable for current size but worth noting. |

### SRP-04 — `check-out-activity.use-case.ts` manages tariff + ledger + card state

| Field       | Value                                                                                                                                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/application/use-cases/check-out-activity.use-case.ts` (131 lines)                                                                                                                                                                                               |
| Type        | SRP Violation                                                                                                                                                                                                                                                        |
| Severity    | **Minor**                                                                                                                                                                                                                                                            |
| Description | The checkout use case orchestrates tariff calculation, card state mutation, transaction log creation, ledger append, and error mapping. While this is typical for a use case orchestrator, the inline tariff + simulation branching logic makes it harder to extend. |

---

## 3. SOLID — Open/Closed Principle (OCP) Violations

### OCP-01 — Hardcoded `#FF0025` color across 18+ files

| Field       | Value                                                                                                                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files       | `useStationActions.ts` (×3), `useGateActions.ts` (×1), `useTerminalActions.ts` (×1), `useScoutActions.ts` (×1), plus 14 fragment/screen files                                                                                                                                                                  |
| Type        | OCP Violation                                                                                                                                                                                                                                                                                                  |
| Severity    | **Medium**                                                                                                                                                                                                                                                                                                     |
| Description | The Signal UI primary color `#FF0025` is defined in `theme/colors.ts` as `signalColorTokens.brand.primary` but is hardcoded as a raw hex string in 24 places across 18 files. Changing the brand color requires modifying all these files instead of just the theme token. Violates "closed for modification." |

### OCP-02 — Hardcoded demo key in `silent-shield.ts`

| Field       | Value                                                                                                                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/infrastructure/nfc/silent-shield.ts:28-31`                                                                                                                                                                                                                             |
| Type        | OCP Violation                                                                                                                                                                                                                                                               |
| Severity    | **Medium**                                                                                                                                                                                                                                                                  |
| Description | The AES-256 demo key is a hardcoded `Buffer.from(...)` constant. Switching to production key provisioning (Android Keystore, secure config) requires modifying this file. Should accept a key provider/resolver function. Documented as "demo-only" but still violates OCP. |

### OCP-03 — Error mapping uses if-chains instead of strategy/map

| Field       | Value                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/infrastructure/nfc/real-mbc-card.repository.ts:37-56`                                                                                                                                                    |
| Type        | OCP Violation                                                                                                                                                                                                 |
| Severity    | **Minor**                                                                                                                                                                                                     |
| Description | `toReadableError()` uses sequential if-checks with regex patterns to classify errors. Adding new error categories requires modifying this function. A map-based or strategy pattern would be more extensible. |

---

## 4. SOLID — Dependency Inversion Principle (DIP) Violations

### DIP-01 — Domain factory depends on concrete `createRandomId` implementation

| Field       | Value                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/domain/membership/factories/membership-card.factory.ts:6`                                                                                                                                                                                    |
| Type        | DIP Violation                                                                                                                                                                                                                                     |
| Severity    | **High**                                                                                                                                                                                                                                          |
| Description | The factory directly imports a concrete ID generation function. Domain should depend on an abstraction (e.g., `IdGenerator` interface) injected at call site. This makes the factory non-deterministic and harder to test without module mocking. |

### DIP-02 — Domain factory depends on system clock

| Field       | Value                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/domain/membership/factories/membership-card.factory.ts:9`                                                                                |
| Type        | DIP Violation                                                                                                                                 |
| Severity    | **High**                                                                                                                                      |
| Description | Direct `new Date()` call couples the domain to the runtime clock. Should accept a `Clock` abstraction or receive `occurredAt` as a parameter. |

### DIP-03 — Application use cases depend on system clock

| Field       | Value                                                                                                                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files       | `register-member-card.use-case.ts:32`, `top-up-member-card.use-case.ts:56,73`, `check-in-activity.use-case.ts:73`, `check-out-activity.use-case.ts:45`                                                                                                  |
| Type        | DIP Violation                                                                                                                                                                                                                                           |
| Severity    | **Medium**                                                                                                                                                                                                                                              |
| Description | Five `new Date().toISOString()` calls across four use cases couple application logic to the system clock. A `Clock` or `TimeProvider` abstraction injected into use case factories would improve testability and make time-dependent behavior explicit. |

### DIP-04 — `silent-shield.ts` depends on concrete crypto library

| Field       | Value                                                                                                                                                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| File        | `src/infrastructure/nfc/silent-shield.ts:1`                                                                                                                                                                                                                                                                                    |
| Type        | DIP Violation                                                                                                                                                                                                                                                                                                                  |
| Severity    | **Minor**                                                                                                                                                                                                                                                                                                                      |
| Description | `import Crypto from 'react-native-quick-crypto'` is a direct dependency on a concrete crypto implementation. For infrastructure this is acceptable (infrastructure IS the place for concrete deps), but the key material is also hardcoded rather than injected. Noted as minor since infrastructure is allowed concrete deps. |

### DIP-05 — `container.ts` uses module-level singleton caching

| Field       | Value                            |
| ----------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File        | `src/app/container.ts:14`        |
| Type        | DIP Violation                    |
| Severity    | **Minor**                        |
| Description | `let cachedServices: AppServices | null = null` implements a module-level singleton. While acceptable for a composition root, it makes testing harder (no way to reset without module reload) and prevents injecting alternative implementations for different environments. |

---

## 5. SOLID — Interface Segregation Principle (ISP) Violations

### ISP-01 — Use cases accept full `MbcCardRepository` when they only need subsets

| Field       | Value                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files       | `inspect-member-card.use-case.ts:11`, `check-in-activity.use-case.ts:64`, `check-out-activity.use-case.ts:38`, `top-up-member-card.use-case.ts:27`, `register-member-card.use-case.ts:17`                                                                                                                                                                                                                        |
| Type        | ISP Violation                                                                                                                                                                                                                                                                                                                                                                                                    |
| Severity    | **Medium**                                                                                                                                                                                                                                                                                                                                                                                                       |
| Description | The domain already defines segregated interfaces (`CardReader`, `CardWriter`, `NfcCapabilityChecker`), but all use cases accept the full `MbcCardRepository` composite interface. `InspectMemberCardUseCase` only calls `readCard()` — it should accept `CardReader`. `CheckInActivityUseCase` only calls `readWriteCard()` — it should accept `CardWriter`. This forces test mocks to implement unused methods. |

---

## 6. SOLID — Liskov Substitution Principle (LSP) Violations

No LSP violations found. All interface implementations honor their contracts correctly.

---

## Severity Summary

| Severity   | Count | Items                                                        |
| ---------- | ----- | ------------------------------------------------------------ |
| **High**   | 4     | CA-01, CA-02, DIP-01, DIP-02                                 |
| **Medium** | 8     | CA-03, CA-04, SRP-01, SRP-02, OCP-01, OCP-02, DIP-03, ISP-01 |
| **Minor**  | 8     | CA-05, CA-06, CA-07, SRP-03, SRP-04, OCP-03, DIP-04, DIP-05  |

---

## Recommendations (Do NOT implement — tracking only)

1. **Domain purity** (High priority): Inject `IdGenerator` and `Clock` abstractions into `createInitialCard()` parameters.
2. **DTO boundary**: Define flat DTO shapes instead of re-exporting domain entity types.
3. **ISP compliance**: Use `CardReader` / `CardWriter` in use case constructors instead of full `MbcCardRepository`.
4. **Theme token usage**: Replace all 24 hardcoded `#FF0025` occurrences with theme token references.
5. **Hook decomposition**: Split `useStationActions` into focused sub-hooks.
6. **Key injection**: Accept a key provider in `silent-shield.ts` instead of hardcoding.
