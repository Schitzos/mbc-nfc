# Firebase App Distribution — GitHub Actions Setup Guide

> Task: T-027B | Owner: Demo/Release Engineer
> Aligned with: `RELEASE_PLAN.md` §2 (Release Automation Channel), `DONE.md` §Firebase Distribution

---

## Overview

This guide explains how to configure GitHub Actions to automatically build and distribute the KDX MBC Android app (`com.mbcnfc`) via Firebase App Distribution whenever code is merged to `main`.

Two workflow files are involved:

| File                                 | Purpose                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| `.github/workflows/release-main.yml` | Quality gate + debug APK build + optional Firebase publish |
| `.github/workflows/distribute.yml`   | Dedicated signed release APK → Firebase App Distribution   |

The `release-main.yml` workflow is the current prototype path (debug APK). The `distribute.yml` workflow is the production-ready path for signed release builds.

---

## 1. Prerequisites

Before configuring the workflow, ensure:

- [ ] Firebase project exists and is linked to `com.mbcnfc`
- [ ] Firebase App Distribution is enabled in the Firebase Console
- [ ] Android app is registered in Firebase (package name: `com.mbcnfc`)
- [ ] You have Owner or Editor access to the Firebase project
- [ ] Repository is hosted on GitHub with Actions enabled

---

## 2. GitHub Secrets Required

Configure these in **GitHub → Repository → Settings → Secrets and variables → Actions → Secrets**:

| Secret Name                 | Description                                                                          | Required                |
| --------------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| `FIREBASE_SERVICE_ACCOUNT`  | Full JSON content of a Firebase service account key with App Distribution Admin role | Yes                     |
| `FIREBASE_APP_ID`           | Firebase App ID for the Android app (format: `1:123456789:android:abcdef`)           | Yes                     |
| `ANDROID_KEYSTORE_BASE64`   | Base64-encoded release keystore file                                                 | Yes (for signed builds) |
| `ANDROID_KEYSTORE_PASSWORD` | Password for the keystore                                                            | Yes (for signed builds) |
| `ANDROID_KEY_ALIAS`         | Alias of the signing key inside the keystore                                         | Yes (for signed builds) |
| `ANDROID_KEY_PASSWORD`      | Password for the specific key alias                                                  | Yes (for signed builds) |

### GitHub Variables (non-secret)

Configure in **Settings → Secrets and variables → Actions → Variables**:

| Variable Name            | Description                        | Example                     |
| ------------------------ | ---------------------------------- | --------------------------- |
| `FIREBASE_TESTER_GROUPS` | Comma-separated tester group names | `kdx-reviewers,internal-qa` |

---

## 3. How to Generate the Firebase Service Account

### Step-by-step:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Project Settings** (gear icon)
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Confirm and download the JSON file

### Add to GitHub:

```bash
# The downloaded file is your service account JSON
# Copy the ENTIRE file content as the GitHub secret value

# Option A: Copy file content directly
cat your-service-account-key.json | pbcopy   # macOS
cat your-service-account-key.json | xclip    # Linux

# Option B: If the workflow expects base64 (not needed for current setup)
base64 -i your-service-account-key.json | tr -d '\n' | pbcopy
```

Go to GitHub → Repository → Settings → Secrets → Actions → **New repository secret**:

- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: paste the entire JSON content

> ⚠️ **Security**: Delete the local JSON file after adding it to GitHub Secrets. Never commit it to the repository.

### Required IAM Role

The service account needs the **Firebase App Distribution Admin** role. To verify or add:

