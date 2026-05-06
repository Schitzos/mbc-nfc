# KDX Membership Benefit Card Device Test Matrix

## 1. Purpose

Track real-device NFC behavior for the MBC Station, Gate, Terminal, and Scout activity flows on the MVP Android + NTAG215 target. iOS is deferred or best-effort/read-only unless validated later.

Android is the primary and required MVP device target for NFC read/write validation.

Primary owner: NFC/Mobile Native Specialist.

Supporting roles:

- Senior QA validates acceptance behavior.
- Security Pentester validates Silent Shield and tamper behavior.
- Demo/Release Engineer records final demo limitations.

## 2. Test Devices

| ID              | Platform | Device Model        | OS Version  | NFC Supported                                         | Tester | Notes                             |
| --------------- | -------- | ------------------- | ----------- | ----------------------------------------------------- | ------ | --------------------------------- |
| DEV-ANDROID-001 | Android  | ASUS ROG Phone 9 FE | Android 14+ | Yes (validated)                                       | Dev    | Primary MVP NFC write/read device |
| DEV-IOS-001     | iOS      | Deferred / optional | N/A         | Out of MVP / best-effort read-only if later validated | N/A    | iOS write is not required for MVP |

## 3. Test Cards/Tags

| ID       | Tag Type            | Writable | Capacity                                                            | Notes                 |
| -------- | ------------------- | -------- | ------------------------------------------------------------------- | --------------------- |
| CARD-001 | NTAG215             | Yes      | 504 bytes user memory; effective app budget measured during testing | Primary MBC test card |
| CARD-002 | NTAG215             | Yes      | 504 bytes user memory; effective app budget measured during testing | Low balance test card |
| CARD-003 | Unknown/unsupported | TBD      | TBD                                                                 | Unsupported card test |

## 4. Compatibility Matrix

| Device          | Card     | Read | Write | Register | Top-Up | Parking Check-In | Parking Checkout | Scout                                 | Notes                          |
| --------------- | -------- | ---- | ----- | -------- | ------ | ---------------- | ---------------- | ------------------------------------- | ------------------------------ |
| DEV-ANDROID-001 | CARD-001 | PASS | PASS  | PASS     | PASS   | PASS             | PASS             | PASS                                  | Full flow validated on NTAG215 |
| DEV-ANDROID-001 | CARD-002 | PASS | PASS  | PASS     | PASS   | PASS             | PASS             | PASS                                  | Low balance scenario validated |
| DEV-IOS-001     | CARD-001 | N/A  | N/A   | N/A      | N/A    | N/A              | N/A              | Optional read-only if later validated | Out of MVP                     |

## 5. Test Cases

| ID       | Scenario                     | Device                                                   | Card     | Expected                                                                               | Result |
| -------- | ---------------------------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- | ------ |
| DTM-001  | NFC availability             | DEV-ANDROID-001 / ASUS ROG 9 FE                          | None     | App shows NFC status                                                                   | PASS   |
| DTM-002  | iOS NFC availability         | iOS / optional                                           | None     | Documented as out of MVP unless separately validated                                   | N/A    |
| DTM-002A | NFC unsupported              | Non-NFC device or mocked unsupported state               | None     | App explains real card operations require NFC-capable device                           | PASS   |
| DTM-002B | NFC disabled                 | DEV-ANDROID-001 / ASUS ROG 9 FE                          | None     | App asks user to enable NFC before scan/read/write                                     | PASS   |
| DTM-003  | Station registration         | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-001 | Registered MBC payload written                                                         | PASS   |
| DTM-004  | Station top-up               | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-001 | Balance increases                                                                      | PASS   |
| DTM-005  | Gate parking check-in        | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-001 | Parking status becomes checked in                                                      | PASS   |
| DTM-006  | Gate simulation mode         | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-001 | Removed — Gate uses real device time only                                              | N/A    |
| DTM-007  | Terminal parking checkout    | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-001 | Fee deducted and status cleared                                                        | PASS   |
| DTM-008  | Insufficient balance         | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-002 | Top-up guidance shown                                                                  | PASS   |
| DTM-009  | Scout inspect                | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-001 | Balance, status, logs shown                                                            | PASS   |
| DTM-010  | Silent Shield                | DEV-ANDROID-001 / ASUS ROG 9 FE + generic NFC reader app | CARD-001 | Sensitive fields not plain in generic NFC app                                          | PASS   |
| DTM-011  | Unsupported card             | DEV-ANDROID-001 / ASUS ROG 9 FE                          | CARD-003 | Safe unsupported message                                                               | PASS   |
| DTM-012  | Cancel scan                  | DEV-ANDROID-001 / ASUS ROG 9 FE                          | None     | NFC session cleaned up                                                                 | PASS   |
| DTM-013  | Station local ledger summary | DEV-ANDROID-001 / ASUS ROG 9 FE                          | None     | Device-local summary reflects executed register/top-up/checkout actions on that device | PASS   |

## 6. Notes

- ASUS ROG Phone 9 FE is the validated MVP real-device NFC read/write baseline (Android 14+).
- iOS NFC write is out of MVP and may be documented as deferred or best-effort/read-only only if separately validated later.
- MVP target tag is NTAG215; validated with standard NTAG215 tags (504 bytes user memory).
- Full read/write behavior confirmed on Android with `react-native-nfc-manager`.
- Protected payload byte length measured: 362 bytes worst-case (5 logs, checked-in state).
- Silent Shield AES-256-GCM via `react-native-quick-crypto` confirmed working.
- Buffer polyfill required in `index.js` for binary crypto operations.
- Android NFC permissions and intent filters configured in AndroidManifest.xml.
- `react-native-reanimated/plugin` added to `babel.config.js` for NfcActionSheet animations.
