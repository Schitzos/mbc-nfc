# KDX Membership Benefit Card Release Plan

## 1. Release Strategy

The prototype should be released in milestones. Each milestone must satisfy its exit criteria before moving to the next.

Agent coordination and escalation follow `specs/AGENT_OPERATING_PROTOCOL.md`.
Feature-based day-to-day implementation order is documented in `specs/EXECUTION_ORDER.md`.

## 2. Delivery Roles

| Role | Release Responsibility |
| --- | --- |
| Product Owner | Confirms MVP scope and acceptance criteria. |
| Project Manager | Tracks milestone readiness, blockers, and delivery sequence. |
| System Analyst | Confirms requirements, assumptions, and traceability stay aligned. |
| Software Architect | Confirms architecture boundaries and technical decisions. |
| Senior React Native FE | Implements role flows and frontend integration through separate feature branches. |
| UI/UX Designer | Confirms Signal UI alignment, role UX, and screen states. |
| NFC/Mobile Native Specialist | Confirms NFC setup, device behavior, and tag/card constraints. |
| Test Automation Engineer | Confirms repeatable automated tests and mocked repository coverage. |
| Senior QA | Confirms manual QA coverage and acceptance readiness. |
| Security Pentester | Confirms Silent Shield, tamper handling, and privacy risks. |
| Technical Writer / Presentation Specialist | Confirms docs and presentation material. |
| Demo/Release Engineer | Confirms Git/repository baseline, branch promotion rules, GitHub Actions distribution pipeline, APK app distribution path, demo path, capture, run instructions, known limitations, and submission package. |

## 3. Milestones

### M0 Repository Baseline

Scope:

- Git repository initialization.
- Branch strategy for `feature/*`, `develop`, and `main`.
- GitHub branch protection / repository governance for `develop` and `main`.
- `CODEOWNERS` or equivalent reviewer-routing guidance.
- Git commit-message convention.
- React Native-ready `.gitignore`.
- README with setup, run, NFC hardware, mock/demo, and known limitation notes.
- Security check for secrets and generated artifacts before baseline commit.

Exit criteria:

- Repository has a clean baseline or a documented reason why commit is deferred.
- Demo/Release Engineer confirms GitHub/GitLab submission path is clear.
- Branch promotion rules are documented and understood before feature work starts.
- GitHub review and branch-protection rules are configured before normal feature PR/MR flow begins.
- The team understands which required checks are enforced now and which are deferred until CI is available.
- Commit-message convention is documented before team commits begin.
- Security Pentester confirms no local secrets, raw NFC payloads, dependency folders, or build artifacts are staged.
- Project Manager confirms M1 can start from the repository baseline.

### M1 Architecture Skeleton

Scope:

- React Native TypeScript project.
- Clean Architecture folders.
- MBC domain entities.
- MBC card repository interface.
- Mock card repository for hardware-independent development.
- Test baseline.
- Coverage reporting baseline.
- Repository baseline from M0.

Exit criteria:

- Project builds.
- Tests run.
- Git status is clean or expected generated changes are documented.
- Domain/application layers have no native NFC dependencies.
- Software Architect confirms folder/layer boundaries.
- Project Manager confirms milestone tracking is updated.

### M2 Offline Card Rules

Scope:

- Activity tariff calculator.
- Activity state policy.
- Transaction log policy.
- Local SQLite ledger repository and summary path.
- Mock card repository fixtures.
- Use-case tests with mocked card repository.

Exit criteria:

- Rp 2.000 started-hour tariff works for the parking demo activity.
- Activity tariff and state logic are not hardcoded only to parking.
- Double check-in/out are rejected.
- Latest five logs are retained.
- Local ledger summary works offline on the device.
- Station/Gate/Terminal/Scout use cases can run without real NFC hardware.
- Test Automation Engineer confirms automated domain/use-case coverage.
- Automated unit/application coverage reaches at least 90% for implemented scope.
- Senior QA and Test Automation Engineer confirm `E2E_TEST_CASES.md` is updated with current status and evidence references.
- System Analyst confirms business/system requirements remain traceable.

### M3 Role Use Cases

Scope:

- Station registration.
- Station top-up.
- Station local ledger summary.
- Gate activity check-in and simulation mode.
- Terminal activity checkout and insufficient balance handling.
- Scout inspection.

Exit criteria:

- All role use cases pass tests with mocked card repository.
- Station reporting path is understandable and clearly marked as device-local history.
- Product Owner confirms role flows satisfy MVP acceptance.
- UI/UX Designer confirms role flows are understandable before final Signal UI polish.

### M4 NFC and Silent Shield Vertical Slice

Scope:

- NFC read/write repository.
- MBC card codec.
- Silent Shield protection.
- Card validation and error handling.

Exit criteria:

- Real device can read/write target card where supported.
- Sensitive fields are not plainly readable.
- NFC cleanup works after cancel/error.
- NFC/Mobile Native Specialist records device/card behavior.
- Security Pentester confirms Silent Shield and tamper checks for prototype scope.

### M5 UI and Demo Hardening

Scope:

- Role switcher.
- Station, Gate, Terminal, Scout screens.
- Mock-card demo path.
- Signal UI design system direction.
- Demo data and capture.
- APK app distribution readiness.
- Device test matrix.
- SonarCloud quality analysis.
- Husky commit/lint enforcement.
- GitHub Actions publish workflow for `main`.
- Submission package.

Exit criteria:

- Working app has no crash in demo flow.
- Core flows are demonstrated.
- Documentation and presentation are ready.
- GitHub/GitLab repository package is ready for submission.
- APK distribution packaging or tester installation instructions are ready.
- SonarCloud quality gate passes and coverage is visible in analysis output.
- Commit-message and changed-file lint enforcement are active for team delivery.
- Merge to `main` is the documented trigger for APK distribution publishing.
- Senior QA confirms acceptance flow coverage.
- Senior QA confirms manual screenshot evidence and defect notes for executed E2E flows.
- Demo/Release Engineer confirms capture, APK distribution path, run instructions, and known limitations.
- Technical Writer / Presentation Specialist confirms final documentation and presentation sections.

## 4. Demo Readiness Checklist

- Writable NFC card/tag prepared.
- Android device prepared.
- iPhone behavior checked or documented.
- App installed on test device.
- APK distribution path prepared for tester/reviewer installation.
- Station registration tested.
- Station top-up tested.
- Gate activity check-in tested.
- Gate simulation mode tested.
- Terminal checkout tested.
- Insufficient balance tested.
- Scout inspection tested.
- Generic NFC read test confirms sensitive fields are not plain text.
- Image or short video demo captured.
- Presentation covers UI/UX design, software design, construction, quality, deployment, and security.
- Known limitations ready to explain.

## 5. Production Readiness Gap

The prototype is not production-ready until these are added:

- Production-grade key management.
- Strong card authenticity verification.
- Backend audit and reconciliation.
- Operator authentication.
- Corrupted/lost card recovery.
- Privacy and retention policy.
- Release signing and CI/CD.
