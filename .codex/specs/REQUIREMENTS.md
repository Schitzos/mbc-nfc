# KDX Chapter 1: Membership Benefit Card Requirements

## 1. Purpose

Build a frontend mobile application for the Membership Benefit Card (MBC) assessment. The app uses NFC cards as offline membership cards for a village cooperative.

The card is the portable source of truth. It stores member identity, balance, activity/visit status, and the last five transaction logs directly on the physical NFC card so the system can work without a central database or always-on internet connection.

Although the PDF uses the member parking benefit as the concrete assessment scenario, the MBC flow should be designed as a reusable member activity flow. The same card and role model can support any cooperative activity that needs entry/check-in, exit/check-out, balance deduction, and transaction logging.

## 2. Business Requirements

| ID     | Business Requirement                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| BR-001 | The cooperative must provide modern member services even when internet connectivity is unstable.                 |
| BR-002 | MBC must act as a portable member identity and benefit card.                                                     |
| BR-003 | Member identity, balance, activity status, and recent transaction history must live on the NFC card.             |
| BR-004 | Cooperative staff must be able to register member cards and top up balances.                                     |
| BR-005 | Members must be able to access cooperative benefits through tap-based entry and exit flows.                      |
| BR-006 | The solution must support not only parking, but any cooperative activity that needs check-in/check-out behavior. |
| BR-007 | Members receive an exclusive benefit tariff for the assessment scenario: Rp 2.000 per started hour.              |
| BR-008 | Non-member guest flow is outside this application scope.                                                         |
| BR-009 | Sensitive member identity and balance must not be plainly readable by external NFC apps.                         |
| BR-010 | The assessment submission must include source code, working app demo, documentation, and presentation material.  |
| BR-011 | Cooperative staff need an offline device-side audit trail and income summary for Station operations.             |

## 3. System Requirements

| ID     | System Requirement                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| SR-001 | The system shall be one frontend app that can switch between Station, Gate, Terminal, and Scout roles.                                |
| SR-002 | The system shall read and write NFC card data without requiring backend API access.                                                   |
| SR-003 | The system shall validate card payload version, structure, integrity, balance, status, and timestamps.                                |
| SR-004 | The system shall reject unregistered, unsupported, malformed, or tampered cards.                                                      |
| SR-005 | The system shall prevent double check-in and double check-out for the active activity.                                                |
| SR-006 | The system shall support configurable activity context so the flow is not hardcoded only to parking.                                  |
| SR-007 | The system shall keep the latest five transaction logs on card.                                                                       |
| SR-008 | The system shall protect identity and balance through Silent Shield encoding/encryption.                                              |
| SR-009 | The system shall show clear top-up guidance when balance is insufficient.                                                             |
| SR-010 | The system shall provide a read-only Scout mode for one-tap member inspection.                                                        |
| SR-011 | The system shall require an NFC-capable device with NFC enabled for real card scan, read, and write operations.                       |
| SR-012 | The system shall clearly inform users when NFC is required, unsupported, disabled, scanning, cancelled, or timed out.                 |
| SR-013 | The system shall maintain a local offline SQLite ledger for audit/reporting without replacing the NFC card as member-state authority. |

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
- Configurable activity context, with parking as the first demo activity.
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
- The card payload can include encoded or encrypted fields for sensitive data.
- SQLite is allowed as a device-local reporting and audit store, but it does not replace the NFC card as the member-state source of truth.
- Parking is the first assessment activity, but the same flow should be reusable for other cooperative activities that need check-in/check-out.
- If member balance is insufficient at The Terminal, the member should be directed to top up at The Station before completing the activity exit.
- Non-members use a separate manual guest process and are outside this project.
- The PDF states the guest path charges Rp 50.000 per hour and uses a separate limited/manual gate; the app should document this context but not implement it.
- Internet access must not be required for core membership, balance, activity entry, or activity exit flows.

## 6. User Stories

