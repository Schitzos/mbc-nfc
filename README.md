# KDX Membership Benefit Card

Frontend mobile application for the KDX Membership Benefit Card (MBC) assessment.

## Current Status

This repository is currently in the `docs-first baseline` stage.

The project already contains:

- requirements and architecture specs
- task inventory and feature-based execution order
- UML/system diagrams
- release, testing, security, and presentation planning
- initial Signal-oriented presentation theme artifacts under `src/`

Implementation will follow the execution sequence in `.codex/specs/EXECUTION_ORDER.md`.

## Product Summary

The app is one mobile application that can switch between four roles:

- Station
- Gate
- Terminal
- Scout

Core rules:

- the NFC card is the source of truth for member state
- the app works offline-first
- a local SQLite ledger is allowed only for device-side audit and reporting
- parking is the first demo activity, but the flow is designed to support other activities later

## NFC And Device Notes

Real card operations require:

- an NFC-capable device
- NFC enabled on the device
- a supported physical NFC card/tag

Current validation direction:

- Android is the primary real-device target
- iOS remains a secondary validation target and must be documented honestly based on real-device behavior

Without a real NFC-capable device, the app may still support mock or simulation flows for development and demo.

## Repository Working Rules

Branch strategy:

- `main` = protected release branch
- `develop` = integration branch
- `feature/*` = implementation branches for each feature/task

Merge flow:

1. Feature work is implemented in a separate `feature/*` branch.
2. Finished work is proposed by merge request into `develop`.
3. Demo/Release Engineer reviews and merges approved work into `develop`.
4. Demo/Release Engineer prepares the promotion merge request from `develop` to `main`.
5. Project Owner performs the final merge into `main`.
6. Merge to `main` triggers GitHub Actions release publishing to app distribution.

Commit-message convention:

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`

Example:

```txt
chore: initialize repository baseline
```

## Main Project Documents

Recommended reading order for the project owner:

- `.codex/specs/PROJECT_OWNER_READING_ORDER.md`

Main execution documents:

- `.codex/specs/REQUIREMENTS.md`
- `.codex/specs/DESIGN.md`
- `.codex/specs/TASKS.md`
- `.codex/specs/EXECUTION_ORDER.md`
- `.codex/specs/AGENT_OPERATING_PROTOCOL.md`

## Local Development Setup

Implementation setup will be finalized during the React Native scaffolding tasks.

Planned stack:

- React Native CLI
- TypeScript
- React Navigation
- NativeWind for utility-first styling
- `react-native-nfc-manager`
- SQLite
- Jest
- SonarCloud

## Mock And Demo Path

Before the real NFC card/tag is available, development may proceed with:

- mocked card repository behavior
- simulation flows
- UI-level demo states

This allows business logic, screens, tests, and documentation to progress without waiting for hardware.

## Submission And Release Notes

Expected delivery package:

- source code repository
- working app demo
- technical and non-technical documentation
- presentation material
- APK distribution path for reviewer installation

Planned release automation:

- GitHub Actions on `main`
- SonarCloud quality checks
- app distribution publish pipeline

## Known Limitations Right Now

- real NFC card/tag details are still pending
- final Figma refinement is still pending
- GitHub, SonarCloud, and app distribution credentials are not configured yet
- React Native application scaffolding is not created yet in full

## Remote Setup Notes

When GitHub or GitLab is ready:

1. create the remote repository
2. add the remote to this local repository
3. push `main`
4. create `develop`
5. configure protected-branch rules
6. configure SonarCloud and GitHub Actions secrets
7. configure app distribution credentials
