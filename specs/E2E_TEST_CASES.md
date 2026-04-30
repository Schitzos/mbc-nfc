# KDX Membership Benefit Card E2E Test Cases

## 1. Purpose

This document provides detailed end-to-end test cases in a standard format for the MBC app.

The output is intended for:

- Senior QA manual execution and acceptance.
- Test Automation Engineer automation mapping and evidence tracking.
- Presentation-ready progress reporting with screenshot proof.

## 2. Standard Test Case Format

Use this format for every test case:

| Field | Description |
| --- | --- |
| Test Case ID | Unique identifier, for example `E2E-REG-001`. |
| Feature | Business feature or role flow under test. |
| Objective | Why this scenario must be validated. |
| Preconditions | Required state before execution. |
| Test Data | Input values and fixtures. |
| Steps | Numbered execution steps. |
| Expected Result | Expected system behavior and UI state. |
| Priority | `High`, `Medium`, `Low`. |
| Type | `Manual`, `Automation`, or `Both`. |
| Owner | Role responsible for execution evidence. |
| Status | `Not Run`, `Pass`, `Fail`, `Blocked`. |
| Evidence | Screenshot file path(s) and notes. |

## 3. Screenshot Evidence Rules

- Capture at least one screenshot per major state: before action, success state, and failure state where applicable.
- File naming convention: `TCID_step_result_platform.png`.
- Store screenshots under `specs/test-evidence/` with this structure:
  - `specs/test-evidence/manual/<role>/`
  - `specs/test-evidence/automation/<suite>/`
- Every executed case must include at least one evidence reference in the `Evidence` field.

## 4. Detailed End-to-End Test Cases

### E2E-REG-001 Register Member Card Success

| Field | Value |
| --- | --- |
| Test Case ID | E2E-REG-001 |
| Feature | Station - Register Member Card |
| Objective | Ensure Station can register a valid member card and create initial payload. |
| Preconditions | App opened; role set to Station; NFC available; writable card available. |
| Test Data | No human-readable member input; initial top-up skipped. |
| Steps | 1. Open Station screen. 2. Tap `Tap NFC Card to Register`. 3. Tap card to device. 4. Open Scout and inspect same card. |
| Expected Result | Registration succeeds; internal member ID is auto-generated; no typed member ID input is required; Scout shows balance, status, logs, and only a masked or shortened reference if the UI exposes a support reference. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/station/E2E-REG-001_05_pass_android.png` |

### E2E-REG-002 Register Rejected on Unsupported NFC

| Field | Value |
| --- | --- |
| Test Case ID | E2E-REG-002 |
| Feature | Station - NFC Availability Guard |
| Objective | Ensure user gets clear guidance when NFC is unsupported/disabled. |
| Preconditions | Unsupported or disabled NFC state is active (real or mocked). |
| Test Data | N/A |
| Steps | 1. Open Station. 2. Tap register action. |
| Expected Result | Action is blocked; user sees clear message that real card operations require NFC-capable device with NFC enabled. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/station/E2E-REG-002_02_pass_mock.png` |

### E2E-TOP-001 Top-Up Success

| Field | Value |
| --- | --- |
| Test Case ID | E2E-TOP-001 |
| Feature | Station - Top Up |
| Objective | Ensure valid top-up increases balance and appends transaction log. |
| Preconditions | Registered card exists with known balance. |
| Test Data | Top-up amount: `20000`. |
| Steps | 1. Open Station top-up mode. 2. Input amount. 3. Tap top-up action. 4. Tap card. 5. Inspect card via Scout. |
| Expected Result | Balance increases correctly; log entry added; success feedback shown. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/station/E2E-TOP-001_05_pass_android.png` |

### E2E-LEDGER-001 Station Local Ledger Summary

| Field | Value |
| --- | --- |
| Test Case ID | E2E-LEDGER-001 |
| Feature | Station - Local Offline Ledger |
| Objective | Ensure Station can show local audit/reporting totals from device-side SQLite data. |
| Preconditions | At least one successful top-up and one successful checkout have already been recorded on the same device. |
| Test Data | Existing local ledger entries on device. |
| Steps | 1. Open Station screen. 2. Navigate to or view the local summary area. 3. Compare totals with known executed actions on that device. |
| Expected Result | Station displays local totals for top-up and checkout history on that device; summary is clearly presented as local device-side history, not card truth. |
| Priority | Medium |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/station/E2E-LEDGER-001_03_pass_summary.png` |

