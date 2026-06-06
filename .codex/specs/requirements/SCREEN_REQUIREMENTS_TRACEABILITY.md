# Screen Requirements Traceability

Maps each screen/role to the Business, System, Functional Requirements, User Stories, and NFRs it satisfies.

---

## 1. Role Switcher Screen

The entry screen where the operator selects their active role (Station, Gate, Terminal, Scout).

| Category | IDs                                    | Description                                                   |
| -------- | -------------------------------------- | ------------------------------------------------------------- |
| BR       | BR-001                                 | Works without internet                                        |
| SR       | SR-001, SR-012                         | Single app with role switching; NFC availability communicated |
| FR       | FR-001                                 | Role switching — each role shows only relevant actions        |
| US       | US-001, US-002, US-003, US-005, US-008 | Entry point for all operator user stories                     |
| NFR      | NFR-001, NFR-004, NFR-010              | Offline, simple UI, Signal UI design system                   |

---

## 2. Station Screen (Register + Top-Up + Ledger Summary)

### 2a. Register Flow

| Category | IDs                                            | Description                                                                                               |
| -------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| BR       | BR-001, BR-002, BR-003, BR-004, BR-009, BR-011 | Offline; portable identity card; identity on NFC; staff registers cards; identity protected; ledger audit |
| SR       | SR-002, SR-003, SR-004, SR-007, SR-008, SR-013 | No backend; validates payload; rejects invalid cards; transaction log; Silent Shield; local ledger        |
| FR       | FR-002, FR-010, FR-013, FR-016                 | Full register spec; Silent Shield; ledger append; NTAG215 capacity                                        |
| US       | US-001, US-011                                 | Admin registers card; identity protected from plain NFC                                                   |
| NFR      | NFR-001, NFR-004, NFR-007, NFR-017, NFR-018    | Offline; cooperative-staff-friendly UI; privacy; NTAG215 capacity; write verification                     |

### 2b. Top-Up Flow

| Category | IDs                                                  | Description                                                                                 |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| BR       | BR-001, BR-003, BR-004, BR-009, BR-011               | Offline; balance on card; staff tops up; balance protected; ledger audit                    |
| SR       | SR-002, SR-003, SR-007, SR-008, SR-009, SR-013       | No backend; validates balance; transaction log; Silent Shield; balance cap guidance; ledger |
| FR       | FR-003, FR-009, FR-010, FR-013, FR-016               | Full top-up spec; FIFO log; Silent Shield; ledger append; NTAG215 capacity                  |
| US       | US-002, US-010, US-011, US-014                       | Admin tops up; latest 5 logs; balance protected; offline income summary                     |
| NFR      | NFR-001, NFR-002, NFR-004, NFR-007, NFR-017, NFR-018 | Offline; card state integrity; simple UI; privacy; NTAG215; write verification              |

### 2c. Ledger Summary

| Category | IDs              | Description                                                           |
| -------- | ---------------- | --------------------------------------------------------------------- |
| BR       | BR-011           | Device-side audit trail and income summary                            |
| SR       | SR-013           | Local offline SQLite ledger for audit/reporting                       |
| FR       | FR-013           | Station views local transaction count, top-up totals, checkout totals |
| US       | US-014           | Admin views offline income and transaction summary                    |
| NFR      | NFR-001, NFR-012 | Offline; NFC card state and ledger clearly separated                  |

---

## 3. Gate Screen (Check-In + Simulation Mode)

### 3a. Check-In Flow

| Category | IDs                                                           | Description                                                                                             |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| BR       | BR-001, BR-003, BR-005                                        | Offline; activity status on card; tap-based entry                                                       |
| SR       | SR-002, SR-003, SR-004, SR-005, SR-007, SR-008                | No backend; validates card; rejects invalid; prevents double check-in; transaction log; Silent Shield   |
| FR       | FR-004, FR-009, FR-010, FR-015, FR-016                        | Full check-in spec; FIFO log; Silent Shield; edge case handling; NTAG215 capacity                       |
| US       | US-003, US-009, US-010, US-011                                | Gate checks in member; no double check-in; latest 5 logs; data protected                                |
| NFR      | NFR-001, NFR-002, NFR-003, NFR-006, NFR-007, NFR-017, NFR-018 | Offline; card state integrity; NFC session cleanup; Android-first; privacy; NTAG215; write verification |

