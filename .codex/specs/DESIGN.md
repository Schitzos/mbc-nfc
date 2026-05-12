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
| Domain         | MBC entities, parking tariff rule, card state policy, transaction log policy            | React components, NFC library calls        |
| Application    | Role use cases such as register, top-up, activity check-in, activity check-out, inspect | UI rendering, native module details        |
| Infrastructure | NFC reader/writer, card payload codec, shield/encryption, logging                       | Business decisions                         |
| Presentation   | Role switcher, screens, forms, status displays                                          | Direct NFC library calls or payload crypto |

## 2. Technology Stack

| Area              | Choice                                                 |
| ----------------- | ------------------------------------------------------ |
| Mobile framework  | React Native CLI                                       |
| Language          | TypeScript                                             |
| NFC library       | `react-native-nfc-manager`                             |
| Crypto library    | `react-native-quick-crypto` (AES-256-GCM)              |
| Local database    | SQLite                                                 |
| UI system         | Signal UI, guided by `.codex/specs/SIGNAL_UI_GUIDE.md` |
| Navigation        | React Navigation                                       |
| Animations        | `react-native-reanimated`                              |
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
      station-ledger-summary.ts
    repositories/
      mbc-card-repository.ts
      local-ledger-repository.ts
      nfc-availability-repository.ts
    services/
      activity-tariff-calculator.ts
      activity-state-policy.ts
      transaction-log-policy.ts
    errors/
      domain-error.ts
      card-repository-error.ts
  application/
    use-cases/
      check-nfc-availability-use-case.ts
      register-member-card.use-case.ts
      top-up-member-card.use-case.ts
      check-in-activity.use-case.ts
      check-out-activity.use-case.ts
      inspect-member-card.use-case.ts
      get-station-ledger-summary.use-case.ts
    dto/
      card-summary-dto.ts
      card-summary-mapper.ts
      role-action-result-dto.ts
      station-ledger-summary-dto.ts
      check-nfc-availability-result-dto.ts
  infrastructure/
    nfc/
      real-mbc-card.repository.ts
      mbc-card-codec.ts
      silent-shield.ts
      device-nfc-status.repository.ts
    local-ledger/
      sqlite-ledger.repository.ts
      sqlite-ledger-mapper.ts
  presentation/
    stores/
      app-store.ts
    context/
      service-context.tsx
    config/
      role-options.ts
    theme/
      colors.ts
      typography.ts
      spacing.ts
      radius.ts
      shadows.ts
      icons.ts
      components.ts
    screens/
      RoleSwitcher/
        index.tsx
        fragments/
          RoleOptionList.tsx
      Station/
        index.tsx
        useStationActions.ts
      Gate/
        index.tsx
        useGateActions.ts
        fragments/
          GateResultState.tsx
      Terminal/
        index.tsx
        useTerminalActions.ts
      Scout/
        index.tsx
        useScoutActions.ts
      RoleSwitcherScreen.tsx
      StationScreen.tsx
      GateScreen.tsx
      TerminalScreen.tsx
      ScoutScreen.tsx
    components/
      AppHeaderCard/
      NfcActionSheet/
      NfcLogPanel/
      RadarZone/
      ScanningRings/
      SignalButton/
      SignalTextField/
      SignalOptionCard/
      SignalBottomSheet/
      SignalStatusBanner/
      SignalSurfaceCard/
      SignalJelajahCard/
      SignalSkeleton/
      BackgroundDecor/
    assets/
      icons/
  shared/
    constants.ts
    utils/
      create-random-id.ts
      mask-member-reference.ts
    types/
```

## 4. Package Principles

The design follows package cohesion principles:

| Principle                 | Project Application                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Reuse/Release Equivalency | Reusable card codec, parking tariff, and state policy are isolated from UI so they can be versioned together. |
| Common Closure            | Code that changes for the same reason stays together, such as fixed tariff logic or card payload encoding.    |
| Common Reuse              | Station, Gate, Terminal, and Scout use only the modules they need through focused use cases and contracts.    |

## 5. Domain Model

MVP domain scope: `PARKING` is the only required benefit activity for this assessment. The design should remain extendable through isolated tariff rule and activity definitions, but Codex must not implement a second non-parking flow unless a future requirement explicitly adds it.

```ts
export type VisitStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN';

