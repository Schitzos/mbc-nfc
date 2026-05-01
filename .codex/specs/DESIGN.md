# KDX Membership Benefit Card Design

## 1. Architecture

The app uses Clean Architecture with SOLID design principles. The NFC card is treated as the persistence boundary for core member data and the active cooperative activity state. A device-local SQLite ledger is treated as a secondary persistence boundary for offline reporting and audit only.

Dependency rule:

```txt
Presentation -> Application -> Domain
Infrastructure -> Application/Domain contracts
Domain -> no outward dependencies
```

Layer responsibilities:

| Layer          | Responsibility                                                                          | Must Not Contain                           |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| Domain         | MBC entities, activity tariff rules, card state policy, transaction log policy          | React components, NFC library calls        |
| Application    | Role use cases such as register, top-up, activity check-in, activity check-out, inspect | UI rendering, native module details        |
| Infrastructure | NFC reader/writer, card payload codec, shield/encryption, logging                       | Business decisions                         |
| Presentation   | Role switcher, screens, forms, status displays                                          | Direct NFC library calls or payload crypto |

## 2. Technology Stack

| Area              | Choice                                                 |
| ----------------- | ------------------------------------------------------ |
| Mobile framework  | React Native CLI                                       |
| Language          | TypeScript                                             |
| NFC library       | `react-native-nfc-manager`                             |
| Local database    | SQLite                                                 |
| UI system         | Signal UI, guided by `.codex/specs/SIGNAL_UI_GUIDE.md` |
| Navigation        | React Navigation                                       |
| State management  | Zustand or React Context                               |
| Testing           | Jest, React Native Testing Library                     |
| Static analysis   | SonarCloud                                             |
| Security baseline | OWASP MASVS-inspired mobile controls                   |

## 3. Suggested Folder Structure

```txt
src/
  app/
    App.tsx
    navigation.tsx
    providers.tsx
    container.ts
  domain/
    entities/
      mbc-card.ts
      member-profile.ts
      transaction-log.ts
      activity-session.ts
    repositories/
      mbc-card.repository.ts
      local-ledger.repository.ts
    services/
      activity-tariff-calculator.ts
      activity-state-policy.ts
      transaction-log-policy.ts
    errors/
      mbc-errors.ts
  application/
    use-cases/
      check-nfc-availability.use-case.ts
      register-member-card.use-case.ts
      top-up-member-card.use-case.ts
      check-in-activity.use-case.ts
      check-out-activity.use-case.ts
      inspect-member-card.use-case.ts
      get-station-ledger-summary.use-case.ts
    dto/
      card-summary.dto.ts
      role-action-result.dto.ts
  infrastructure/
    nfc/
      react-native-mbc-card-reader.ts
      react-native-mbc-card-writer.ts
    card-codec/
      mbc-card-codec.ts
      mbc-card-shield.ts
      mbc-card-validator.ts
    security/
      audit-logger.ts
      data-redactor.ts
    local-ledger/
      sqlite-ledger.repository.ts
      sqlite-ledger-mapper.ts
  presentation/
    stores/
      role.store.ts
      mbc-flow.store.ts
    hooks/
      useMbcCardScan.ts
    screens/
      RoleSwitcherScreen.tsx
      StationScreen.tsx
      GateScreen.tsx
      TerminalScreen.tsx
      ScoutScreen.tsx
    components/
      BalancePanel.tsx
      LedgerSummaryPanel.tsx
      TransactionLogList.tsx
      NfcActionButton.tsx
      SimulationTimePicker.tsx
  shared/
    utils/
    types/
```

## 4. Package Principles

The design follows package cohesion principles:

| Principle                 | Project Application                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Reuse/Release Equivalency | Reusable card codec, activity tariff, and state policy are isolated from UI so they can be versioned together. |
| Common Closure            | Code that changes for the same reason stays together, such as activity tariff logic or card payload encoding.  |
| Common Reuse              | Station, Gate, Terminal, and Scout use only the modules they need through focused use cases and contracts.     |

## 5. Domain Model

```ts
export type VisitStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN';

export type MbcActivity = 'REGISTER' | 'TOP_UP' | 'CHECK_IN' | 'CHECK_OUT';

export type BenefitActivityType = 'PARKING' | 'GENERIC';

export type ActivitySession = {
  activityId: string;
  activityType: BenefitActivityType;
  checkedInAt: string;
};

export type MemberProfile = {
  /**
   * Internal system-generated identifier.
   * This is written to the protected card payload, but normal presentation DTOs
   * should not expose the full value on member/operator screens.
   */
  memberId: string;
  displayName?: string;
};

export type TransactionLog = {
  id: string;
  activity: MbcActivity;
  nominal: number;
  occurredAt: string;
};

export type LedgerEntry = {
  id: string;
  role: 'STATION' | 'GATE' | 'TERMINAL' | 'SCOUT';
  action: 'REGISTER' | 'TOP_UP' | 'CHECK_IN' | 'CHECK_OUT';
  maskedMemberReference?: string;
  activityType?: BenefitActivityType;
  amount?: number;
  occurredAt: string;
  deviceId?: string;
};

export type MbcCard = {
  version: number;
  cardId: string;
  member: MemberProfile;
  balance: number;
  currency: 'IDR';
  visitStatus: VisitStatus;
  activeSession?: ActivitySession;
  transactionLogs: TransactionLog[];
};
```

