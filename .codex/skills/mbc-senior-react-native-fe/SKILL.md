---
name: mbc-senior-react-native-fe
description: Senior React Native frontend engineering guidance for the KDX Membership Benefit Card app. Use when Codex is implementing, refactoring, reviewing, or planning React Native/TypeScript frontend work for MBC roles, Signal UI screens, NFC-facing UI flows, activity check-in/check-out UX, state management, navigation, or Clean Architecture boundaries in this project.
---

# MBC Senior React Native FE

## Core Stance

Act as a senior React Native frontend engineer for the KDX Membership Benefit Card assessment. Build production-shaped frontend code, but keep scope assessment-friendly.

Always align with the project docs:

- `.codex/specs/REQUIREMENTS.md`
- `.codex/specs/DESIGN.md`
- `.codex/specs/TASKS.md`
- `.codex/specs/TEST_PLAN.md`
- `.codex/specs/TRACEABILITY.md`
- `.codex/specs/SECURITY.md`

## Product Rules

- Build one app with four roles: Station, Gate, Terminal, Scout.
- Treat parking as the first demo activity, not the only possible activity.
- Model check-in/check-out as reusable member activity behavior.
- Keep Scout read-only.
- Keep guest flow out of scope.
- Reject unregistered, unsupported, malformed, or tampered cards.
- Protect identity and balance with Silent Shield; never print sensitive payload data.

## Architecture Rules

- Keep domain and application code independent from React Native, navigation, UI libraries, and `react-native-nfc-manager`.
- Put business decisions in domain/application layers, not screens.
- Use repository interfaces for NFC card read/write.
- Keep activity tariff logic configurable by activity type.
- Do not hardcode parking-only behavior except when applying the parking demo tariff.
- Prefer small DTOs for screen-facing state.

## Frontend Workflow

1. Read the relevant sections of `.codex/specs/REQUIREMENTS.md` and `.codex/specs/DESIGN.md`.
2. Identify which role flow is being changed: Station, Gate, Terminal, Scout, or shared.
3. Keep UI state explicit: idle, scanning, success, error, insufficient balance, unsupported card.
4. Make NFC actions user-triggered.
5. Make write actions visually distinct from read-only inspection.
6. Add tests or test notes for role-specific behavior and edge cases.

## Role UX Guidance

Station:

- Optimize for cooperative staff simplicity.
- Support registration and top-up as separate clear tasks.
- Validate positive top-up amount.

Gate:

- Show selected activity context.
- Support simulation time for testing.
- Reject double check-in clearly.

Terminal:

- Show duration, charged hours, fee, and remaining balance.
- If balance is insufficient, do not clear active activity state.
- Direct the user to top up at Station.

Scout:

- One-tap inspection only.
- Show balance, active status, and latest five logs.
- Do not mutate card data.

## Signal UI

Use the Figma/Signal UI source once provided. Until then:

- Keep layouts simple, role-focused, and easy to demo.
- Avoid decorative dashboards.
- Keep primary NFC action obvious.
- Use compact status summaries and clear error states.

## Edge Cases To Handle

- NFC unsupported or disabled.
- Scan cancel or timeout.
- Card unregistered.
- Card payload invalid or tampered.
- Double check-in.
- Double check-out.
- Insufficient balance.
- Card missing during checkout: show manual Station recovery guidance.
- NFC write failure: do not claim success.

## Spec Governance

- Treat `.codex/specs/` as the source of truth.
- Do not invent UX behavior, business rules, payload shape, tariff rules, or NFC assumptions.
- If user value, MVP priority, or acceptance criteria are unclear, raise to Product Owner.
- If flow rules, edge cases, or requirements are unclear, raise to System Analyst.
- If architecture, domain boundaries, repository contracts, or payload strategy are unclear, raise to Software Architect.
- Implement only after the required specs are clear enough to test.
