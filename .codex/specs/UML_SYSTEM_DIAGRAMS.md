# KDX Membership Benefit Card UML and System Diagrams

This document contains the baseline UML/system diagrams for the current MBC scope.

Scope reflected here:

- one app with four roles: Station, Gate, Terminal, Scout
- NFC card as member-state source of truth
- local SQLite ledger as current-device/current-installation reporting and audit store
- Android-first real NFC validation
- parking as the only MVP activity, with reusable activity flow design for future extension

## 1. Component Diagram

```mermaid
flowchart LR
  UI["Presentation Layer\nRole Switcher\nStation\nGate\nTerminal\nScout"] --> APP["Application Layer\nUse Cases\nDTOs"]
  APP --> DOMAIN["Domain Layer\nEntities\nPolicies\nTariff Rules"]
  INFRA["Infrastructure Layer\nNFC Repository\nCard Codec\nSilent Shield\nSQLite Ledger"] --> APP
  INFRA --> DOMAIN

  NFC["NFC Card\nMember State\nBalance\nVisit Status\nLast 5 Logs"]:::ext
  DB["SQLite Ledger\nDevice-Local Audit and Reporting"]:::ext

  UI --> INFRA
  INFRA --> NFC
  INFRA --> DB

  classDef ext fill:#f7f7f7,stroke:#666,stroke-width:1px;
```

## 2. Use-Case Diagram

```mermaid
flowchart LR
  Admin["Cooperative Admin"] --> UC1["Register Member Card"]
  Admin --> UC2["Top Up Balance"]
  Admin --> UC3["View Station Ledger Summary"]

  GateOp["Gate Operator"] --> UC4["Check In Parking"]
  GateOp --> UC5["Run Simulation Mode"]

  TerminalOp["Terminal Operator"] --> UC6["Check Out Parking"]
  TerminalOp --> UC7["Handle Insufficient Balance"]

  Member["Member / Scout User"] --> UC8["Inspect Card"]

  UC1 --> SYS["MBC App"]
  UC2 --> SYS
  UC3 --> SYS
  UC4 --> SYS
  UC5 --> SYS
  UC6 --> SYS
  UC7 --> SYS
  UC8 --> SYS
```

## 3. Sequence Diagram: Station Registration

```mermaid
sequenceDiagram
  actor Admin as Station Admin
  participant UI as Station Screen
  participant Register as Register Member Use Case
  participant CardRepo as MbcCardRepository
  participant Ledger as LocalLedgerRepository
  participant Card as NFC Card

  Admin->>UI: Tap register card
  UI->>Register: execute()
  Register->>Register: generate internal memberId
  Register->>CardRepo: writeCard(newCard)
  CardRepo->>Card: write protected MBC payload
  Card-->>CardRepo: success
  Register->>Ledger: append(register entry)
  Ledger-->>Register: success
  Register-->>UI: success result
  UI-->>Admin: show registered card summary
```

## 4. Sequence Diagram: Station Top-Up

```mermaid
sequenceDiagram
  actor Admin as Station Admin
  participant UI as Station Screen
  participant TopUp as Top Up Use Case
  participant CardRepo as MbcCardRepository
  participant Ledger as LocalLedgerRepository
  participant Card as NFC Card

  Admin->>UI: Enter amount and tap card
  UI->>TopUp: execute(amount)
  TopUp->>CardRepo: readCard()
  CardRepo->>Card: read protected payload
  Card-->>CardRepo: card data
  CardRepo-->>TopUp: decoded card
  TopUp->>TopUp: validate positive amount
  TopUp->>TopUp: increase balance and append log
  TopUp->>CardRepo: writeCard(updatedCard)
  CardRepo->>Card: write updated payload
  Card-->>CardRepo: success
  TopUp->>Ledger: append(top up entry)
  Ledger-->>TopUp: success
  TopUp-->>UI: success result
  UI-->>Admin: show updated balance
```

## 5. Sequence Diagram: Gate Check-In

```mermaid
sequenceDiagram
  actor Operator as Gate Operator
  participant UI as Gate Screen
  participant CheckIn as Check In Use Case
  participant CardRepo as MbcCardRepository
  participant Ledger as LocalLedgerRepository
  participant Card as NFC Card

  Operator->>UI: Tap card to check in
  UI->>CheckIn: execute(activityType, time)
  CheckIn->>CardRepo: readCard()
  CardRepo->>Card: read protected payload
  Card-->>CardRepo: card data
  CardRepo-->>CheckIn: decoded card
  CheckIn->>CheckIn: validate NOT_CHECKED_IN
  CheckIn->>CheckIn: set active session and append log
  CheckIn->>CardRepo: writeCard(updatedCard)
  CardRepo->>Card: write updated payload
  Card-->>CardRepo: success
  CheckIn->>Ledger: append(checkin audit entry amount 0)
  Ledger-->>CheckIn: success
  CheckIn-->>UI: success result
  UI-->>Operator: show checked-in status
```