1. Go to [Google Cloud Console → IAM](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account email
3. Ensure it has `roles/firebaseappdistro.admin`

---

## 4. How to Create the Release Keystore

### Generate a new keystore:

```bash
keytool -genkey -v \
  -keystore mbc-release.keystore \
  -alias mbc \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=KDX MBC, OU=Development, O=KDX, L=Jakarta, ST=DKI Jakarta, C=ID"
```

### Base64-encode for GitHub Secrets:

```bash
# macOS
base64 -i mbc-release.keystore | tr -d '\n' | pbcopy

# Linux
base64 -w 0 mbc-release.keystore | xclip -selection clipboard

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("mbc-release.keystore")) | Set-Clipboard
```

### Add secrets to GitHub:

| Secret                      | Value                        |
| --------------------------- | ---------------------------- |
| `ANDROID_KEYSTORE_BASE64`   | The base64 string from above |
| `ANDROID_KEYSTORE_PASSWORD` | `YOUR_STORE_PASSWORD`        |
| `ANDROID_KEY_ALIAS`         | `mbc`                        |
| `ANDROID_KEY_PASSWORD`      | `YOUR_KEY_PASSWORD`          |

> ⚠️ **Security**: Store the original `.keystore` file securely offline. If lost, you cannot update the app on the same signing identity. Never commit the keystore to the repository.

---

## 5. How to Find the Firebase App ID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Project Settings**
4. Under **Your apps**, find the Android app with package `com.mbcnfc`
5. Copy the **App ID** (format: `1:123456789:android:abcdef123456`)

Add as GitHub secret:

- Name: `FIREBASE_APP_ID`
- Value: the App ID string

---

## 6. Tester Group Setup

### Create a tester group in Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **App Distribution** (left sidebar under Release & Monitor)
4. Click **Testers & Groups** tab
5. Click **Add group**
6. Name it (e.g., `kdx-reviewers`)
7. Add tester email addresses

### Recommended groups for KDX MBC:

| Group Name      | Purpose                         | Members         |
| --------------- | ------------------------------- | --------------- |
| `kdx-reviewers` | Assessment reviewers/examiners  | Reviewer emails |
| `internal-qa`   | QA team for pre-release testing | QA team emails  |

### Configure in GitHub:

Go to **Settings → Secrets and variables → Actions → Variables → New repository variable**:

- Name: `FIREBASE_TESTER_GROUPS`
- Value: `kdx-reviewers,internal-qa`

---

## 7. Workflow Files

### Current: `.github/workflows/release-main.yml` (Debug APK)

This is the existing prototype workflow. It:

- Runs quality checks (lint, tests, audit)
- Builds a **debug** APK
- Uploads APK as GitHub Actions artifact
- Publishes to Firebase App Distribution if secrets are configured
- Gracefully skips distribution if secrets are missing

### New: `.github/workflows/distribute.yml` (Signed Release APK)

This is the production-ready workflow for signed release builds. It:

- Triggers only on push to `main`
- Decodes the release keystore from secrets
- Builds a **signed release** APK
- Uploads signed APK as GitHub Actions artifact
- Publishes to Firebase App Distribution with release notes
- Includes build metadata in release notes

---

## 8. Verifying the Setup

### First-time verification checklist:

1. [ ] Push or merge a commit to `main`
2. [ ] Go to **Actions** tab in GitHub
3. [ ] Verify the workflow starts and passes all steps
4. [ ] Check the **Publish to Firebase** step logs for success
5. [ ] Verify testers receive an email invitation from Firebase
6. [ ] Install the APK from the Firebase App Tester app on a device

### Troubleshooting:

| Symptom                      | Likely Cause               | Fix                                              |
| ---------------------------- | -------------------------- | ------------------------------------------------ |
| Workflow skips Firebase step | Secrets not configured     | Add all required secrets                         |
| `INVALID_ARGUMENT` error     | Wrong App ID format        | Verify App ID in Firebase Console                |
| `PERMISSION_DENIED` error    | Service account lacks role | Add `firebaseappdistro.admin` role               |
| Build fails at signing       | Keystore decode error      | Re-encode keystore, check base64 has no newlines |
| Testers don't receive email  | Group name mismatch        | Verify group name matches exactly                |

---

## 9. Upgrade Path

The current `release-main.yml` uses `assembleDebug` for quick reviewer access. When ready for production-grade distribution:

1. Configure all signing secrets (§4)
2. Enable the `distribute.yml` workflow (it activates automatically when secrets exist)
3. Optionally disable the debug distribution in `release-main.yml`

The `distribute.yml` workflow is designed to coexist with `release-main.yml`. Both trigger on `main` push, but `distribute.yml` only runs the Firebase publish step when signing secrets are available.

---

## 10. Security Considerations

- **Never** commit keystore files, service account JSON, or passwords to the repository
- Service account JSON is stored as a GitHub Secret (encrypted at rest)
- Keystore is base64-encoded in a GitHub Secret (encrypted at rest)
- The workflow decodes the keystore only in the ephemeral CI runner
- GitHub Actions logs automatically mask secret values
- Rotate the service account key periodically
- Use the minimum required IAM role (`firebaseappdistro.admin`)

---

## 11. Known Limitations

| Limitation                           | Impact                       | Mitigation                              |
| ------------------------------------ | ---------------------------- | --------------------------------------- |
| Debug APK is unsigned                | Cannot verify app identity   | Use `distribute.yml` for signed builds  |
| Firebase free tier has tester limits | Max 500 testers per project  | Sufficient for assessment               |
| No AAB support yet                   | Cannot publish to Play Store | Out of scope for assessment             |
| Release notes are static template    | No per-commit changelog      | Can be enhanced with git log extraction |

---

## References

- [Firebase App Distribution docs](https://firebase.google.com/docs/app-distribution)
- [wzieba/Firebase-Distribution-Github-Action](https://github.com/wzieba/Firebase-Distribution-Github-Action)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- `.codex/specs/RELEASE_PLAN.md` — Release automation requirements
- `.codex/specs/DONE.md` — Firebase Distribution Definition of Done
- `.github/CI_CD_SETUP.md` — CI/CD overview