| ID     | User Story                                                                                                     | Priority |
| ------ | -------------------------------------------------------------------------------------------------------------- | -------- |
| US-001 | As a cooperative admin, I can register a member card at The Station.                                           | Must     |
| US-002 | As a cooperative admin, I can top up a member balance at The Station.                                          | Must     |
| US-003 | As a gate operator, I can check in a member to an activity by tapping the card at The Gate.                    | Must     |
| US-004 | As a gate operator, I can simulate an older entry time for duration/tariff testing.                            | Must     |
| US-005 | As a terminal operator, I can check out a member from an activity by tapping the card at The Terminal.         | Must     |
| US-006 | As a terminal operator, I can see activity duration and fee before/after deduction.                            | Must     |
| US-007 | As a terminal operator, I can block checkout when balance is insufficient and show clear top-up guidance.      | Must     |
| US-008 | As a member, I can inspect my card through The Scout to see balance, status, and history.                      | Must     |
| US-009 | As the system, I prevent double check-in and double check-out.                                                 | Must     |
| US-010 | As the system, I keep only the latest five card transaction logs.                                              | Must     |
| US-011 | As the system, I protect identity and balance from plain NFC reading.                                          | Must     |
| US-012 | As an evaluator, I can review source code, demo evidence, documentation, and presentation material.            | Must     |
| US-013 | As a developer, I can reuse the check-in/check-out flow for activities beyond parking.                         | Should   |
| US-014 | As a cooperative admin, I can view offline income and transaction summaries on the device used at The Station. | Must     |

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
- Normal member/operator screens do not expose the full internal member ID; if a support reference is needed, the app may show a masked or short reference only.
- App writes a valid MBC payload to the NFC card.
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
- For the parking demo activity, app calculates member tariff using Rp 2.000 per started hour.
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
- New logs are added newest-first or with a clearly defined order.
- When more than five logs exist, the oldest log is removed.

### FR-010 Silent Shield

The app shall protect sensitive card data.

Acceptance criteria:

- Identity and balance are not stored in plain readable text.
- The protected payload includes encryption or equivalent confidential encoding plus an integrity check that detects tampering or corruption.
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

The app shall model the Gate and Terminal flow as an activity flow, not as parking-only logic.

Acceptance criteria:

- Card state stores the active activity identifier or type.
- Tariff calculation accepts an activity tariff rule.
- Parking uses the default assessment rule of Rp 2.000 per started hour.
- Domain names and use cases avoid hardcoding parking-only behavior unless referring to the demo scenario.

### FR-013 Local Offline Ledger and Reporting

The app shall maintain a device-local SQLite ledger for offline audit and reporting.

Acceptance criteria:

- Successful register, Station top-up, and Terminal checkout actions append a local ledger record on the device.
- The ledger stores enough data to produce offline income/reporting summaries without reading every card again.
- The ledger does not replace the NFC card as the member-state source of truth.
- If local ledger write fails, the app reports the issue clearly and does not silently claim the report is complete.
- Station can view at least a simple local summary of top-up totals and checkout totals for that device.

## 8. Non-Functional Requirements

| ID      | Category                         | Requirement                                                                                                                                                              |
| ------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-001 | Offline support                  | Core flows work without internet or external API.                                                                                                                        |
| NFR-002 | Integrity                        | Card state prevents invalid sequential actions.                                                                                                                          |
| NFR-003 | Reliability                      | NFC read/write sessions are cleaned up after success, cancel, timeout, or error.                                                                                         |
| NFR-004 | Usability                        | Station UI is simple enough for cooperative staff.                                                                                                                       |
| NFR-005 | Maintainability                  | Business rules are independent from React Native and NFC library details.                                                                                                |
| NFR-006 | Portability                      | Shared NFC flow handles iOS and Android differences where possible.                                                                                                      |
| NFR-007 | Privacy                          | Sensitive member identity and balance are protected.                                                                                                                     |
| NFR-008 | Testability                      | Activity tariff, card state, logs, and encoding rules are testable without hardware.                                                                                     |
| NFR-009 | Quality                          | Working frontend app must not crash during demo flows.                                                                                                                   |
| NFR-010 | UI system                        | The frontend applies the Signal UI design system direction required by the brief.                                                                                        |
| NFR-011 | Device clarity                   | The app clearly communicates that real card operations require NFC hardware and shows actionable guidance when NFC is unavailable or disabled.                           |
| NFR-012 | Data separation                  | NFC card member state and local device audit/reporting data remain clearly separated.                                                                                    |
| NFR-013 | Coverage target                  | Unit and application automated coverage should reach at least 90% for the implemented scope.                                                                             |
| NFR-014 | Static quality gate              | The project should integrate with SonarCloud and target a passing quality gate with strong maintainability, reliability, and security ratings.                           |
| NFR-015 | Branching and release automation | The project shall use feature branches with controlled promotion to `develop` and `main`, and merging to `main` shall trigger automated APK app-distribution publishing. |

