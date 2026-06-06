# MBC Full-App Vibrant Theme Spec

> Implementation checklist for the FE engineer.  
> Base: Signal UI tokens from `src/presentation/theme/`.  
> Extended: `vibrantTokens` in `colors.ts`.

---

## 1. Global Design Tokens (already in `colors.ts`)

| Token                                 | Value                    | Usage                              |
| ------------------------------------- | ------------------------ | ---------------------------------- |
| `vibrantTokens.darkCardGradientStart` | `#0F172A`                | Dark card top/left                 |
| `vibrantTokens.darkCardGradientEnd`   | `#1E293B`                | Dark card bottom/right             |
| `vibrantTokens.successGradientStart`  | `#059669`                | Success card top                   |
| `vibrantTokens.successGradientEnd`    | `#10B981`                | Success card bottom                |
| `vibrantTokens.simulationAmber`       | `#F59E0B`                | Simulation badge, fee text on dark |
| `vibrantTokens.simulationAmberGlow`   | `rgba(245,158,11,0.3)`   | Amber shadow glow                  |
| `vibrantTokens.glassWhite`            | `rgba(255,255,255,0.85)` | Glassmorphism bg                   |
| `vibrantTokens.glassBorder`           | `rgba(255,255,255,0.4)`  | Glassmorphism border               |
| `vibrantTokens.accentBlue`            | `#3B82F6`                | Info accent                        |

### Add to `vibrantTokens` if missing:

```ts
screenGradientTop: '#0D1B3E',
screenGradientBottom: '#F0F2F5',
roleSwitcherBg: '#001A41',
glassWhiteDark: 'rgba(255,255,255,0.1)',  // glass on dark bg
errorRed: '#EF4444',
actionRed: '#FF0025',
```

---

## 2. Card Patterns

### A. Dark Gradient Card (info/results/summaries)

```tsx
<LinearGradient
  colors={['#0F172A', '#1E293B']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  }}
>
  {/* White text inside */}
</LinearGradient>
```

**Used in:** Station ledger, Station latest result (success), Scout member info, Scout logs, Terminal checkout summary, NfcActionSheet body.

### B. Glassmorphism Card (inputs/controls)

```tsx
<View style={{
  backgroundColor: 'rgba(255,255,255,0.85)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.4)',
  borderRadius: 12,
  padding: 12,
  shadowColor: '#9E9E9E',
  shadowOpacity: 0.15,
  shadowRadius: 8,
}}>
```

**Used in:** Station amount input, Gate simulation panel, RoleSwitcher role cards (on dark bg use `rgba(255,255,255,0.1)`).

### C. Success Gradient Card

```tsx
<LinearGradient
  colors={['#059669', '#10B981']}
  style={{
    borderRadius: 16,
    padding: 16,
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  }}
>
  {/* White text, checkmark icon */}
</LinearGradient>
```

**Used in:** Station register/topup success result, Gate check-in success, NfcActionSheet success state.

### D. Error Card

```tsx
<View
  style={{
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  }}
>
  {/* Dark text */}
</View>
```

**Used in:** Station error result, Scout error, Terminal generic failure, NfcActionSheet error state.

### E. Warning/Simulation Card

```tsx
<View style={{
  backgroundColor: 'rgba(255,255,255,0.85)',
  borderWidth: 1.5,
  borderColor: 'rgba(245,158,11,0.5)',
  borderRadius: 12,
  shadowColor: '#F59E0B',
  shadowOpacity: 0.4,
  shadowRadius: 8,
}}>
```

**Used in:** Gate simulation panel (already done ✅), NfcActionSheet confirm state.

---

## 3. Typography Rules

| Context           | Class/Style               | Dark card        | Light card       |
| ----------------- | ------------------------- | ---------------- | ---------------- |
| Card title        | `text-sm font-bold`       | `text-white`     | `text-[#1A1A1A]` |
| Large number      | `text-3xl font-extrabold` | `text-white`     | `text-[#1A1A1A]` |
| Body              | `text-sm`                 | `text-white`     | `text-[#4E5764]` |
| Caption/label     | `text-xs`                 | `text-[#94A3B8]` | `text-[#6B7280]` |
| Fee/money on dark | `text-xs font-bold`       | `text-[#F59E0B]` | —                |

---

## 4. Shadows & Glow

| Type          | Style                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Default card  | `shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4`  |
| Dark card     | `shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 10` |
| Success glow  | `shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 12`             |
| Amber glow    | `shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 8`              |
| Selected role | `shadowColor: <roleColor>, shadowOpacity: 0.5, shadowRadius: 10`           |

---

## 5. Animations

