# KDX Chapter 1: Membership Benefit Card Requirements

## 1. Purpose

Build a frontend mobile application for the Membership Benefit Card (MBC) assessment. The app uses NFC cards as offline membership cards for a village cooperative.

The card is the portable operational source of truth. It stores member identity reference, balance, activity/visit status, write counter, Silent Shield signature, and the last five transaction logs directly on the physical NFC card so the system can work without a central database or always-on internet connection. The detailed payload, Silent Shield, and ledger rules are defined in `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md`.

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
| BR-012 | Authorized cooperative staff must be able to update the active parking tariff locally when the offline APK is already deployed.                |

## 3. System Requirements

| ID     | System Requirement                                                                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SR-001 | The system shall be one frontend app that can switch between Station, Gate, Terminal, and Scout roles.                                                                                                            |
| SR-002 | The system shall read and write NFC card data without requiring backend API access.                                                                                                                               |
| SR-003 | The system shall validate card payload version, structure, integrity, balance, status, and timestamps.                                                                                                            |
| SR-004 | The system shall reject unregistered, unsupported, malformed, or tampered cards.                                                                                                                                  |
| SR-005 | The system shall prevent double check-in and double check-out for the active activity.                                                                                                                            |
| SR-006 | The system shall implement parking as the required MVP activity and may keep activity context configurable for future extension.                                                                                  |
| SR-007 | The system shall keep the latest five transaction logs on card.                                                                                                                                                   |
| SR-008 | The system shall protect card confidentiality and integrity with Silent Shield production-grade authenticated encryption plus integrity validation, preventing direct plain NFC exposure of identity and balance. |
| SR-009 | The system shall show clear top-up guidance when balance is insufficient.                                                                                                                                         |
| SR-010 | The system shall provide a read-only Scout mode for one-tap member inspection.                                                                                                                                    |
| SR-011 | The system shall require an NFC-capable device with NFC enabled for real card scan, read, and write operations.                                                                                                   |
| SR-012 | The system shall clearly inform users when NFC is required, unsupported, disabled, scanning, cancelled, or timed out.                                                                                             |
| SR-013 | The system shall maintain a local offline SQLite ledger for audit/reporting without replacing the NFC card as member-state authority.                                                                             |
| SR-014 | The system shall maintain a local active parking tariff setting that defaults to Rp 2.000 per started hour and can be changed by authorized Station/Admin staff without backend access or APK rebuild.            |
| SR-015 | The Terminal shall always resolve fee calculation from the local active tariff repository, show the active tariff before deduction, and never use a hidden magic-number tariff inside checkout logic.             |

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
- Parking activity as the required MVP path, with future activity extension kept architectural only.
- Sequential flow integrity, with no double check-in or double check-out.
- Simulation mode at The Gate to set entry time in the past for testing.
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
- Devices without NFC may open the app and may use mock/simulation flows during development or demo, but they cannot perform real MBC card operations.
- Android is the primary real-device validation target for the first implementation round.
- iOS compatibility remains a secondary validation target and must be documented honestly based on real-device results.
- The safest target for prototype validation is NFC Forum compatible tags that can store structured payloads.
- The app is allowed to simulate card data during development, but final validation should use real NFC hardware.
- The card payload must follow NFC Card Payload v1 in `.codex/specs/CARD_DATA_SECURITY_LEDGER_SPEC.md` and must be protected by Silent Shield.
- SQLite is a device-local reporting and audit store only; it does not replace the NFC card as the member-state source of truth and must never override card balance/status/activity state.
- Parking is the required assessment activity. The same flow may be reusable for other cooperative activities, but non-parking activity behavior is not an MVP blocker.
- If member balance is insufficient at The Terminal, the member should be directed to top up at The Station before completing the activity exit.
- Non-members use a separate manual guest process and are outside this project.
- The PDF states the guest path charges Rp 50.000 per hour and uses a separate limited/manual gate; the app should document this context but not implement it.
- Internet access must not be required for core membership, balance, activity entry, or activity exit flows.
- Because the app is offline, tariff changes do not automatically propagate across devices. All operational devices must be manually configured with the same active tariff before use.
- Device clock correctness matters for check-in/check-out duration. Operators must be able to see the current device time before writing entry or checkout state.

