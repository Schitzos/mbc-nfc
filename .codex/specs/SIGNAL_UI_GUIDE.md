# Signal UI Guide for MBC

## 1. Source

Signal UI is the required design system direction for the KDX Membership Benefit Card app.

Figma file:

- Name: `Signal - Web 1.1`
- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?m=auto&t=zwxs81tH8lptvvLM-6`
- File key: `zw3drt0BTUTWyypdMWJ0VM`
- Confirmed access: yes, metadata can be read.
- Confirmed cover page: `Cover`
- Confirmed cover frame: `Signal - Web 1.1`

## 2. Connected Signal Libraries

The Figma file is connected to these team libraries:

| Library                 | Use in MBC                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Signal - Color Family` | Primary source for colors and semantic color families.                                                                  |
| `Signal - Styles`       | Primary source for typography, effects, spacing-like style decisions, and shared visual language.                       |
| `Signal - Icon`         | Primary source for icon style and icon usage.                                                                           |
| `Signal - Web 1.1`      | Main provided design-system guide from the user.                                                                        |
| `Signal - App Kit`      | Preferred reference when adapting Signal patterns to mobile app screens.                                                |
| `Signal - Web Kit`      | Secondary reference for web-style components when mobile-specific guidance is not exposed.                              |
| `Signal - Illustration` | Optional only for empty states or presentation visuals; do not use illustration to make operational screens decorative. |
| `Design System - DX`    | Supporting design-system reference if exposed by Figma.                                                                 |

Do not use community libraries such as Material, iOS, or Simple Design System as the project visual source unless the Product Owner explicitly changes the design direction.

## 3. MBC Adoption Rules

- Preserve the MBC role flows from `.codex/specs/REQUIREMENTS.md`.
- Use Signal UI for visual treatment, not for changing business behavior.
- Keep the app operational and direct; this is not a marketing interface.
- Make the active role unmistakable on every screen.
- Use Signal icons where possible for role, scan, success, warning, error, balance, history, and activity states.
- Prefer mobile-app patterns from `Signal - App Kit` when available.
- Use `Signal - Web 1.1` and `Signal - Web Kit` to guide spacing, density, component hierarchy, and typography when mobile-specific patterns are unavailable.
- Keep Station simple for cooperative staff: short labels, direct validation, clear NFC action.
- Keep Scout visually read-only: no write-style call to action.
- Terminal must clearly show duration, charged hours, fee, balance before, and balance after.
- Gate simulation mode must be visibly active when enabled.

## 4. Screen Mapping

| MBC Screen    | Signal UI Guidance                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Role Switcher | Use clear navigation or selector patterns; each role should have a distinct label, icon, and short operational purpose. |
| Station       | Use form/input patterns, primary action button, validation/error states, and success result summary.                    |
| Gate          | Use activity selector, NFC scan action, active simulation state, and member validation result.                          |
| Terminal      | Use fee summary, status/result panels, warning/error state, and insufficient balance recovery guidance.                 |
| Scout         | Use read-only summary, balance/status surface, and compact transaction history list.                                    |

## 5. Required States

Every role screen should be designed with these states:

- Idle.
- NFC required / device support explanation.
- NFC scanning.
- Success.
- Cancelled or timeout.
- Unsupported NFC.
- NFC disabled.
- Unregistered or unsupported card.
- Tampered or unreadable card.
- Write failure, for Station, Gate, and Terminal.
- Insufficient balance, for Terminal.
- Double check-in, for Gate.
- Double check-out, for Terminal.

## 6. Token Extraction Status

The color-token page from `Signal - Styles` was inspected from:

- File: `Signal - Styles`
- URL: `https://www.figma.com/design/YlPjsT9cQfUSqoZubvZMmu/Signal---Styles?node-id=2-31&m=dev`
- File key: `YlPjsT9cQfUSqoZubvZMmu`
- Node: `2:31`
- Page/canvas name: `Token Color`
- Main frame: `Colors Token`