export type MbcActivity = 'REGISTER' | 'TOP_UP' | 'CHECK_IN' | 'CHECK_OUT';

export type BenefitActivityType = 'PARKING';

export type MbcRole = 'STATION' | 'GATE' | 'TERMINAL' | 'SCOUT';

export type CurrencyCode = 'IDR';

export type ActivitySession = {
  activityId: string;
  activityType: BenefitActivityType;
  checkedInAt: string;
};

export type MemberProfile = {
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
  role: MbcRole;
  action: MbcActivity;
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
  currency: CurrencyCode;
  visitStatus: VisitStatus;
  activeSession?: ActivitySession;
  transactionLogs: TransactionLog[];
};

export const PARKING_TARIFF_PER_STARTED_HOUR = 2000;
```

## 6. Application DTOs

```ts
export type CardSummaryDto = {
  cardId: string;
  memberName?: string;
  maskedMemberReference?: string;
  balance: number;
  currency: CurrencyCode;
  visitStatus: VisitStatus;
  activeSession?: ActivitySession;
  transactionLogs: TransactionLog[];
};

export type RoleActionResultDto = {
  success: boolean;
  role: MbcRole;
  message: string;
  card?: CardSummaryDto;
  chargedHours?: number;
  chargedAmount?: number;
  durationMs?: number;
};

export type RoleActionErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'ALREADY_CHECKED_IN'
  | 'CARD_TAMPERED'
  | 'CARD_UNSUPPORTED'
  | 'UNREGISTERED_CARD'
  | 'SCAN_TIMEOUT'
  | 'READ_FAILED'
  | 'WRITE_FAILED'
  | 'GENERIC_FAILURE';

export type StationLedgerSummaryDto = StationLedgerSummary;
// StationLedgerSummary is defined in domain/entities/station-ledger-summary.ts:
// { topUpTotal, checkoutTotal, registerCount, topUpCount, checkoutCount, latestEntries }
```

## 7. Repository Interface

```ts
export interface MbcCardRepository {
  isSupported(): Promise<boolean>;
  readCard(): Promise<MbcCard>;
  writeCard(card: MbcCard): Promise<void>;
  readWriteCard(transform: (card: MbcCard) => MbcCard): Promise<MbcCard>;
  registerCard(card: MbcCard): Promise<void>;
  cancel(): Promise<void>;
}

export interface LocalLedgerRepository {
  append(entry: LedgerEntry): Promise<void>;
  getStationSummary(): Promise<StationLedgerSummary>;
}

// Tariff calculation is a standalone function, not an interface:
export type ActivityTariffCalculation = {
  chargedHours: number;
  chargedAmount: number;
  durationMs: number;
};

