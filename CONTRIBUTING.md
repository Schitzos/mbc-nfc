# Contributing

## Branch Strategy

```
main      ← Protected release branch (triggers CI/CD)
develop   ← Integration branch (PRs merge here)
feature/* ← One branch per task
```

## Workflow

1. Create branch from `develop`: `feature/T-XXX-description`
2. Implement the task with tests
3. Run `npm run lint` and `npm test` — both must pass
4. Open PR to `develop`
5. QA validates with screenshots on Android device
6. Merge to `develop` after approval

## Commit Convention

```
feat: add parking tariff calculator
fix: correct ceiling rounding for exact hours
chore: update dependencies
docs: add iOS deferral note
refactor: extract codec validation
test: add FIFO log policy tests
```

## PR Checklist

- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Coverage ≥90% for changed files
- [ ] QA screenshot evidence attached (Android)
- [ ] PR description includes summary and related task IDs

## Code Quality

- Follow Clean Architecture layer boundaries
- Domain layer must have zero outward dependencies
- Every changed source file must have corresponding test updates
- No inline styles in presentation layer
- Use DTOs for UI — never expose raw domain entities to screens

## NFC Development

- Real NFC testing requires physical device + NTAG215 tag
- Buffer polyfill must remain in `index.js`
- Never log decrypted payloads, keys, or full member IDs
