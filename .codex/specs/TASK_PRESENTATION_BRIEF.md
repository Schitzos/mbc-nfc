# MBC Task Presentation Brief

This brief explains each project task in a simple format that can be reused for stakeholder updates and presentation slides.

## How To Read

| Field              | Meaning                                             |
| ------------------ | --------------------------------------------------- |
| Purpose            | Why the task matters.                               |
| Owner              | Main role responsible for delivery or confirmation. |
| Output             | What should exist after the task is done.           |
| Presentation Value | How to explain the task to reviewers or users.      |

## Project Setup

| Task                                  | Purpose                                                                    | Owner                                                   | Output                                                                  | Presentation Value                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| T-000 Git Repository Baseline         | Make the project safe and ready for GitHub/GitLab submission.              | Demo/Release Engineer                                   | Git repo, `.gitignore`, README, clean baseline.                         | Shows the project is reviewable and submission-ready from the start.               |
| T-000B GitHub Repository Governance   | Enforce branch, review, and approval rules before feature delivery starts. | Demo/Release Engineer / Project Manager / Product Owner | Branch protection, reviewer routing, CODEOWNERS or equivalent guidance. | Shows the team delivery process is controlled by GitHub rules, not only by memory. |
| T-001 React Native TypeScript Project | Create the mobile app foundation.                                          | Senior React Native FE                                  | React Native CLI app with TypeScript, Jest, base folders.               | Shows the implementation starts from a maintainable mobile foundation.             |
| T-002 Core Dependencies               | Install required libraries for navigation, NFC, state, and tests.          | Senior React Native FE                                  | Working dependency setup.                                               | Shows the app has the tools needed for NFC role flows.                             |

## Platform NFC

| Task                            | Purpose                                        | Owner                        | Output                                                     | Presentation Value                                             |
| ------------------------------- | ---------------------------------------------- | ---------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| T-003 iOS NFC Configuration     | Prepare iPhone NFC capability where supported. | NFC/Mobile Native Specialist | iOS NFC capability and usage description.                  | Shows platform limitation awareness and honest iOS validation. |
| T-004 Android NFC Configuration | Prepare Android NFC permissions and detection. | NFC/Mobile Native Specialist | Android NFC permission, feature declaration, device check. | Shows Android is the main practical real-card demo path.       |

## Domain Layer

| Task                         | Purpose                                      | Owner                                             | Output                                                                   | Presentation Value                                                     |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| T-005 Domain Entities        | Define the core MBC data model.              | Software Architect                                | Card, member, activity session, tariff, log types.                       | Shows the card stores identity, balance, status, and logs.             |
| T-006 Repository Interface   | Hide NFC details behind a clean contract.    | Software Architect                                | `MbcCardRepository` interface.                                           | Shows business logic can work with mock or real NFC.                   |
| T-007 Tariff Calculator      | Calculate member parking fees correctly.     | Senior React Native FE / Test Automation Engineer | Rp 2.000 started-hour parking rule with isolated tariff logic.           | Shows the required parking MVP works while remaining extendable later. |
| T-008 Activity State Policy  | Prevent invalid check-in/check-out behavior. | Software Architect / Test Automation Engineer     | State rules for check-in, checkout, double action, insufficient balance. | Shows balance/status integrity is protected.                           |
| T-009 Transaction Log Policy | Keep recent card history compact.            | Software Architect                                | Latest-five transaction log rule.                                        | Shows the NFC card keeps useful history within limited memory.         |

## Application Layer

