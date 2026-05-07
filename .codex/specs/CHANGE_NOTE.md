# Change Note — Final Android 9 FE / NTAG215 MVP Decisions

This patch applies the final platform/security/device decisions after the NTAG215 payload discussion.

## Decisions applied

- MVP real NFC write/read focus is Android.
- Primary MVP test device is **Android 9 FE**.
- MVP target NFC tag is **NTAG215**.
- iOS NFC write is out of MVP and may be documented as deferred or best-effort/read-only unless separately validated later.
- Silent Shield uses AES-256-GCM or equivalent authenticated encryption.
- Assessment MVP may use a clearly labeled app-bundled demo AES key.
- Production must replace demo key handling with secure provisioning and/or Android hardware-backed Keystore.
- NFC writer should prefer raw byte/binary NDEF payloads; Base64URL/NDEF text is fallback only if the library requires text payloads.
- Card transaction history keeps latest 5 records with FIFO behavior and stores only activity, nominal, and ISO time.

## Files changed

- `DEVICE_TEST_MATRIX.md`
- `REQUIREMENTS.md`
- `CARD_DATA_SECURITY_LEDGER_SPEC.md`
- `SECURITY.md`
- `TEST_PLAN.md`
- `E2E_TEST_CASES.md`
- `PO_FINAL_GO_NO_GO_CHECKLIST.md`
- `RFID_NFC_REACT_NATIVE_101.md`
- `TASKS.md`
- `TRACEABILITY.md`
- `RISKS.md`
- `TASK_PRESENTATION_BRIEF.md`

---

# Change Note — NFC Single-Tap and UI Polish (2026-05-07)

## Decisions applied

- Post-write readback verification removed. The compact codec does not preserve transaction log IDs round-trip, making JSON fingerprint comparison unreliable. `writeNdefMessage` throws on write failure, which is sufficient.
- `readWriteCard(transform)` added to `MbcCardRepository` interface. Performs read, transform, and write in a single NFC session (one tap). Used by top-up, check-in, and check-out.
- `getNdefMessage()` on Android returns a tag-like object `{ ndefMessage: [...] }`, not a records array. Fixed to extract `.ndefMessage` property.
- `DomainError` now passes through `toReadableError` in the repository so domain validation errors (e.g., `ACTIVE_SESSION_MISSING`, `INSUFFICIENT_BALANCE`) propagate correctly from `readWriteCard` transforms.
- `durationMs` added to `ActivityTariffCalculation` return type for exact duration display.

## UI changes

- Bottom sheet height set to 50% of device screen.
- Dark overlay (`rgba(0,0,0,0.5)`) shown when bottom sheet is open.
- Bottom sheet dismissable in all states including scanning (tap overlay to cancel).
- Dismissed scanning state suppresses subsequent error sheet (all screens use `dismissedRef` pattern).
- Check-in result card shows current balance and check-in time.
- Terminal screen shows exact duration as `Xh Ym Zs` instead of rounded hours.
- Top-up and check-in success bottom sheets show current balance.
- Station screen: removed "Real NFC mode" info card, moved refresh inline with ledger header, latest result clears on mode switch.
- Gate screen: removed recovery guidance card from error state.

## Files changed

- `src/infrastructure/nfc/real-mbc-card.repository.ts`
- `src/domain/repositories/mbc-card-repository.ts`
- `src/domain/services/activity-tariff-calculator.ts`
- `src/application/dto/role-action-result-dto.ts`
- `src/application/use-cases/top-up-member-card.use-case.ts`
- `src/application/use-cases/check-in-activity.use-case.ts`
- `src/application/use-cases/check-out-activity.use-case.ts`
- `src/presentation/components/SignalBottomSheet/styles.ts`
- `src/presentation/components/NfcActionSheet/index.tsx`
- `src/presentation/screens/Station/useStationActions.ts`
- `src/presentation/screens/Station/index.tsx`
- `src/presentation/screens/Gate/useGateActions.ts`
- `src/presentation/screens/Gate/index.tsx`
- `src/presentation/screens/Gate/fragments/GateResultState.tsx`
- `src/presentation/screens/Terminal/useTerminalActions.ts`
- `src/presentation/screens/Terminal/index.tsx`
- `src/presentation/screens/Scout/useScoutActions.ts`
- `src/presentation/screens/Scout/index.tsx`