## 6. User Stories

| ID     | User Story                                                                                                              | Priority |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| US-001 | As a cooperative admin, I can register a member card at The Station.                                                    | Must     |
| US-002 | As a cooperative admin, I can top up a member balance at The Station.                                                   | Must     |
| US-003 | As a gate operator, I can check in a member to an activity by tapping the card at The Gate.                             | Must     |
| US-004 | As a gate operator, I can simulate an older entry time for duration/tariff testing.                                     | Must     |
| US-005 | As a terminal operator, I can check out a member from an activity by tapping the card at The Terminal.                  | Must     |
| US-006 | As a terminal operator, I can see activity duration and fee before/after deduction.                                     | Must     |
| US-007 | As a terminal operator, I can block checkout when balance is insufficient and show clear top-up guidance.               | Must     |
| US-008 | As a member, I can inspect my card through The Scout to see balance, status, and history.                               | Must     |
| US-009 | As the system, I prevent double check-in and double check-out.                                                          | Must     |
| US-010 | As the system, I keep only the latest five card transaction logs.                                                       | Must     |
| US-011 | As the system, I protect identity and balance from plain NFC reading.                                                   | Must     |
| US-012 | As an evaluator, I can review source code, demo evidence, documentation, and presentation material.                     | Must     |
| US-013 | As a developer, I can reuse the check-in/check-out flow for activities beyond parking.                                  | Should   |
| US-014 | As a cooperative admin, I can view offline income and transaction summaries on the device used at The Station.          | Must     |
| US-015 | As an authorized Station/Admin staff member, I can change the active parking tariff locally without rebuilding the APK. | Must     |
| US-016 | As a terminal operator, I can see which tariff is active before confirming checkout deduction.                          | Must     |

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
- Registration must reject an already registered valid MBC card to prevent accidental overwrite. MVP has no overwrite/reset flow unless explicitly added later.
- New card starts with a known visit status and balance.
- Registration writes a transaction log entry.

### FR-003 Station Top-Up

The Station shall top up member balance.

Acceptance criteria:

- Admin can input a top-up amount.
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

### FR-005 Gate Simulation Mode

The Gate shall support simulation mode for testing.

Acceptance criteria:

- Operator can set entry time to a past timestamp.
- Simulated entry time is written as the card activity check-in timestamp.
- UI clearly indicates simulation mode is active.

### FR-006 Terminal Check-Out

The Terminal shall calculate activity duration, fee, and deduct balance.

Acceptance criteria:

- App reads checked-in member card.
- App calculates duration from entry timestamp to exit timestamp.
- App rejects checkout with `INVALID_TIME` / `INVALID_DURATION` when exit time is not after entry time.
- For the parking MVP, the default tariff is Rp 2.000 per started hour.
- The active tariff must be read from local tariff storage, not hardcoded directly inside checkout logic.
- Terminal must display the active tariff before deduction so the operator can detect a wrongly configured offline device.
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
- New logs are stored newest-first on card.
- When more than five logs exist, the oldest log is removed.

### FR-010 Silent Shield

The app shall protect sensitive card data.

Acceptance criteria:

- Identity and balance are not stored in plain readable text.
- The protected payload uses the defined Silent Shield v1 codec: canonical logical payload, HMAC integrity signature, then AES-256-GCM or equivalent authenticated encryption. Plain JSON, Base64-only, or weak obfuscation is not acceptable.
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

MVP decision: do not implement non-parking runtime flows, non-parking tariff fixtures, or non-parking E2E acceptance cases in this build. Future activities must be enabled through clean boundaries, configuration/rule interfaces, and isolated tariff logic, but parking remains the only required activity for assessment delivery.

Acceptance criteria:

- Parking is the required MVP and assessment acceptance path.
- Card state stores the active activity identifier/type, with `PARKING` as the required initial value.
- Tariff calculation accepts an activity tariff rule, but only the parking tariff is required for MVP.
- Domain names and use cases may use reusable activity wording, but non-parking activities must not delay or replace the parking demo.