Extracted color tokens:

| Group        | Token               | Hex                                 | Usage From Signal                                              |
| ------------ | ------------------- | ----------------------------------- | -------------------------------------------------------------- |
| Brand        | `primary`           | `#FF0025`                           | Main brand color, CTA, background, banner, highlighted action. |
| Brand        | `secondary`         | `#001A41`                           | Secondary brand color, default header/title/banner dark blue.  |
| Text         | `red`               | `#FF0025`                           | Negative states such as failed/error text.                     |
| Text         | `valid`             | `#008E53`                           | Success or positive state text.                                |
| Text         | `info`              | `#0050AE`                           | Informational text and links.                                  |
| Text         | `error`             | `#BC1D42`                           | Negative states such as failed/error text.                     |
| Text         | `warning`           | `#D9801F`                           | Warning text.                                                  |
| Text         | `primary`           | `#001A41`                           | Header/title/default body emphasis.                            |
| Text         | `secondary`         | `#4E5764`                           | Body or subdescription text.                                   |
| Text         | `disable`           | `#B3BAC6`                           | Disabled state text.                                           |
| Text         | `white`             | `#FFFFFF`                           | Text on dark background.                                       |
| Background   | `primary`           | `#ED0226`                           | Button, background, banner.                                    |
| Background   | `secondary`         | `#001A41`                           | Button, background, banner.                                    |
| Background   | `disable`           | `#F5F6FA`                           | Disabled/grey background.                                      |
| Background   | `warm`              | `#F6F3F3`                           | Warm grey background.                                          |
| Background   | `valid`             | `#EDFCF0`                           | Success background.                                            |
| Background   | `info`              | `#E7F5FC`                           | Information background.                                        |
| Background   | `error`             | `#FDDDD4`                           | Error background.                                              |
| Background   | `warning`           | `#FEF3D4`                           | Warning/chip background.                                       |
| Background   | `white`             | `#FFFFFF`                           | Default background or text inside red/dark background.         |
| Background   | `gradientPrimary`   | `#ED0226`                           | Banner/icon fill.                                              |
| Background   | `gradientSecondary` | `#001A41`                           | Banner/icon fill.                                              |
| Background   | `gradientBanner01`  | `#CD0A45` to `#FD2B77`              | Banner fill.                                                   |
| Background   | `gradientBanner02`  | `#ED0226` to `#FDA22B`              | Banner fill.                                                   |
| Background   | `gradientBanner03`  | `#B90024` to `#FF0025` to `#FD195E` | Banner fill.                                                   |
| Link Text    | `text`              | `#0050AE`                           | Link text.                                                     |
| Product Icon | `red`               | `#FF0025`                           | Product icon primary color.                                    |
| Product Icon | `primary`           | `#001A41`                           | Default product icon color.                                    |
| Product Icon | `white`             | `#FFFFFF`                           | Product icon on dark background.                               |
| Product Icon | `disable`           | `#4E5764`                           | Disabled product icon.                                         |
| System Icon  | `valid`             | `#008E53`                           | Success icon.                                                  |
| System Icon  | `info`              | `#0050AE`                           | Info icon.                                                     |
| System Icon  | `error`             | `#DB2941`                           | Error icon.                                                    |
| System Icon  | `warning`           | `#FDA22B`                           | Warning icon.                                                  |
| Divider      | `default`           | `#EDECF0`                           | Divider fill.                                                  |
| Stroke       | `default`           | `#EDECF0`                           | Default border line.                                           |
| Stroke       | `warning`           | `#FED27F`                           | Warning border.                                                |
| Stroke       | `valid`             | `#008E53`                           | Success border.                                                |
| Stroke       | `info`              | `#0050AE`                           | Info border.                                                   |
| Stroke       | `error`             | `#BC1D42`                           | Error border.                                                  |
| Stroke       | `white`             | `#FFFFFF`                           | Transparent/white border state.                                |