## 6. Sequence Diagram: Terminal Check-Out

```mermaid
sequenceDiagram
  actor Operator as Terminal Operator
  participant UI as Terminal Screen
  participant Checkout as Check Out Use Case
  participant CardRepo as MbcCardRepository
  participant Ledger as LocalLedgerRepository
  participant Card as NFC Card

  Operator->>UI: Tap card to check out
  UI->>Checkout: execute(exitTime)
  Checkout->>CardRepo: readCard()
  CardRepo->>Card: read protected payload
  Card-->>CardRepo: card data
  CardRepo-->>Checkout: decoded card
  Checkout->>Checkout: validate CHECKED_IN
  Checkout->>Checkout: calculate duration and tariff
  alt Balance sufficient
    Checkout->>Checkout: deduct balance, clear session, append log
    Checkout->>CardRepo: writeCard(updatedCard)
    CardRepo->>Card: write updated payload
    Card-->>CardRepo: success
    Checkout->>Ledger: append(checkout entry)
    Ledger-->>Checkout: success
    Checkout-->>UI: success result with fee summary
    UI-->>Operator: show remaining balance
  else Insufficient balance
    Checkout-->>UI: failure result with top-up guidance
    UI-->>Operator: show instruction to top up at Station
  end
```

## 7. Sequence Diagram: Scout Inspection

```mermaid
sequenceDiagram
  actor Member as Member
  participant UI as Scout Screen
  participant Inspect as Inspect Card Use Case
  participant CardRepo as MbcCardRepository
  participant Card as NFC Card

  Member->>UI: Tap card to inspect
  UI->>Inspect: execute()
  Inspect->>CardRepo: readCard()
  CardRepo->>Card: read protected payload
  Card-->>CardRepo: card data
  CardRepo-->>Inspect: decoded card
  Inspect-->>UI: read-only summary
  UI-->>Member: show balance, status, and logs
```

## 8. Sequence Diagram: Local Ledger Write Flow

```mermaid
sequenceDiagram
  participant UseCase as Role Use Case
  participant Ledger as LocalLedgerRepository
  participant Mapper as Ledger Mapper
  participant SQLite as SQLite Database

  UseCase->>UseCase: business action succeeds
  UseCase->>Ledger: append(entry)
  Ledger->>Mapper: map entry to persistence shape
  Mapper-->>Ledger: mapped row
  Ledger->>SQLite: insert row
  SQLite-->>Ledger: success
  Ledger-->>UseCase: success
```

## 9. Activity Diagram: Main Parking Tap-In / Tap-Out Flow

```mermaid
flowchart TD
  A["Start"] --> B["Detect active role"]
  B --> C{"Role?"}

  C -->|Station Register| D["Tap NFC card"]
  D --> E["Generate internal memberId"]
  E --> F["Write protected card payload"]
  F --> G["Append register ledger entry"]
  G --> Z["End"]

  C -->|Station Top Up| H["Tap NFC card"]
  H --> I["Read protected card payload"]
  I --> J["Validate amount and increase balance"]
  J --> K["Write updated card payload"]
  K --> L["Append top-up ledger entry"]
  L --> Z

  C -->|Gate Check In| M["Tap NFC card"]
  M --> N["Read protected card payload"]
  N --> O{"Already checked in?"}
  O -->|Yes| P["Reject as double check-in"]
  P --> Z
  O -->|No| Q["Write active session and check-in log"]
  Q --> Z

  C -->|Terminal Check Out| R["Tap NFC card"]
  R --> S["Read protected card payload"]
  S --> T["Calculate duration and tariff"]
  T --> U{"Balance sufficient?"}
  U -->|No| V["Keep active session\nShow top-up guidance"]
  V --> Z
  U -->|Yes| W["Deduct balance and clear session"]
  W --> X["Write checkout log"]
  X --> Y["Append checkout ledger entry"]
  Y --> Z

  C -->|Scout Inspect| AA["Tap NFC card"]
  AA --> AB["Read protected card payload"]
  AB --> AC["Show read-only summary"]
  AC --> Z
```

## 10. Notes

- These diagrams intentionally reflect the current MVP and assessment scope.
- Guest flow is excluded.
- Full internal member ID is not shown in normal operator/member screens.
- The local SQLite ledger is device-local reporting support, not member-state truth.
- Real-card behavior remains subject to the final physical NFC tag constraints.