### FR-013 Local Offline Ledger and Reporting

The app shall maintain a device-local SQLite ledger for offline audit and reporting.

Acceptance criteria:

- Successful `REGISTER`, `TOPUP`, `CHECKIN`, and `CHECKOUT` card-state operations append a local ledger record on the device that processed the operation.
- The ledger stores enough data to produce offline transaction count and income/reporting summaries without reading every card again.
- Income reports sum only money-related rows, especially `TOPUP` and `CHECKOUT`; `CHECKIN` uses amount `0` and is counted as activity/audit, not income.
- Station reporting must clearly label summaries as current-device/current-installation only. It is not a global cooperative report when multiple devices are used.
- The ledger does not replace the NFC card as the member-state source of truth.
- If local ledger write fails after a successful card write, the member operation remains successful but the app reports the reporting/audit gap clearly.
- Station can view at least a simple local summary of transaction counts, top-up totals, and checkout totals for that device.

### FR-014 Local Offline Tariff Management

The app shall support local parking tariff management because the APK may already be built and the app cannot depend on backend/API configuration.

Acceptance criteria:

- The default active parking tariff is Rp 2.000 per started hour.
- Authorized Station/Admin staff can change the active parking tariff locally, for example from Rp 2.000 to Rp 3.000, without rebuilding the APK.
- The active tariff is stored locally on the device using SQLite or secure local storage.
- Gate check-in reads the current active tariff from the local tariff repository and stores a compact tariff snapshot in the NFC card active visit state.
- Terminal checkout calculates the parking fee using the tariff snapshot stored on the card active visit, not the current local active tariff.
- Terminal checkout displays the visit tariff snapshot before deduction.
- The local active tariff must include at least rate, currency, rounding mode, version, updated time, and updated-by role/reference.
- Changing tariff on one offline device does not automatically update any other device.
- All operational Station/Terminal devices must be manually configured with the same tariff before operation.
- Future enhancement may use a signed Tariff Config NFC card to distribute tariff offline, but this is not required for MVP.
- Local active tariff changes affect only new check-ins after the change; already checked-in cards keep their stored tariff snapshot until checkout.
- If a legacy/demo checked-in card has no tariff snapshot, Terminal may fall back to the current local active tariff only after showing a warning.
- Non-admin roles must not be able to change tariff. MVP may use a simple admin PIN or equivalent local authorization, documented as demo-level authorization unless stronger auth is implemented.

### FR-014A Tariff Snapshot at Check-In

The app shall lock the parking tariff at successful Gate check-in so members already inside are not affected by later offline tariff changes.

Acceptance criteria:

- Gate check-in stores a compact tariff snapshot inside the NFC card active visit state.
- The snapshot must include at minimum rate per started hour and tariff version; rounding mode may be stored when not globally fixed.
- Terminal checkout uses the stored visit tariff snapshot for fee calculation.
- Local active tariff changes, such as Rp 2.000 to Rp 3.000, apply only to new check-ins after the change.
- A member who checked in at Rp 2.000/hour must check out using Rp 2.000/hour even if the local active tariff is later changed to Rp 3.000/hour.
- Terminal must show the visit tariff snapshot before deduction.
- If the active visit has no tariff snapshot due to legacy/demo data, Terminal may fall back to current local active tariff only with a visible warning.
- The tariff snapshot must remain compact to protect NFC capacity.

### FR-015 Operational Edge Case Handling

The app shall explicitly handle common offline/NFC operational edge cases so field users and assessors see deterministic behavior instead of hidden failure.

Acceptance criteria:

- Gate simulation must only allow a past entry timestamp; future timestamps are rejected.
- Gate and Terminal must display the current device time before writing check-in or checkout state.
- If the device clock causes checkout time to be earlier than or equal to check-in time, checkout is rejected before any balance deduction.
- If a card is removed too early or write-readback cannot verify the expected state, success is not shown.
- If SQLite/local reporting data is deleted, the card remains operational source of truth but local reports for that device may be incomplete.
- Unsupported card, unsupported payload version, tampered payload, capacity failure, and write verification failure must produce clear recovery guidance.

