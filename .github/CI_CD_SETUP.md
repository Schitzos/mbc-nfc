# CI/CD Setup Notes

This repository uses three GitHub Actions workflows:

- `.github/workflows/quality.yml`
- `.github/workflows/release-main.yml`
- `.github/workflows/distribute.yml`

## Quality Workflow

The quality workflow runs on `develop` and `main` pushes and pull requests.

It performs:

- `npm ci`
- `npm run lint`
- `npm run test:quality`
- `npm audit --audit-level=low`
- coverage and JUnit artifact upload
- SonarCloud scan when `SONAR_TOKEN` is configured

### Required secret

- `SONAR_TOKEN`

If `SONAR_TOKEN` is not configured, the workflow keeps the quality steps but skips the SonarCloud scan explicitly.

## Main Release Workflow

The release workflow runs only when `main` receives a merge or push.

It performs:

- dependency install
- lint
- coverage test run
- `npm audit`
- Android APK build
- APK artifact upload
- Firebase App Distribution publish when secrets and variables are configured

### Required secrets for Firebase App Distribution

- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

### Required variable

- `FIREBASE_TESTER_GROUPS`

If these are not configured, the workflow still builds and uploads the APK artifact and logs that distribution was skipped.

## Firebase Distribution Workflow (Signed Release)

The `distribute.yml` workflow is the production-ready path for signed release APK distribution.

It performs:

- dependency install and quality checks
- keystore decode from GitHub Secrets
- signed release APK build (falls back to debug if signing secrets are missing)
- APK artifact upload
- dynamic release notes generation
- Firebase App Distribution publish

### Required secrets for signed release

- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

### Required variable

- `FIREBASE_TESTER_GROUPS`

For full setup instructions, see `.codex/specs/FIREBASE_DISTRIBUTION_SETUP.md`.

## Current Prototype Choice

The `release-main.yml` workflow currently builds `assembleDebug` for quick reviewer distribution readiness.

The `distribute.yml` workflow provides the upgrade path to signed release builds without changing the branch-promotion model. Both workflows coexist and trigger on `main` push.
