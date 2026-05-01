# KDX Membership Benefit Card Tasks

This task list follows spec-driven development:

```txt
Assessment Brief -> Requirements -> Design -> Implementation Tasks -> Tests -> Demo
```

Agent coordination follows `.codex/specs/AGENT_OPERATING_PROTOCOL.md`.

## Delivery Role Ownership

| Role                                       | Primary Ownership                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner                              | MVP scope, acceptance criteria, product value, and scope tradeoffs.                                                                         |
| Project Manager                            | Milestones, task sequencing, delivery tracking, risks, and demo readiness.                                                                  |
| System Analyst                             | Business/system requirements, user flows, assumptions, and traceability.                                                                    |
| Software Architect                         | Clean Architecture, module boundaries, domain model, card payload strategy, and technical decisions.                                        |
| Senior React Native FE                     | React Native implementation, role screens, state management, and UI integration.                                                            |
| UI/UX Designer                             | Signal UI interpretation, role-based UX, screen states, and demo polish.                                                                    |
| NFC/Mobile Native Specialist               | Android/iOS NFC setup, real-device behavior, tag compatibility, and NFC lifecycle.                                                          |
| Test Automation Engineer                   | Unit, use-case, and presentation automation with mocked card repositories.                                                                  |
| Senior QA                                  | Manual QA, requirements validation, edge cases, and release confidence.                                                                     |
| Security Pentester                         | Silent Shield review, NFC payload abuse cases, tamper handling, and privacy checks.                                                         |
| Technical Writer / Presentation Specialist | Technical/non-technical docs, README, demo script, and presentation material.                                                               |
| Demo/Release Engineer                      | Git/repository setup, APK app distribution, submission packaging, demo capture, run instructions, known limitations, and release checklist. |

## 1. Project Setup

### T-000A Create UML and System Design Diagrams

Owner:

- Software Architect
- System Analyst
- Technical Writer / Presentation Specialist

Coverage:

- FR-011 Assessment Deliverables
- NFR-005 Maintainability
- NFR-009 Quality

Tasks:

- Create a component diagram for the Clean Architecture structure.
- Create a use-case diagram for Station, Gate, Terminal, and Scout.
- Create sequence diagrams for Station registration, Station top-up, Gate check-in, Terminal checkout, Scout inspection, and local ledger write flow.
- Create an activity diagram for the main tap-in/tap-out flow, including insufficient balance handling.
- Store the diagrams in a versioned project document under `.codex/specs/`.

Acceptance:

- UML/system diagrams exist for the core role flows and architecture.
- The diagrams match current requirements, design decisions, and execution scope.
- The diagrams are usable for technical review and presentation material.

### T-000 Set Up Git Repository and Submission Baseline

Owner:

- Demo/Release Engineer
- Project Manager
- Security Pentester

Coverage:

- FR-011 Assessment Deliverables
- NFR-009 Quality

Tasks:

- Initialize Git repository if the workspace is not already a Git repository.
- Define branch strategy using `feature/*`, `develop`, and `main`.
- Document that every feature must be developed in a separate feature branch and merged by merge request into `develop`.
- Document that Demo/Release Engineer reviews and merges feature work into `develop`.
- Document that only the Project Owner merges the `develop` to `main` promotion request.
- Define Git commit-message convention for the repository.
- Add project `.gitignore` for React Native, Node, native build outputs, IDE metadata, logs, temporary files, and secret files.
- Add or update `README.md` with project purpose, setup/run instructions, mock/demo notes, NFC hardware requirements, and known limitations.
- Verify no secrets, raw NFC payloads, build artifacts, generated dependency folders, or local environment files are staged.
- Create an initial baseline commit after docs/project skeleton are ready.
- Prepare repository remote instructions for GitHub/GitLab submission; actual remote creation may remain manual if credentials are not available.

Acceptance:

- `git status` is clean after baseline commit or clearly documented if commit is deferred.
- `.gitignore` covers common React Native/Node/iOS/Android generated files.
- Branching and merge-promotion rules are documented before feature implementation begins.
- Commit-message convention is documented before team delivery begins.
- README exists before submission packaging.
- Security Pentester confirms no sensitive local files are included.
- Demo/Release Engineer confirms repository is ready to become the submission source of truth.