### E2E-TOP-002 Top-Up Reject Non-Positive Amount

| Field | Value |
| --- | --- |
| Test Case ID | E2E-TOP-002 |
| Feature | Station - Top Up Validation |
| Objective | Ensure zero/negative top-up cannot proceed. |
| Preconditions | Station top-up mode opened. |
| Test Data | Amount: `0` and `-1000`. |
| Steps | 1. Enter non-positive amount. 2. Attempt top-up. |
| Expected Result | Validation error shown; no NFC write performed; balance unchanged. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/station/E2E-TOP-002_02_pass_validation.png` |

### E2E-GATE-001 Check-In Success (Parking Demo)

| Field | Value |
| --- | --- |
| Test Case ID | E2E-GATE-001 |
| Feature | Gate - Check In |
| Objective | Ensure Gate writes active activity state with timestamp. |
| Preconditions | Registered card with sufficient balance; role set to Gate. |
| Test Data | Activity type: `parking`. |
| Steps | 1. Open Gate. 2. Select activity type. 3. Tap check-in action. 4. Tap card. 5. Inspect via Scout. |
| Expected Result | Card marked checked-in; activity type and time saved; log entry added. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/gate/E2E-GATE-001_05_pass_android.png` |

### E2E-GATE-002 Check-In With Simulation Timestamp

| Field | Value |
| --- | --- |
| Test Case ID | E2E-GATE-002 |
| Feature | Gate - Simulation Mode |
| Objective | Ensure simulation stores past check-in timestamp for demo/testing. |
| Preconditions | Registered card; simulation mode available. |
| Test Data | Simulated check-in time: 2 hours in the past. |
| Steps | 1. Enable simulation mode. 2. Set past timestamp. 3. Execute check-in. |
| Expected Result | Stored check-in time equals simulated value; flow still valid. |
| Priority | Medium |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/gate/E2E-GATE-002_03_pass_simulation.png` |

### E2E-GATE-003 Reject Double Check-In

| Field | Value |
| --- | --- |
| Test Case ID | E2E-GATE-003 |
| Feature | Gate - State Guard |
| Objective | Ensure second check-in is rejected while activity is active. |
| Preconditions | Card already checked-in. |
| Test Data | Same card tapped twice. |
| Steps | 1. Execute first valid check-in. 2. Repeat check-in immediately. |
| Expected Result | Second action rejected with clear error; card state remains unchanged from first check-in. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/gate/E2E-GATE-003_02_pass_reject.png` |

### E2E-TERM-001 Check-Out Success (Parking Tariff)

| Field | Value |
| --- | --- |
| Test Case ID | E2E-TERM-001 |
| Feature | Terminal - Check Out |
| Objective | Ensure checkout deducts correct parking started-hour fee and clears status. |
| Preconditions | Card checked-in with known start time and sufficient balance. |
| Test Data | Start time such that duration is 1h 5m 1s. |
| Steps | 1. Open Terminal. 2. Tap checkout action. 3. Tap checked-in card. |
| Expected Result | Fee charged as 2 started hours (`Rp 4.000`); balance reduced; checked-in status cleared; log added. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/terminal/E2E-TERM-001_03_pass_fee.png` |

### E2E-TERM-002 Check-Out Insufficient Balance

| Field | Value |
| --- | --- |
| Test Case ID | E2E-TERM-002 |
| Feature | Terminal - Insufficient Balance Handling |
| Objective | Ensure checkout failure due to low balance does not clear active status. |
| Preconditions | Card checked-in with balance lower than expected fee. |
| Test Data | Balance: `1000`; expected fee: `2000+`. |
| Steps | 1. Attempt checkout in Terminal. 2. Inspect card in Scout after failure. |
| Expected Result | Top-up guidance displayed; checkout rejected; active status remains checked-in; no improper deduction. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/terminal/E2E-TERM-002_02_pass_insufficient.png` |

