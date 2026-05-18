# Chapter 1: Membership Benefit Card Requirements

## 1. Purpose

Build a frontend mobile application for the Membership Benefit Card (MBC) assessment. The app uses NFC cards as offline membership cards for a village cooperative.

The card is the portable operational source of truth. It stores member identity reference, balance, activity/visit status, write counter, Silent Shield authentication metadata, and the last five transaction logs directly on the physical NFC card so the system can work without a central database or always-on internet connection. The detailed payload, Silent Shield, and ledger rules are defined in `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md`.

The PDF uses member parking as the concrete required assessment scenario. Parking is the MVP acceptance path and must not be weakened by generic extensibility work. The MBC flow may be designed with reusable activity abstractions, but non-parking activities are a design extension and must not block or replace the required parking behavior.

## 2. Business Requirements

| ID     | Business Requirement                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-001 | The cooperative must provide modern member services even when internet connectivity is unstable.                                               |
| BR-002 | MBC must act as a portable member identity and benefit card.                                                                                   |
| BR-003 | Member identity, balance, activity status, and recent transaction history must live on the NFC card.                                           |
| BR-004 | Cooperative staff must be able to register member cards and top up balances.                                                                   |
| BR-005 | Members must be able to access cooperative benefits through tap-based entry and exit flows.                                                    |
| BR-006 | The solution should keep the flow extensible for future cooperative activities, but the required MVP/demonstration activity is member parking. |
| BR-007 | Members receive an exclusive benefit tariff for the assessment scenario: Rp 2.000 per started hour.                                            |
| BR-008 | Non-member guest flow is outside this application scope.                                                                                       |
| BR-009 | Sensitive member identity and balance must not be plainly readable by external NFC apps.                                                       |
| BR-010 | The assessment submission must include source code, working app demo, documentation, and presentation material.                                |
| BR-011 | Cooperative staff need an offline device-side audit trail and income summary for Station operations.                                           |
| BR-012 | Operators need optional on-screen NFC operational logs for troubleshooting during demo/field support.                                          |

## 3. System Requirements

| ID     | System Requirement                                                                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SR-001 | The system shall be one frontend app that can switch between Station, Gate, Terminal, and Scout roles.                                                                                                                                                                          |
| SR-002 | The system shall read and write NFC card data without requiring backend API access.                                                                                                                                                                                             |
| SR-003 | The system shall validate card payload version, structure, integrity, balance, status, and timestamps.                                                                                                                                                                          |
| SR-004 | The system shall reject unregistered, unsupported, malformed, or tampered cards.                                                                                                                                                                                                |
| SR-005 | The system shall prevent double check-in and double check-out for the active activity.                                                                                                                                                                                          |
| SR-006 | The system shall implement parking as the required MVP activity and may keep activity context configurable for future extension.                                                                                                                                                |
| SR-007 | The system shall keep the latest five transaction logs on card.                                                                                                                                                                                                                 |
| SR-008 | The system shall protect card confidentiality and integrity with Silent Shield production-grade authenticated encryption plus integrity validation, preventing direct plain NFC exposure of identity and balance.                                                               |
| SR-009 | The system shall show clear top-up guidance when balance is insufficient.                                                                                                                                                                                                       |
| SR-010 | The system shall provide a read-only Scout mode for one-tap member inspection.                                                                                                                                                                                                  |
| SR-011 | The system shall require an NFC-capable device with NFC enabled for real card scan, read, and write operations.                                                                                                                                                                 |
| SR-012 | The system shall clearly inform users when NFC is required, unsupported, disabled, scanning, or cancelled. MVP implements four availability states: SUPPORTED, UNSUPPORTED, DISABLED, UNAVAILABLE. SCAN_TIMEOUT is a session-level error code, not a device availability state. |
| SR-013 | The system shall maintain a local offline SQLite ledger for audit/reporting without replacing the NFC card as member-state authority.                                                                                                                                           |
| SR-014 | The system shall provide an optional user-visible NFC operational log panel that can be toggled on/off and cleared by the operator.                                                                                                                                             |