### T-000B Configure GitHub Repository Governance

Owner:

- Demo/Release Engineer
- Project Manager
- Product Owner

Coverage:

- FR-011 Assessment Deliverables
- NFR-015 Branching and release automation

Tasks:

- Configure branch protection or repository rules for `develop` and `main`.
- Require pull request or merge request flow for protected branches.
- Configure approval rules so direct feature delivery does not bypass review.
- Set merge ownership expectation so Demo/Release Engineer reviews and controls merges into `develop`.
- Configure `main` so promotion remains controlled by the Project Owner.
- Add `CODEOWNERS` or an equivalent reviewer-mapping strategy for the repository.
- Document which required checks are active now and which are deferred until CI exists.

Acceptance:

- GitHub repository governance is configured before normal feature delivery begins.
- `develop` and `main` are protected by documented review rules.
- Reviewer ownership is documented and not left to informal practice only.
- `CODEOWNERS` or equivalent reviewer-routing guidance exists.
- The team knows which checks are already enforced and which will be added later in `T-027A`.

### T-001 Create React Native TypeScript Project

Owner:

- Senior React Native FE

Coverage:

- NFR-005 Maintainability
- NFR-009 Quality

Tasks:

- Create React Native CLI project with TypeScript.
- Configure linting, formatting, and Jest.
- Install Husky for local Git hook enforcement.
- Install and configure a changed-file strategy such as `lint-staged`.
- Install and configure commit-message validation for the chosen Git commit convention.
- Wire commit hooks so lint runs against changed files only and commit messages are validated locally.
- Add base folder structure from `DESIGN.md`.

Acceptance:

- App launches from project skeleton.
- Tests run with a baseline.
- Husky is active for local Git hooks.
- Commit-message convention is validated locally.
- Lint runs against changed files only through local hook enforcement.

### T-002 Install Core Dependencies

Owner:

- Senior React Native FE

Coverage:

- FR-001 Role Switching
- NFC read/write integration

Tasks:

- Install `react-native-nfc-manager`.
- Install SQLite package for local offline ledger support.
- Install React Navigation.
- Install chosen state library, either Zustand or React Context setup.
- Install test utilities.
- Prepare coverage reporting and SonarCloud-compatible analysis outputs.

Acceptance:

- Project builds after dependency installation.

## 2. Platform NFC Configuration

### T-003 Configure iOS NFC

Owner:

- NFC/Mobile Native Specialist

Tasks:

- Enable NFC capability.
- Add NFC usage description.
- Verify on a real NFC-capable iPhone.

Acceptance:

- iOS can start NFC read/write flow where supported.

### T-004 Configure Android NFC

Owner:

- NFC/Mobile Native Specialist

Tasks:

- Add NFC permission.
- Add NFC hardware feature declaration.
- Verify on a real NFC-capable Android device.

Acceptance:

- Android can detect NFC availability and scan a card.

## 3. Domain Layer

### T-005 Create MBC Domain Entities

Owner:

- Software Architect

Tasks:

- Create `MbcCard`.
- Create `MemberProfile`.
- Create `TransactionLog`.
- Create `ActivitySession`.
- Create `ActivityTariffRule`.
- Create visit status and activity types.

Acceptance:

- Domain types compile without React Native or NFC imports.

### T-006 Create MBC Repository Interface

Owner:

- Software Architect

Tasks:

- Create `MbcCardRepository` with support, read, write, and cancel methods.

Acceptance:

- Use cases depend on the interface only.

### T-007 Create Activity Tariff Calculator

Owner:

- Senior React Native FE
- Test Automation Engineer

Tasks:

- Implement Rp 2.000 per started hour for the parking demo activity.
- Accept an activity tariff rule so future activities are not hardcoded to parking.
- Round partial hours up.
- Reject invalid timestamps.

Tests:

- 1 hour returns Rp 2.000.
- 1 hour 5 minutes 1 second returns Rp 4.000.
- Zero or negative duration is rejected.

Acceptance:

