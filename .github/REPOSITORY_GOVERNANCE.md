# Repository Governance Baseline

This file captures the intended GitHub governance for the MBC repository.

## Branch Model

- `main` = protected release branch
- `develop` = protected integration branch
- `feature/*` = implementation branches

## Merge Flow

1. Feature work is developed in a separate `feature/*` branch.
2. Finished work opens a pull request into `develop`.
3. Demo/Release Engineer is the merge gatekeeper for `develop`.
4. Promotion from `develop` to `main` is prepared separately.
5. Project Owner performs the final merge into `main`.
6. Merge to `main` is the controlled release trigger.

## Current Reviewer Routing

Current repository reviewer routing is defined in `.github/CODEOWNERS`.

At the moment, `@Schitzos` is the effective required reviewer until dedicated GitHub users or teams are available for project roles.

## Required GitHub UI Settings

These settings should be configured directly in GitHub repository settings.

### `develop`

- require pull request before merge
- require at least 1 approval
- dismiss stale approvals when new commits are pushed
- restrict direct pushes if the workflow should be enforced strictly
- optionally require code-owner review once CODEOWNERS enforcement is enabled

### `main`

- require pull request before merge
- require at least 1 approval
- restrict direct pushes
- optionally require code-owner review
- later require successful status checks from CI/CD

## Deferred Required Checks

The following checks are expected later and should be added when available:

- lint
- unit/application tests
- SonarCloud quality gate
- release build / app distribution workflow

These checks are intentionally deferred until the CI pipeline exists.