| Animation       | Spec                                                   | Where                               |
| --------------- | ------------------------------------------------------ | ----------------------------------- |
| Pulsing dot     | `opacity: 0.4 → 1.0`, repeat, 1000ms                   | Gate simulation, Terminal sim badge |
| Success fade-in | `opacity: 0 → 1`, `translateY: 30 → 0`, 400ms ease-out | Scout result, Station result        |
| Bottom sheet    | Slide-up spring (already via absolute positioning)     | NfcActionSheet                      |

---

## 6. Per-Screen Implementation Checklist

### 6.1 RoleSwitcher (`src/presentation/screens/RoleSwitcher/`)

- [ ] **Screen bg:** Change outer `View` to full `bg-[#001A41]` (already done ✅)
- [ ] **Content area:** Keep `bg-[#F0F2F5]` with `rounded-t-2xl` overlap ✅
- [ ] **Role cards** (`RoleOptionList.tsx`): Replace `bg-white` with glassmorphism:
  - `backgroundColor: 'rgba(255,255,255,0.08)'`
  - `borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'`
  - Text: white (`text-white`) for title, `text-[#94A3B8]` for hint
  - Icon bg: keep colored but reduce opacity (`opacity: 0.2` bg)
  - On press: add colored border glow matching role color
- [ ] **App title in header:** Already white on navy via `ScreenHeader` ✅

### 6.2 Station (`src/presentation/screens/Station/`)

- [ ] **SegmentedControl.tsx:** Replace `bg-white` pill with dark pill:
  - Container: `bg-[#0F172A]` with `rounded-full p-1`
  - Active tab: `bg-[#FF0025]` (red) with `text-white`
  - Inactive tab: transparent with `text-[#94A3B8]`
- [ ] **AmountInput.tsx:** Apply glassmorphism card pattern (B):
  - `backgroundColor: 'rgba(255,255,255,0.9)'`
  - `borderColor: 'rgba(255,255,255,0.5)'`, `borderWidth: 1`
  - Label: `text-[#4E5764]`, value: `text-[#1A1A1A]`
  - Preset buttons: dark pills `bg-[#0F172A] text-white rounded-full`
  - Active preset: `bg-[#FF0025] text-white`
- [ ] **LatestResultCard.tsx:**
  - Success: Use success gradient card (C) with white text, large balance `text-3xl font-extrabold text-white`
  - Error: Use error card (D) with red left border
- [ ] **LocalStationLedgerCard.tsx:** Use dark gradient card (A):
  - Title: `text-white font-bold`
  - Labels: `text-[#94A3B8]`
  - Numbers: `text-[#F59E0B] font-bold` (amber for money)
  - Refresh link: `text-[#3B82F6]`
  - Stat icons bg: `rgba(255,255,255,0.1)` instead of `bg-slate-100`

### 6.3 Gate (`src/presentation/screens/Gate/`)

- [ ] **Already aligned** — verify:
  - SimulationModePanel: glassmorphism + amber glow ✅
  - Pulsing dot animation ✅
  - Content area: LinearGradient `#0D1B3E` → `#F5F6FA` ✅
- [ ] **GateResultState.tsx:** Verify success uses green gradient card (C)
  - If currently using plain white/green bg, upgrade to `LinearGradient ['#059669', '#10B981']`
  - Activity info card: blue left border accent ✅

### 6.4 Terminal (`src/presentation/screens/Terminal/`)

- [ ] **Already aligned** — verify:
  - CheckoutSummaryCard: dark gradient ✅, fee in amber ✅
  - Simulation badge: amber pill with glow + pulsing ✅
  - TariffPreviewCard: should use dark gradient card (A)
- [ ] **TariffPreviewCard.tsx:** If not already dark gradient, wrap in `LinearGradient ['#0F172A', '#1E293B']` with white text
- [ ] **InsufficientBalanceCard.tsx:** Use error card (D) pattern — white bg, red left border, clear CTA
- [ ] **GenericFailureCard.tsx:** Use error card (D) pattern

### 6.5 Scout (`src/presentation/screens/Scout/`)

- [ ] **MemberCardInfo.tsx:** Replace white card with dark gradient card (A):
  - Card bg: `LinearGradient ['#0F172A', '#1E293B']`
  - Title: `text-white font-bold`
  - Labels: `text-[#94A3B8]`
  - Values: `text-white font-semibold`
  - Balance positive: `text-[#10B981]` (green on dark)
  - Balance zero: `text-[#EF4444]` (red on dark)
  - Status badge: keep colored bg but adjust for dark context
- [ ] **LatestLogsCard.tsx:** Replace white card with dark gradient card (A):
  - Title: `text-white font-bold`
  - Activity names: `text-white`
  - Amounts: `text-[#F59E0B]` (amber)
  - Timestamps: `text-[#94A3B8]`
  - Row dividers: `rgba(255,255,255,0.1)`
- [ ] **MemberCardError.tsx:** Use error card (D) — white bg, red left border
- [ ] **"Scan Another Card" button:** Keep `bg-[#00B4D8]` but add glow shadow