## 4. Scope

### In Scope

- One application that can switch between four roles:
  - The Station, for cooperative admin registration and top-up.
  - The Gate, for member activity entry/check-in.
  - The Terminal, for member activity exit/check-out and balance deduction.
  - The Scout, for member self-inspection of card contents.
- NFC read and write integration.
- NFC availability check before real card operations.
- User-facing NFC requirement and scan guidance on role screens.
- Offline-first card validation.
- Member registration to card.
- Balance top-up to card.
- Activity check-in timestamp writing.
- Activity check-out duration calculation.
- Member benefit fee deduction.
- Parking activity as the required MVP activity, with configurable activity context treated as future-friendly design support.
- Sequential flow integrity, with no double check-in or double check-out.
- Simulation mode at The Gate to set entry time in the past for testing (removed in Phase 9; Gate uses real device time only).
- Last five transaction logs stored on card.
- Local SQLite ledger for offline reporting and audit on the device.
- Sensitive data protection so identity and balance are not readable in plain form by generic NFC apps.
- Clear UI based on the Signal UI design system.
- Technical and non-technical documentation.
- Demo capture using image or short video.
- Presentation covering UI/UX design, software design, software construction, software quality, software deployment, and software security.

### Out of Scope

- Guest flow.
- Guest tariff processing.
- Backend API.
- Central database.
- Cloud sync.
- Payment gateway integration.
- Gate/barrier hardware integration.
- Guaranteed compatibility with every proprietary RFID card.
- UHF RFID support.

## 5. Assumptions

- Target cards are NFC/HF RFID cards readable and writable by supported phones.
- Real card scan, read, and write flows require a physical device with NFC hardware enabled.
- Devices without NFC cannot perform real MBC card operations. No simulation mode or mock scenario selectors are included in the production app.
- Android is the primary MVP NFC read/write validation target, using ASUS ROG Phone 9 FE (Android 14+) as the validated real-device test baseline.
- iOS NFC read/write is out of MVP and may be treated as best-effort/read-only unless validated later on real device.
- The MVP target NFC tag is NTAG215. NFC payload design, card capacity validation, and real-card tests must be validated against NTAG215 behavior and capacity.
- The app is allowed to simulate card data during development, but final validation should use real NFC hardware.
- The card payload must follow NFC Card Payload v1 in `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md` and must be protected by Silent Shield.
- SQLite is a device-local reporting and audit store only; it does not replace the NFC card as the member-state source of truth and must never override card balance/status/activity state.
- Parking is the required assessment activity. The same flow may be reusable for other cooperative activities, but non-parking activity behavior is not an MVP blocker.
- If member balance is insufficient at The Terminal, the member should be directed to top up at The Station before completing the activity exit.
- Non-members use a separate manual guest process and are outside this project.
- The PDF states the guest path charges Rp 50.000 per hour and uses a separate limited/manual gate; the app should document this context but not implement it.
- Internet access must not be required for core membership, balance, activity entry, or activity exit flows.
- Device clock correctness matters for check-in/check-out duration.

## 6. User Stories

| ID     | User Story                                                                                                     | Priority |
| ------ | -------------------------------------------------------------------------------------------------------------- | -------- |
| US-001 | As a cooperative admin, I can register a member card at The Station.                                           | Must     |
| US-002 | As a cooperative admin, I can top up a member balance at The Station.                                          | Must     |
| US-003 | As a gate operator, I can check in a member to an activity by tapping the card at The Gate.                    | Must     |
| US-004 | As a gate operator, I can check in a member using real device time (simulation mode removed).                  | Must     |
| US-005 | As a terminal operator, I can check out a member from an activity by tapping the card at The Terminal.         | Must     |
| US-006 | As a terminal operator, I can see activity duration and fee after successful checkout tap.                     | Must     |
| US-007 | As a terminal operator, I can block checkout when balance is insufficient and show clear top-up guidance.      | Must     |
| US-008 | As a member, I can inspect my card through The Scout to see balance, status, and history.                      | Must     |
| US-009 | As the system, I prevent double check-in and double check-out.                                                 | Must     |
| US-010 | As the system, I keep only the latest five card transaction logs.                                              | Must     |
| US-011 | As the system, I protect identity and balance from plain NFC reading.                                          | Must     |
| US-012 | As an evaluator, I can review source code, demo evidence, documentation, and presentation material.            | Must     |
| US-013 | As a developer, I can reuse the check-in/check-out flow for activities beyond parking.                         | Should   |
| US-014 | As a cooperative admin, I can view offline income and transaction summaries on the device used at The Station. | Must     |
| US-015 | As an operator, I can enable or disable an NFC log panel and clear log lines for troubleshooting.              | Should   |