The extracted color tokens are implemented in `src/presentation/theme/colors.ts` as `signalColorTokens`, with backward-compatible semantic aliases exported as `colors`.

The typography page from `Signal - Styles` was inspected from:

- File: `Signal - Styles`
- URL: `https://www.figma.com/design/YlPjsT9cQfUSqoZubvZMmu/Signal---Styles?node-id=135-64&m=dev`
- File key: `YlPjsT9cQfUSqoZubvZMmu`
- Node: `135:64`
- Page/canvas name: `Typography`

Extracted typography tokens:

| Token              | Size | Typeface             | Weight                 | Line Height | Letter Spacing | Usage From Signal                           |
| ------------------ | ---- | -------------------- | ---------------------- | ----------- | -------------- | ------------------------------------------- |
| `h1`               | `44` | Telkomsel Batik Sans | Bold                   | `56`        | `0`            | Header title, desktop 1440px.               |
| `h2`               | `32` | Telkomsel Batik Sans | Bold                   | `48`        | `0`            | Header title, desktop 1366px responsive.    |
| `h3`               | `28` | Telkomsel Batik Sans | Bold                   | `40`        | `0`            | Promotion/content section title on desktop. |
| `h4`               | `24` | Telkomsel Batik Sans | Bold                   | `40`        | `0`            | Header title, tablet 640px responsive.      |
| `h5`               | `18` | Telkomsel Batik Sans | Bold                   | `24`        | `0`            | Header title, mobile 375px/360px.           |
| `h6`               | `16` | Telkomsel Batik Sans | Bold                   | `24`        | `0`            | Promotion/content section title on mobile.  |
| `titleBold`        | `16` | Poppins              | Semi Bold              | `24`        | `0`            | Card title and promotion content title.     |
| `titleRegular`     | `16` | Poppins              | Regular                | `24`        | `0`            | Subtitle header section.                    |
| `body1Bold`        | `14` | Poppins              | Semi Bold              | `20`        | `0`            | Description body text.                      |
| `body1Regular`     | `14` | Poppins              | Regular                | `20`        | `0`            | Description body text.                      |
| `body1CapsBold`    | `14` | Poppins              | Semi Bold              | `20`        | `0`            | Label, ribbon, caps highlight text.         |
| `body1CapsRegular` | `14` | Poppins              | Regular                | `20`        | `0`            | Label and ribbon text.                      |
| `strikeNumber`     | `12` | Poppins              | Regular, strikethrough | `20`        | `0`            | Discount price.                             |
| `body2Bold`        | `12` | Poppins              | Semi Bold              | `20`        | `0`            | Description text in cards.                  |
| `body2Regular`     | `12` | Poppins              | Regular                | `20`        | `0`            | Description text in cards.                  |
| `labelBold`        | `10` | Poppins              | Semi Bold              | `16`        | `0`            | Card labels.                                |
| `labelRegular`     | `10` | Poppins              | Regular                | `16`        | `1.5`          | Card labels.                                |

Typography tokens are implemented in `src/presentation/theme/typography.ts`.

The shadow page from `Signal - Styles` was inspected from:

- File: `Signal - Styles`
- URL: `https://www.figma.com/design/YlPjsT9cQfUSqoZubvZMmu/Signal---Styles?node-id=252-44&m=dev`
- File key: `YlPjsT9cQfUSqoZubvZMmu`
- Node: `252:44`
- Page/canvas name: `Shadow`

Extracted shadow tokens:

