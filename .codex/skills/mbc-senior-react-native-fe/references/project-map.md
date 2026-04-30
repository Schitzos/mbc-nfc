# MBC FE Project Map

Use these docs before implementation:

- `specs/REQUIREMENTS.md`: source of business, system, and functional requirements.
- `specs/DESIGN.md`: Clean Architecture, domain model, folder structure.
- `specs/TASKS.md`: implementation sequence.
- `specs/SECURITY.md`: Silent Shield and logging rules.
- `specs/TEST_PLAN.md`: expected verification.

Key implementation direction:

- Activity flow must support more than parking.
- Parking is only the demo activity with Rp 2.000 per started hour.
- NFC read/write must stay behind repository interfaces.
- UI must expose Station, Gate, Terminal, and Scout roles.