## 7. Functional Requirements

### FR-001 Role Switching

The app shall provide one frontend application that can switch between Station, Gate, Terminal, and Scout roles.

Acceptance criteria:

- User can select the active role.
- Each role shows only the actions relevant to that role.
- Role switching does not corrupt card state.

### FR-002 Station Registration

The Station shall register a member card.

Acceptance criteria:

- The system generates the internal member ID automatically during registration.
- The registration flow may complete without collecting human-readable member profile fields.
- The registration form does not require staff to type a member ID.
- Normal member/operator screens do not expose the full internal member ID; if a support reference is needed, the app may show a masked or short reference only. Scout may show a safe member reference after successful decode, not the raw full identifier.
- App writes a valid MBC payload to the NFC card.
- If the card is already registered with a valid MBC payload, the app shows a confirmation prompt offering to wipe and re-register with a new member ID. If the user confirms, the card is erased and registered fresh. If the user declines (Skip), no modification is made.
- If the card has an unrecognized or tampered payload, the app shows an error. At Station, unrecognized (non-MBC) payloads show the confirmation prompt offering to wipe and re-register. Tampered authenticated payloads (Silent Shield integrity failure) show a `CARD_TAMPERED` error without a reset prompt.
- New card starts with zero balance and `NOT_CHECKED_IN` visit status. No initial balance field is presented.
- Registration writes a transaction log entry.

### FR-003 Station Top-Up

The Station shall top up member balance.

Acceptance criteria:

- Top-up accepts numeric input (free-text allowed) with validation to ensure only numbers are entered. Preset buttons (10.000, 20.000, 50.000, or 100.000 IDR) are also available as shortcuts.
- Amount must be positive.
- App reads current balance, adds the amount, and writes the new balance to card.
- Top-up writes a transaction log entry with nominal, time, and activity.

### FR-004 Gate Check-In

The Gate shall write activity check-in state to the card.

Acceptance criteria:

- App reads a registered member card.
- Operator can use the default parking activity or another configured activity context.
- If the card is not currently checked in, app writes activity ID, entry timestamp, and checked-in status.
- If the card is already checked in, app rejects the action as double check-in.
- Check-in writes a transaction log entry.

### FR-005 Gate Simulation Mode (Removed)

Gate simulation mode was removed in Phase 9. The Gate now uses real device time for check-in timestamps. This simplifies the Gate flow and removes mock scenario selectors from all screens.

### FR-006 Terminal Check-Out

The Terminal shall calculate activity duration, fee, and deduct balance.

Acceptance criteria:

- App reads checked-in member card.
- App calculates duration from entry timestamp to exit timestamp.
- App rejects checkout with `INVALID_TIME` / `INVALID_DURATION` when exit time is not after entry time.
- For the parking MVP, the default tariff is Rp 2.000 per started hour.
- The MVP parking tariff is fixed at Rp 2.000 per started hour and must be implemented through one isolated tariff constant/module, not repeated magic numbers across checkout code.
- Terminal must display the fixed MVP tariff, charged hours, and calculated fee immediately after successful checkout tap (single-session NFC model: read+calculate+deduct+write is atomic).
- Example: 1 hour 5 minutes 1 second is charged as 2 hours.
- App deducts fee from card balance when balance is sufficient.
- App clears visit status after successful checkout.
- Checkout writes a transaction log entry.

### FR-007 Insufficient Balance

