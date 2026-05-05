# MBC Improvements Not Explicitly Explained in the Original Requirement

## Purpose

This document lists the improvements, product decisions, architecture clarifications, and delivery controls that were added during Product Owner review but were **not explicitly described in the original `KDX#1 - Membership Benefit Card (MBC).pdf` requirement**.

These additions are intended to make the requirement implementable, testable, secure, and clear for System Analyst, Software Architect, developers, QA, and Codex execution.

## Source-of-Truth Reminder

The original PDF remains the business source of truth for the required MBC assessment scope:

- One app with four roles: Station, Gate, Terminal, Scout.
- NFC card stores identity, balance, visit status, and last 5 transaction logs.
- Offline-first operation without central database/API dependency.
- Parking member tariff defaults to Rp2.000 per started hour.
- Sequential loop: no double tap-in or double tap-out.
- Gate simulation mode for past entry time.
- Silent Shield: sensitive identity and balance must not be plainly readable by other NFC apps.
- Guest flow is out of scope.

The improvements below do **not replace** the original requirement. They clarify how the team should implement it safely.

---

# 1. Product Scope Improvements

| Improvement                            | Not explicitly in original PDF                                                          | Why we added it                                                         | Current treatment                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Parking-only MVP decision              | PDF focuses on parking but does not explicitly discuss future activity types            | Prevents Codex/team from overbuilding generic benefit/activity modules  | MVP must implement parking only; generic activity is extension-ready design only                |
| Future activity extensibility boundary | PDF mentions membership benefits generally but only defines parking flow                | Allows future features without polluting MVP                            | Code should isolate tariff/session/use-case boundaries, but no non-parking runtime flow for MVP |
| Explicit guest exclusion               | PDF says guest mode is out of scope, but docs now repeat it across implementation files | Prevents accidental guest tariff implementation                         | Guest/non-member parking must not be built                                                      |
| PO GO/NO-GO checklist                  | PDF asks for deliverables but not formal gate criteria                                  | Helps PM/PO decide readiness for Codex, NFC phase, and final submission | Required project management artifact                                                            |
| Edge case register                     | PDF gives core flow and assumptions, not a complete edge-case list                      | Gives QA/dev a shared list of expected failure states                   | Required support doc for QA and implementation                                                  |

---

# 2. Removed From Current MVP: Runtime Rate Changes

Previous non-MVP pricing alternatives were considered during analysis but are intentionally excluded from the current MVP to stay aligned with the original PDF.