## 8. Non-Functional Requirements

| ID      | Category                         | Requirement                                                                                                                                                                 |
| ------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-001 | Offline support                  | Core flows work without internet or external API.                                                                                                                           |
| NFR-002 | Integrity                        | Card state prevents invalid sequential actions.                                                                                                                             |
| NFR-003 | Reliability                      | NFC read/write sessions are cleaned up after success, cancel, timeout, or error.                                                                                            |
| NFR-004 | Usability                        | Station UI is simple enough for cooperative staff.                                                                                                                          |
| NFR-005 | Maintainability                  | Business rules are independent from React Native and NFC library details.                                                                                                   |
| NFR-006 | Portability                      | Shared NFC flow handles iOS and Android differences where possible.                                                                                                         |
| NFR-007 | Privacy                          | Sensitive member identity and balance are protected.                                                                                                                        |
| NFR-008 | Testability                      | Activity tariff, card state, logs, and encoding rules are testable without hardware.                                                                                        |
| NFR-009 | Quality                          | Working frontend app must not crash during demo flows.                                                                                                                      |
| NFR-010 | UI system                        | The frontend applies the Signal UI design system direction required by the brief.                                                                                           |
| NFR-011 | Device clarity                   | The app clearly communicates that real card operations require NFC hardware and shows actionable guidance when NFC is unavailable or disabled.                              |
| NFR-012 | Data separation                  | NFC card member state and local device audit/reporting data remain clearly separated.                                                                                       |
| NFR-013 | Coverage target                  | Automated unit-test coverage should reach at least 90% across the whole executable repository source, excluding only pure type-only contract files and generated artifacts. |
| NFR-014 | Static quality gate              | The project should integrate with SonarCloud and target a passing quality gate with strong maintainability, reliability, and security ratings.                              |
| NFR-015 | Branching and release automation | The project shall use feature branches with controlled promotion to `develop` and `main`, and merging to `main` shall trigger automated APK app-distribution publishing.    |
| NFR-016 | Dependency vulnerability gate    | After installing or changing libraries, `npm audit` shall report 0 known vulnerabilities before the task is considered done.                                                |
| NFR-017 | NFC capacity compatibility       | The chosen NFC tag/card type must have enough writable capacity for NFC Card Payload v1. If not, the app must fail safely with `CARD_CAPACITY_INSUFFICIENT`.                |
| NFR-018 | Write verification               | Every real NFC write must be followed by readback verification: decode, validate signature, and confirm expected counter/state before showing success.                      |
| NFR-019 | Local tariff manageability       | Active parking tariff can be changed locally by authorized Station/Admin staff without backend/API access and without rebuilding the APK.                                   |
| NFR-020 | Offline fleet clarity            | The app clearly communicates that tariff, ledger, and clock state are local to each offline device unless manually synchronized.                                            |

## 9. Security Requirements

- Do not store identity and balance as plain readable NFC text.
- Use Silent Shield production-grade authenticated encryption for sensitive card payload fields; Base64-only or plain JSON storage is not allowed.
- Validate payload version, structure, timestamps, balance, and status before writing.
- Reject malformed, unsupported, or tampered payloads safely.
- Do not log raw sensitive identity, balance, or encoded secrets.
- Keep NFC and card encoding logic isolated from presentation code.
- Do not commit encryption/signing secrets to the repository; load assessment keys through secure configuration and platform secure storage where available.
- Do not store full sensitive identity in the local ledger when a masked or shortened reference is enough for reporting/audit.
- Protect local tariff management from unauthorized role access; only authorized Station/Admin staff may change active tariff.
- Do not store admin PINs or local authorization secrets in plain text.

## 10. Error Requirements