## 9. Security Requirements

- Do not store identity and balance as plain readable NFC text.
- Use a card payload encoding/encryption strategy for sensitive fields.
- Validate payload version, structure, timestamps, balance, and status before writing.
- Reject malformed, unsupported, or tampered payloads safely.
- Do not log raw sensitive identity, balance, or encoded secrets.
- Keep NFC and card encoding logic isolated from presentation code.
- Use local-only demo secrets only for the assessment prototype; production would require stronger key management.
- Do not store full sensitive identity in the local ledger when a masked or shortened reference is enough for reporting/audit.

## 10. Error Requirements

| Code                    | Meaning                                               |
| ----------------------- | ----------------------------------------------------- |
| NFC_UNSUPPORTED         | Device does not support NFC.                          |
| NFC_DISABLED            | NFC is turned off.                                    |
| SCAN_CANCELLED          | Operator cancelled scan.                              |
| SCAN_TIMEOUT            | No tag found in time.                                 |
| CARD_UNREGISTERED       | Card does not contain a valid registered MBC payload. |
| CARD_UNSUPPORTED        | Card technology or payload format is unsupported.     |
| CARD_TAMPERED           | Card payload cannot be verified or decoded safely.    |
| DOUBLE_CHECK_IN         | Card is already checked in.                           |
| DOUBLE_CHECK_OUT        | Card is not currently checked in.                     |
| INSUFFICIENT_BALANCE    | Balance is lower than calculated fee.                 |
| ACTIVITY_ALREADY_ACTIVE | Card already has an active activity session.          |
| ACTIVITY_NOT_ACTIVE     | Card has no active activity session to check out.     |
| AMOUNT_INVALID          | Top-up or calculated amount is invalid.               |
| WRITE_FAILED            | NFC card write failed.                                |
| READ_FAILED             | NFC card read failed.                                 |

## 11. Prototype Acceptance Criteria

- App opens without backend configuration.
- App can switch between Station, Gate, Terminal, and Scout.
- Station can register a card.
- Station can top up a card.
- Gate can check in a card to an activity.
- Gate can simulate past entry time.
- Terminal can check out a card, calculate activity duration, charge Rp 2.000 per started hour for the parking demo activity, and deduct balance.
- Terminal clearly blocks checkout if balance is insufficient.
- Scout can read balance, status, and last five logs.
- Sequential loop prevents double check-in and double check-out.
- Sensitive identity and balance are not readable as plain NFC text.
- Station can show a local offline summary for audit/reporting on that device.
- Automated unit/application coverage for the implemented scope reaches at least 90%.
- SonarCloud analysis passes the configured quality gate for the submitted codebase.
- App works offline for all core flows.
- App follows the documented architecture, quality, and security baseline.
- App applies the Signal UI design system direction.
- App shows an NFC requirement message before or during card actions.
- App blocks real card operations with clear guidance when the device has no NFC hardware or NFC is disabled.
- Repository, demo capture, documentation, and presentation are ready for submission.
- Check-in/check-out logic is modeled for reusable member activities, not only parking.
