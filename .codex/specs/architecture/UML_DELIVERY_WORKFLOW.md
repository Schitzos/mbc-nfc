# UML Delivery Workflow — MBC Parking MVP

> This document describes the **delivery/team workflow**, not the MBC product behavior.
>
> Product/system UML remains in `UML_SYSTEM_DIAGRAMS.md`.
>
> Use this document to explain how Project Manager, System Analyst, Software Architect, Senior Frontend Engineer/Codex, Senior QA, Release Engineer, and Product Owner collaborate to deliver the project.

---

## 1. Delivery Actors and Responsibilities

| Actor / Agent                          | Responsibility                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| Project Manager Agent                  | Execute `EXECUTION_ORDER.md` phase by phase, track task status, block incomplete gates.    |
| System Analyst Agent                   | Validate requirement alignment, acceptance criteria, and scope.                            |
| Software Architect Agent               | Validate architecture, security, test strategy, module boundaries, and extensibility.      |
| Senior Frontend Engineer / Codex Agent | Implement one task at a time from `TASKS.md`, update tests, summarize output.              |
| Senior QA Agent                        | Validate feature before PR merge and capture Android simulator/device screenshot evidence. |
| Release Engineer Agent                 | Configure GitHub Actions and Firebase App Distribution release pipeline.                   |
| Product Owner / Final Gate             | Approve final GO / NO-GO using checklist and QA evidence.                                  |

---

## 2. Delivery Use Case Diagram

```mermaid
flowchart LR
  PM[Project Manager Agent]
  SA[System Analyst Agent]
  ARCH[Software Architect Agent]
  FE[Senior Frontend Engineer / Codex Agent]
  QA[Senior QA Agent]
  REL[Release Engineer Agent]
  PO[Product Owner / Final Gate]

  UC1((Plan phase execution))
  UC2((Validate requirements))
  UC3((Validate architecture and quality policy))
  UC4((Implement task))
  UC5((Create or update unit tests))
  UC6((Validate feature and capture screenshots))
  UC7((Review PR gate))
  UC8((Merge to develop))
  UC9((Merge to main))
  UC10((Distribute APK to Firebase App Distribution))
  UC11((Prepare final evidence pack))
  UC12((Final GO / NO-GO))

  PM --> UC1
  PM --> UC7
  PM --> UC11
  SA --> UC2
  ARCH --> UC3
  ARCH --> UC7
  FE --> UC4
  FE --> UC5
  QA --> UC6
  QA --> UC11
  REL --> UC10
  PO --> UC12

  UC1 --> UC2 --> UC3 --> UC4 --> UC5 --> UC6 --> UC7 --> UC8 --> UC9 --> UC10 --> UC11 --> UC12
```

---

## 3. End-to-End Delivery Activity Diagram

```mermaid
flowchart TD
  A([Start project delivery]) --> B[Requirement freeze]
  B --> C[System Analyst validates requirements]
  C --> D{Requirement aligned?}
  D -- No --> B
  D -- Yes --> E[Architecture freeze]
  E --> F[Software Architect validates design, security, and test policy]
  F --> G{Architecture approved?}
  G -- No --> E
  G -- Yes --> H[PM selects next phase from EXECUTION_ORDER.md]

  H --> I[Codex / Senior FE works one task from TASKS.md]
  I --> J[Create or update unit tests for changed source files]
  J --> K{Coverage target >= 90%?}
  K -- No --> J
  K -- Yes --> L[Developer self-test]
  L --> M[QA validates feature on Android simulator/device]
  M --> N{QA screenshot evidence attached?}
  N -- No --> M
  N -- Yes --> O[Create PR]
  O --> P[Architect and PM review PR gate]
  P --> Q{PR approved?}
  Q -- No --> I
  Q -- Yes --> R[Merge to develop]

  R --> S{More phase tasks?}
  S -- Yes --> H
  S -- No --> T[Regression and E2E validation]
  T --> U{E2E evidence complete?}
  U -- No --> T
  U -- Yes --> V[Merge to main]
  V --> W[GitHub Actions builds APK]
  W --> X[Firebase App Distribution upload]
  X --> Y[Final QA evidence pack]
  Y --> Z[PO final GO / NO-GO]
  Z --> END([Delivery complete])
```

---

## 4. Delivery Sequence Diagram

```mermaid
sequenceDiagram
  autonumber
  participant PM as Project Manager
  participant SA as System Analyst
  participant ARCH as Software Architect
  participant FE as Senior FE / Codex
  participant QA as Senior QA
  participant GH as GitHub
  participant REL as Release Engineer
  participant FB as Firebase App Distribution
  participant PO as Product Owner

  PM->>SA: Confirm requirement scope and acceptance criteria
  SA-->>PM: Requirements aligned
  PM->>ARCH: Request architecture and quality gate validation
  ARCH-->>PM: Architecture and quality rules approved
  PM->>FE: Assign next task from EXECUTION_ORDER.md / TASKS.md
  FE->>FE: Implement task only
  FE->>FE: Create/update unit tests for changed files
  FE-->>PM: Summary: files changed, tests, risks
  PM->>QA: Request feature validation
  QA->>QA: Test on Android simulator/device
  QA-->>PM: Screenshot evidence and result
  PM->>GH: Open/approve PR gate
  ARCH->>GH: Review architecture/test/security impact
  GH-->>PM: PR merged to develop
  PM->>QA: Request regression/E2E validation
  QA-->>PM: E2E screenshot evidence complete
  PM->>GH: Merge release branch/main
  GH->>REL: Trigger GitHub Actions release workflow
  REL->>FB: Upload APK to Firebase App Distribution
  FB-->>REL: Build distributed to testers
  REL-->>PM: Release proof complete
  PM->>PO: Submit final evidence pack
  PO-->>PM: GO / NO-GO decision
```

