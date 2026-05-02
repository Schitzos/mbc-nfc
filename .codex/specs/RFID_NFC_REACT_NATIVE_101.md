# KDX Membership Benefit Card React Native Prototype 101

> This document is a developer onboarding and NFC/React Native technical reference only.
> If this document conflicts with `REQUIREMENTS.md`, `DESIGN.md`,
> `CARD_DATA_SECURITY_LEDGER_SPEC.md`, `SECURITY.md`, or `PO_FINAL_GO_NO_GO_CHECKLIST.md`,
> follow those source-of-truth documents.

## 1. Overview

This project is a frontend mobile assessment for KDX Chapter 1: Membership Benefit Card (MBC). The app demonstrates how an NFC card can become a portable cooperative membership card for areas where internet connectivity is unstable.

Instead of relying on a central database for every transaction, the card carries the important member state: identity, balance, active parking visit status, tariff snapshot for the active visit, and recent transaction history. The mobile app reads and writes that card data directly through NFC. A separate device-local SQLite ledger may store offline reporting and audit history for the current device, but it does not replace the card as member-state truth.

The PDF gives parking as the concrete member benefit scenario. For MVP, this project implements **parking only**. The code should still be structured with clean extension seams so future cooperative activities can reuse similar tap-in/tap-out patterns later, but generic/non-parking activities are not MVP deliverables and must not block parking acceptance.

## 2. MBC Project-Specific Decisions

For this project, the NFC implementation must follow these decisions:

1. Parking is the only MVP activity.
2. Generic/non-parking activity support is a future extension only, not MVP.
3. NFC card is the source of truth for member identity, balance, active parking visit, active visit tariff snapshot, and last five card transaction logs.
4. SQLite is only a local device reporting/audit ledger. It is not the global member-state source of truth.
5. The default parking tariff is Rp2.000 per started hour.
6. The active tariff must be locally editable by authorized admin/station staff without rebuilding the APK.
7. The active tariff must be stored locally on-device using SQLite or secure local storage.
8. Tariff must be locked at successful Gate check-in by storing a compact tariff snapshot on the NFC card active visit state.
9. Terminal checkout must calculate fee from the card-stored tariff snapshot, not from the current local tariff setting.
10. Local tariff changes affect only new check-ins. Members already checked in keep their check-in tariff until checkout.
11. Silent Shield must use production-grade protection: authenticated encryption/integrity validation, not plain JSON, Base64-only encoding, or weak obfuscation.
12. Every successful NFC write must be verified using readback before showing success.
13. Card payload size must be validated against the selected NFC tag/card capacity.
14. All operational offline devices must be manually configured with the same active tariff before operation.

## 3. Core Idea

The app has one codebase with four operational roles:

| Role         | Purpose                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------- |
| The Station  | Admin registration, member balance top-up, and authorized local tariff management.            |
| The Gate     | Parking entry point that writes check-in timestamp and tariff snapshot to card.               |
| The Terminal | Parking exit point that calculates duration, deducts balance, and clears active visit status. |
| The Scout    | Member self-service view for card balance, status, and history.                               |

## 4. Important NFC Concept

Phones do not read every RFID card. Most phones can read NFC/HF RFID cards at 13.56 MHz. They generally cannot read UHF RFID inventory tags.

Prototype target:

- NFC Forum compatible tags.
- Writable NFC tags/cards with enough memory for structured and protected MBC payload.
- ISO 14443 compatible tags where supported.
- NDEF-compatible cards where practical.

The implementation should isolate card parsing and card writing so the payload format can evolve without changing the UI.

Before final real-device demo, the team must confirm:

- Exact NFC card/tag type.
- Writable memory capacity.
- Whether the protected payload fits the selected tag/card.
- Android read/write behavior.
- iOS support or explicit deferral.

## 5. Goals From Assessment Brief

- Secure hardware integration: read and write card data through NFC.
- Offline-first integrity: validate balance and parking status without internet or external API.
- State management: manage parking check-in/check-out flow inside limited card memory.
- Data privacy: protect sensitive identity and balance from plain reading by other NFC apps.

The first real-device validation target is Android. iOS validation stays in scope, but it should be documented from real-device results instead of assumed parity.

## 6. Main Flows

### Station Registration

Admin taps a blank or reusable NFC card and writes a registered MBC payload. The internal member ID is generated by the system, is not typed by staff, the first implementation round does not require human-readable member profile input, and the successful registration is also recorded in the local ledger for audit/reporting.

Registration must reject an already registered valid MBC card unless an explicit reset flow exists. For MVP, overwrite is rejected.

### Station Top-Up

Admin reads the card, inputs top-up amount, updates balance on card, appends a transaction log, and writes a local ledger entry for reporting/audit.

Top-up must not clear an active parking visit. If a member is checked in and has insufficient balance, Station top-up should allow the member to return to Terminal and complete checkout.

### Station/Admin Local Tariff Setting

Because the app is offline and the APK may already be built, tariff cannot rely only on build-time config or backend remote config.

