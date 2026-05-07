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

Format: `type: description (#issue)`

```
feat: add parking tariff calculator (#34)
fix: correct ceiling rounding for exact hours (#34)
chore: update dependencies (#29)
docs: add iOS deferral note (#30)
refactor: extract codec validation (#47)
test: add FIFO log policy tests (#36)
```

Referencing `#issue` in commit messages links the commit to the GitHub Issue and shows it in the project board timeline.

## Linking Commits and PRs to Issues

GitHub automatically links work to the project board when you:

1. **Reference in commits** — Include `#issue` in the commit message:

   ```
   feat: implement gate check-in flow (#41)
   ```

2. **Reference in PR body** — Use closing keywords to auto-close issues on merge:

   ```
   Closes #41
   Resolves #41
   Fixes #41
   ```

3. **Branch naming** — Name branches with the issue number:
   ```
   feature/41-gate-check-in
   ```

### Project Board Automation

The project board has these built-in workflows enabled:

| Workflow                     | Trigger                      | Action                  |
| ---------------------------- | ---------------------------- | ----------------------- |
| Item added to project        | Issue/PR added               | Sets status to **Todo** |
| Pull request linked to issue | PR references issue          | Links PR to board item  |
| Pull request merged          | PR merged                    | Sets status to **Done** |
| Item closed                  | Issue closed                 | Sets status to **Done** |
| Auto-close issue             | Closing keyword in merged PR | Closes the linked issue |

### Typical Flow

```
1. Pick issue from board (e.g., #41 Gate Check-In)
2. Create branch:    git checkout -b feature/41-gate-check-in develop
3. Commit with ref:  git commit -m "feat: implement gate check-in (#41)"
4. Open PR:          gh pr create --base develop --title "feat: gate check-in" --body "Closes #41"
5. On merge → issue auto-closes → board moves to Done
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