- Parking tariff uses Rp 2.000 per started hour.
- Generic activity tariff rules can be supplied without hardcoding parking everywhere.
- Automated tests cover rounding and invalid-duration behavior.

### T-008 Create Activity State Policy

Owner:

- Software Architect
- Test Automation Engineer

Tasks:

- Allow check-in only from `NOT_CHECKED_IN`.
- Allow checkout only from `CHECKED_IN`.
- Store active activity ID/type on check-in.
- Prevent starting a second activity while one is active.
- Reject double check-in.
- Reject double check-out.
- Reject checkout when balance is insufficient.

Tests:

- Valid check-in succeeds.
- Starting a second activity while active fails.
- Double check-in fails.
- Valid checkout succeeds.
- Double check-out fails.
- Insufficient balance does not change card state.

Acceptance:

- State transitions enforce valid check-in and checkout sequencing.
- Invalid repeated actions are rejected safely.
- Insufficient balance does not mutate active card state.

### T-009 Create Transaction Log Policy

Owner:

- Software Architect

Tasks:

- Add logs for register, top-up, activity check-in, and activity check-out.
- Keep latest five logs only.

Tests:

- Sixth log removes the oldest log.

Acceptance:

- Register, top-up, check-in, and checkout actions can append logs consistently.
- Card log storage never exceeds five records.

## 4. Application Layer

### T-010 Create Card DTOs

Owner:

- Senior React Native FE

Tasks:

- Create `CardSummaryDto`.
- Create `RoleActionResultDto`.

Acceptance:

- Presentation can render role results without domain internals.

### T-011 Create Check NFC Availability Use Case

Owner:

- Senior React Native FE
- NFC/Mobile Native Specialist

Tasks:

- Inject `MbcCardRepository`.
- Return supported/unsupported state.
- Return disabled/unavailable state when the platform can distinguish disabled NFC from missing NFC hardware.
- Provide presentation-ready guidance for real card operations: NFC-capable device required, enable NFC, retry scan, or use mock/demo mode if available.

Acceptance:

- Presentation can show NFC requirement, unsupported-device, and disabled-NFC messages before real card operations.

### T-012 Create Register Member Card Use Case

Owner:

- Senior React Native FE

Tasks:

- Validate registration request and initial card state.
- Generate internal member ID in the application/domain flow.
- Do not require the Station UI to provide a typed member ID.
- Create initial card state.
- Add register log.
- Write card through repository.

Acceptance:

- Register flow creates a valid initial card payload.
- Internal member ID is generated automatically.
- Registration does not require typed member ID or human-readable profile input.

### T-013 Create Top-Up Member Card Use Case

Owner:

- Senior React Native FE

Tasks:

- Read card.
- Validate positive top-up amount.
- Add amount to balance.
- Add top-up log.
- Write card.

Acceptance:

- Top-up only accepts positive amounts.
- Balance is increased correctly and a top-up log is written.

### T-014 Create Check-In Activity Use Case

Owner:

- Senior React Native FE

Tasks:

- Read card.
- Validate state.
- Support activity context.
- Support optional simulation timestamp.
- Set checked-in status and timestamp.
- Add check-in log.
- Write card.

Acceptance:

- Check-in writes activity context, timestamp, and checked-in status.
- Optional simulation timestamp is supported.
- Invalid repeated check-in is rejected.

### T-015 Create Check-Out Activity Use Case

Owner:

- Senior React Native FE

Tasks:

- Read card.
- Validate state.
- Calculate activity duration and fee.
- Validate balance.
- Deduct balance.
- Clear checked-in status.
- Add check-out log.
- Write card.

Acceptance:

- Checkout calculates duration and fee correctly.
- Successful checkout deducts balance and clears checked-in status.
- Invalid state or insufficient balance is handled safely.

### T-016 Create Inspect Member Card Use Case

Owner:

- Senior React Native FE

Tasks:

- Read card.
- Return balance, status, and logs.
- Do not write card.

Acceptance:

- Inspect flow returns balance, status, and logs without mutation.
- Scout-compatible read-only behavior is preserved.

## 5. Infrastructure Layer

### T-017 Implement Mock Card Repository

Owner:

- Senior React Native FE
- Test Automation Engineer

Tasks:

