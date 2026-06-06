# QA Evidence and PR Gate Policy

## 1. Purpose

This document defines the manual QA evidence required before feature work is pushed/merged and before final delivery.

It complements:

- `UNIT_TEST_COVERAGE_POLICY.md` for automated unit-test coverage.
- `TEST_PLAN.md` and `E2E_TEST_CASES.md` for validation scenarios.
- `RELEASE_PLAN.md` for release readiness.

## 2. Feature PR QA Gate

Before a Senior Frontend Engineer opens or finalizes a PR for a feature, Senior QA must verify the changed feature in an Android simulator/emulator or real Android device when available.

For each feature PR, QA must provide:

1. Feature/task ID being tested.
2. Build/version/branch name.
3. Device or Android simulator name and OS/API level.
4. Test scenario summary.
5. Pass/fail result.
6. Screenshots proving the feature behavior.
7. Defects found, if any.
8. Retest screenshots after fixes, if defects were resolved.

A feature PR should not be merged without QA evidence unless the PM/Software Architect records an approved exception.

## 3. Screenshot Evidence Rules

Screenshots should prove the visible behavior, not only the final screen.

For role features, capture at least:

- Station: register/top-up success and relevant validation/error state.
- Gate: successful check-in.
- Scout: read-only card status, balance, active visit, and recent logs.
- Error flows: representative errors such as already checked-in, insufficient balance, invalid card, or write failure when applicable.

Screenshots must not expose raw secrets, raw Silent Shield payloads, private keys, or sensitive local debug dumps.

## 4. Final Delivery QA Evidence

At the end of the project, Senior QA must provide a use-case testing evidence package proving the project satisfies the requirements.

The final QA evidence package should include:

- Covered requirements/use cases.
- Test environment.
- Android simulator/device screenshots.
- Result per scenario.
- Known limitations.
- Open defects, if any.
- Final QA recommendation: GO, CONDITIONAL GO, or NO-GO.

## 5. Required Final Use-Case Evidence

Final QA evidence must cover at minimum:

1. Station registers a new member card.
2. Station tops up balance.
3. Scout reads card state and recent logs without modifying the card.
4. Double check-in is rejected.
5. Double checkout/no active visit is rejected.
6. Insufficient balance blocks checkout and allows recovery after top-up.
7. SQLite report shows only local-device audit/reporting data.
8. Silent Shield protected payload is not plainly readable by generic NFC reader validation, when real NFC testing is available.

## 6. Ownership

| Responsibility              | Owner                           |
| --------------------------- | ------------------------------- |
| Feature screenshot evidence | Senior QA                       |
| Fixing failed feature QA    | Senior React Native FE          |
| PR merge decision           | PM / reviewer / repository rule |
| Final QA evidence package   | Senior QA                       |
| Final GO/NO-GO decision     | Product Owner / PM              |

## 7. Gate Rule

A feature is not ready for merge unless both are true:

1. Automated tests satisfy `UNIT_TEST_COVERAGE_POLICY.md`.
2. QA screenshot evidence satisfies this policy, or an approved exception is documented.
