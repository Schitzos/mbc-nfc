# KDX Membership Benefit Card Risk Register

## Risk Matrix

| Impact | Meaning                                                |
| ------ | ------------------------------------------------------ |
| High   | Blocks demo or causes serious security/financial issue |
| Medium | Affects user workflow or assessment quality            |
| Low    | Annoyance or edge case                                 |

| Likelihood | Meaning                    |
| ---------- | -------------------------- |
| High       | Expected to happen often   |
| Medium     | Possible during normal use |
| Low        | Rare or controlled         |

## Risks

| ID    | Risk                                                                                                | Likelihood | Impact | Mitigation                                                                                                                                   | Status |
| ----- | --------------------------------------------------------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| R-001 | Target NFC card does not support required write capacity                                            | Medium     | High   | Test writable card/tag early and keep payload compact                                                                                        | Open   |
| R-002 | iOS NFC write support limits the full demo flow                                                     | Medium     | High   | Validate platform support early; document iOS limitations                                                                                    | Open   |
| R-003 | Sensitive identity and balance can be read by generic NFC app                                       | Medium     | High   | Implement Silent Shield codec and verify with external NFC reader                                                                            | Open   |
| R-004 | Frontend-only secret is extracted from app bundle                                                   | Medium     | High   | Document as prototype limitation; production needs real key management                                                                       | Open   |
| R-005 | Card write interruption corrupts state                                                              | Medium     | High   | Validate payload, write atomically where possible, show retry guidance                                                                       | Open   |
| R-006 | Double check-in/check-out causes invalid balance or status                                          | Medium     | High   | Enforce activity state policy in domain and use cases                                                                                        | Open   |
| R-007 | Tariff rounding is implemented incorrectly                                                          | Medium     | Medium | Unit test started-hour rounding examples                                                                                                     | Open   |
| R-008 | Transaction logs exceed card memory                                                                 | Medium     | Medium | Store only five compact logs                                                                                                                 | Open   |
| R-009 | Insufficient balance flow blocks exit queue                                                         | Medium     | Medium | Provide direct top-up guidance and keep status unchanged                                                                                     | Open   |
| R-010 | Cooperative admin UI is too complex                                                                 | Medium     | Medium | Keep Station UI simple and task-focused                                                                                                      | Open   |
| R-011 | Demo fails without real NFC hardware                                                                | Medium     | High   | Prepare simulation fallback plus real-device validation                                                                                      | Open   |
| R-012 | Implementation becomes parking-only and cannot support other activities                             | Medium     | Medium | Model active activity ID/type and tariff rules in domain                                                                                     | Open   |
| R-013 | Signal UI Figma is delayed or unavailable                                                           | Medium     | Medium | UI/UX Designer uses provisional role-focused UI and applies Signal UI later                                                                  | Open   |
| R-014 | Automated coverage is too thin for balance/status logic                                             | Medium     | High   | Test Automation Engineer owns tariff, state, logs, and use-case regression tests                                                             | Open   |
| R-015 | Submission package is incomplete near deadline                                                      | Medium     | Medium | Demo/Release Engineer and Technical Writer maintain demo, README, docs, and presentation checklist                                           | Open   |
| R-016 | Git repository is not initialized or contains generated/sensitive files near submission             | Medium     | Medium | Demo/Release Engineer owns T-000 Git setup, `.gitignore`, README, clean status, and security staging review                                  | Open   |
| R-017 | Local ledger totals diverge from card-side truth after partial failure or device-specific data loss | Medium     | High   | Keep card as member-state truth, make ledger secondary, test failure handling, and surface ledger-write issues clearly                       | Open   |
| R-018 | Automated coverage stays below 90% near deadline                                                    | Medium     | High   | Track coverage from the start, expand tests across the whole executable repository, and fail quality checks when coverage drops below target | Open   |
| R-019 | SonarCloud quality gate fails because of code smells, bugs, or missing analysis setup               | Medium     | Medium | Configure SonarCloud early, publish coverage reports, and fix quality findings continuously instead of at the end                            | Open   |

## Production Blockers

Before production, resolve:

- Strong card authenticity verification.
- Secure key management.
- Backend audit/reconciliation.
- Operator authentication.
- Recovery flow for corrupted or lost cards.
- Privacy and retention policy.
- Device and app integrity controls.