- Implement in-memory or fixture-backed `MbcCardRepository`.
- Support read and write behavior without NFC hardware.
- Support seeded cards for normal, low balance, checked-in, unregistered, and tampered scenarios.
- Make Station, Gate, Terminal, and Scout flows demoable before physical card availability.

Acceptance:

- Use cases and screens can run with simulated card data.
- Mock repository can be swapped with real NFC repository without changing domain/application logic.

### T-017A Implement Local SQLite Ledger Repository

Owner:

- Senior React Native FE
- Software Architect

Coverage:

- FR-013 Local Offline Ledger and Reporting
- NFR-012 Data separation

Tasks:

- Create `LocalLedgerRepository`.
- Implement SQLite-backed append and summary read methods.
- Store ledger entries for register, top-up, and checkout actions needed for device-side audit/reporting.
- Keep ledger schema separate from NFC card payload schema.
- Prefer masked or shortened member references over full sensitive identity.

Acceptance:

- App can append ledger records locally without internet access.
- Station can read a local summary from SQLite.
- Ledger repository remains replaceable behind an interface.

### T-018 Implement NFC Card Repository

Owner:

- NFC/Mobile Native Specialist

Tasks:

- Implement read card.
- Implement write card.
- Handle scan cancel, timeout, and errors.
- Always clean up NFC session.

Acceptance:

- Real NFC repository can read and write supported cards.
- Cancel, timeout, and error paths clean up the NFC session reliably.

### T-019 Implement MBC Card Codec

Owner:

- Software Architect
- Security Pentester

Tasks:

- Encode card payload.
- Decode card payload.
- Validate payload version and structure.
- Keep payload compact enough for target NFC tag/card capacity.
- Fail safely on malformed payloads.

Acceptance:

- Codec can encode and decode the defined MBC payload structure.
- Payload version and structure validation reject malformed data safely.
- Payload remains compact enough for intended NFC tag/card use.

### T-020 Implement Silent Shield

Owner:

- Security Pentester
- Software Architect

Tasks:

- Protect identity and balance from plain NFC reads.
- Add integrity check.
- Redact sensitive logs.

Acceptance:

- Identity and balance are not stored as plain readable text.
- Integrity validation detects tampered or corrupted payloads.
- Sensitive values are redacted from logs and errors.

### T-020A Integrate Ledger Writes Into Role Flows

Owner:

- Senior React Native FE
- Software Architect

Coverage:

- FR-013 Local Offline Ledger and Reporting

Tasks:

- Append local ledger entry after successful register action.
- Append local ledger entry after successful top-up action.
- Append local ledger entry after successful checkout action.
- Surface clear warning/error if card write succeeds but ledger write fails.

Acceptance:

- Successful Station and Terminal actions are visible in local ledger summary.
- Ledger failure handling is explicit and testable.

## 6. Presentation Layer

### T-021 Build Role Switcher

Owner:

- Senior React Native FE
- UI/UX Designer

Tasks:

- Allow switching between Station, Gate, Terminal, and Scout.

Acceptance:

- User can switch roles without corrupting card or screen state.
- Active role is clearly reflected in the UI.

### T-022 Build Station Screen

Owner:

- Senior React Native FE
- UI/UX Designer

Tasks:

- Registration flow without required human-readable member profile fields; member ID is generated by the system and is not typed by staff.
- Top-up form.
- Local offline ledger summary for that device.
- NFC action button.
- Result state.

Acceptance:

- Station supports register and top-up flows.
- Station can show the device-local ledger summary.
- Station UI does not require typed member ID.

### T-023 Build Gate Screen

Owner:

- Senior React Native FE
- UI/UX Designer

Tasks:

- Activity selector or default parking activity indicator.
- Check-in action.
- Simulation mode control.
- Result state.

Acceptance:

- Gate supports activity check-in with default or selected activity context.
- Simulation mode is available and clearly indicated.
- Result state reflects success and major failure paths.

### T-024 Build Terminal Screen

Owner:

- Senior React Native FE
- UI/UX Designer

Tasks:

- Checkout action.
- Duration, charged hours, charged amount, and remaining balance display.
- Fee result.
- Insufficient balance guidance.
- Missing card, scan timeout, or unreadable card guidance that directs member to Station/manual recovery.