| Task                            | Purpose                                       | Owner                                   | Output                                                         | Presentation Value                                            |
| ------------------------------- | --------------------------------------------- | --------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| T-010 Card DTOs                 | Shape domain data for screens.                | Senior React Native FE                  | Screen-safe DTOs without exposing internals.                   | Shows UI does not depend on raw card payload.                 |
| T-011 NFC Availability Use Case | Tell the UI whether real NFC actions can run. | Senior React Native FE / NFC Specialist | Supported, unsupported, disabled guidance.                     | Shows users are informed that real card operations need NFC.  |
| T-012 Register Member Card      | Create a valid member card.                   | Senior React Native FE                  | Generated member ID, initial card state, register log.         | Shows staff does not type member ID; the system generates it. |
| T-013 Top-Up Member Card        | Add balance safely.                           | Senior React Native FE                  | Positive top-up validation, balance update, top-up log.        | Shows cooperative staff can manage member balance offline.    |
| T-014 Parking Check-In          | Start the parking session.                    | Senior React Native FE                  | Parking activity type, entry time, checked-in status, log.     | Shows Gate writes member entry state to the card.             |
| T-015 Parking Check-Out         | End the parking session and deduct fee.       | Senior React Native FE                  | Duration, charged hours, fee, balance deduction, status clear. | Shows Terminal calculates fee and updates card state.         |
| T-016 Inspect Member Card       | Read card without modifying it.               | Senior React Native FE                  | Balance, status, and latest logs.                              | Shows Scout is one-tap and read-only.                         |

## Infrastructure Layer

| Task                            | Purpose                                                                | Owner                                             | Output                                                          | Presentation Value                                                           |
| ------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| T-017 Mock Card Repository      | Enable development without real NFC hardware.                          | Senior React Native FE / Test Automation Engineer | In-memory card fixtures for normal and edge states.             | Shows demo and tests can progress before physical cards arrive.              |
| T-017A Local SQLite Ledger      | Add device-side audit and reporting storage.                           | Senior React Native FE / Software Architect       | Local ledger repository and summary queries.                    | Shows the app can report offline income and audit data on the device.        |
| T-018 NFC Card Repository       | Connect app use cases to real NFC read/write.                          | NFC/Mobile Native Specialist                      | Real NFC read/write implementation with cleanup.                | Shows the app can move from mock mode to real card operations.               |
| T-019 MBC Card Codec            | Encode and decode compact card payloads.                               | Software Architect / Security Pentester           | Versioned payload codec and validator.                          | Shows card data format is controlled and evolvable.                          |
| T-020 Silent Shield             | Protect sensitive card data.                                           | Security Pentester / Software Architect           | Protected identity/balance, integrity check, and redacted logs. | Shows sensitive member data is not plain NFC text and tampering is detected. |
| T-020A Ledger Write Integration | Record successful business actions into local audit/reporting storage. | Senior React Native FE / Software Architect       | Ledger append behavior and failure handling.                    | Shows offline reporting stays connected to real card operations.             |

## Presentation Layer

| Task                              | Purpose                                                   | Owner                                     | Output                                                                     | Presentation Value                                             |
| --------------------------------- | --------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| T-021 Role Switcher               | Let one app play four roles.                              | Senior React Native FE / UI UX Designer   | Station, Gate, Terminal, Scout selection.                                  | Shows the assessment runs as one multi-role app.               |
| T-022 Station Screen              | Register, top up, and review local device-side summaries. | Senior React Native FE / UI UX Designer   | Registration, top-up, ledger summary, NFC action, result states.           | Shows cooperative staff workflow plus offline reporting value. |
| T-023 Gate Screen                 | Check in members to parking.                              | Senior React Native FE / UI UX Designer   | Parking activity indicator, check-in, simulation, result states.           | Shows entry flow and demo-friendly simulation.                 |
| T-024 Terminal Screen             | Check out using card-stored tariff snapshot.              | Senior React Native FE / UI UX Designer   | Snapshot-based fee summary, balance result, insufficient balance guidance. | Shows fair exit flow and fee calculation.                      |
| T-025 Scout Screen                | Inspect card safely.                                      | Senior React Native FE / UI UX Designer   | Read-only summary, balance, status, latest logs.                           | Shows members can inspect card state without mutation.         |
| T-026 Signal UI Direction         | Apply the selected design system.                         | UI UX Designer / Senior React Native FE   | Signal tokens, components, and role screen styling.                        | Shows the app follows the required Signal UI direction.        |
| T-026A Low-Fi E2E Figma Flow      | Map all screens and edge cases before coding UI.          | UI UX Designer / Project Manager          | Low-fi Figma flow.                                                         | Shows the complete user journey is designed first.             |
| T-026B Hi-Fi Figma Screens        | Provide implementation-ready visual guidance.             | UI UX Designer / FE / System Analyst      | Hi-fi mobile screens and validation board.                                 | Shows what the final demo should look like.                    |
| T-026C Hi-Fi Polish and Visual QA | Fix spacing, buttons, icons, and overlap issues.          | UI UX Designer / FE / PO / SA / Architect | Hi-fi V2 polish plan and updated Figma when available.                     | Shows design quality is reviewed before implementation.        |
| T-026D Task Presentation Brief    | Keep task explanations ready for slides.                  | Technical Writer / Project Manager        | This presentation brief.                                                   | Shows progress can be explained clearly to stakeholders.       |

