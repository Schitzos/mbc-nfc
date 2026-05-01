# Project Owner Reading Order

This guide tells the Project Owner which documents to read first, why they matter, and when to use them.

Use this file as the single entry point for the spec set.

## Quick Path

If you only want the shortest important reading flow, read these first:

1. `REQUIREMENTS.md`
2. `DECISIONS.md`
3. `DESIGN.md`
4. `EXECUTION_ORDER.md`
5. `TASKS.md`
6. `RELEASE_PLAN.md`
7. `DONE.md`

That path is enough to understand:

- what we are building
- why key choices were made
- how the app is designed
- in what order the team should work
- how progress is tracked
- what counts as finished

## Full Reading Order

### 1. `REQUIREMENTS.md`

Read this first.

Purpose:

- understand the real business scope
- confirm the four roles
- confirm parking-first direction
- confirm NFC card, SQLite ledger, and quality expectations

You should use this file to answer:

- What are we building?
- What is in scope and out of scope?
- What are the rules of the product?

### 2. `DECISIONS.md`

Read this second.

Purpose:

- understand why important choices were made
- review tradeoffs already agreed by the team

You should use this file to answer:

- Why Android first?
- Why no required member profile field?
- Why NFC card as source of truth?
- Why SQLite for offline reporting?

### 3. `DESIGN.md`

Read this third.

Purpose:

- understand how requirements are translated into architecture
- review app layers, repositories, use cases, and ledger boundaries

You should use this file to answer:

- How will the app work internally?
- Where does member state live?
- Where does admin reporting live?

### 4. `EXECUTION_ORDER.md`

Read this fourth.

Purpose:

- understand the real delivery order
- follow work by feature instead of by architecture layer

You should use this file to answer:

- What should the team do first?
- What is blocked by missing Figma or real NFC card?
- What sequence should we use day to day?

### 5. `TASKS.md`

Read this fifth.

Purpose:

- review the full task inventory
- see owner and acceptance for every task

You should use this file to answer:

- Who owns each task?
- What does success look like for each task?
- What is the full scope of delivery?

### 6. `RELEASE_PLAN.md`

Read this sixth.

Purpose:

- understand milestone order and readiness gates

You should use this file to answer:

- What must be complete before we move to the next stage?
- What is needed for demo and submission readiness?

### 7. `DONE.md`

Read this seventh.

Purpose:

- understand the final completion standard

You should use this file to answer:

- When can we say the project is really done?
- What quality bar must be met?

### 8. `TRACEABILITY.md`

Read this after the core flow above.

Purpose:

- verify that requirements, tasks, tests, and release checks are connected

You should use this file to answer:

- Is anything missing?
- Is each requirement covered by design and delivery?

### 9. `TEST_PLAN.md`

Read this when checking delivery quality.

Purpose:

- review test strategy, coverage expectations, and quality gates

You should use this file to answer:

- How will we test the app?
- How do we reach the repository-wide 90% target?
- How is SonarCloud used?

### 10. `E2E_TEST_CASES.md`

Read this when checking operational flows.

Purpose:

- review detailed end-to-end validation scenarios
- understand screenshot evidence expectations

You should use this file to answer:

- What scenarios will QA execute?
- What evidence will be collected?

### 11. `SECURITY.md`

Read this before reviewing NFC protection or release risks.

Purpose:

- review Silent Shield, data protection, and operational safeguards

You should use this file to answer:

- How do we protect card data?
- How do we handle tampering and exposure risk?

### 12. `RISKS.md`

Read this when checking project readiness.

Purpose:

- understand known uncertainties and delivery risks

You should use this file to answer:

- What can still go wrong?
- What depends on external inputs?

### 13. `DEVICE_TEST_MATRIX.md`

Read this when real NFC device testing starts.

Purpose:

- review device coverage and physical test expectations

You should use this file to answer:

- What devices and conditions must be validated?
- What depends on the real NFC tag?

### 14. `SIGNAL_UI_GUIDE.md`

Read this when design refinement becomes active.

Purpose:

- review UI direction for implementation consistency

You should use this file to answer:

- What design system direction are we following?

### 15. `RFID_NFC_REACT_NATIVE_101.md`

Read this as a simple refresher.

Purpose:

- give a lighter summary of the system in easier language

You should use this file to answer:

- How does the app work in plain language?

### 16. `TASK_PRESENTATION_BRIEF.md`

Read this when preparing stakeholder communication.

Purpose:

- summarize work in presentation-friendly format

You should use this file to answer:

- How do I explain the project task progress simply?

### 17. `AGENT_OPERATING_PROTOCOL.md`

Read this when checking team operating discipline.

Purpose:

- review how the agent team should collaborate

You should use this file to answer:

- How should the team work?
- Which document drives execution order?

### 18. `CHANGELOG.md`

Read this last.

Purpose:

- review the history of major document and scope changes

You should use this file to answer:

- What changed over time?
- Why do some older assumptions no longer apply?

## Practical Review Routine

For weekly or milestone review, use this sequence:

1. `EXECUTION_ORDER.md`
2. `TASKS.md`
3. `RELEASE_PLAN.md`
4. `DONE.md`
5. `RISKS.md`

For requirement validation, use this sequence:

1. `REQUIREMENTS.md`
2. `DECISIONS.md`
3. `DESIGN.md`
4. `TRACEABILITY.md`

For quality and release review, use this sequence:

1. `TEST_PLAN.md`
2. `E2E_TEST_CASES.md`
3. `SECURITY.md`
4. `DEVICE_TEST_MATRIX.md`
5. `RELEASE_PLAN.md`

## Recommended Rule

If a document seems to conflict with another document, use this priority order:

1. `REQUIREMENTS.md`
2. `DECISIONS.md`
3. `DESIGN.md`
4. `EXECUTION_ORDER.md`
5. `TASKS.md`
6. supporting documents

If you find a mismatch, raise it before implementation continues.