### 6.6 NfcActionSheet (`src/presentation/components/NfcActionSheet/`)

This is the **highest-impact change** — convert from plain white sheet to dark gradient.

- [ ] **SignalBottomSheet styles.ts:** Add a `darkSheet` variant or override in NfcActionSheet:
  - Sheet bg: `LinearGradient ['#0F172A', '#1E293B']` (wrap sheet content)
  - Handle bar: centered pill `w-10 h-1 rounded-full bg-[rgba(255,255,255,0.3)]` at top
  - Title text: `text-white`
  - Close button text: `text-white`

- [ ] **Scanning state:**
  - Bg: dark (inherited from sheet)
  - PulseRing (inline): keep existing animation ✅
  - Ring container bg: `rgba(255,255,255,0.05)` instead of `bg-[#0050AE]/[0.08]`
  - Primary text: `text-white font-semibold`
  - Secondary text: `text-[#94A3B8]`

- [ ] **Success state:**
  - Icon circle: green gradient bg `['#059669', '#10B981']` with white checkmark
  - Result card: success gradient card (C) — `LinearGradient ['#059669', '#10B981']`
  - Title inside card: `text-white font-semibold`
  - Message: `text-white/80`
  - "Done" button: `bg-[#FF0025] rounded-full text-white`

- [ ] **Error state:**
  - Icon circle: `bg-[rgba(239,68,68,0.15)]` with `border-[#EF4444]`
  - Result card: error card (D) — white bg, red left border
  - Title: `text-[#1A1A1A] font-semibold`
  - Message: `text-[#4E5764]`
  - "Dismiss" button: `bg-[#FF0025] rounded-full text-white`

- [ ] **Confirm state:**
  - Icon circle: `bg-[rgba(245,158,11,0.15)]` with `border-[#F59E0B]`
  - Result card: warning card (E) — glassmorphism + amber border glow
  - Title: `text-white font-semibold` (on dark sheet bg)
  - Message: `text-[#94A3B8]`
  - Primary button: `bg-[#FF0025] rounded-full text-white`
  - Secondary button: `border border-white rounded-full text-white bg-transparent`

---

## 7. Implementation Priority Order

1. **Theme tokens** — Add missing `vibrantTokens` entries to `colors.ts`
2. **NfcActionSheet** — Dark gradient conversion (shared across all screens)
3. **Station fragments** — SegmentedControl, AmountInput, LatestResultCard, LedgerCard
4. **Scout fragments** — MemberCardInfo, LatestLogsCard
5. **RoleSwitcher** — RoleOptionList glassmorphism
6. **Gate/Terminal** — Verify alignment, fix TariffPreviewCard if needed

---

## 8. Files to Modify

| File                                                                      | Change                                      |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| `src/presentation/theme/colors.ts`                                        | Add missing vibrant tokens                  |
| `src/presentation/components/NfcActionSheet/index.tsx`                    | Dark gradient bg, white text, themed states |
| `src/presentation/components/SignalBottomSheet/styles.ts`                 | Optional: add dark variant style            |
| `src/presentation/screens/Station/fragments/SegmentedControl.tsx`         | Dark pill style                             |
| `src/presentation/screens/Station/fragments/AmountInput.tsx`              | Glassmorphism + dark preset pills           |
| `src/presentation/screens/Station/fragments/LatestResultCard.tsx`         | Success gradient / error card               |
| `src/presentation/screens/Station/fragments/LocalStationLedgerCard.tsx`   | Dark gradient card                          |
| `src/presentation/screens/Scout/fragments/MemberCardInfo.tsx`             | Dark gradient card                          |
| `src/presentation/screens/Scout/fragments/LatestLogsCard.tsx`             | Dark gradient card                          |
| `src/presentation/screens/RoleSwitcher/fragments/RoleOptionList.tsx`      | Glassmorphism cards                         |
| `src/presentation/screens/Terminal/fragments/TariffPreviewCard.tsx`       | Verify dark gradient                        |
| `src/presentation/screens/Terminal/fragments/InsufficientBalanceCard.tsx` | Error card pattern                          |
| `src/presentation/screens/Terminal/fragments/GenericFailureCard.tsx`      | Error card pattern                          |

---

## 9. Do NOT Change

- RadarZone component (already themed per-role via `color` prop)
- ScreenHeader (already navy gradient header)
- Domain/application layer code
- NFC business logic
- Test files (update only if component props change)

---

## 10. Accessibility Notes

- All white text on dark gradient must meet WCAG AA contrast (4.5:1 minimum) — `#FFFFFF` on `#0F172A` = 16.7:1 ✅
- Amber `#F59E0B` on `#0F172A` = 6.2:1 ✅
- `#94A3B8` on `#0F172A` = 5.1:1 ✅
- Error card red border must be supplemented with text/icon (not color-only)
- Maintain all existing `accessibilityRole` and `accessibilityLabel` props
