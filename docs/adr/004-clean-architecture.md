# ADR-004: Clean Architecture with Dependency Inversion

## Status
Accepted

## Context
The app combines NFC hardware, crypto, SQLite, and React Native UI. Without clear boundaries, business logic would become coupled to platform specifics, making testing and maintenance difficult.

## Decision
Apply Clean Architecture with strict layer boundaries and dependency inversion via a composition root.

## Rationale
- **Testability**: Domain and application logic tested without NFC hardware or React Native
- **Swappability**: Mock repository for tests, real NFC repository for production — same interface
- **Maintainability**: Changes to NFC library don't affect business rules
- **SOLID compliance**: Each layer has a single direction of dependency

## Architecture
```
Presentation → Application → Domain ← Infrastructure
```

- Domain: zero outward dependencies (pure TypeScript)
- Application: orchestrates domain via use cases
- Infrastructure: implements domain interfaces with real tech
- Presentation: renders UI, calls use cases only

## Consequences
- Composition root (`container.ts`) is the only file that knows concrete implementations
- Slightly more files/interfaces than a flat architecture
- Worth it for 100% testability and clear separation of concerns
