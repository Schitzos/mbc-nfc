# KDX Membership Benefit Card Decision Log

This document records architecture and product decisions. Use ADR-style entries.

## ADR-001 Use React Native CLI

Status: Accepted

Decision:

Use React Native CLI instead of Expo managed workflow.

Reason:

The prototype needs direct NFC native module access through `react-native-nfc-manager`, including read/write behavior and platform-specific NFC configuration.

Consequences:

- Native setup is more involved.
- NFC configuration is explicit.
- Easier to add platform-specific behavior.

## ADR-002 Use One App With Four Roles

Status: Accepted

Decision:

Build one application that switches between Station, Gate, Terminal, and Scout modes.

Reason:

The assessment requires one app that can change role based on operational context.

Consequences:

- Shared card use cases and codec can be reused.
- UI must clearly show the active role.

## ADR-003 Treat NFC Card as Core Data Store

Status: Accepted

Decision:

Store member identity, balance, active activity/visit state, and latest five logs on the card payload.

Reason:

The assessment emphasizes offline-first operation without central database access.

Consequences:

- Card memory is a design constraint.
- Write integrity becomes critical.
- Payload format must be compact and versioned.

## ADR-004 Use Clean Architecture

Status: Accepted

Decision:

Use domain, application, infrastructure, and presentation layers.

Reason:

Activity tariff calculation, visit state, transaction log trimming, and card encoding rules should be testable without React Native or NFC hardware.

Consequences:

- More files than a quick prototype.
- Easier to test and explain in presentation.

## ADR-005 Add Silent Shield Codec

Status: Accepted

Decision:

Sensitive fields such as identity and balance must be protected through a codec abstraction instead of plain NFC text.

Reason:

The brief requires data privacy so sensitive data cannot be read plainly by other NFC apps.

Consequences:

- Codec validation and failure handling are required.
- Assessment implementation must use authenticated encryption and secure key configuration; real cooperative production still needs fleet key management and rotation.

## ADR-006 Use Rp 2.000 Started-Hour Tariff for Parking MVP

Status: Accepted

Decision:

The required parking MVP checkout fee defaults to Rp 2.000 per started hour, rounded up.

Reason:

This is an explicit technical constraint in the assessment brief. Other cooperative activities should be able to define their own tariff rules later.

Consequences:

- Parking tariff calculator must use ceiling-hour behavior for the required parking MVP.
- Unit tests must cover partial-hour examples.

## ADR-007 Keep Guest Flow Out of Scope

Status: Accepted

Decision:

Do not implement non-member/guest flow.

Reason:

The brief states guest mode is outside the project scope. It describes a separate manual guest path with Rp 50.000 per hour pricing, but this app focuses on registered cooperative members.

Consequences:

- UI and domain logic focus only on registered cooperative members.

## ADR-008 Generate Internal Member ID

Status: Accepted

Decision:

Generate the internal member ID during Station registration instead of asking staff to type it.

Reason:

The member ID is a system identifier for card integrity, traceability, and payload structure. Manual entry increases operator burden, typo risk, duplicate risk, and unnecessary exposure of an internal identifier.

Consequences:

- Station registration does not require human-readable member profile input.
- The generated member ID is written into the protected card payload.
- Normal Station, Gate, Terminal, and Scout screens do not show the full internal member ID.
- If support or recovery needs a reference, the app may show a masked or shortened member reference.

## ADR-009 Use Open-Source Stroke Icons as Fallback

Status: Accepted

Decision:

Use Signal icons when exact assets are available. If they are not available during implementation, use a consistent open-source rounded-stroke icon family, preferably Lucide for the first React Native build.

Reason:

The app needs clearer NFC, status, member, balance, history, and recovery cues, but iconography must remain implementation-friendly and visually consistent with the Signal system icon direction.

Consequences:

- Icons remain supportive and must be paired with text for operational clarity.
- React Native FE can map the design to `lucide-react-native` or an equivalent package.
- Do not mix multiple icon styles inside the same role screen or control group.
- Product scope and business behavior do not change because this is visual polish only.

## ADR-010 Apply Signal UI Direction

Status: Accepted

Decision:

Use the Signal UI design system direction for the frontend experience. The active Figma source is documented in `.codex/specs/SIGNAL_UI_GUIDE.md`.

