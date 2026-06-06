# CI/CD Pipeline

## Overview

The MBC NFC app uses GitHub Actions for automated quality gates and deployment. Every code change passes a sequence of validation jobs before an APK can be built and distributed.

Pipeline file: `.github/workflows/build.yml`

---

## Triggers

| Event                                     | Branch    | What runs                                                  |
| ----------------------------------------- | --------- | ---------------------------------------------------------- |
| Pull Request (opened/sync/reopened/ready) | `develop` | `unit_test` + `lint` + `vulnerability_scan` + `sonarcloud` |
| Push                                      | `main`    | Same as above                                              |
| `workflow_dispatch` (manual)              | `main`    | Full pipeline including `build_apk` + `distribute_apk`     |

---

## Job Dependency Graph

```
unit_test ──┐
            ├──→ vulnerability_scan ──→ sonarcloud ──→ build_apk ──→ distribute_apk
lint ───────┘
```

`build_apk` and `distribute_apk` only run on **`main` branch via manual `workflow_dispatch`** trigger.

---

## Jobs

### 1. `unit_test`

- Runs: `npm test` (Jest)
- Requirement: all tests must pass
- No coverage report at this step (coverage is run separately in `sonarcloud`)

### 2. `lint`

- Runs: `npm run lint` (ESLint)
- Requirement: zero lint errors

### 3. `vulnerability_scan`

- Depends on: `unit_test` + `lint`
- Runs: `npm audit --omit=dev --audit-level=high`
- Requirement: no high/critical vulnerabilities in production dependencies

### 4. `sonarcloud`

- Depends on: `vulnerability_scan`
- Runs: `npx jest --coverage` then uploads to SonarCloud
- Quality gates enforced by SonarCloud: coverage ≥ 90%, no new bugs, no new code smells above threshold

### 5. `build_apk`

- Depends on: `sonarcloud` + `unit_test` + `lint` + `vulnerability_scan`
- Condition: `workflow_dispatch` on `main` only
- Steps:
  1. Set up Node 20 + Java 17 (Temurin)
  2. Validate Gradle wrapper checksum
  3. Cache Gradle dependencies
  4. Bundle JS: `react-native bundle --platform android --dev true`
  5. Generate debug keystore (CI-only, not for production signing)
  6. Inject `google-services.json` from GitHub Secret (base64-decoded)
  7. Build: `./gradlew assembleDebug --parallel --build-cache --no-daemon`
  8. Upload APK as GitHub Actions artifact (`debug-apk`)

### 6. `distribute_apk`

- Depends on: `build_apk`
- Condition: `workflow_dispatch` on `main` only
- Downloads APK artifact from `build_apk`
- Uploads to Firebase App Distribution via `wzieba/Firebase-Distribution-Github-Action@v1`
- Distributes to `testers` group with auto-generated release notes (branch, commit SHA, run URL)

---

## Quality Gates Summary

| Gate                    | Job                  | Tool              |
| ----------------------- | -------------------- | ----------------- |
| Unit tests pass         | `unit_test`          | Jest              |
| Zero lint errors        | `lint`               | ESLint            |
| No high vulnerabilities | `vulnerability_scan` | npm audit         |
| 90%+ coverage           | `sonarcloud`         | Jest + SonarCloud |
| SonarCloud quality gate | `sonarcloud`         | SonarCloud        |

---

## Pre-Commit (Local)

Before any code reaches CI, Husky hooks enforce:

- `eslint --fix` + `prettier --write` on staged `.ts/.tsx` files (via `lint-staged`)
- `commitlint` — enforces Conventional Commits format on every commit message

---

## Required GitHub Secrets

| Secret                          | Used by          | Purpose                               |
| ------------------------------- | ---------------- | ------------------------------------- |
| `SONAR_TOKEN`                   | `sonarcloud`     | SonarCloud authentication             |
| `GOOGLE_SERVICES_JSON`          | `build_apk`      | Base64-encoded `google-services.json` |
| `FIREBASE_APP_ID`               | `distribute_apk` | Firebase app identifier               |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `distribute_apk` | Firebase service account credentials  |

---

## Known Limitations

- APK build is **debug variant only** (not production-signed)
- iOS build is not included (Android-first assessment scope)
- QA validation after Firebase distribution is **manual** — no automated device testing in CI
- Demo AES key is compiled into the build — production would require secure key provisioning via Android Keystore
