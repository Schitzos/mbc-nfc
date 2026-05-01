# CI/CD Setup Notes

This repository uses two GitHub Actions workflows:

- `.github/workflows/quality.yml`
- `.github/workflows/release-main.yml`

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

## Current Prototype Choice

The workflow currently builds `assembleDebug` for reviewer distribution readiness.

When signing and store/reviewer requirements are finalized, this can be upgraded to:

- `assembleRelease`
- or a signed `bundleRelease` / `assembleRelease` path

without changing the branch-promotion model.