Acceptance:

- Terminal shows fee, balance impact, and remaining balance clearly.
- Insufficient balance guidance is actionable.
- Missing-card and scan-failure recovery states are present.

### T-025 Build Scout Screen

Owner:

- Senior React Native FE
- UI/UX Designer

Tasks:

- Support one-tap card inspection.
- Read-only card summary.
- Balance.
- Visit status.
- Last five transaction logs.

Acceptance:

- Scout supports one-tap read-only inspection.
- Balance, visit status, and latest logs are visible without mutation.

### T-026 Apply Signal UI Direction

Owner:

- UI/UX Designer
- Senior React Native FE

Tasks:

- Align role screens with the Signal UI design system direction documented in `.codex/specs/SIGNAL_UI_GUIDE.md`.
- Extract or apply Signal colors, typography, spacing, radius, icon style, and core component patterns when Figma access allows.
- Keep provisional theme values isolated in `src/presentation/theme/` until exact Signal tokens are available.
- Keep Station actions simple for cooperative staff.
- Verify main screens are clear for demo capture.

Acceptance:

- Role screens follow the documented Signal UI direction as closely as current inputs allow.
- Theme values remain isolated for later refinement.
- Main demo screens are visually clear and consistent.

### T-026A Create Low-Fi E2E Figma Flow

Owner:

- UI/UX Designer
- Project Manager

Design artifact:

- Figma: `https://www.figma.com/design/v6NWSWAZ2MRlxJqPHDJs90/Untitled?node-id=2-2&m=dev`
- Page: `MBC Low-Fi E2E Flow`

Coverage:

- FR-001 Role Switching
- FR-002 Station Registration
- FR-003 Station Top-Up
- FR-004 Gate Check-In
- FR-005 Gate Simulation Mode
- FR-006 Terminal Check-Out
- FR-007 Insufficient Balance
- FR-008 Scout Card Inspection
- FR-009 Transaction Logs
- FR-012 Activity Extensibility
- NFR-004 Usability
- NFR-010 UI System

Tasks:

- Create a mobile low-fi Figma flow for the complete MBC experience from role selection to Station, Gate, Terminal, and Scout.
- Include the happy path: register card, top up balance, check in to activity, check out and deduct balance, inspect card.
- Include required error and edge states: unsupported NFC, missing/timeout/cancelled scan, unregistered/unsupported card, tampered/unreadable card, write failure, double check-in, double check-out, and insufficient balance.
- Show parking as the default demo activity while keeping copy generic enough for reusable tap-in/tap-out activities.
- Mark Scout as read-only and ensure it has no write-style CTA.
- Use extracted Signal UI tokens and component decisions from `.codex/specs/SIGNAL_UI_GUIDE.md` only as low-fi guidance; final hi-fi styling remains a later polish step.
- Keep the generated Figma link in this task updated if the low-fi flow moves or is replaced.

Acceptance:

- Figma contains an E2E map plus mobile low-fi screens for all four roles.
- Each role has idle, scan, success, and major failure states.
- The flow visually communicates card state changes: balance, active activity status, duration/fee, and latest logs.
- The task can guide Senior React Native FE implementation for T-021 to T-025.

### T-026B Create Hi-Fi Implementation-Ready Figma Screens

Owner:

- UI/UX Designer
- Senior React Native FE
- System Analyst

Design artifact:

- Figma: `https://www.figma.com/design/v6NWSWAZ2MRlxJqPHDJs90/Untitled?node-id=4-2&m=dev`
- Page: `MBC Low-Fi E2E Flow`
- Section: `HI-FI 00 Design Handoff Board`

Coverage:

- FR-001 Role Switching
- FR-002 Station Registration
- FR-003 Station Top-Up
- FR-004 Gate Check-In
- FR-005 Gate Simulation Mode
- FR-006 Terminal Check-Out
- FR-007 Insufficient Balance
- FR-008 Scout Card Inspection
- FR-009 Transaction Logs
- FR-012 Activity Extensibility
- NFR-004 Usability
- NFR-010 UI System

Tasks:

