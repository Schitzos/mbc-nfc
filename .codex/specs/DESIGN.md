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
      tariff-settings.repository.ts
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
      RoleSwitcher/
        index.tsx
        fragments/
          AppHeaderCard.tsx
          RoleOptionList.tsx
      Station/
        index.tsx
        fragments/
          StationHeader.tsx
      Gate/
        index.tsx
        fragments/
          GateHeader.tsx
          GateResultState.tsx
      Terminal/
        index.tsx
        fragments/
          TerminalHeader.tsx
      Scout/
        index.tsx
        fragments/
          ScoutHeader.tsx
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

| Principle                 | Project Application                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Reuse/Release Equivalency | Reusable card codec, parking tariff, and state policy are isolated from UI so they can be versioned together. |
| Common Closure            | Code that changes for the same reason stays together, such as tariff logic or card payload encoding.          |
| Common Reuse              | Station, Gate, Terminal, and Scout use only the modules they need through focused use cases and contracts.    |

## 5. Domain Model

MVP domain scope: `PARKING` is the only required benefit activity for this assessment. The design should remain extendable through isolated tariff rules and activity definitions, but Codex must not implement a second non-parking flow unless a future requirement explicitly adds it.

```ts
export type VisitStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN';

export type MbcActivity = 'REGISTER' | 'TOP_UP' | 'CHECK_IN' | 'CHECK_OUT';

export type BenefitActivityType = 'PARKING';

// Future extension note:
// Non-parking activities are not required for MVP. Add them later by extending
// an ActivityDefinition/TariffRule registry, not by scattering new activity
// constants across UI, NFC codec, SQLite ledger, and use cases.

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

export interface TariffSettingsRepository {
  getActiveParkingTariff(): Promise<ParkingTariffSetting>;
  updateActiveParkingTariff(
    input: UpdateParkingTariffInput,
  ): Promise<ParkingTariffSetting>;
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

- Parking MVP default fee is Rp 2.000 per started hour.
- Gate check-in must resolve the current active tariff from a local tariff repository so already-built APKs can support operational tariff changes without rebuild.
- Gate check-in must write a compact tariff snapshot into the card active visit state.
- Terminal checkout must calculate the fee using the tariff snapshot stored on the card, not the current local active tariff.
- The tariff calculator must not contain a hidden `2000` magic number inside checkout logic.
- Terminal checkout must display the visit tariff snapshot before deduction.
- Other cooperative activities can provide their own tariff rule later, but non-parking runtime flow is not part of MVP.
- Duration is rounded up.
- Zero or negative duration is invalid for checkout.

### Local Tariff Setting

- Store the active parking tariff locally using SQLite or secure local storage.
- Seed default active tariff as Rp 2.000 per started hour.
- Authorized Station/Admin staff may update the local active tariff, for example to Rp 3.000 per started hour, without rebuilding the APK.
- Local tariff setting must include rate, currency, rounding mode, version, updatedAt, and updatedBy role/reference.
- Offline tariff updates are per-device only; changing one device does not update other devices.
- All active offline devices must be manually configured with the same tariff before operation.
- Future enhancement may support a signed Tariff Config NFC card for offline distribution.
- Local active tariff changes apply only to new check-ins; existing checked-in cards keep their card-stored tariff snapshot until checkout.

### Tariff Snapshot at Check-In

- Active visit state must include a compact tariff snapshot captured at Gate check-in.
- Suggested fields: `tariffRatePerStartedHour`, `tariffVersion`, and `roundingMode` when not globally fixed.
- Terminal checkout must not recalculate using whatever tariff is currently configured on the device if a valid snapshot exists on the card.
- This protects members already checked in from later local tariff changes.
- If the card lacks a snapshot due to legacy/demo data, Terminal may fallback to current local tariff only with a visible warning.

### Registration Safety

- Station registration must reject a valid already registered MBC card with `ALREADY_REGISTERED_CARD`.
- MVP does not include overwrite/reset. Adding reset requires a new explicit requirement and audit trail.

### Visit State

- A card with `NOT_CHECKED_IN` can be checked in.
- A card with `CHECKED_IN` cannot be checked in again.
- A card with `CHECKED_IN` can be checked out if balance is sufficient.
- A card with `NOT_CHECKED_IN` cannot be checked out.
- A card can only have one active activity session at a time.
- Gate simulation must only write a past timestamp; future timestamps are rejected.
- Gate and Terminal must display current device time before committing card writes because offline fee calculation depends on local clock correctness.

### Transaction Logs

- Only the latest five logs are kept on card.
- Each log records nominal, time, and activity.

### Local Ledger

- SQLite ledger records every successful card-state operation: `REGISTER`, `TOPUP`, `CHECKIN`, and `CHECKOUT`.
- Station summaries are current-device/current-installation only and must say so in UI.
- Income summaries count money-related rows; `CHECKIN` has amount `0` and is audit/activity count only.
- SQLite ledger is device-local and offline.
- The ledger stores audit/reporting data for the current device only.
- The ledger does not replace card balance, status, or activity truth.
- Register, top-up, and checkout actions append ledger entries after successful business completion.
- A masked or shortened member reference is preferred over full sensitive identity.

### NFC Capacity and Write Verification

- Selected NFC tag/card writable capacity must be documented before real-card support is claimed.
- The encoded protected payload length must be checked before write.
- If payload exceeds capacity, return `CARD_CAPACITY_INSUFFICIENT` and do not show success.
- After every real NFC write, the repository must read the card back, decode it, verify Silent Shield signature, and confirm expected counter/state.
- If readback verification fails, return `WRITE_VERIFY_FAILED`.
- If the card is removed too early and the readback cannot confirm expected counter/state, do not show success.

## 9. Silent Shield Design

Silent Shield must be implemented in production-grade assessment mode, because assessors may inspect the NFC card with generic NFC tools.

Design rules:

- Logical card payload remains a compact domain object for tests and business logic.
- NFC storage must be a protected `mbc1` envelope, not direct JSON.
- Sign canonical logical payload with HMAC-SHA256.
- Encrypt the signed payload using AES-256-GCM or equivalent authenticated encryption.
- Use separate encryption and signing keys derived from secure configuration.
- Do not commit real keys or secrets.
- Keep crypto, codec, and key-loading logic inside infrastructure.
- Generic NFC readers must not reveal member identity, balance, parking status details, or transaction values.
- Any decrypt/authentication/signature failure maps to `CARD_TAMPERED`.
- After every real NFC write, read back and verify decrypted payload, HMAC, counter, and expected state.

For the first implementation round, Android is the primary real-card target. iOS behavior must be validated later on a real device and documented without assuming full parity.

Remaining real-world production hardening such as fleet key rotation, backend reconciliation, operator authentication, and physical card authenticity controls remains outside MVP but must be documented as future production work.

## 10. Presentation Design

The app starts with role selection and then shows the active role surface.

Before any real card operation, the presentation layer checks NFC availability through the application use case. If NFC is unsupported or disabled, the role screen must show a clear message that real MBC card scan/read/write requires an NFC-capable device with NFC enabled. Mock or simulation mode may remain available for development/demo, but it must be visually distinct from real NFC operation.

- Station: registration form, top-up form, admin tariff setting, NFC write action, latest result.
- Station also shows a simple local ledger summary for that device, such as top-up total and checkout total.
- Station/Admin settings allow authorized local tariff update and show the active tariff version/update time.
- Gate: default parking indicator, check-in action, simulation time control limited to past timestamps, current device time display, NFC write action, status result.
- Terminal: checkout action, active tariff display, duration/fee summary, insufficient balance guidance, current device time display, NFC write action, status result.
- Scout: one-tap read-only card summary, balance, visit status, last five logs.

The UI should apply the Signal UI design system direction, stay simple and direct, and be usable by cooperative staff. Avoid unnecessary dashboard complexity.

Signal UI adoption is documented in `.codex/specs/SIGNAL_UI_GUIDE.md`. Role screens must preserve the MBC business flows while using Signal UI colors, typography, icon style, components, and interaction patterns once the Figma tokens are fully extracted.

## 11. Quality Strategy

- Domain and application logic should be written for high automated testability.
- The repository should target at least 90% automated unit-test coverage across the whole executable source base, excluding only pure type-only contract files and generated artifacts.
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
