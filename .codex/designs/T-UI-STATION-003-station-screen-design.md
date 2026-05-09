# T-UI-STATION-003: Station Screen & NfcActionSheet Scanning Animation Design

## 1. Station Screen Layout

Follows the same pattern as Gate/Terminal/Scout:

```
┌─────────────────────────────────────┐
│  AppHeaderCard                      │
│  "The Station"                      │
│  "Register & Top Up Cards"    [STN] │
│  ← back                            │
├─────────────────────────────────────┤ ← -mt-3 rounded-t-3xl bg-[#F0F2F5]
│                                     │
│  ┌─ Segmented Control ───────────┐  │ ← z-10, top
│  │ [Register]  |  [Top Up]      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─ Top-Up Amount Card ─────────┐  │ ← z-10, only in Top-Up mode
│  │ Rp [___________]             │  │
│  │ [10k] [20k] [50k] [100k]    │  │
│  └───────────────────────────────┘  │
│                                     │
│         ╭─────────────╮             │ ← absolute center, z-0
│       ╭─┤  RadarZone  ├─╮          │
│     ╭─┤ │  ((•))      │ ├─╮        │
│     │ │ │ Tap Card to  │ │ │        │
│     │ │ │  Register    │ │ │        │
│     ╰─┤ ╰─────────────╯ ├─╯        │
│       ╰──────────────────╯          │
│                                     │
│  ┌─ Latest Result Card ─────────┐  │ ← z-10, bottom overlay
│  │ ✓ Registered: MBR-xxx        │  │
│  └───────────────────────────────┘  │
│  ┌─ Local Station Ledger ───────┐  │ ← z-10, collapsible accordion
│  │ ▸ Ledger (3 reg, 5 top-up)  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─ NfcLogPanel ────────────────┐  │ ← fixed bottom
│  │ [NFC] Ready...               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 2. Mode Switching UX — Segmented Control

**Component:** Pill-shaped segmented control (2 segments).

```
┌──────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐     │
│  │ Register │  │  Top Up  │     │  bg-white rounded-full p-1 border
│  └──────────┘  └──────────┘     │
└──────────────────────────────────┘
```

**Behavior:**
- Active segment: `bg-[#16A34A]` with white text
- Inactive segment: transparent with `text-[#4E5764]`
- Border: `border-slate-200`
- Outer container: `bg-white rounded-full p-1`
- Transition: smooth 200ms background slide

**Accessibility:**
- `accessibilityRole="tab"` on each segment
- `accessibilityState={{ selected: true/false }}`

## 3. RadarZone Labels Per Mode

| Mode     | Label                    | Busy Label        | Color     |
|----------|--------------------------|-------------------|-----------|
| Register | "Tap Card to Register"   | "Registering..."  | `#16A34A` |
| Top Up   | "Tap Card to Top Up"     | "Processing..."   | `#16A34A` |

Both modes use the same green `#16A34A` RadarZone. The label changes based on active segment.

**Disabled state:** When `topUpAmount` is 0 or empty in Top-Up mode, RadarZone is disabled with `opacity: 0.4`.

## 4. Top-Up Amount Input Placement

**Position:** Directly below the segmented control, inside the `z-10` top overlay area. Only visible when mode = "Top Up".

```
┌─────────────────────────────────────┐
│  Top Up Amount                      │  ← label, text-xs font-semibold
│  Rp [_________________________]     │  ← TextInput, text-2xl font-bold
│                                     │
│  [10k]  [20k]  [50k]  [100k]       │  ← preset chips, flex-row gap-2
└─────────────────────────────────────┘
```

**Specs:**
- Card: `rounded-xl bg-white p-3 shadow-sm mt-3`
- Input: numeric keyboard, formatted with locale separator
- Presets: pill chips (`rounded-full border px-3 py-1.5`)
  - Selected: `bg-[#16A34A] border-[#16A34A] text-white`
  - Unselected: `bg-white border-slate-200 text-[#4E5764]`
- Validation: only numeric, strip non-digits on input

## 5. Result Cards & Ledger Placement

**Position:** Bottom of the content area, above NfcLogPanel, using `mt-auto z-10`.

### Latest Result Card
- Shows after any successful register/top-up
- Green success variant: `bg-[#EAFBF2] border-l-4 border-[#16A34A]`
- Shows: action type, masked member ref, amount (for top-up), timestamp
- Dismissible (tap X or auto-hide after 10s)

### Local Station Ledger (Accordion)
- Default: **collapsed** — shows summary line only
- Summary: "Ledger: {registerCount} reg · {topUpCount} top-up · Rp {topUpTotal}"
- Expanded: shows latest 5 entries in compact list
- Chevron icon rotates on expand/collapse
- Card: `rounded-xl bg-white p-3 mt-2`

**Layout order (bottom-up):**
1. NfcLogPanel (fixed)
2. LocalStationLedgerCard (accordion, collapsed default)
3. LatestResultCard (conditional)

## 6. NfcActionSheet Scanning State Visual Design

### Current Problem
The scanning phase shows only a plain `ActivityIndicator` on white — no visual feedback that communicates "hold your card near the phone."

### Proposed Design: Animated Concentric Rings

Inspired by Apple Pay / Google Pay NFC scanning UIs and Lottie NFC animations.

```
┌─────────────────────────────────────┐  ← Bottom sheet, 50% height
│                                     │
│  ─── Ready to Scan ───              │  ← title
│                                     │
│            ╭───╮                    │
│          ╭─┤   ├─╮                  │  ← 3 concentric rings
│        ╭─┤ │ 📱│ ├─╮               │     pulsing outward
│        │ │ │   │ │ │                │
│        ╰─┤ ╰───╯ ├─╯               │
│          ╰───────╯                  │
│                                     │
│  "Hold your card to the back        │  ← instruction text
│   of the phone"                     │
│                                     │
│  "Keep steady until complete"       │  ← helper text, muted
│                                     │
└─────────────────────────────────────┘
```

### Animation Specification

**Visual:** 3 concentric rings expanding outward from a center phone/NFC icon.

**Implementation using `react-native-reanimated`:**

```
Center icon: NFC contactless symbol (((•))) or phone icon
  - Size: 48x48
  - Color: role-based (Station=#16A34A, Gate=#1D4ED8, Terminal=#7C3AED, Scout=#D97706)

Ring 1 (inner):
  - Start radius: 32px
  - End radius: 56px
  - Duration: 1500ms
  - Opacity: 0.6 → 0
  - Border: 2px solid {roleColor}
  - Loop: infinite, staggered 0ms

Ring 2 (middle):
  - Start radius: 32px
  - End radius: 72px
  - Duration: 1500ms
  - Opacity: 0.4 → 0
  - Border: 1.5px solid {roleColor}
  - Loop: infinite, staggered 500ms

Ring 3 (outer):
  - Start radius: 32px
  - End radius: 88px
  - Duration: 1500ms
  - Opacity: 0.2 → 0
  - Border: 1px solid {roleColor}
  - Loop: infinite, staggered 1000ms
```

**Animation behavior:**
- Rings pulse outward continuously (scale + fade)
- Staggered start creates a "ripple" effect
- Easing: `Easing.out(Easing.cubic)` for natural deceleration
- Center icon has subtle "breathe" scale (1.0 → 1.05 → 1.0, 2s loop)

### Component Props Addition

```ts
// NfcActionSheet scanning phase now accepts optional color
export type NfcActionState =
  | { phase: 'idle' }
  | { phase: 'scanning'; message?: string; color?: string }
  | { phase: 'success'; title: string; message: string }
  | { phase: 'error'; title: string; message: string }
  | { phase: 'confirm'; title: string; message: string; confirmLabel: string; onConfirm: () => void };
```

### Extracted Component: `ScanningRings`

```tsx
// src/presentation/components/NfcActionSheet/ScanningRings.tsx
// Props: { color: string }
// Renders: 3 animated rings + center NFC icon
// Uses: react-native-reanimated for performant native-thread animations
```

**Fallback:** If reanimated is unavailable, use `Animated` API (already in project) with the same staggered ring pattern.

## 7. Color Scheme — Station = Green #16A34A

| Element                    | Color                          |
|----------------------------|--------------------------------|
| RadarZone rings/button     | `#16A34A`                      |
| Segmented control active   | `#16A34A`                      |
| Preset chip selected       | `#16A34A`                      |
| Role badge                 | `bg-green-700` (#15803D)       |
| Result card success bg     | `#EAFBF2`                      |
| Result card success border | `#16A34A`                      |
| Result card success text   | `#166534` (green-800)          |
| Scanning rings (sheet)     | `#16A34A`                      |
| Header background          | `#001A41` (Signal secondary)   |
| Content area background    | `#F0F2F5`                      |
| Card backgrounds           | `#FFFFFF`                       |
| Text primary               | `#001A41`                      |
| Text secondary             | `#4E5764`                      |
| Error states               | `#BC1D42` / `#FFECEC`          |
| Warning/confirm states     | `#D9801F` / `#FFF7DB`          |

## 8. State Coverage Checklist

| State                      | Station Behavior                                                    |
|----------------------------|---------------------------------------------------------------------|
| Idle                       | RadarZone active, segmented control visible, ready to tap           |
| NFC scanning               | NfcActionSheet opens with ScanningRings animation                   |
| Success                    | Sheet shows green success card, LatestResultCard updates            |
| Error                      | Sheet shows red error card with actionable message                  |
| Unsupported/unregistered   | Error: "Card not recognized" with guidance                          |
| Cancelled/timeout          | Sheet closes, RadarZone re-enables, toast or inline message         |
| Write failure              | Error: "Write failed — try again" with retry guidance               |
| Confirm (re-register)      | Sheet shows amber confirm card with Wipe & Re-register / Skip       |
| Top-Up invalid amount      | RadarZone disabled, amount field shows error border                  |
| NFC unsupported/disabled   | Full-screen banner replacing RadarZone with guidance                 |

## 9. Implementation Notes

1. **No new dependencies** — use existing `react-native-reanimated` (already in stack) for ScanningRings.
2. **ScanningRings is shared** — all role screens benefit from the same animation in NfcActionSheet.
3. **Color prop** — pass role color to NfcActionSheet so rings match the role theme.
4. **Keep it simple** — no Lottie files needed; pure reanimated circles are lightweight and customizable.
5. **Accessibility** — ScanningRings has `accessibilityLabel="Scanning for NFC card"` and `importantForAccessibility="no"` on decorative rings.

## 10. File Changes Required

| File | Change |
|------|--------|
| `src/presentation/components/NfcActionSheet/ScanningRings.tsx` | NEW — animated rings component |
| `src/presentation/components/NfcActionSheet/index.tsx` | Replace `ActivityIndicator` with `ScanningRings` |
| `src/presentation/components/NfcActionSheet/types.ts` | Add optional `color` to scanning phase |
| `src/presentation/screens/Station/index.tsx` | Already aligned (current impl matches this design) |

The current Station screen implementation already follows this design. The main deliverable is the **ScanningRings** component for NfcActionSheet.