| Code                       | Meaning                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| NFC_UNSUPPORTED            | Device does not support NFC.                                                                     |
| NFC_DISABLED               | NFC is turned off.                                                                               |
| SCAN_CANCELLED             | Operator cancelled scan.                                                                         |
| SCAN_TIMEOUT               | No tag found in time.                                                                            |
| CARD_UNREGISTERED          | Card does not contain a valid registered MBC payload.                                            |
| CARD_UNSUPPORTED           | Card technology or payload format is unsupported.                                                |
| CARD_TAMPERED              | Card payload cannot be verified or decoded safely.                                               |
| DOUBLE_CHECK_IN            | Card is already checked in.                                                                      |
| DOUBLE_CHECK_OUT           | Card is not currently checked in.                                                                |
| INSUFFICIENT_BALANCE       | Balance is lower than calculated fee.                                                            |
| ACTIVITY_ALREADY_ACTIVE    | Card already has an active activity session.                                                     |
| ACTIVITY_NOT_ACTIVE        | Card has no active activity session to check out.                                                |
| AMOUNT_INVALID             | Top-up or calculated amount is invalid.                                                          |
| WRITE_FAILED               | NFC card write failed.                                                                           |
| READ_FAILED                | NFC card read failed.                                                                            |
| WRITE_VERIFY_FAILED        | NFC write could not be verified by post-write readback.                                          |
| CARD_CAPACITY_INSUFFICIENT | Protected payload does not fit the selected NFC tag/card.                                        |
| INVALID_TIME               | Device or simulated time is invalid for the requested operation.                                 |
| INVALID_DURATION           | Checkout time is not after check-in time.                                                        |
| TARIFF_NOT_CONFIGURED      | Active parking tariff is missing or invalid on this device.                                      |
| TARIFF_SNAPSHOT_MISSING    | Checked-in card does not contain a tariff snapshot; Terminal may use fallback only with warning. |
| TARIFF_UPDATE_UNAUTHORIZED | Current role/user is not allowed to change local tariff.                                         |

## 11. Prototype Acceptance Criteria

- App opens without backend configuration.
- App can switch between Station, Gate, Terminal, and Scout.
- Station can register a card.
- Station can top up a card.
- Gate can check in a card to an activity.
- Gate can simulate past entry time.
- Terminal can check out a card, calculate activity duration, use the card-stored tariff snapshot from check-in, show the fee source before deduction, and deduct balance.
- Terminal clearly blocks checkout if balance is insufficient.
- Scout can read balance, status, and last five logs.
- Sequential loop prevents double check-in and double check-out.
- Sensitive identity, balance, parking status details, and transaction values are not readable as plain NFC text in generic NFC apps.
- Station can show a local offline summary for audit/reporting on that device.
- Automated unit-test coverage across the whole executable repository source reaches at least 90%.
- SonarCloud analysis passes the configured quality gate for the submitted codebase.
- `npm audit` reports 0 known vulnerabilities after dependency changes.
- App works offline for all core flows.
- App follows the documented architecture, quality, and security baseline.
- App applies the Signal UI design system direction.
- App shows an NFC requirement message before or during card actions.
- App blocks real card operations with clear guidance when the device has no NFC hardware or NFC is disabled.
- Repository, demo capture, documentation, and presentation are ready for submission.
- Check-in/check-out logic is modeled for reusable member activities, not only parking.
- Authorized Station/Admin staff can update the local active parking tariff without rebuilding the APK.
- Terminal checkout displays the card-stored tariff snapshot before deduction. The current local tariff may be shown only as a reference.
- Gate and Terminal display current device time and reject invalid/future simulation timing.

## 12. Product Owner Alignment Notes

- The PDF requirement remains the source of truth for MVP scope.
- Parking is the required acceptance path; non-parking activity support is future-friendly design, not required demo scope.
- SQLite is a device-local transaction/reporting ledger only. It does not create global reporting across devices and never overrides card state.
- Registration rejects already registered valid MBC cards.
- Real NFC writes require post-write readback verification.
- Chosen NFC tag/card capacity must be validated before claiming real-card support.
- Local tariff management is required for offline operation after APK release; all active offline devices must be manually configured to the same tariff.
- Device time correctness is an operational dependency and must be visible in Gate/Terminal flows.