### 3b. Simulation Mode

| Category | IDs     | Description                                                       |
| -------- | ------- | ----------------------------------------------------------------- |
| SR       | SR-006  | Configurable activity context for testing                         |
| FR       | FR-005  | Simulation toggle, past timestamp picker, simulation flag on card |
| US       | US-004  | Gate operator can use real time or simulated past time            |
| NFR      | NFR-008 | Testability without full hardware setup                           |

---

## 4. Terminal Screen (Check-Out + Fee Calculation)

### 4a. Check-Out Flow (Normal)

| Category | IDs                                                                    | Description                                                                                            |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| BR       | BR-001, BR-003, BR-005, BR-007                                         | Offline; activity status/balance on card; tap-based exit; Rp 2.000/started hour tariff                 |
| SR       | SR-002, SR-003, SR-004, SR-005, SR-007, SR-008                         | No backend; validates card; rejects invalid; prevents double check-out; transaction log; Silent Shield |
| FR       | FR-006, FR-009, FR-010, FR-014, FR-015, FR-016                         | Full check-out spec; FIFO log; Silent Shield; fixed tariff; edge cases; NTAG215 capacity               |
| US       | US-005, US-006, US-009, US-010, US-011                                 | Terminal checks out; shows duration and fee; no double check-out; latest 5 logs; data protected        |
| NFR      | NFR-001, NFR-002, NFR-003, NFR-006, NFR-007, NFR-008, NFR-017, NFR-018 | Offline; integrity; NFC cleanup; Android-first; privacy; testable tariff; NTAG215; write verification  |

### 4b. Insufficient Balance

| Category | IDs     | Description                                                           |
| -------- | ------- | --------------------------------------------------------------------- |
| SR       | SR-009  | Shows clear top-up guidance when balance insufficient                 |
| FR       | FR-007  | Does not clear check-in; no partial deduction; shows Station guidance |
| US       | US-007  | Terminal blocks checkout, shows top-up guidance                       |
| NFR      | NFR-002 | Card state integrity — checked-in status preserved on failure         |

---

## 5. Scout Screen (Read-Only Inspection)

| Category | IDs                                    | Description                                                                       |
| -------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| BR       | BR-001, BR-002, BR-003, BR-009         | Offline; portable identity card; data on NFC; data protected                      |
| SR       | SR-002, SR-003, SR-004, SR-008, SR-010 | No backend; validates card; rejects invalid; Silent Shield; read-only Scout mode  |
| FR       | FR-008, FR-010                         | One-tap inspect: balance, status, last 5 logs; never modifies card; Silent Shield |
| US       | US-008, US-011                         | Member inspects card; data protected from plain NFC                               |
| NFR      | NFR-001, NFR-003, NFR-007, NFR-008     | Offline; NFC session cleanup; privacy; testable without hardware                  |

---

## 6. Cross-Cutting (All Screens)

Requirements satisfied across all role screens:

| Category | IDs                    | Description                                                                                       |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| BR       | BR-012                 | NFC operational log panel for troubleshooting                                                     |
| SR       | SR-011, SR-012, SR-014 | NFC-capable device required; NFC state communicated; log panel toggleable                         |
| FR       | FR-017                 | NFC log panel: toggleable, clearable, redacted, available on all NFC role screens                 |
| US       | US-015                 | Operator can toggle and clear NFC log panel                                                       |
| NFR      | NFR-011, NFR-023       | Device clarity for NFC state; safe operational logging                                            |
| Security | SEC                    | Silent Shield on all card writes; no sensitive data in logs; payload validated before every write |