### E2E-TERM-003 Missing Card or Scan Timeout

| Field | Value |
| --- | --- |
| Test Case ID | E2E-TERM-003 |
| Feature | Terminal - Recovery Flow |
| Objective | Ensure user receives clear recovery guidance when card is missing or scan fails. |
| Preconditions | Terminal checkout initiated; no valid card tap received. |
| Test Data | Timeout / cancel scan. |
| Steps | 1. Start checkout scan. 2. Cancel scan or do not tap card until timeout. |
| Expected Result | Error state shown; no card mutation occurs; guidance directs user to Station/manual recovery flow. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/terminal/E2E-TERM-003_02_pass_timeout.png` |

### E2E-SCOUT-001 One-Tap Read-Only Inspect

| Field | Value |
| --- | --- |
| Test Case ID | E2E-SCOUT-001 |
| Feature | Scout - Inspect |
| Objective | Ensure Scout reads card with one tap and does not mutate state. |
| Preconditions | Card has known state and logs. |
| Test Data | Card with activity status and five logs. |
| Steps | 1. Open Scout. 2. Tap card once. 3. Reinspect card with another role if needed. |
| Expected Result | Balance, status, and latest logs shown; no write operation performed; card state unchanged. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/scout/E2E-SCOUT-001_03_pass_readonly.png` |

### E2E-SEC-001 Tampered Payload Rejection

| Field | Value |
| --- | --- |
| Test Case ID | E2E-SEC-001 |
| Feature | Security - Silent Shield / Payload Validation |
| Objective | Ensure tampered or malformed payload is rejected safely. |
| Preconditions | Tampered payload fixture available in mock repository or test harness. |
| Test Data | Corrupted payload bytes / invalid version. |
| Steps | 1. Attempt inspect or transactional action with tampered card data. |
| Expected Result | Action blocked safely; error state appears; no unsafe crash; no sensitive data leakage. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/security/E2E-SEC-001_01_pass_tamper.png` |

### E2E-ACT-001 Generic Activity Tariff (Non-Parking)

| Field | Value |
| --- | --- |
| Test Case ID | E2E-ACT-001 |
| Feature | Activity Extensibility |
| Objective | Ensure non-parking activity can use a different tariff rule. |
| Preconditions | Generic activity fixture available with distinct hourly tariff. |
| Test Data | Activity type: `co-working`; tariff fixture: `Rp 3.000/hour`. |
| Steps | 1. Check in with generic activity. 2. Wait or simulate duration. 3. Check out in Terminal. |
| Expected Result | Fee follows generic activity tariff fixture, not parking tariff constant. |
| Priority | High |
| Type | Both |
| Owner | Senior QA + Test Automation Engineer |
| Status | Not Run |
| Evidence | `specs/test-evidence/manual/activity/E2E-ACT-001_03_pass_generic_tariff.png` |

## 5. Coverage Summary

- Station: `E2E-REG-001` to `E2E-TOP-002`
- Gate: `E2E-GATE-001` to `E2E-GATE-003`
- Terminal: `E2E-TERM-001` to `E2E-TERM-003`
- Scout: `E2E-SCOUT-001`
- Security: `E2E-SEC-001`
- Reusable activity tariff: `E2E-ACT-001`

## 6. Execution and Reporting

- Senior QA updates `Status` and manual evidence paths after each run.
- Test Automation Engineer links each automated scenario to test file names and CI job references.
- Project Manager reviews weekly progress using pass/fail/block counts and missing evidence list.