## 6. Application DTOs

```ts
export type CardSummaryDto = {
  cardId: string;
  memberName?: string;
  maskedMemberReference?: string;
  balance: number;
  currency: 'IDR';
  visitStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN';
  activeSession?: ActivitySession;
  transactionLogs: TransactionLog[];
};

export type RoleActionResultDto = {
  success: boolean;
  role: 'STATION' | 'GATE' | 'TERMINAL' | 'SCOUT';
  message: string;
  card?: CardSummaryDto;
  chargedHours?: number;
  chargedAmount?: number;
};

export type StationLedgerSummaryDto = {
  topUpTotal: number;
  checkoutTotal: number;
  registerCount: number;
  topUpCount: number;
  checkoutCount: number;
  latestEntries: LedgerEntry[];
};
```

## 7. Repository Interface

```ts
export interface MbcCardRepository {
  isSupported(): Promise<boolean>;
  readCard(): Promise<MbcCard>;
  writeCard(card: MbcCard): Promise<void>;
  cancel(): Promise<void>;
}

export interface LocalLedgerRepository {
  append(entry: LedgerEntry): Promise<void>;
  getStationSummary(): Promise<StationLedgerSummaryDto>;
}
```

## 8. Business Rules

### Member Identity

- The app generates the internal `memberId` during Station registration.
- The first implementation round does not require any human-readable member profile field.
- Staff must not manually type the internal `memberId`.
- Normal Station, Gate, Terminal, and Scout screens should not show the full internal `memberId`.
- A masked or short member reference may be shown only when useful for support, recovery, or transaction traceability.

### Activity Tariff

- Parking demo activity fee is Rp 2.000 per started hour.
- Other cooperative activities can provide their own tariff rule.
- Duration is rounded up.
- Zero or negative duration is invalid for checkout.

### Visit State

- A card with `NOT_CHECKED_IN` can be checked in.
- A card with `CHECKED_IN` cannot be checked in again.
- A card with `CHECKED_IN` can be checked out if balance is sufficient.
- A card with `NOT_CHECKED_IN` cannot be checked out.
- A card can only have one active activity session at a time.

### Transaction Logs

- Only the latest five logs are kept on card.
- Each log records nominal, time, and activity.

### Local Ledger

- SQLite ledger is device-local and offline.
- The ledger stores audit/reporting data for the current device only.
- The ledger does not replace card balance, status, or activity truth.
- Register, top-up, and checkout actions append ledger entries after successful business completion.
- A masked or shortened member reference is preferred over full sensitive identity.

## 9. Silent Shield Design

Sensitive fields must not be stored as plain readable text. For the prototype, use a card codec abstraction that can be implemented with encoded JSON plus authenticated encryption or equivalent protection.

Minimum payload protections:

- Payload version.
- Integrity check.
- Encrypted or equivalently protected identity and balance.
- Safe decode failures.
- Redacted logs.

For the first implementation round, Android is the primary real-card target. iOS behavior must be validated later on a real device and documented without assuming full parity.

Production would need stronger key management than a frontend-only demo can provide.

## 10. Presentation Design

The app starts with role selection and then shows the active role surface.

Before any real card operation, the presentation layer checks NFC availability through the application use case. If NFC is unsupported or disabled, the role screen must show a clear message that real MBC card scan/read/write requires an NFC-capable device with NFC enabled. Mock or simulation mode may remain available for development/demo, but it must be visually distinct from real NFC operation.

- Station: registration form, top-up form, NFC write action, latest result.
- Station also shows a simple local ledger summary for that device, such as top-up total and checkout total.
- Gate: activity selector, check-in action, simulation time control, NFC write action, status result.
- Terminal: checkout action, fee result, insufficient balance guidance.
- Scout: one-tap read-only card summary, balance, visit status, last five logs.

The UI should apply the Signal UI design system direction, stay simple and direct, and be usable by cooperative staff. Avoid unnecessary dashboard complexity.

Signal UI adoption is documented in `.codex/specs/SIGNAL_UI_GUIDE.md`. Role screens must preserve the MBC business flows while using Signal UI colors, typography, icon style, components, and interaction patterns once the Figma tokens are fully extracted.

## 11. Quality Strategy

- Domain and application logic should be written for high automated testability.
- The implemented scope should target at least 90% automated coverage across unit and application layers.
- SonarCloud should analyze the repository with coverage input, lint/test results where applicable, and a passing quality gate before submission.
- Dependency changes should be followed by `npm audit`, and the working dependency set should remain at 0 known vulnerabilities.
- Coverage and static-analysis targets should not encourage shallow tests; critical balance, status, tariff, codec, and ledger paths must be meaningfully asserted.

## 12. Assessment Deliverables

The implementation should be shaped so the final submission can include:

- GitHub or GitLab repository link.
- Working frontend app with no crash in main flows.
- Image capture or short video demo.
- Technical and non-technical documentation.
- Presentation covering UI/UX design, software design, software construction, software quality, software deployment, and software security.
