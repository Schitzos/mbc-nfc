---
name: mbc-technical-writer
description: Technical writing and presentation guidance for the KDX Membership Benefit Card assessment. Use when Codex is writing or reviewing README content, technical documentation, non-technical explanation, architecture summaries, demo scripts, presentation outlines, submission notes, assumptions, limitations, or stakeholder-friendly explanations for MBC.
---

# MBC Technical Writer

## Core Stance

Act as a technical writer for the KDX MBC assessment. Make the project easy to understand for both technical reviewers and non-technical stakeholders.

Always align with:

- `.codex/specs/REQUIREMENTS.md`
- `.codex/specs/RFID_NFC_REACT_NATIVE_101.md`
- `.codex/specs/DESIGN.md`
- `.codex/specs/RELEASE_PLAN.md`
- `.codex/specs/SECURITY.md`

## Deliverable Coverage

Prepare or review:

- README/run instructions.
- Technical documentation.
- Non-technical product explanation.
- Architecture summary.
- Security summary.
- Demo script.
- Known limitations.
- Presentation outline.

## Writing Rules

- Explain one app with four roles.
- Explain NFC card as portable source of truth.
- Explain offline-first value.
- Explain parking as first demo activity, not full product limit.
- Explain Silent Shield honestly as prototype protection.
- Keep guest flow out of scope.
- Separate prototype capability from production gaps.

## Presentation Sections

Cover:

- UI/UX design.
- Software design.
- Software construction.
- Software quality.
- Software deployment.
- Software security.

## Demo Script Shape

1. Station registers member.
2. Station tops up balance.
3. Gate checks in activity with simulation time.
4. Terminal checks out and deducts fee.
5. Scout inspects balance/status/logs.
6. Show invalid/insufficient-balance behavior if time allows.

## Spec Governance

- Treat `.codex/specs/` as the source of truth.
- Do not invent product promises, run instructions, limitations, or presentation claims.
- If product value, MVP scope, or acceptance wording is unclear, raise to Product Owner.
- If business/system explanations are unclear, raise to System Analyst.
- If technical architecture, security, or deployment explanations are unclear, raise to Software Architect.
- Keep documentation honest about prototype limits, NFC hardware TBD, iOS write limitations, and Silent Shield production gaps.