Reason:

The assessment deliverables explicitly require applying the Signal UI design system.

Consequences:

- Role screens should be visually consistent.
- Station must remain simple enough for cooperative staff.
- Demo capture should show the UI system clearly.
- Exact design tokens should be extracted from Figma before final UI hardening.
- Until exact tokens are extracted, provisional theme values must be isolated in the presentation theme layer.

## ADR-011 Model Check-In/Check-Out as Reusable Activity Flow

Status: Accepted

Decision:

Model Gate and Terminal behavior as a reusable member activity session flow, with parking as the only required MVP activity.

Reason:

MBC development scope should support any cooperative activity that needs tap-in/tap-out, not only parking.

Consequences:

- Card state stores active activity ID/type, not a parking-only session.
- Tariff calculation accepts activity rules.
- Future cooperative activities can reuse the same Station, Gate, Terminal, and Scout foundations.

## ADR-012 Require NFC-Capable Device for Real Card Operations

Status: Accepted

Decision:

Real MBC card scan, read, and write operations require a physical NFC-capable device with NFC enabled. Non-NFC devices may open the app and may use mock/simulation flows for development or demo, but they cannot perform real card operations.

Reason:

The assessment is centered on NFC card interaction. A device without NFC hardware cannot scan, read, or write the physical MBC card.

Consequences:

- The app must check NFC availability before real card actions.
- Role screens must clearly tell users that NFC is required for real card operations.
- Unsupported or disabled NFC states must block real card operations with actionable guidance.
- Mock/simulation mode must be visually distinct from real NFC operation.

## ADR-013 Use Android as the First Real NFC Target

Status: Accepted

Decision:

Build and validate the first real NFC implementation on Android before targeting full iOS parity.

Reason:

Android is the safer first path for practical NFC read/write validation in this assessment. iOS support can vary by device, OS, tag type, and write capability, so it should be validated later with real hardware instead of assumed early.

Consequences:

- T-018 and T-028 prioritize Android implementation and validation first.
- iOS remains in scope for documentation and later device verification.
- Demo readiness must not depend on unverified iOS write behavior.

## ADR-014 Do Not Require Human-Readable Member Profile Fields

Status: Accepted

Decision:

Do not require human-readable member profile fields during Station registration in the first implementation round.

Reason:

The assessment brief does not require member name capture. For the first implementation round, reducing input keeps Station faster and simpler, while the protected internal `memberId` remains the true card identity inside the payload.

Consequences:

- Station registration can register a valid card without collecting member name or other profile fields.
- The protected internal `memberId` is still generated automatically by the system.
- A masked or shortened member reference may still be shown if operational support needs it.
- Additional human-readable fields can be added later without changing the core card flow.

## ADR-015 Add Device-Local SQLite Ledger For Reporting And Audit

Status: Accepted

Decision:

Add a device-local SQLite ledger for offline reporting and audit, while keeping the NFC card as the member-state source of truth.

Reason:

Card-only storage is enough for member operations, but it is not enough for Station income visibility and device-side audit reporting. SQLite gives the app a structured local history without introducing a backend dependency.

Consequences:

- The NFC card remains the authority for member balance, status, and activity state.
- SQLite becomes the authority for device-local reporting and audit history only.
- Top-up and checkout flows must append local ledger records after successful business completion.
- Reporting UI must be clearly described as device-local history, not global cooperative truth.

## ADR-016 Use Feature Branch Promotion With Main-Triggered Distribution

Status: Accepted

Decision:

Use a Git flow with `feature/*`, `develop`, and `main` branches. Each feature is implemented in its own branch, merged first into `develop` after Demo/Release Engineer review, and then promoted to `main` through a separate merge request that the Project Owner merges manually. Merging to `main` triggers GitHub Actions to publish the APK to app distribution.

Reason:

The project needs controlled delivery, review discipline, and repeatable APK distribution without making day-to-day feature work depend on manual release steps.

Consequences:

- Senior React Native FE must develop each feature in a separate feature branch.
- Feature work should open a merge request into `develop` after implementation is ready.
- Demo/Release Engineer reviews and approves merge requests into `develop`.
- Demo/Release Engineer prepares the promotion merge request from `develop` to `main`.
- Project Owner performs the final merge to `main`.
- GitHub Actions on `main` must run the distribution publish pipeline.

