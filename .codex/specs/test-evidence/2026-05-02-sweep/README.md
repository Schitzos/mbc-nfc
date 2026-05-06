# QA Sweep Evidence - 2026-05-02

This folder is the cleaned evidence set for the emulator mock-flow sweep.

## Scope

- App: MBC Card (Android emulator)
- Flow type: Mock scenarios (happy + failure)
- Roles covered: Station, Gate, Terminal, Scout

## Coverage Matrix

### Station

- Happy:
  - Register from `Unregistered` -> success (`11-station-register-unregistered-success.png`)
  - Top up from `Normal card` -> success (`17-station-topup-normal-success.png`)
- Failure:
  - Register from `Normal card` (`12-station-register-normal-failure.png`)
  - Register from `Low balance` (`13-station-register-low-balance-failure.png`)
  - Register from `Checked in` (`14-station-register-checkedin-failure.png`)
  - Register from `Tampered` (`15-station-register-tampered-failure.png`)
  - Top up from `Unregistered` (`18-station-topup-unregistered-failure.png`)
  - Top up from `Tampered` (`19-station-topup-tampered-failure.png`)

### Gate

- Happy:
  - Check in `Normal card` (`31-gate-normal-success.png`)
  - Check in with simulation time (`35-gate-simulation-success.png`)
- Failure:
  - `Already checked in` (`32-gate-checkedin-failure.png`)
  - `Unregistered` (`33-gate-unregistered-failure.png`)
  - `Tampered` (`34-gate-tampered-failure.png`)

### Terminal

- Happy:
  - Checkout `Checked-in parking card` (`61-terminal-checkedin-parking-success.png`)
  - Checkout `Checked-in generic card` (`62-terminal-checkedin-generic-success.png`)
- Failure:
  - `Checked-in low-balance card` (`63-terminal-low-balance-failure.png`)
  - `Not checked in` (`64-terminal-not-checkedin-failure.png`)
  - `Unregistered` (`65-terminal-unregistered-failure.png`)
  - `Tampered` (`66-terminal-tampered-failure.png`)

### Scout

- Happy:
  - `Normal card` (`51-scout-normal-success.png`)
  - `Checked-in parking card` (`52-scout-checkedin-parking-success.png`)
  - `Checked-in generic card` (`53-scout-checkedin-generic-success.png`)
  - `Low balance` (`54-scout-low-balance-success.png`)
- Failure:
  - `Unregistered` (`55-scout-unregistered-failure.png`)
  - `Tampered` (`56-scout-tampered-failure.png`)

## Notes

- Role-switcher navigation evidence:
  - `00-role-switcher.png`
  - `20-role-switcher-after-station.png`
  - `36-role-switcher-after-gate.png`
  - `57-role-switcher-final.png`
  - `67-role-switcher-after-terminal.png`
- Real NFC hardware cases (unsupported/disabled/timeout/cancel/write interruption) remain in manual-device test scope and cannot be fully proven in emulator mock mode.