| Token        | Figma Effect | Color       | Offset | Radius | Spread | React Native Guidance                                          |
| ------------ | ------------ | ----------- | ------ | ------ | ------ | -------------------------------------------------------------- |
| `low`        | Low          | `#9E9E9E33` | `0, 2` | `2`    | `0`    | Small cards and lightweight raised surfaces.                   |
| `elevation2` | Elevation 2  | `#9E9E9E40` | `0, 4` | `4`    | `0`    | Stronger card elevation when shown in the Low variant context. |
| `high`       | High         | `#9E9E9E33` | `4, 0` | `4`    | `0`    | Prominent raised surfaces.                                     |

Shadow tokens are implemented in `src/presentation/theme/shadows.ts`.

## 7. Mobile Component Tokens

These mobile-only component references were extracted from `Signal - Web 1.1`.

### Mobile Button

Source:

- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?node-id=2-12&m=dev`
- Page/canvas: `Button`
- Main node: `2:12`

Extracted mobile button variants:

| Variant   | Node         | Size   | Width | Height | Radius | Text                     | Colors                                   |
| --------- | ------------ | ------ | ----- | ------ | ------ | ------------------------ | ---------------------------------------- |
| Primary   | `224:359719` | Large  | `328` | `40`   | `100`  | Poppins SemiBold `14/20` | bg `#ED0226`, text/icon `#FFFFFF`        |
| Secondary | `224:359725` | Large  | `328` | `40`   | `100`  | Poppins SemiBold `14/20` | bg `#FFFFFF`, border/text/icon `#FF0025` |
| Text      | `224:359729` | Large  | `103` | `40`   | `100`  | Poppins SemiBold `14/20` | text/icon `#0050AE`                      |
| Primary   | `224:359827` | Medium | `328` | `32`   | `100`  | Poppins SemiBold `12/20` | bg `#ED0226`, text/icon `#FFFFFF`        |
| Primary   | `224:359881` | Small  | `87`  | `20`   | `100`  | Poppins SemiBold `10/16` | bg `#ED0226`, text/icon `#FFFFFF`        |

Button implementation:

- `src/presentation/theme/components.ts`
- `src/presentation/components/SignalButton.tsx`

MBC usage:

- Use primary buttons for the main NFC action per role.
- Use secondary buttons for cancel/secondary actions.
- Use text buttons only for low-emphasis links or helper actions.
- For mobile MBC screens, prefer large full-width buttons for NFC scan/write actions.

### Mobile Option Card

Source:

- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?node-id=2502-133549&m=dev`
- Page/frame: `Component - Card List`
- Main node: `2502:133549`

Extracted mobile option-card variants:

| State    | Node         | Width | Min Height | Padding                        | Radius | Colors                                         |
| -------- | ------------ | ----- | ---------- | ------------------------------ | ------ | ---------------------------------------------- |
| Default  | `676:672573` | `327` | `44`       | `16` horizontal, `12` vertical | `8`    | bg `#FFFFFF`, border `#CCD1D9`, text `#001A41` |
| Selected | `676:672575` | `327` | `44`       | `16` horizontal, `12` vertical | `8`    | bg `#E9F6FF`, border `#CCD1D9`, text `#001A41` |
| Disabled | `676:672577` | `327` | `44`       | `16` horizontal, `12` vertical | `8`    | bg `#F1F1F4`, border `#CCD1D9`, text `#B3BAC6` |

Option-card implementation:

- `src/presentation/theme/components.ts`
- `src/presentation/components/SignalOptionCard.tsx`

MBC usage:

- Use for activity selection, role options, payment/top-up choices, and entry-point style selections.
- Use selected state for active role/activity selection.
- Use disabled state when an action is not currently valid.

### Mobile Bottom Sheet

Source:

- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?node-id=4-64444&m=dev`
- Page/canvas: `Bottomsheet & Modals`
- Main node: `4:64444`

Extracted mobile bottom-sheet rules:

| Area              | Node      | Value                                                                                                                   |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Overlay           | `4:66557` | Dark blue `#001A41` at `50%` opacity                                                                                    |
| Header close-only | `4:66497` | Width `375`, top padding `24`, horizontal padding `24`, bottom padding `16`, extracted header radius `16`               |
| Header with title | `4:66499` | Width `375`, title max `2` lines, close button top right, title typography `Telkomsel Batik Sans Bold 19/28`            |
| Sticky CTA        | `4:66533` | Width `375`, content width `327`, top padding `16`, horizontal padding `24`, bottom padding `32`, gap `12`, high shadow |
| Full mobile sheet | metadata  | Device width `360` to `375`, max height `660`, full-page max height `720`                                               |
| Usage rule        | metadata  | Bottom sheet top-left/top-right corner radius should be `20`                                                            |

Bottom-sheet implementation:

- `src/presentation/theme/components.ts`
- `src/presentation/components/SignalBottomSheet.tsx`

MBC usage:

- Use for confirmation, insufficient-balance recovery, card-read details, and action result details.
- Use CTA sticky area when the next action must stay visible.
- If a message does not need further action, hide close button and use a single acknowledgement CTA.
- If CTA label is longer than 14 characters, stack buttons vertically.

### Mobile Loader

Source:

- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?node-id=4418-25&m=dev`
- Page/canvas: `Skeleton Load`
- Main node: `4418:25`

Extracted loader variants:

| Variant         | Node         | Size                       | Radius | Colors                                                                         |
| --------------- | ------------ | -------------------------- | ------ | ------------------------------------------------------------------------------ |
| Title skeleton  | `4459:43868` | `227 x 5`, max width `360` | `0`    | fill `#E9E8ED`                                                                 |
| Card skeleton   | `4459:44849` | `604 x 88`                 | `8`    | bg `#FFFFFF`, border `#CCD1D9`, skeleton fill `#E9E8ED`, avatar fill `#CCCFD3` |
| Button skeleton | `4461:45888` | `280 x 40`                 | `40`   | fill `#E9E8ED`                                                                 |

Loader implementation:

- `src/presentation/theme/components.ts`
- `src/presentation/components/SignalSkeleton.tsx`

MBC usage:

- Use title skeletons for short loading labels.
- Use button skeletons while primary NFC actions are preparing.
- Use card skeletons for Scout transaction/history or Station/Gate result panels while reading.

### Mobile Text Field

Source:

- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?node-id=4-57057&m=dev`
- Page/canvas: `Text Field`
- Main node: `4:57057`

Extracted text-field variants:

| State   | Node          | Width | Height | Padding                       | Radius | Border / Background            | Text                                         |
| ------- | ------------- | ----- | ------ | ----------------------------- | ------ | ------------------------------ | -------------------------------------------- |
| Enabled | `1891:277650` | `328` | `40`   | `12` horizontal, `8` vertical | `8`    | bg `#FFFFFF`, border `#CCCFD3` | label/value `#001A41`, placeholder `#B3BAC6` |
| Focused | `4:57244`     | `328` | `40`   | `12` horizontal, `8` vertical | `8`    | bg `#FFFFFF`, border `#0050AE` | value `#001A41`                              |
| Error   | `4:57248`     | `328` | `40`   | `12` horizontal, `8` vertical | `8`    | bg `#FFFFFF`, border `#BC1D42` | helper `#BC1D42`                             |
| Success | `4:57250`     | `328` | `40`   | `12` horizontal, `8` vertical | `8`    | bg `#FFFFFF`, border `#008E53` | helper `#008E53`                             |
| Load    | `4:57252`     | `328` | `40`   | `12` horizontal, `8` vertical | `8`    | bg `#EDECF0`, border `#CCCFD3` | placeholder `#B3BAC6`, loader icon `24`      |

Text-field implementation:

- `src/presentation/theme/components.ts`
- `src/presentation/components/SignalTextField.tsx`

MBC usage:

- Use for Station member registration fields, top-up amount, simulation-time input, and filter/search fields if needed.
- Use error state for invalid amount, invalid member data, or required fields.
- Use load state while a field is locked during NFC read/write processing.