## ADR-017 Standardize NFC Payload v1, Production-Grade Silent Shield, And Ledger Boundary

Status: Accepted

Decision:

Use the compact NFC Card Payload v1 schema and Silent Shield v1 rules defined in `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md`.

The NFC card remains the operational source of truth for member balance and check-in/activity state. SQLite is used only as a device-local reporting and audit ledger for transactions processed by the current app/device.

Silent Shield v1 uses HMAC-SHA256 over a canonical payload without `sig`, stores the Base64Url signature in `sig`, encrypts the signed payload with AES-256-GCM or equivalent authenticated encryption, stores only a protected `mbc1` envelope on NFC, increments `ctr` after each successful card-state write, and rejects invalid decrypt/authentication/signature failures as tampered/corrupted cards.

Reason:

The previous documents described card payload, Silent Shield, and local ledger behavior at a high level. A precise schema and signing rule prevents implementation drift, reduces Codex guessing, and keeps Station/Gate/Terminal/Scout behavior consistent.

Consequences:

- Card codec, domain validation, tests, and UI DTOs must follow Payload v1.
- HMAC provides explicit integrity validation while authenticated encryption provides confidentiality; plain JSON, Base64-only, and weak obfuscation are not allowed.
- SQLite reporting totals are device-local, not global cooperative totals.
- Ledger write failure after successful card write is a reporting/audit warning, not a rollback of the member operation.

## ADR-019 Support Local Offline Tariff Management

Decision:

The parking tariff must be editable locally by authorized Station/Admin staff because the app runs offline and the APK may already be built when operational tariff changes happen. The default MVP tariff remains Rp 2.000 per started hour, and Gate reads the active tariff from local device storage at check-in instead of relying on hidden hardcoded tariff logic.

Reasoning:

Build-time config is too rigid for an offline deployed APK. A backend or remote config would violate the offline requirement. Local tariff settings allow values such as Rp 3.000 per started hour without rebuilding or requiring internet access.

Consequences:

- Add a `TariffSettingsRepository` backed by SQLite or secure local storage.
- Seed the default active tariff as Rp 2.000 per started hour.
- Gate check-in must read the current local active tariff and store a compact tariff snapshot on the card. Terminal checkout must display and use the card-stored visit tariff snapshot before deduction.
- Only authorized Station/Admin staff can update tariff.
- Tariff updates are per-device; all active offline devices must be manually configured to the same tariff.
- Future enhancement may use a signed Tariff Config NFC card to distribute tariff offline.

## ADR-020 Lock Tariff at Check-In

### Status

Accepted

### Context

The app is offline and allows authorized staff to change the active parking tariff locally after the APK has been built. A member may already be checked in when the tariff changes from Rp 2.000/hour to Rp 3.000/hour.

### Decision

The tariff used for checkout is locked at successful Gate check-in. Gate writes a compact tariff snapshot into the NFC card active visit state. Terminal checkout calculates the fee using that snapshot, not the current local tariff setting.

### Consequences

- Members already checked in are not unexpectedly charged a newer tariff.
- Local tariff changes affect only new check-ins.
- The NFC card active visit payload grows slightly, so payload capacity validation remains mandatory.
- Legacy/demo checked-in cards without snapshot require a visible warning before fallback.

## ADR-021 Firebase App Distribution as Android Release Channel

Decision: Controlled push/merge to `main` must trigger GitHub Actions to build the Android release artifact and distribute it through Firebase App Distribution.

Reason: The team needs a repeatable release path for testers and assessment review without manual APK sharing.

Impact: Demo/Release Engineer must document GitHub secrets, signing setup, Firebase app ID, tester group, and workflow failure behavior.

## ADR-022 QA Screenshot Evidence Before Feature Merge

Decision: Senior QA must validate each feature on Android simulator/device and attach screenshot evidence before the feature PR is merged, unless an approved exception is recorded.

Reason: The project needs visible proof that delivered features match the requirements, not only automated test results.

Impact: Feature delivery includes both automated tests and QA evidence. Final delivery requires a use-case evidence package with screenshots.