- Create hi-fi mobile screens for Role Switcher, Station, Gate, Terminal, Scout, shared NFC error handling, and implementation notes.
- Apply Signal-derived colors, typography guidance, radius, spacing, button, text-field, option-card, badge/label, and bottom-sheet decisions from `.codex/specs/SIGNAL_UI_GUIDE.md`.
- Revise Station registration hi-fi to remove any manually typed member ID field and show generated internal member identity only as hidden/technical state or a masked support reference.
- Confirm the design is implementable by Senior React Native FE using `src/presentation/theme/` and existing component primitives.
- Validate the design against system requirements and scope boundaries, including guest mode exclusion, reusable activity flow, and Scout read-only behavior.
- Keep the generated Figma link updated if the hi-fi section moves or is replaced.

Acceptance:

- Hi-fi screens are clear enough for FE implementation without needing additional product decisions.
- Every screen identifies its active role and primary NFC action.
- Major success and failure states show expected card mutation or no-mutation behavior.
- FE confirmation notes state the component/token mapping.
- System Analyst validation notes confirm the design remains aligned with requirements.

### T-026C Polish Hi-Fi Spacing, Icons, and Visual QA

Owner:

- UI/UX Designer
- Senior React Native FE
- Product Owner
- System Analyst
- Software Architect

Design artifact:

- Figma target: `https://www.figma.com/design/v6NWSWAZ2MRlxJqPHDJs90/Untitled?node-id=4-2&m=dev`
- Page: `MBC Low-Fi E2E Flow`
- Status: Pending Figma update after MCP tool-call limit resets.

Coverage:

- FR-001 Role Switching
- FR-002 Station Registration
- FR-003 Station Top-Up
- FR-004 Gate Check-In
- FR-005 Gate Simulation Mode
- FR-006 Terminal Check-Out
- FR-007 Insufficient Balance
- FR-008 Scout Card Inspection
- FR-009 Transaction Logs
- FR-012 Activity Extensibility
- NFR-004 Usability
- NFR-010 UI System

Tasks:

- Revise hi-fi screens so no inner card, stat panel, button, badge, text row, or bottom sheet content overlaps a border.
- Add at least `16px` inner padding inside status/stat containers and keep at least `24px` horizontal screen margin.
- Fix Station success and Scout summary status panels so the status stat does not collide with the parent card border.
- Balance button sizing: primary full-width CTAs use `327 x 40/44`; secondary text actions use a visually intentional width and center alignment, not a cramped pill.
- Fix the error bottom-sheet layout so the badge, title, body copy, rows, and CTA area have clear vertical spacing.
- Remove any typed member ID field from Station registration; show generated internal member ID only as hidden technical state or a masked support reference if needed.
- Add supportive icons for role, NFC action, member, balance, status, history, warning/error, and protected/internal data using the Signal icon rules or Lucide/Phosphor-style fallback.
- Confirm with PO that the polish does not add new scope.
- Confirm with System Analyst that four roles, guest exclusion, Scout read-only, and reusable activity flow remain correct.
- Confirm with Software Architect that the icon/component choices map to theme/component implementation and do not introduce business logic into presentation.

Acceptance:

- Figma hi-fi V2 is visually cleaner and has no overlapping borders or text.
- All primary NFC actions are immediately recognizable through icon plus text.
- Buttons look balanced and align with Signal button dimensions.
- Member ID remains generated and not user-typed.
- Product, system, and architecture validation notes are visible in the design or task handoff.

## 7. Verification and Demo

### T-026D Maintain Presentation-Friendly Task Brief

Owner:

- Technical Writer / Presentation Specialist
- Project Manager

Coverage:

- FR-011 Assessment Deliverables

Tasks:

- Maintain `.codex/specs/TASK_PRESENTATION_BRIEF.md` as a stakeholder-readable summary of all implementation tasks.
- For each task, document purpose, owner, expected output, and presentation value.
- Keep wording simple enough to reuse in slides or progress updates.
- Update the brief whenever task scope, owner, or delivery sequence changes.

Acceptance:

- Every task from `T-000` to `T-030` has a concise explanation in the presentation brief.
- The brief separates project setup, domain/application, infrastructure, UI, verification, and release work.
- Project Manager confirms the brief reflects the current task order and delivery priorities.