### Mobile Icon Rules

Source:

- URL: `https://www.figma.com/design/zw3drt0BTUTWyypdMWJ0VM/Signal---Web-1.1?node-id=113-302768&m=dev`
- Page/canvas: `Icon`
- Main node: `113:302768`

Extracted icon rules:

| Rule                                          | Value                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------- |
| Icon purpose                                  | Supportive visual elements, not primary content.                      |
| Icon families                                 | System icons and product icons.                                       |
| Major system icon size                        | `24 x 24`                                                             |
| Compact/control icon sizes used by components | `20 x 20` and `16 x 16`                                               |
| Product icon colors                           | primary `#001A41`, red `#FF0025`, white `#FFFFFF`, disabled `#4E5764` |
| System icon colors                            | valid `#008E53`, info `#0050AE`, error `#DB2941`, warning `#FDA22B`   |

Useful system icons from the Signal page:

- `ico_search`
- `ico_check`
- `ico_success`
- `ico_success_filled`
- `ico_failed_filled`
- `ico_close`
- `ico_plus`
- `ico_minus`
- `ico_chevron_down`
- `ico_chevron_left`
- `ico_chevron_right`
- `ico_chevron_up`
- `ico_arrow_left`
- `ico_arrow_right`
- `ico_history`
- `ico_repeat`
- `ico_info`
- `ico_warning`
- `ico_help`
- `ico_simcard`
- `ico_menu`
- `ico_list`
- `ico_setting`

Icon implementation reference:

- `src/presentation/theme/icons.ts`

Open-source implementation fallback:

- If exact Signal icon assets are not available to the React Native team, use a consistent 24px rounded-stroke icon family such as Lucide or Phosphor as the implementation fallback.
- Lucide is preferred for first implementation because it provides a React Native package and uses a clean 24px stroke style that is close to the extracted Signal system-icon behavior.
- Keep icon use supportive: icons may clarify role, NFC action, status, balance, history, and recovery states, but must not replace required text labels.
- Use one icon style per screen; do not mix filled, duotone, and stroke icons in the same control group.
- Use icons with clear operational meaning: NFC/card for tap actions, user for member display, wallet for balance/top-up, check for success, alert for blocked/error, search for Scout inspect, clock/history for logs and simulation, lock/shield for protected/internal values.

Mobile app component decision:

- Alerts may use default React Native alert behavior for the first implementation; Signal-specific alert styling can be revisited later.
- Navigation may use default React Native navigation patterns first; custom Signal navigation can be designed when the route structure is finalized.
- Badge and label components may be created by the project team using the extracted Signal colors, typography, radius, and spacing tokens.
- Icons should follow the Signal icon page rules from this section whenever icons are needed in buttons, status rows, bottom sheets, cards, role selectors, or scan results.

MBC icon mapping:

| MBC Use                 | Signal Icon                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| Station/register/top-up | `ico_plus`; fallback `UserPlus` / `Wallet`                                |
| Gate/check-in           | `ico_check`; fallback `LogIn` / `CheckCircle`                             |
| Terminal/check-out      | `ico_success`; fallback `LogOut` / `ReceiptText`                          |
| Scout/read card         | `ico_search`; fallback `Search`                                           |
| NFC scan/card           | `ico_simcard`; fallback `ScanLine` / `Contactless` / `CreditCard`         |
| Transaction history     | `ico_history`; fallback `History` / `Clock`                               |
| Success status          | `ico_success_filled`; fallback `CircleCheck`                              |
| Error status            | `ico_failed_filled`; fallback `CircleX` / `TriangleAlert`                 |
| Warning status          | `ico_warning`; fallback `TriangleAlert`                                   |
| Info/help               | `ico_info` / `ico_help`; fallback `Info` / `CircleHelp`                   |
| Protected/internal data | fallback `Lock` / `ShieldCheck`                                           |
| Close sheet/modal       | `ico_close`; fallback `X`                                                 |
| Back/next               | `ico_arrow_left` / `ico_arrow_right`; fallback `ArrowLeft` / `ArrowRight` |