export function calculateActivityTariff(input: {
  checkedInAt: string;
  checkedOutAt: string;
}): ActivityTariffCalculation;
// Throws DomainError('INVALID_TIMESTAMP') or DomainError('INVALID_DURATION')
```

## 8. Business Rules

### Member Identity

- The app generates the internal `memberId` during Station registration.
- The first implementation round does not require any human-readable member profile field.
- Staff must not manually type the internal `memberId`.
- Normal Station, Gate, Terminal, and Scout screens should not show the full internal `memberId`.
- A masked or short member reference may be shown only when useful for support, recovery, or transaction traceability.

### Parking Tariff

- Parking MVP fee is fixed at Rp 2.000 per started hour.
- Duration is rounded up to the next started hour.
- Keep the rate in one isolated tariff module/constant; do not scatter `2000` magic numbers across screens.
- Terminal checkout displays tariff, charged hours, and fee immediately after successful tap (single-session atomic NFC model).
- Runtime rate editing, tariff schedules, and non-parking tariff fixtures are out of MVP scope.

### Registration Safety

- Station registration uses `registerCard()` which reads-then-writes in a single NFC session.
- If the card is already registered or has unrecognized (non-MBC) data, the app shows a confirmation prompt (Wipe & Re-register / Skip).
- Tampered authenticated payloads (Silent Shield integrity failure) show a `CARD_TAMPERED` error without a reset prompt.
- If the user confirms, `executeWithReset()` wipes the card and writes a fresh payload with a new member ID.
- If the user skips, no modification is made.
- The reset flow generates a new card ID and member ID (does not reuse old ones).
- No initial balance field is presented during registration; new cards start at zero balance.

### Visit State

- A card with `NOT_CHECKED_IN` can be checked in.
- A card with `CHECKED_IN` cannot be checked in again.
- A card with `CHECKED_IN` can be checked out if balance is sufficient.
- A card with `NOT_CHECKED_IN` cannot be checked out.
- A card can only have one active activity session at a time.
- Gate writes check-in using real device time in production flow.

### Transaction Logs

- Only the latest five logs are kept on card.
- Each log records nominal, time, and activity.

### Local Ledger

- SQLite ledger records every successful card-state operation: `REGISTER`, `TOPUP`, and `CHECKOUT`. Check-in (CHECKIN) does NOT append a local ledger row.
- Station summaries reflect operations processed on this device.
- Income summaries count money-related rows (`TOPUP` and `CHECKOUT`).
- SQLite ledger is device-local and offline.
- The ledger stores audit/reporting data for the device that processed each operation.
- The ledger does not replace card balance, status, or activity truth.
- Register, top-up, and checkout actions append ledger entries after successful business completion.
- A masked or shortened member reference is preferred over full sensitive identity.

### NFC Capacity and Single-Session Operations

- NTAG215 is the MVP target tag and its writable capacity must be documented before real-card support is claimed.
- The encoded protected payload length must be checked before every NTAG215 write.
- If payload exceeds capacity, return `CARD_CAPACITY_INSUFFICIENT` and do not show success.
- `writeNdefMessage` throws on write failure; no post-write readback verification is performed (the codec does not preserve all fields round-trip, making fingerprint comparison unreliable).
- `readWriteCard(transform)` performs read, transform, and write in a single NFC session (one tap). Used by top-up, check-in, and check-out flows.
- `registerCard(card)` checks for existing data then writes in a single NFC session.
- `readCard()` is used for read-only operations (inspect).

## 9. Silent Shield Design

Silent Shield is implemented in production-grade assessment mode using `react-native-quick-crypto` for AES-256-GCM authenticated encryption.

Design rules:

- Logical card payload remains a compact domain object for tests and business logic. Use compact NFC DTOs for NTAG215 writes.
- NFC storage is a protected `MBC1` binary envelope, not direct JSON.
- Card codec encodes `MbcCard` to a compact payload using the format: `v,c,m,b,i,x,n` (version, cardId, memberId, balance, activeSession, transaction log tuples, writeCounter).
- Silent Shield envelope structure: `MBC1` magic (4 bytes) + version (1 byte) + kid (1 byte) + alg (1 byte) + IV (12 bytes) + authTag (16 bytes) + ciphertext.
- Encryption uses AES-256-GCM via `react-native-quick-crypto`.
- Do not commit real keys or secrets. MVP uses a documented demo key.
- Keep crypto, codec, and key-loading logic inside infrastructure.
- Generic NFC readers must not reveal member identity, balance, parking status details, or transaction values.
- Any decrypt/authentication failure maps to `CARD_TAMPERED`.

Measured payload sizes on NTAG215 (504 bytes raw user memory; app validates against 480 bytes NDEF capacity):

- Worst-case 5-log payload: 327 bytes plaintext, 362 bytes encrypted (fits NTAG215).

Android is the primary real-card target (validated on ASUS ROG 9 FE with NTAG215). iOS behavior must be validated later on a real device and documented without assuming full parity.

Remaining real-world production hardening such as fleet key rotation, backend reconciliation, operator authentication, and physical card authenticity controls remains outside MVP but must be documented as future production work.

## 10. Presentation Design

The app starts with role selection and then shows the active role surface.

Before any real card operation, the presentation layer checks NFC availability through the application use case. If NFC is unsupported or disabled, the role screen must show a clear message that real MBC card scan/read/write requires an NFC-capable device with NFC enabled.

All role screens use `NfcActionSheet` — a bottom sheet component that provides scan/success/error feedback during NFC operations. The scanning phase uses `ScanningRings` animation (3 concentric pulsing rings + breathing center NFC icon) consistent with the RadarZone visual language.

All four role screens (Station, Gate, Terminal, Scout) use `RadarZone` as the shared NFC trigger component — a dark immersive zone with concentric radar rings, sweep line animation, and a colored circular action button. Each role uses a distinct color (Station: green #008E53, Gate: blue #1D4ED8, Terminal: amber #D97706, Scout: cyan #00B4D8).

- Station uses RadarZone with a segmented control (Register | Top Up tabs) to switch between registration and top-up modes. The local ledger summary is displayed as a collapsible accordion (collapsed by default). Top-up accepts numeric input (free-text allowed) with validation to ensure only numbers are entered. Preset buttons (10k/20k/50k/100k) are also available as shortcuts.
- Gate: parking check-in action via RadarZone tap, NFC write action, status result. No simulation mode or mock scenario selectors.
- Terminal: checkout action via RadarZone tap, fixed tariff display, duration/fee summary, tap-out time displayed in `dd-MMM-YYYY hh:mm` format, insufficient balance guidance, NFC write action, status result.
- Scout: one-tap read-only card summary via RadarZone tap. After scan, the radar hides and card results appear at the top of the screen (balance, visit status, last five logs with timestamps). A "Scan Another Card" button resets the view back to radar mode.
- Shared: NFC Log panel is scrollable with a fixed max height, can be toggled on/off and cleared by the operator. It records safe operational events only (no sensitive payload data).

NFC operational log design rules:

- Keep log state in presentation store, isolated from domain/application business state.
- Use bounded in-memory list (for example latest 100-200 lines) to avoid unbounded growth.
- Log format should be concise. MVP uses plain `[NFC] message` prefix. Categorized format (`HH.mm.ss [NFC:READ]`, `[NFC:WRITE]`, `[NFC:ERROR]`) is a future enhancement.
- Logs must never include raw decrypted payload, private keys, full internal member IDs, or security secrets.

The UI applies the Signal UI design system direction, stays simple and direct, and is usable by cooperative staff. Avoid unnecessary dashboard complexity.

Signal UI adoption is documented in `.codex/specs/SIGNAL_UI_GUIDE.md`. Role screens must preserve the MBC business flows while using Signal UI colors, typography, icon style, components, and interaction patterns once the Figma tokens are fully extracted.

## 11. Quality Strategy

- Domain and application logic should be written for high automated testability.
- The repository should target at least 90% automated unit-test coverage across the whole executable source base, excluding only pure type-only contract files and generated artifacts. Actual achievement: 100% line coverage (444+ tests, 65 suites; jest.config.js enforces 99% statements/lines/branches, 96% functions).
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

## NTAG215 Compact Payload Design

The architecture separates readable domain models from compact NFC DTOs. Screens and use cases use readable names, but the NFC repository normalizes card state into the compact NTAG215 payload before Silent Shield protection.

Compact codec format: `v,c,m,b,i,x,n` where fields are comma-separated values for version, cardId, memberId, balance, activeSession (object or null), transaction log tuples, and writeCounter.

Compact rules:

- no display name/profile/debug data on card;
- no tariff-management fields on card for fixed-tariff MVP;
- active visit uses compact state and ISO timestamp;
- latest 5 card transactions use tuple records;
- binary Silent Shield envelope is written directly to NTAG215;
- write is blocked with `CARD_CAPACITY_INSUFFICIENT` if protected payload does not fit.

Measured capacity (NTAG215, 504 bytes raw user memory; `assertSupportedTag()` validates against 480 bytes NDEF capacity):

- Worst-case 5-log payload: 327 bytes plaintext, 362 bytes encrypted.
- Envelope overhead: 35 bytes (4 magic + 1 version + 1 kid + 1 alg + 12 IV + 16 authTag).
- Fits comfortably within NTAG215 NDEF capacity (480 bytes). The 24-byte difference between raw memory (504) and NDEF capacity (480) accounts for CC bytes, lock bytes, and NTAG215 internal overhead.