### T-027 Unit and Use-Case Tests

Owner:

- Test Automation Engineer
- Senior QA

Tasks:

- Test tariff, visit state, logs, and role use cases.
- Test activity flow with the parking demo activity and at least one generic activity fixture.
- Test missing card/scan timeout handling and manual Station recovery guidance.
- Maintain `.codex/specs/E2E_TEST_CASES.md` with detailed end-to-end cases in standard format.
- Attach screenshot evidence path for each executed E2E case.
- Map automated test cases to implementation suites and CI jobs.
- Keep automated unit/application coverage at or above 90% for the implemented scope.

Acceptance:

- `.codex/specs/E2E_TEST_CASES.md` exists and covers Station, Gate, Terminal, Scout, security, and generic activity tariff flows.
- Each case includes objective, preconditions, steps, expected result, owner, status, and evidence field.
- Coverage report shows at least 90% automated coverage for the implemented unit/application scope.
- Senior QA and Test Automation Engineer both confirm ownership split and execution approach.

### T-027A Integrate SonarCloud Quality Analysis

Owner:

- Test Automation Engineer
- Demo/Release Engineer

Coverage:

- NFR-014 Static quality gate

Tasks:

- Configure SonarCloud project settings for the repository.
- Publish coverage data from automated tests in a SonarCloud-compatible format.
- Ensure static analysis covers maintainability, reliability, and security findings for the submitted codebase.
- Add Husky hooks for commit-message validation and lint checks on changed files only.
- Use a changed-file strategy such as `lint-staged` for lint enforcement.
- Enforce the chosen Git commit convention through commit-message checks.
- Add GitHub Actions workflow rules so merging to `main` runs the release pipeline.
- Configure the `main` pipeline to build and publish the APK to app distribution.
- Document required secrets, service credentials, and release-notes inputs for the distribution workflow.
- Document any justified exclusions clearly.

Acceptance:

- SonarCloud analysis runs against the project.
- Coverage data is visible in SonarCloud.
- Configured quality gate passes for the submitted codebase or any temporary exceptions are explicitly documented and approved.
- Husky is prepared to enforce commit-message convention and lint checks for changed files only.
- GitHub Actions is prepared so `main` merge is the controlled publish trigger for APK distribution.

### T-028 Device Tests

Owner:

- NFC/Mobile Native Specialist
- Senior QA

Tasks:

- Test on at least one Android device.
- Test on at least one iPhone if available and write flow is supported.
- Record results in `DEVICE_TEST_MATRIX.md`.

Acceptance:

- Device results are recorded in `DEVICE_TEST_MATRIX.md`.
- Android validation is completed first as the primary real-device baseline.
- iOS findings are documented honestly where available.

### T-029 Demo Capture

Owner:

- Demo/Release Engineer
- Technical Writer / Presentation Specialist
- UI/UX Designer

Tasks:

- Capture image or short video for Station, Gate, Terminal, and Scout flows.
- Prepare APK distribution packaging and distribution notes for reviewer/demo installation.

Acceptance:

- Demo evidence exists for the main four-role flows.
- Captured evidence is usable for assessment submission and presentation.
- APK distribution path is documented for demo/reviewer installation.

### T-030 Prepare Submission Package

Owner:

- Demo/Release Engineer
- Technical Writer / Presentation Specialist
- Project Manager

Tasks:

- Confirm T-000 Git repository setup is complete or document why commit/remote setup is deferred.
- Prepare repository for GitHub or GitLab submission.
- Prepare APK app distribution flow and release notes for distributed tester/reviewer access.
- Confirm branch, merge-request, and `main` publish workflow are documented and ready for use.
- Ensure technical and non-technical documentation are available.
- Prepare presentation sections for UI/UX design, software design, software construction, software quality, software deployment, and software security.

Acceptance:

- Repository, docs, and presentation materials are ready for submission packaging.
- APK distribution packaging or distribution instructions are ready.
- Branch promotion and `main` publish automation are documented for release use.
- Run instructions and known limitations are documented.
- Submission scope matches the agreed MVP.
