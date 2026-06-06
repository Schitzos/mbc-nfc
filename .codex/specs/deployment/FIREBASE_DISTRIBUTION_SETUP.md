# Firebase App Distribution — Single Workflow Setup

> Task: `T-027B`  
> Owner: Demo/Release Engineer  
> Source workflow: `.github/workflows/build.yml`

## 1. Current CI/CD Shape (Single Workflow)

This project uses **one** GitHub Actions workflow file:

- `.github/workflows/build.yml`

Behavior:

- PR to `develop` runs validation jobs (unit test, lint, vulnerability scan, SonarCloud).
- Push/merge to `main` runs build + distribution jobs.
- Build job creates a distributable debug APK with bundled JS.
- Distribution job uploads the APK to Firebase App Distribution.

## 2. Required GitHub Secrets

Set these in GitHub repository secrets:

| Secret                          | Purpose                                                             |
| ------------------------------- | ------------------------------------------------------------------- |
| `GOOGLE_SERVICES_JSON`          | Base64 content of `google-services.json` used in Android build job. |
| `FIREBASE_APP_ID`               | Firebase Android App ID (format `1:...:android:...`).               |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service account JSON text used by distribution action.         |
| `SONAR_TOKEN`                   | SonarCloud token for quality analysis step.                         |

## 3. Service Account Requirements

The service account in `FIREBASE_SERVICE_ACCOUNT_JSON` must:

- belong to the same Firebase/GCP project as `FIREBASE_APP_ID`,
- have role `Firebase App Distribution Admin`.

If these are mismatched, Firebase upload returns HTTP `403`.

## 4. Keystore Policy (Current Debug Distribution)

Current distribution path uses debug APK:

- CI generates `android/app/debug.keystore` on runner when missing.
- Keystore is ephemeral and not committed to repository.
- This is acceptable for assessment/debug distribution.

Release signing keystore is not required for current debug distribution path.

## 5. Secret Preflight Checks

`build.yml` includes fail-fast checks:

- Build job checks `GOOGLE_SERVICES_JSON`.
- Distribution job checks `FIREBASE_APP_ID` and `FIREBASE_SERVICE_ACCOUNT_JSON`.

Missing secret fails early with explicit error.

## 6. Release Notes and CI Summary

`build.yml` automatically:

- generates Firebase release notes from workflow metadata,
- writes build/distribution summary to GitHub step summary.

## 7. Troubleshooting

### A) `Unable to load script` after installing APK

Cause: JS bundle missing in APK.  
Current workflow mitigates this by bundling:

- `index.android.bundle` into `android/app/src/main/assets`

before `assembleDebug`.

### B) Firebase upload `403 The caller does not have permission`

Check:

1. `FIREBASE_APP_ID` project matches service account project.
2. Service account has `Firebase App Distribution Admin`.
3. App Distribution API is enabled.
4. Secrets are updated (especially after key rotation).

### C) `base64: invalid input` for Google services

`GOOGLE_SERVICES_JSON` must be base64 text if workflow decodes it.

## 8. Final Rule

Treat `.github/workflows/build.yml` as the release automation source of truth for this project revision.