The Terminal shall handle insufficient balance safely.

Acceptance criteria:

- App does not clear checked-in status when balance is insufficient.
- App does not deduct partial balance.
- App shows clear instruction to top up at The Station.
- After Station top-up, the same card remains checked in and Terminal checkout can be retried successfully.
- The queue flow is not blocked by ambiguous messaging.

### FR-008 Scout Card Inspection

The Scout shall read a member card for self-inspection.

Acceptance criteria:

- Member can inspect the card with one NFC tap.
- Member can see balance.
- Member can see current visit status.
- Member can see last five transaction logs.
- Scout does not modify card data.

### FR-009 Transaction Logs

The card shall store the last five transaction logs.

Acceptance criteria:

- Each log includes nominal, time, and activity.
- New logs use FIFO latest-five behavior: when adding a sixth transaction, remove the oldest record and keep the five newest records.
- When more than five logs exist, the oldest log is removed.

### FR-010 Silent Shield

The app shall protect sensitive card data.

Acceptance criteria:

- Identity and balance are not stored in plain readable text.
- The protected payload uses the defined Silent Shield v1 codec: compact canonical logical payload encrypted with AES-256-GCM or equivalent authenticated encryption. Plain JSON, Base64-only, or weak obfuscation is not acceptable.
- Generic NFC apps cannot read sensitive fields directly.
- App can still decode and validate card payload.
- Debug logs do not expose sensitive decoded data.

### FR-011 Assessment Deliverables

The project shall include the required assessment deliverables.

Acceptance criteria:

- Source code is prepared for a GitHub or GitLab repository link.
- Working frontend app has no error or crash in the main demo flows.
- Demo evidence is prepared as image capture or short video.
- Technical and non-technical documentation are available.
- Presentation covers UI/UX design, software design, software construction, software quality, software deployment, and software security.

### FR-012 Activity Extensibility

The app shall implement the required parking flow first and keep the domain model friendly to future activity extension.

Acceptance criteria:

- Parking is the required MVP and assessment acceptance path.
- Card state stores the active activity identifier/type, with `PARKING` as the required initial value.
- Tariff calculation uses the fixed parking MVP rule only: Rp 2.000 per started hour.
- Domain names and use cases may use reusable activity wording, but non-parking activities must not delay or replace the required parking MVP.

### FR-013 Local Offline Ledger and Reporting

The app shall maintain a device-local SQLite ledger for offline audit and reporting.

Acceptance criteria:

- Successful `REGISTER`, `TOPUP`, and `CHECKOUT` card-state operations append a local ledger record on the device that processed the operation. Check-in (CHECKIN) does NOT append a local ledger row.
- The ledger stores enough data to produce offline transaction count and income/reporting summaries without reading every card again.
- Income reports sum only money-related rows, especially `TOPUP` and `CHECKOUT`.
- Station reporting reflects operations processed on this device. It is not a global cooperative report when multiple devices are used.
- The ledger does not replace the NFC card as the member-state source of truth.
- If local ledger write fails after a successful card write, the member operation remains successful but the app reports the reporting/audit gap clearly.
- Station can view at least a simple local summary of transaction counts, top-up totals, and checkout totals for that device.

### FR-014 Fixed Parking MVP Tariff

The app shall use the fixed assessment tariff defined in the original PDF: Rp 2.000 per started hour.

Acceptance criteria:

- Parking is the only MVP tariff scenario.
- Fee calculation rounds up to the next started hour.
- The Rp 2.000 rate is defined in one isolated tariff module/constant, not duplicated as hidden magic numbers across UI code.
- Terminal checkout displays the fixed tariff, charged started hours, and calculated fee immediately after successful tap.

### FR-015 Operational Edge Case Handling

The app shall explicitly handle common offline/NFC operational edge cases so field users and assessors see deterministic behavior instead of hidden failure.

Acceptance criteria:

