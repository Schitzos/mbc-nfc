# KDX Membership Benefit Card

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=Schitzos_mbc-nfc)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Schitzos_mbc-nfc&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Schitzos_mbc-nfc&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Schitzos_mbc-nfc&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Schitzos_mbc-nfc&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Schitzos_mbc-nfc&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Schitzos_mbc-nfc)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Tests](https://img.shields.io/badge/tests-444%20passed-brightgreen)
![Platform](https://img.shields.io/badge/platform-Android-blue)
![NFC](https://img.shields.io/badge/NFC-NTAG215-orange)

Offline-first NFC membership card app for a village cooperative. The NFC card is the portable source of truth for member identity, balance, and activity state — no backend required.

## Status

**Production-ready assessment build.** Full parking MVP validated on real hardware (ASUS ROG Phone 9 FE + NTAG215).

## App Screenshots

|                     Role Switcher                      |                      Station (Register)                      |                    Station (Top Up)                     |
| :----------------------------------------------------: | :----------------------------------------------------------: | :-----------------------------------------------------: |
| ![Role Switcher](.tmp/screen-role-switcher-latest.png) | ![Station Register](.tmp/screen-station-register-latest.png) | ![Station Top Up](.tmp/screen-station-topup-latest.png) |

|                 Gate                 |                   Terminal                   |                 Scout                  |
| :----------------------------------: | :------------------------------------------: | :------------------------------------: |
| ![Gate](.tmp/screen-gate-latest.png) | ![Terminal](.tmp/screen-terminal-latest.png) | ![Scout](.tmp/screen-scout-latest.png) |

## Architecture

Clean Architecture with SOLID principles:

```
Presentation → Application → Domain
Infrastructure → Application/Domain contracts
```

- **Domain**: Entities, tariff rules, card state policy
- **Application**: Use cases (register, top-up, check-in, check-out, inspect)
- **Infrastructure**: NFC reader/writer, Silent Shield codec, SQLite ledger
- **Presentation**: Role screens, Signal UI components

## Tech Stack

| Area       | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | React Native CLI + TypeScript             |
| NFC        | `react-native-nfc-manager`                |
| Crypto     | `react-native-quick-crypto` (AES-256-GCM) |
| Local DB   | SQLite (device-local audit only)          |
| UI         | Signal UI design system                   |
| State      | Zustand + React Context (DI)              |
| Navigation | React Navigation                          |
| Testing    | Jest (444+ tests, 100% coverage)          |
| Quality    | SonarCloud, Husky hooks                   |

## Key Features

- **4 Roles**: Station, Gate, Terminal, Scout — switchable in one app
- **Station**: Register cards, top-up balance, view local ledger summary
- **Gate**: Check-in members to parking (real device time)
- **Terminal**: Check-out, calculate fee (Rp 2.000/started hour), deduct balance
- **Scout**: Read-only card inspection (balance, status, last 5 transactions)
- **Silent Shield**: AES-256-GCM authenticated encryption — card data unreadable by generic NFC apps
- **NTAG215 Compact Codec**: 362 bytes worst-case, fits within 480-byte NDEF capacity
- **Offline-first**: No internet required for any core flow
- **Single-tap NFC**: Read+validate+transform+write in one session
- **SQLite Ledger**: Device-local audit trail for Station operations

## How to Run

```bash
# Install dependencies
npm install

# Start Metro
npm start

# Run on Android
npm run android
```

**Requirements**: Android device with NFC enabled + NTAG215 tags.

## Branch Strategy

- `main` → protected release (triggers Firebase App Distribution)
- `develop` → integration
- `feature/*` → implementation branches

## Known Limitations

- iOS NFC write is deferred (read-only/best-effort)
- Demo AES key is app-bundled (production needs secure provisioning)
- SQLite ledger is device-local only, not cross-device
- Device clock correctness is an operational dependency
