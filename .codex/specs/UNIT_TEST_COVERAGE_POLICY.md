# MBC Unit Test and Coverage Policy

## 1. Purpose

This document defines the Software Architect quality rule for every implementation change in the MBC project.

The goal is to prevent feature work from being merged without matching unit-test coverage and to keep Codex prompts clear and token-efficient.

## 2. Non-Negotiable Rule

Every source file changed by a feature must have a matching unit test created or updated in the same task/branch.

The project target is at least **90% automated unit-test coverage** for executable repository source.

This rule applies to new files and modified files, including domain logic, use cases, repositories, codecs, security helpers, state/view models, hooks, utilities, and UI components where behavior is testable.

## 3. Changed-File Test Rule

For every feature branch or Codex task:

1. List changed source files.
2. For each changed source file, create or update the closest unit test file.
3. If a changed file is not practical to unit test directly, test it through the nearest public behavior and document the reason in the task result.
4. Run the relevant focused test command for the changed scope.
5. Run full coverage before merge or before declaring the phase complete.

Recommended naming:

| Source file                              | Test file                                               |
| ---------------------------------------- | ------------------------------------------------------- |
| `src/domain/foo.ts`                      | `src/domain/__tests__/foo.test.ts`                      |
| `src/application/useCases/fooUseCase.ts` | `src/application/useCases/__tests__/fooUseCase.test.ts` |
| `src/infrastructure/fooRepository.ts`    | `src/infrastructure/__tests__/fooRepository.test.ts`    |
| `src/presentation/FooScreen.tsx`         | `src/presentation/__tests__/FooScreen.test.tsx`         |

## 4. Coverage Gate

A feature is not ready to push/merge unless:

- Relevant unit tests for changed files pass.
- Existing tests still pass.
- Coverage remains at least 90%, or the branch includes additional tests to restore it.
- Any unavoidable temporary exception is documented with reason, impacted file, and follow-up task.

The preferred command names are:

```bash
npm test -- --watch=false
npm run test:coverage
```

If the repository uses different scripts, the team must keep this policy behavior and update the command names in `package.json` and project documentation.

## 5. Codex Instruction

Use this compact instruction for every implementation task:

```txt
For every source file you change, create or update the closest unit test.
Keep total executable-source unit coverage at least 90%.
Run focused tests for changed files and coverage when practical.
If tests cannot run, explain the exact reason and list the tests that should be run locally.
```

## 6. Exceptions

Allowed exceptions are limited to:

- Generated files.
- Static assets.
- Pure type-only files with no runtime behavior.
- Platform configuration files where behavior is validated by integration/device testing.
- Documentation-only changes.

Even when an exception applies, the task result must say why no direct unit test was added.

## 7. Ownership

| Role                     | Responsibility                                               |
| ------------------------ | ------------------------------------------------------------ |
| Software Architect       | Owns this policy and approves exceptions.                    |
| Senior React Native FE   | Adds or updates tests with each changed source file.         |
| Test Automation Engineer | Reviews coverage quality and regression risk.                |
| Demo/Release Engineer    | Blocks merge/release when coverage gates fail.               |
| Project Manager          | Tracks phase completion only after test/coverage gates pass. |