- Gate uses real device time for check-in; simulation mode is not part of production flow.
- If the device clock causes checkout time to be earlier than or equal to check-in time, checkout is rejected before any balance deduction.
- If a card is removed during write, `writeNdefMessage` throws and success is not shown.
- If SQLite/local reporting data is deleted, the card remains operational source of truth but local reports for that device may be incomplete.
- Unsupported card, unsupported payload version, tampered payload, capacity failure, and write verification failure must produce clear recovery guidance.

### FR-016 NTAG215 Target Tag and Compact Payload

The MVP shall target NTAG215 as the primary writable NFC tag/card type.

Acceptance criteria:

- NTAG215 is documented as the MVP target NFC tag.
- Card payload must be compact and capacity-tested before write.
- If protected/encrypted payload cannot fit NTAG215, the app reduces optional payload size before reducing security.
- The app must not remove required identity, balance, active visit, or latest five transaction history data to fit capacity.
- If the payload still cannot fit, the app blocks write with `CARD_CAPACITY_INSUFFICIENT`.

### FR-017 NFC Operational Log Panel (Toggleable)

The app shall provide a user-visible NFC operational log panel for troubleshooting and demo support.

Acceptance criteria:

- The log panel is available in role screens that execute NFC actions (Station, Gate, Terminal, Scout).
- The log panel can be toggled on/off by the user without restarting the app.
- The log panel provides a clear action to remove current log lines.
- Log lines include timestamp and short operational event text (scan start, read, write, cancel, success, error).
- Log lines must not expose sensitive secrets, raw decrypted payloads, full private identifiers, or private keys.
- The log panel is an operator troubleshooting aid; it does not replace card transaction logs and does not mutate card business state.

## 8. Non-Functional Requirements

| ID      | Category                         | Requirement                                                                                                                                                                                                                                                         |
| ------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-001 | Offline support                  | Core flows work without internet or external API.                                                                                                                                                                                                                   |
| NFR-002 | Integrity                        | Card state prevents invalid sequential actions.                                                                                                                                                                                                                     |
| NFR-003 | Reliability                      | NFC read/write sessions are cleaned up after success, cancel, timeout, or error.                                                                                                                                                                                    |
| NFR-004 | Usability                        | Station UI is simple enough for cooperative staff.                                                                                                                                                                                                                  |
| NFR-005 | Maintainability                  | Business rules are independent from React Native and NFC library details.                                                                                                                                                                                           |
| NFR-006 | Android-first NFC portability    | MVP NFC read/write is validated on Android 9 FE with NTAG215. iOS is deferred or best-effort/read-only unless separately validated.                                                                                                                                 |
| NFR-007 | Privacy                          | Sensitive member identity and balance are protected.                                                                                                                                                                                                                |
| NFR-008 | Testability                      | Parking tariff, card state, logs, and encoding rules are testable without hardware.                                                                                                                                                                                 |
| NFR-009 | Quality                          | Working frontend app must not crash during demo flows.                                                                                                                                                                                                              |
| NFR-010 | UI system                        | The frontend applies the Signal UI design system direction required by the brief.                                                                                                                                                                                   |
| NFR-011 | Device clarity                   | The app clearly communicates that real card operations require NFC hardware and shows actionable guidance when NFC is unavailable or disabled.                                                                                                                      |
| NFR-012 | Data separation                  | NFC card member state and local device audit/reporting data remain clearly separated.                                                                                                                                                                               |
| NFR-013 | Coverage target                  | Automated unit-test coverage should reach at least 90% across the whole executable repository source, excluding only pure type-only contract files and generated artifacts. Actual achievement: 100% line coverage with 444+ automated tests across 65 test suites. |
| NFR-014 | Static quality gate              | The project should integrate with SonarCloud and target a passing quality gate with strong maintainability, reliability, and security ratings.                                                                                                                      |
| NFR-015 | Branching and release automation | The project shall use feature branches with controlled promotion to `develop` and `main`, and merging to `main` shall trigger automated APK app-distribution publishing.                                                                                            |
| NFR-016 | Dependency vulnerability gate    | After installing or changing libraries, `npm audit` shall report 0 known vulnerabilities before the task is considered done.                                                                                                                                        |
| NFR-017 | NTAG215 capacity compatibility   | NTAG215 is the MVP target tag. The protected compact payload must fit NTAG215 or fail safely with `CARD_CAPACITY_INSUFFICIENT`.                                                                                                                                     |
| NFR-018 | Write verification               | Every real NFC write relies on `writeNdefMessage` throwing on failure. Capacity is checked before write. No post-write readback (codec lossy round-trip).                                                                                                           |
| NFR-023 | Troubleshooting observability    | NFC operational logging in UI must be concise, optional (toggleable), clearable, and safe (no sensitive payload disclosure).                                                                                                                                        |