## Verification And Demo

| Task                           | Purpose                                                       | Owner                                                      | Output                                                                                                          | Presentation Value                                                                               |
| ------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| T-027 Unit and Use-Case Tests  | Prove business logic works.                                   | Test Automation Engineer / Senior QA                       | Tests for tariff, state, logs, use cases, NFC guidance, and `E2E_TEST_CASES.md` with screenshot evidence paths. | Shows quality is not only manual demo and has traceable evidence.                                |
| T-027A SonarCloud Quality Gate | Keep automated quality visible and enforceable.               | Test Automation Engineer / Demo/Release Engineer           | SonarCloud setup, coverage import, and quality-gate result.                                                     | Shows code quality is measured continuously, not judged only by demo feel.                       |
| T-028 Device Tests             | Validate real NFC behavior.                                   | NFC Specialist / Senior QA                                 | Android/iOS device matrix.                                                                                      | Shows real hardware behavior is recorded honestly.                                               |
| T-029 Demo Capture             | Prepare evidence and installation path for assessment review. | Demo/Release Engineer / Technical Writer / UI UX Designer  | Images or short video of key flows plus APK distribution notes.                                                 | Shows the app working through Station, Gate, Terminal, Scout, and can be installed by reviewers. |
| T-030 Submission Package       | Package the final assessment deliverables.                    | Demo/Release Engineer / Technical Writer / Project Manager | Repository, docs, presentation, run instructions, APK distribution plan.                                        | Shows the project is ready for reviewer handoff.                                                 |

## Slide Grouping Suggestion

| Slide                     | Use These Tasks            |
| ------------------------- | -------------------------- |
| Problem and Scope         | T-000 to T-002             |
| NFC and Device Strategy   | T-003, T-004, T-011, T-018 |
| Core Business Logic       | T-005 to T-016             |
| Security and Card Payload | T-019, T-020               |
| UI and Experience         | T-021 to T-026C            |
| Quality and Demo          | T-027 to T-030             |

## Current Readiness Notes

- Phases 0 to 6 are already implemented in the app and merged through `develop`.
- Phase 7 focuses on quality gates: stronger automated coverage, SonarCloud preparation, GitHub Actions, and presentation-ready verification notes.
- Real NFC hardware/card details remain TBD and are tracked in `DEVICE_TEST_MATRIX.md` and `RISKS.md`.
- Figma hi-fi refinement is still pending, but the current Signal-based implementation is usable for mock-first demo flows.

## Software Quality Improvement Note

The implementation plan now requires every changed executable source file to have a created or updated unit test. The project quality gate is at least 90% automated unit-test coverage for executable source. This is an architecture-driven quality improvement beyond the original PDF requirement and should be mentioned in the software quality section of the presentation.
