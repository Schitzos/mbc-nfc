# KDX Membership Benefit Card Device Test Matrix

## 1. Purpose

Track real-device NFC behavior for the MBC Station, Gate, Terminal, and Scout activity flows across iOS, Android, and writable card/tag types.

Android is the primary device target for the first real NFC validation round.

Primary owner: NFC/Mobile Native Specialist.

Supporting roles:

- Senior QA validates acceptance behavior.
- Security Pentester validates Silent Shield and tamper behavior.
- Demo/Release Engineer records final demo limitations.

## 2. Test Devices

| ID | Platform | Device Model | OS Version | NFC Supported | Tester | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| DEV-ANDROID-001 | Android | TBD | TBD | TBD | TBD | TBD |
| DEV-IOS-001 | iOS | TBD | TBD | TBD | TBD | TBD |

## 3. Test Cards/Tags

| ID | Tag Type | Writable | Capacity | Notes |
| --- | --- | --- | --- | --- |
| CARD-001 | NFC writable card/tag | TBD | TBD | Primary MBC test card |
| CARD-002 | NFC writable card/tag | TBD | TBD | Low balance test card |
| CARD-003 | Unknown/unsupported | TBD | TBD | Unsupported card test |

## 4. Compatibility Matrix

| Device | Card | Read | Write | Register | Top-Up | Activity Check-In | Activity Checkout | Scout | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEV-ANDROID-001 | CARD-001 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DEV-ANDROID-001 | CARD-002 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DEV-IOS-001 | CARD-001 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DEV-IOS-001 | CARD-002 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## 5. Test Cases

| ID | Scenario | Device | Card | Expected | Result |
| --- | --- | --- | --- | --- | --- |
| DTM-001 | NFC availability | Android | None | App shows NFC status | TBD |
| DTM-002 | NFC availability | iOS | None | App shows NFC status | TBD |
| DTM-002A | NFC unsupported | Non-NFC device or mocked unsupported state | None | App explains real card operations require NFC-capable device | TBD |
| DTM-002B | NFC disabled | Android/iOS where detectable | None | App asks user to enable NFC before scan/read/write | TBD |
| DTM-003 | Station registration | Android | CARD-001 | Registered MBC payload written | TBD |
| DTM-004 | Station top-up | Android | CARD-001 | Balance increases | TBD |
| DTM-005 | Gate activity check-in | Android | CARD-001 | Activity status becomes checked in | TBD |
| DTM-006 | Gate simulation mode | Android | CARD-001 | Past entry time stored | TBD |
| DTM-007 | Terminal activity checkout | Android | CARD-001 | Fee deducted and status cleared | TBD |
| DTM-008 | Insufficient balance | Android | CARD-002 | Top-up guidance shown | TBD |
| DTM-009 | Scout inspect | Android | CARD-001 | Balance, status, logs shown | TBD |
| DTM-010 | Silent Shield | Any | CARD-001 | Sensitive fields not plain in generic NFC app | TBD |
| DTM-011 | Unsupported card | Any | CARD-003 | Safe unsupported message | TBD |
| DTM-012 | Cancel scan | iOS/Android | None | NFC session cleaned up | TBD |
| DTM-013 | Station local ledger summary | Android | None | Device-local summary reflects executed register/top-up/checkout actions on that device | TBD |

## 6. Notes

- iOS NFC write capability must be validated on a real device.
- Android behavior can vary by manufacturer and OS version.
- Android results should be completed first and treated as the primary demo baseline.
- Record exact card/tag type and capacity where possible.
- Record whether full read/write or read-only behavior is available on each platform.