## 9. Security Requirements

- Do not store identity and balance as plain readable NFC text.
- Use Silent Shield production-grade authenticated encryption for sensitive card payload fields; Base64-only or plain JSON storage is not allowed.
- Validate payload version, structure, timestamps, balance, and status before writing.
- Reject malformed, unsupported, or tampered payloads safely.
- Do not log raw sensitive identity, balance, or encoded secrets.
- Keep NFC and card encoding logic isolated from presentation code.
- For assessment MVP, an app-bundled demo AES key is allowed only as a clearly documented demo secret. Production must move key handling to secure provisioning and/or Android hardware-backed Keystore. Do not commit production secrets to the repository.
- Do not store full sensitive identity in the local ledger when a masked or shortened reference is enough for reporting/audit.
- Do not store admin PINs or local authorization secrets in plain text.

## 10. Error Requirements

| Code                       | Meaning                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| NFC_UNSUPPORTED            | Device does not support NFC.                                     |
| NFC_DISABLED               | NFC is turned off.                                               |
| SCAN_CANCELLED             | Operator cancelled scan.                                         |
| SCAN_TIMEOUT               | No tag found in time.                                            |
| CARD_UNREGISTERED          | Card does not contain a valid registered MBC payload.            |
| ALREADY_REGISTERED_CARD    | Card is already registered; registration is rejected.            |
| CARD_UNSUPPORTED           | Card technology or payload format is unsupported.                |
| CARD_TAMPERED              | Card payload cannot be verified or decoded safely.               |
| DOUBLE_CHECK_IN            | Card is already checked in.                                      |
| DOUBLE_CHECK_OUT           | Card is not currently checked in.                                |
| INSUFFICIENT_BALANCE       | Balance is lower than calculated fee.                            |
| ACTIVITY_ALREADY_ACTIVE    | Card already has an active activity session.                     |
| ACTIVITY_NOT_ACTIVE        | Card has no active activity session to check out.                |
| WRITE_FAILED               | NFC card write failed.                                           |
| READ_FAILED                | NFC card read failed.                                            |
| CARD_CAPACITY_INSUFFICIENT | Protected payload does not fit the selected NFC tag/card.        |
| INVALID_TIME               | Device or simulated time is invalid for the requested operation. |
| INVALID_DURATION           | Checkout time is not after check-in time.                        |

## 11. Prototype Acceptance Criteria

- App opens without backend configuration.
- App can switch between Station, Gate, Terminal, and Scout.
- Station can register a card.
- Station can top up a card.
- Gate can check in a card to an activity using real device time.
- Terminal can check out a card, calculate activity duration, use the fixed Rp 2.000 per started hour tariff, show the calculated fee after successful tap, and deduct balance.
- Terminal clearly blocks checkout if balance is insufficient.
- Scout can read balance, status, and last five logs.
- Sequential loop prevents double check-in and double check-out.
- Sensitive identity, balance, parking status details, and transaction values are not readable as plain NFC text in generic NFC apps.
- Station can show a local offline summary for audit/reporting on that device.
- Automated unit-test coverage across the whole executable repository source reaches at least 90%. Actual achievement: 100% line coverage (444+ tests, 65 suites; jest.config.js thresholds set to 99% statements/lines/branches, 96% functions).
- SonarCloud analysis passes the configured quality gate for the submitted codebase.
- `npm audit` reports 0 known vulnerabilities after dependency changes.
- App works offline for all core flows.
- App follows the documented architecture, quality, and security baseline.
- App applies the Signal UI design system direction.
- App shows an NFC requirement message before or during card actions.
- App blocks real card operations with clear guidance when the device has no NFC hardware or NFC is disabled.
- Repository, demo capture, documentation, and presentation are ready for submission.
- Check-in/check-out logic is implemented for the required parking MVP. Future non-parking activities are out of scope.