The card component at Figma node `213:348377` was successfully inspected.

Extracted card tokens:

| Token                  | Value                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Component name         | `.Master Card Jelajah / Desktop`                                                   |
| Width                  | `292`                                                                              |
| Image height           | `164`                                                                              |
| Radius                 | `20`                                                                               |
| Background             | `Background Color/bg-warm`, `#F6F3F3`                                              |
| Primary text           | `Text/text-primary`, `#001A41`                                                     |
| Secondary body text    | `#4E5764`                                                                          |
| Border muted           | `#CCD1D9`                                                                          |
| Low shadow             | `#9E9E9E33`, offset `0, 2`, radius `2`                                             |
| Title typography       | `Poppins`, SemiBold, size `14`, weight `600`, line height `20`, letter spacing `0` |
| Body/meta typography   | `Poppins`, Regular, size `12`, weight `400`, line height `20`, letter spacing `0`  |
| Small label typography | `Poppins`, Regular, size `10`, weight `400`, line height `16`, letter spacing `0`  |

Generated React Native reference:

- `src/presentation/theme/colors.ts`
- `src/presentation/theme/typography.ts`
- `src/presentation/theme/shadows.ts`
- `src/presentation/theme/spacing.ts`
- `src/presentation/theme/radius.ts`
- `src/presentation/theme/components.ts`
- `src/presentation/theme/icons.ts`
- `src/presentation/components/SignalButton.tsx`
- `src/presentation/components/SignalOptionCard.tsx`
- `src/presentation/components/SignalBottomSheet.tsx`
- `src/presentation/components/SignalSkeleton.tsx`
- `src/presentation/components/SignalTextField.tsx`
- `src/presentation/components/SignalJelajahCard.tsx`

Remaining exact Signal values are not yet fully extracted because earlier broad Figma inspection returned a plan/tool-call limit.

Pending extraction after mobile focus:

- Full spacing scale beyond the extracted mobile component values.
- Full radius scale beyond the extracted card, option-card, button, and bottom-sheet values.
- Signal-specific alert/toast/status component variants, if the project decides default React Native alert is not enough.
- Badge/label variants, if future Figma references are provided; first implementation may be project-owned using current tokens.
- Signal-specific navigation component variants, after route structure is finalized.
- Mobile-specific patterns from `Signal - App Kit`.

Until extraction is complete, implementation may use a restrained provisional Signal-like UI, but it must isolate visual tokens in a theme file so the real Signal tokens can replace them later.

## 8. Implementation Guidance

Create a presentation theme layer before building role screens:

```txt
src/presentation/theme/
  colors.ts
  typography.ts
  shadows.ts
  spacing.ts
  radius.ts
  components.ts
  icons.ts
```

The first version may contain provisional values, but names should be semantic so Signal tokens can be swapped in without rewriting screens.

Suggested semantic token names:

- `color.background`
- `color.surface`
- `color.surfaceMuted`
- `color.textPrimary`
- `color.textSecondary`
- `color.border`
- `color.primary`
- `color.success`
- `color.warning`
- `color.danger`
- `color.info`

Component styling should import tokens only from the theme layer. Role screens should not hardcode raw colors, font sizes, spacing, or radius values.

## 9. Next Figma Inspection Steps

When the Figma tool limit resets or broader access is available:

1. Inspect local variables and styles from the Signal file.
2. Capture the exact color, typography, spacing, radius, and elevation tokens.
3. Inspect primary component sets for buttons, inputs, navigation, lists, alerts, badges, cards/panels, and icons.
4. Update this guide with exact token values.
5. Update `.codex/specs/TASKS.md` acceptance criteria for T-026 with the extracted token checklist.
