# CODE AUDIT REPORT — T-CODE-AUDIT-001

**Task:** SOLID and Clean Architecture Code Audit  
**Auditors:** @SA (System Analyst) + @FE (Senior RN FE)  
**Date:** 2026-05-13  
**Scope:** All files under `src/` (domain, application, infrastructure, presentation, app, shared)  
**Issue:** [#141](https://github.com/Schitzos/mbc-nfc/issues/141)

---

## Executive Summary

The codebase demonstrates **strong adherence** to Clean Architecture principles and SOLID design. Layer boundaries are well-maintained, dependencies flow inward correctly, and the functional factory pattern used throughout avoids many common OOP pitfalls.

**Overall Grade: A-**

| Category                            | Status                  |
| ----------------------------------- | ----------------------- |
| Clean Architecture Layer Boundaries | ✅ PASS — No violations |
| SRP (Single Responsibility)         | ⚠️ 2 Minor findings     |
| OCP (Open/Closed Principle)         | ✅ PASS                 |
| LSP (Liskov Substitution)           | ✅ PASS                 |
| ISP (Interface Segregation)         | ✅ PASS                 |
| DIP (Dependency Inversion)          | ✅ PASS                 |

**Critical violations: 0**  
**Major violations: 0**  
**Minor violations: 2**

---

## 1. Clean Architecture Layer Boundary Audit

### 1.1 Domain Layer (`src/domain/`)

| File                                          | Imports From                                                                                             | Verdict |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| `entities/mbc-card.ts`                        | None (pure types)                                                                                        | ✅      |
| `entities/station-ledger-summary.ts`          | `./mbc-card` (same layer)                                                                                | ✅      |
| `repositories/mbc-card-repository.ts`         | `@domain/entities/mbc-card`                                                                              | ✅      |
| `repositories/local-ledger-repository.ts`     | `@domain/entities/mbc-card`, `@domain/entities/station-ledger-summary`                                   | ✅      |
| `repositories/nfc-availability-repository.ts` | None (pure types)                                                                                        | ✅      |
| `services/activity-tariff-calculator.ts`      | `@domain/errors/domain-error`                                                                            | ✅      |
| `services/activity-state-policy.ts`           | `@domain/entities/mbc-card`, `@domain/errors/domain-error`                                               | ✅      |
| `services/transaction-log-policy.ts`          | `@domain/entities/mbc-card`, `@domain/errors/domain-error`                                               | ✅      |
| `errors/domain-error.ts`                      | None                                                                                                     | ✅      |
| `errors/membership-card-repository-error.ts`  | None                                                                                                     | ✅      |
| `config/parking-tariff.ts`                    | `@domain/services/activity-tariff-calculator`                                                            | ✅      |
| `factories/mbc-card-factory.ts`               | `@domain/entities/mbc-card`, `@domain/services/transaction-log-policy`, `@shared/utils/create-random-id` | ✅      |

**Result:** Domain layer has **zero** imports from Application, Infrastructure, or Presentation. ✅

> Note: `@shared/utils/create-random-id` is used in the factory. The `shared/` layer is a cross-cutting utility layer that sits outside the architecture ring hierarchy. This is acceptable as it contains only pure utility functions with no dependencies on any layer.

### 1.2 Application Layer (`src/application/`)

| File                                               | Imports From                                                         | Verdict |
| -------------------------------------------------- | -------------------------------------------------------------------- | ------- |
| `use-cases/register-member-card.use-case.ts`       | `@domain/*`, `@application/dto/*`, `@shared/utils/*`                 | ✅      |
| `use-cases/top-up-member-card.use-case.ts`         | `@domain/*`, `@application/dto/*`, `@shared/utils/*`                 | ✅      |
| `use-cases/check-nfc-availability-use-case.ts`     | `@application/dto/*`, `@domain/repositories/*`                       | ✅      |
| `use-cases/check-out-activity.use-case.ts`         | `@domain/*`, `@application/dto/*`, `@shared/utils/*`                 | ✅      |
| `use-cases/get-station-ledger-summary.use-case.ts` | `@domain/repositories/*`, `@application/dto/*`                       | ✅      |
| `use-cases/check-in-activity.use-case.ts`          | `@domain/*`, `@application/dto/*`, `@shared/utils/*`                 | ✅      |
| `use-cases/inspect-member-card.use-case.ts`        | `@domain/*`, `@application/dto/*`                                    | ✅      |
| `dto/check-nfc-availability-result-dto.ts`         | `@domain/repositories/nfc-availability-repository` (type re-export)  | ✅      |
| `dto/card-summary-dto.ts`                          | `@domain/entities/mbc-card` (types only)                             | ✅      |
| `dto/card-summary-mapper.ts`                       | `@domain/entities/mbc-card`, `@shared/utils/*`, `./card-summary-dto` | ✅      |
| `dto/role-action-result-dto.ts`                    | `@domain/entities/mbc-card` (type only), `./card-summary-dto`        | ✅      |
| `dto/station-ledger-summary-dto.ts`                | `@domain/entities/station-ledger-summary` (type alias)               | ✅      |

**Result:** Application layer has **zero** imports from Infrastructure or Presentation. ✅

### 1.3 Infrastructure Layer (`src/infrastructure/`)

| File                                       | Imports From                                                                                                                | Verdict |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| `nfc/real-mbc-card.repository.ts`          | `react-native-nfc-manager`, `buffer`, `@domain/entities/*`, `@domain/repositories/*`, `@domain/errors/*`, `./silent-shield` | ✅      |
| `nfc/silent-shield.ts`                     | `react-native-quick-crypto`, `@domain/entities/mbc-card`, `./mbc-card-codec`                                                | ✅      |
| `nfc/device-nfc-status.repository.ts`      | `react-native-nfc-manager`, `@domain/repositories/*`                                                                        | ✅      |
| `nfc/mbc-card-codec.ts`                    | `@domain/entities/mbc-card`                                                                                                 | ✅      |
| `local-ledger/sqlite-ledger.repository.ts` | `@op-engineering/op-sqlite`, `@domain/repositories/*`, `@domain/entities/*`                                                 | ✅      |
| `local-ledger/sqlite-ledger-mapper.ts`     | `@domain/entities/mbc-card`                                                                                                 | ✅      |

**Result:** Infrastructure implements domain contracts only. No imports from Application or Presentation. ✅

### 1.4 App Layer (`src/app/`)

| File                   | Imports From                                                              | Verdict |
| ---------------------- | ------------------------------------------------------------------------- | ------- |
| `services-contract.ts` | `@application/use-cases/*` (types only)                                   | ✅      |
| `container.ts`         | `@application/use-cases/*`, `@infrastructure/*`, `@app/services-contract` | ✅      |
| `providers.tsx`        | `@presentation/context/*`, `./container`                                  | ✅      |
| `navigation.tsx`       | `@presentation/screens/*`                                                 | ✅      |
| `App.tsx`              | `./navigation`, `./providers`, `@presentation/components/ErrorBoundary`   | ✅      |

**Result:** App layer is the composition root — it correctly wires infrastructure to application contracts. ✅

### 1.5 Presentation Layer (`src/presentation/`)

| File                                                     | Imports From                                                                   | Verdict |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| `context/service-context.tsx`                            | `@app/services-contract` (types only)                                          | ✅      |
| `screens/*/useXxxActions.ts`                             | `@application/dto/*`, `@presentation/*`, `@shared/*`                           | ✅      |
| `screens/*/index.tsx`                                    | `@presentation/*`, `@app/navigation` (types), `@shared/constants`              | ✅      |
| `screens/Terminal/fragments/InsufficientBalanceCard.tsx` | `@app/navigation` (type), `@application/dto/*`, `@presentation/*`, `@shared/*` | ✅      |
| All other components                                     | `@presentation/*`, `@shared/*`                                                 | ✅      |

**Result:** Presentation depends on Application layer (via DTOs and service contracts) and never directly on Infrastructure or Domain internals. ✅

---

## 2. SOLID Principles Audit

### 2.1 SRP — Single Responsibility Principle

#### Finding SRP-001 (Minor)

| Field               | Value                                                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**            | `src/presentation/screens/Station/useStationActions.ts`                                                                                                                                                                                                                                       |
| **Lines**           | 1–185 (entire file)                                                                                                                                                                                                                                                                           |
| **Principle**       | SRP                                                                                                                                                                                                                                                                                           |
| **Severity**        | Minor                                                                                                                                                                                                                                                                                         |
| **Description**     | This hook manages 3 distinct flows (register, wipe-and-register, top-up) plus NFC availability check and ledger summary refresh. It has 7 state variables and 5 action handlers. While it delegates business logic to use cases correctly, the hook itself orchestrates too many UI concerns. |
| **Impact**          | Harder to test individual flows in isolation; larger cognitive load when modifying one flow.                                                                                                                                                                                                  |
| **Recommended Fix** | Consider extracting `useRegisterFlow` and `useTopUpFlow` as sub-hooks, composed by `useStationActions`. This is a refactoring opportunity, not a blocking issue — the current structure works and is testable via the existing test suite.                                                    |

#### Finding SRP-002 (Minor)

| Field               | Value                                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**            | `src/presentation/screens/Station/index.tsx`                                                                                                                                                                                           |
| **Lines**           | 1–165 (entire file)                                                                                                                                                                                                                    |
| **Principle**       | SRP                                                                                                                                                                                                                                    |
| **Severity**        | Minor                                                                                                                                                                                                                                  |
| **Description**     | The Station screen component contains inline UI logic for the segmented control, top-up amount input, and quick-amount buttons. While it delegates state to `useStationActions`, the render tree is dense.                             |
| **Impact**          | Moderate cognitive load; harder to reuse the segmented control or amount input independently.                                                                                                                                          |
| **Recommended Fix** | Extract `<StationModeSelector>` and `<TopUpAmountInput>` as fragment components (similar to how `LatestResultCard` and `LocalStationLedgerCard` are already extracted). Low priority — the current structure is functional and tested. |

### 2.2 OCP — Open/Closed Principle ✅

The codebase uses several OCP-compliant patterns:

- **Strategy pattern** for tariff calculation (`TariffStrategy` type + `PARKING_TARIFF_STRATEGY` config). New activity types can provide their own strategy without modifying the calculator.
- **Factory functions** for use cases accept repository interfaces, making them open for extension via new implementations.
- **Discriminated union types** (`NfcActionState`, `DomainErrorCode`, `CardRepositoryErrorCode`) allow adding new variants without modifying existing handlers.
- **`GUIDANCE_BY_STATUS` lookup table** in `check-nfc-availability-use-case.ts` — new statuses can be added by extending the record.

No violations found.

### 2.3 LSP — Liskov Substitution Principle ✅

The project uses TypeScript interfaces (`MbcCardRepository`, `LocalLedgerRepository`, `NfcAvailabilityRepository`) as contracts. Infrastructure implementations:

- `createRealMbcCardRepository()` → implements `MbcCardRepository`
- `createDeviceNfcStatusRepository()` → implements `NfcAvailabilityRepository`
- `createSqliteLedgerRepository()` → implements `LocalLedgerRepository`

All implementations satisfy their interface contracts without weakening preconditions or strengthening postconditions. The functional factory pattern avoids class inheritance issues entirely.

No violations found.

### 2.4 ISP — Interface Segregation Principle ✅

Repository interfaces are well-segregated:

- `CardReader` — read-only operations (`readCard`, `cancel`)
- `CardWriter` — write operations (`writeCard`, `readWriteCard`, `registerCard`, `cancel`)
- `NfcCapabilityChecker` — capability query (`isSupported`)
- `MbcCardRepository` — composed interface (`extends CardReader, CardWriter, NfcCapabilityChecker`)

This allows consumers to depend on only the slice they need (e.g., Scout only needs `CardReader`). The composed `MbcCardRepository` is used at the DI boundary for convenience.

`LocalLedgerRepository` has only 2 methods (`append`, `getStationSummary`) — appropriately lean.

`NfcAvailabilityRepository` has only 2 methods (`isSupported`, `getAvailabilityStatus`) — appropriately lean.

No violations found.

### 2.5 DIP — Dependency Inversion Principle ✅

All use cases depend on **abstractions** (interfaces defined in `@domain/repositories/`), not concretions:

- `createRegisterMemberCardUseCase(cardRepository: MbcCardRepository, ...)`
- `createTopUpMemberCardUseCase(cardRepository: MbcCardRepository, ...)`
- `createCheckInActivityUseCase(cardRepository: MbcCardRepository)`
- `createCheckOutActivityUseCase(cardRepository: MbcCardRepository, ...)`
- `createInspectMemberCardUseCase(cardRepository: MbcCardRepository)`
- `createCheckNfcAvailabilityUseCase(nfcAvailabilityRepository: NfcAvailabilityRepository)`
- `createGetStationLedgerSummaryUseCase(localLedgerRepository: LocalLedgerRepository)`

Concrete implementations are only instantiated in the composition root (`src/app/container.ts`). The presentation layer accesses use cases through the `ServiceContext` abstraction.

No violations found.

---

## 3. Additional Quality Observations

### 3.1 Strengths

1. **Pure functional domain** — Domain services are pure functions with no side effects, making them trivially testable.
2. **Error modeling** — Typed error hierarchies (`DomainError`, `CardRepositoryError`) with discriminated codes enable precise error handling without `instanceof` chains.
3. **Immutable state transitions** — `applyCheckInState`, `applyCheckOutState`, `appendTransactionLog` all return new objects rather than mutating.
4. **Composition root isolation** — Only `container.ts` knows about concrete infrastructure. Swapping implementations (e.g., mock NFC for testing) requires changing only this file.
5. **DTO boundary** — Application layer maps domain entities to DTOs before passing to presentation, preventing domain leakage.
6. **Silent Shield envelope** — Security concern is properly isolated in infrastructure, not leaking into domain or application logic.

### 3.2 Minor Observations (Not Violations)

| #   | Observation                                                         | Location                                                                                          | Note                                                                                                               |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | `container.ts` uses module-level singleton cache (`cachedServices`) | `src/app/container.ts:15`                                                                         | Acceptable for RN app lifecycle; could use React context for testability (already done via `ServiceProvider`).     |
| 2   | `parseIsoDate` is duplicated across 3 domain service files          | `activity-tariff-calculator.ts:22`, `activity-state-policy.ts:17`, `transaction-log-policy.ts:14` | Could be extracted to a shared domain utility. Very low priority — each is 5 lines and keeps files self-contained. |
| 3   | Presentation fragments import `@application/dto/*` types directly   | Multiple fragments                                                                                | Acceptable — DTOs are the designed boundary between application and presentation layers.                           |

---

## 4. Conclusion

The codebase passes the SOLID and Clean Architecture audit with **no critical or major violations**. The two minor SRP findings are refactoring opportunities that do not affect correctness, testability, or maintainability in a meaningful way.

**Recommendation:** No immediate action required. The minor findings can be addressed opportunistically during future feature work on the Station screen.

---

## Appendix: Audit Checklist Summary

| Check                                                            | Result     |
| ---------------------------------------------------------------- | ---------- |
| Domain → no outer layer imports                                  | ✅ PASS    |
| Application → no Infrastructure/Presentation imports             | ✅ PASS    |
| Infrastructure → implements domain contracts only                | ✅ PASS    |
| Presentation → depends on Application DTOs, not domain internals | ✅ PASS    |
| Use cases depend on abstractions                                 | ✅ PASS    |
| Interfaces are segregated and focused                            | ✅ PASS    |
| No LSP violations in implementations                             | ✅ PASS    |
| Each module has clear single responsibility                      | ⚠️ 2 Minor |
| Modules are open for extension                                   | ✅ PASS    |