## 12. Product Owner Alignment Notes

- The PDF requirement remains the source of truth for MVP scope.
- Parking is the required acceptance path; non-parking activity support is future-friendly design, not required demo scope.
- SQLite is a device-local transaction/reporting ledger only. It does not create global reporting across devices and never overrides card state.
- Registration rejects already registered valid MBC cards with `ALREADY_REGISTERED_CARD`.
- Real NFC writes rely on `writeNdefMessage` throwing on failure. Capacity guard is enforced before write.
- NTAG215 payload capacity must be validated before claiming real-card support.
- Device time correctness is an operational dependency and must be visible in Gate/Terminal flows.

### PO Clarifications (2026-05-07)

- **Minimum parking duration (FR-006/FR-014):** PO confirms 1 second already counts as 1 started hour = Rp 2.000. Any non-zero duration rounds up to the next whole hour. This is correct per spec.
- **Max balance cap (FR-003):** PO confirms there is no maximum balance cap. Unlimited top-up is acceptable; no upper-bound validation is required on card balance.
- **Re-registration behavior (FR-002):** Current prompt-to-overwrite behavior is canonical. Operator must confirm before wipe and re-register. `ALREADY_REGISTERED_CARD` is the detection state, not a hard rejection. PO confirmed 2026-05-07.

### PO Clarifications (2026-05-08)

- **#5 Write counter regression:** Removed from spec. Silent Shield AES-256-GCM authenticated encryption already catches tampering/replay via integrity validation (`CARD_TAMPERED`), making counter regression detection redundant. Write counter remains as a monotonic sequence number for traceability only.
- **#6 Error codes implemented:** `SCAN_TIMEOUT`, `WRITE_FAILED`, `READ_FAILED`, `CARD_UNSUPPORTED` are now implemented and no longer annotated as future. `AMOUNT_INVALID` removed from spec entirely (validated in use case as message, not a typed error code).
- **#9 NFC log format:** MVP uses plain `[NFC] message` prefix. No categories. Confirmed.
- **#10 NfcAvailabilityStatus:** TIMEOUT is NOT an availability state. `SCAN_TIMEOUT` is a session-level error code in `RoleActionErrorCode`. `NfcAvailabilityStatus` remains four states: SUPPORTED, UNSUPPORTED, DISABLED, UNAVAILABLE.
- **#11 Tampered card at Station:** Tampered cards (Silent Shield integrity failure) show `CARD_TAMPERED` error at all roles including Station. No reset prompt for tampered authenticated payloads. Only unrecognized/non-MBC payloads get the wipe-and-re-register prompt.
- **#12 RoleActionErrorCode:** Spec updated to match implementation exactly: `INSUFFICIENT_BALANCE`, `ALREADY_CHECKED_IN`, `CARD_TAMPERED`, `CARD_UNSUPPORTED`, `UNREGISTERED_CARD`, `SCAN_TIMEOUT`, `READ_FAILED`, `WRITE_FAILED`, `GENERIC_FAILURE`.
- **#13 current-device label:** Confirmed removed. Not present in specs or code.

## Additional Delivery Requirements

### NFR-020 Feature PR QA Evidence Gate

Before a feature PR is merged, Senior QA must validate the changed feature on Android simulator/device and attach screenshot evidence showing the feature behavior and relevant error state.

### NFR-021 Final QA Use-Case Evidence Package

Before final delivery, Senior QA must provide a use-case testing evidence package with screenshots proving the delivered parking MVP satisfies the requirements.

### NFR-022 Firebase App Distribution Release Automation

The Demo/Release Engineer must configure GitHub Actions so controlled push/merge to `main` builds the Android release artifact and distributes it through Firebase App Distribution.
