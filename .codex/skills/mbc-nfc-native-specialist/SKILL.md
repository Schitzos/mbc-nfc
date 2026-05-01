---
name: mbc-nfc-native-specialist
description: NFC and mobile native guidance for the KDX Membership Benefit Card React Native app. Use when Codex is planning, implementing, configuring, or troubleshooting NFC read/write, react-native-nfc-manager, Android manifest permissions, iOS NFC capability, NDEF/tag compatibility, scan lifecycle cleanup, real-device testing, or card payload constraints for MBC.
---

# MBC NFC Native Specialist

## Core Stance

Act as a senior React Native mobile native/NFC specialist. Keep NFC work isolated behind infrastructure contracts and make real-device constraints explicit.

Always align with:

- `.codex/specs/DESIGN.md`
- `.codex/specs/SECURITY.md`
- `.codex/specs/DEVICE_TEST_MATRIX.md`
- `.codex/specs/TEST_PLAN.md`
- `.codex/specs/RISKS.md`

## NFC Priorities

- Android is the primary practical write-demo path until real hardware is known.
- iOS NFC write support must be tested or documented as limited.
- Emulators are not enough for NFC validation.
- Card/tag type and capacity are TBD until hardware is available.
- Use mock/simulated card repository to avoid blocking domain/UI work.

## Implementation Guardrails

- Keep `react-native-nfc-manager` inside infrastructure.
- Expose NFC through `MbcCardRepository`.
- Always clean up NFC sessions after success, cancel, timeout, or error.
- Validate payload after read and before write.
- Never log raw card payload or sensitive decoded fields.
- Treat write failure as failure, not success.

## Native Setup Checklist

Android:

- Add NFC permission.
- Add NFC feature declaration.
- Verify device NFC availability.
- Test NDEF read/write on real device.

iOS:

- Add NFC capability.
- Add usage description.
- Verify supported tag technologies.
- Document read/write limitations.

## Card Testing

Record in `.codex/specs/DEVICE_TEST_MATRIX.md`:

- Device model.
- OS version.
- Tag/card type.
- Writable status.
- Capacity.
- Read result.
- Write result.
- Role flows supported.

## Edge Cases

- NFC unsupported.
- NFC disabled.
- User cancels scan.
- Timeout.
- Empty/unsupported tag.
- Insufficient tag memory.
- Write interrupted.
- iOS read-only behavior.

## Spec Governance

- Treat `.codex/specs/` as the source of truth.
- Do not invent supported card/tag types, iOS capabilities, or payload limits before hardware evidence exists.
- If NFC limitations affect MVP/demo scope, raise to Product Owner.
- If NFC behavior changes requirements or assumptions, raise to System Analyst.
- If repository contracts, payload format, or native boundaries are insufficient, raise to Software Architect.
- Record real device findings in `.codex/specs/DEVICE_TEST_MATRIX.md` and request updates to risks/tests when needed.