---

## 5. Task State Diagram

```mermaid
stateDiagram-v2
  [*] --> TODO
  TODO --> IN_PROGRESS: PM assigns task
  IN_PROGRESS --> DEV_DONE: Senior FE / Codex implements
  DEV_DONE --> UNIT_TEST_DONE: Unit tests created/updated
  UNIT_TEST_DONE --> QA_READY: Developer self-test passed
  QA_READY --> QA_PASSED_WITH_EVIDENCE: QA validates + screenshots
  QA_PASSED_WITH_EVIDENCE --> PR_READY: PR prepared
  PR_READY --> MERGED_TO_DEVELOP: PM/Architect approve PR
  MERGED_TO_DEVELOP --> RELEASE_READY: Regression/E2E passed
  RELEASE_READY --> DONE: Main release + Firebase distribution complete

  DEV_DONE --> IN_PROGRESS: Test failed / rework
  QA_READY --> IN_PROGRESS: QA failed
  PR_READY --> IN_PROGRESS: PR review changes requested
  RELEASE_READY --> IN_PROGRESS: Regression failed
```

---

## 6. PR Gate Activity Diagram

```mermaid
flowchart TD
  A([Feature implementation complete]) --> B[Check linked task ID]
  B --> C[Check linked requirement ID]
  C --> D[Verify changed source files have tests]
  D --> E{Coverage target >= 90%?}
  E -- No --> F[Return to developer for test update]
  F --> D
  E -- Yes --> G[Senior QA tests feature]
  G --> H{Screenshot evidence attached?}
  H -- No --> G
  H -- Yes --> I[Software Architect reviews architecture/security impact]
  I --> J{Architecture acceptable?}
  J -- No --> K[Request code/design changes]
  K --> A
  J -- Yes --> L[PM approves PR gate]
  L --> M[Merge to develop]
  M --> N([PR gate complete])
```

---

## 7. Release Pipeline Activity Diagram

```mermaid
flowchart TD
  A([Ready for release]) --> B[Regression and E2E validation on develop]
  B --> C{QA evidence complete?}
  C -- No --> B
  C -- Yes --> D[Merge to main]
  D --> E[GitHub Actions triggered]
  E --> F[Install dependencies]
  F --> G[Run lint and tests]
  G --> H{Quality checks passed?}
  H -- No --> I[Fail workflow and show logs]
  I --> B
  H -- Yes --> J[Build Android APK]
  J --> K{Build successful?}
  K -- No --> I
  K -- Yes --> L[Upload APK to Firebase App Distribution]
  L --> M{Upload successful?}
  M -- No --> I
  M -- Yes --> N[Notify testers / build available]
  N --> O[Release Engineer records release proof]
  O --> P([Release complete])
```

---

## 8. Delivery Rules

1. `EXECUTION_ORDER.md` is the official PM execution sequence.
2. `TASKS.md` is the compact task index for Codex/dev work.
3. `REQUIREMENTS.md` defines business behavior.
4. `CARD_DATA_SECURITY_LEDGER_SPEC.md` defines NFC, tariff, card, ledger, and Silent Shield behavior.
5. Work must be executed one task at a time.
6. Parking MVP only. Generic/non-parking activity is future extension only.
7. Every changed executable source file must have created/updated unit tests.
8. Unit-test coverage target is 90% for executable source.
9. QA screenshot evidence is required before PR merge.
10. Merge/push to `main` must trigger GitHub Actions and Firebase App Distribution.
11. Final delivery requires QA evidence pack and PO final GO / NO-GO.

---

## 9. Final Evidence Checklist

| Evidence                             | Owner              | Required before final GO? |
| ------------------------------------ | ------------------ | ------------------------: |
| Requirement alignment checklist      | System Analyst     |                       Yes |
| Architecture/security review         | Software Architect |                       Yes |
| Unit test and coverage proof         | Senior FE / Codex  |                       Yes |
| Android simulator/device screenshots | Senior QA          |                       Yes |
| E2E flow screenshots                 | Senior QA          |                       Yes |
| Firebase App Distribution proof      | Release Engineer   |                       Yes |
| Final GO / NO-GO checklist           | Product Owner / PM |                       Yes |

---

## 10. Final GO / NO-GO Rule

```txt
GO only when:
- all required parking MVP flows pass,
- unit-test and coverage policy is satisfied,
- QA screenshot evidence exists,
- release pipeline proof exists,
- unresolved TBD items are accepted or closed,
- Product Owner / PM approves final checklist.
```