Authorized admin/station staff can update the active parking tariff locally, for example from Rp2.000/hour to Rp3.000/hour. The active tariff is stored locally on-device using SQLite or secure local storage.

Rules:

- Only authorized admin/station staff may update tariff.
- Terminal and Gate must read tariff from the local tariff repository.
- The active tariff must be displayed clearly before check-in/checkout-sensitive actions.
- Changing tariff on one offline device does not update other devices automatically.
- All active offline devices must be manually configured with the same tariff before operation.

Future enhancement may use a signed Tariff Config NFC card to distribute tariff changes offline.

### Gate Check-In

Gate operator taps the card. If the member is not currently checked in, the app writes parking activity ID, entry timestamp, checked-in status, and a compact tariff snapshot from the local active tariff.

The tariff snapshot should include at least:

```txt
ratePerStartedHour
tariffVersion
roundingMode
```

This locks the checkout tariff for that active visit.

### Gate Simulation Mode

For testing, the Gate can write an entry timestamp in the past so the Terminal can validate duration and fee calculation without waiting in real time.

Simulation mode must not create a future check-in time. If checkout time is earlier than check-in time, Terminal must reject checkout as invalid duration.

### Terminal Check-Out

Terminal operator taps the card. The app calculates parking duration, rounds up to the next started hour, charges using the tariff snapshot stored on the card, deducts balance, clears active visit status, appends a transaction log, and records the completed transaction in the local ledger for reporting/audit.

Terminal must not use the current local active tariff for an already checked-in card. It must use the card-stored tariff snapshot.

If a legacy/demo checked-in card has no tariff snapshot, Terminal may fallback to the current local active tariff only after showing a warning.

### Scout Inspection

Member taps their card once to instantly view balance, active parking status, and the last five transaction logs.

Scout is read-only. It must not write card state.

## 7. Tariff Rule

For the parking MVP activity, members receive the default exclusive tariff:

```txt
Rp 2.000 per started hour
```

Rounding rule:

```txt
1 hour 5 minutes 1 second = 2 charged hours
```

The tariff is locally configurable by authorized admin/station staff. However, checkout for an active visit uses the tariff snapshot locked at check-in.

Example:

| Scenario                                | Check-in tariff | Tariff later changed?                   | Checkout tariff |
| --------------------------------------- | --------------: | --------------------------------------- | --------------: |
| Member A checks in before tariff change |    Rp2.000/hour | Changed to Rp3.000/hour before checkout |    Rp2.000/hour |
| Member B checks in after tariff change  |    Rp3.000/hour | No later change                         |    Rp3.000/hour |

Guest flow is outside the project scope. The PDF describes guest parking as a separate manual path with Rp50.000 per hour pricing, but that context is not implemented in this app.

## 8. Activity Scope

Parking is the required MVP activity because the PDF defines its exact tariff and operational flow.

The domain and use cases may use clean boundaries such as tariff repository, parking visit use case, card codec, and ledger repository so future cooperative activities can be added later. Future extension readiness must not create MVP runtime screens, tests, or flows for non-parking activities.

## 9. Sequential Loop Rule

The system must preserve the visit lifecycle:

```txt
NOT_CHECKED_IN -> CHECKED_IN -> NOT_CHECKED_IN
```

Invalid actions:

- Double check-in.
- Double check-out.
- Checkout without sufficient balance.
- Starting a second parking visit while one parking visit is already active.
- Checkout with device time earlier than check-in time.
- Checkout using a tampered or unauthenticated card payload.

## 10. Security and Write Safety

Silent Shield must protect identity and balance from plain reading by other NFC apps.

Minimum expectations:

- Do not store plain JSON member data on the card.
- Do not rely on Base64-only encoding as security.
- Use production-grade authenticated encryption or equivalent integrity-protected secure wrapping.
- Verify payload authenticity/integrity before trusting balance, visit status, or tariff snapshot.
- Reject tampered payloads with a clear card authentication failure.
- Validate payload size before write.
- After every NFC write, read back the card and verify the expected state before showing success.

## 11. Recommended Tech Stack

| Area                 | Choice                             |
| -------------------- | ---------------------------------- |
| Mobile framework     | React Native CLI                   |
| Language             | TypeScript                         |
| NFC library          | `react-native-nfc-manager`         |
| Local ledger         | SQLite                             |
| Local tariff setting | SQLite or secure local storage     |
| State management     | Zustand or React Context           |
| Testing              | Jest, React Native Testing Library |
| Architecture         | Clean Architecture                 |
| UI system            | Signal UI                          |

The core member state should live on the card for the assessment flow. SQLite supports local audit/reporting and local tariff setting only.

## 12. Deliverables

- Source code repository.
- Working frontend app with no crash in demo flows.
- Short image/video demo.
- Technical and non-technical documentation.
- Presentation covering UI/UX design, software design, construction, quality, deployment, and security.

The repository should be prepared for GitHub or GitLab submission.
