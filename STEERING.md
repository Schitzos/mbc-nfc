# Steering Guide

This file is a reusable project steering template.

Use it to define how a team should work before implementation starts.
It is intentionally generic so it can be copied into other projects.

## 1. Purpose

This document sets the default working rules for the project:

- how decisions are made
- how work is sequenced
- how code is reviewed
- how quality is enforced
- how documentation stays aligned

If a project-specific requirement conflicts with this file, the project-specific requirement wins.

## 2. Core Principles

- Build from clear requirements, not assumptions.
- Prefer simple solutions before adding framework or process weight.
- Keep architecture testable and replaceable.
- Deliver in small, reviewable increments.
- Document decisions that affect implementation or scope.
- Treat quality, security, and release readiness as part of delivery, not as cleanup work.

## 3. Source Of Truth

Every project should define a source-of-truth area, for example:

- `.codex/specs/`
- `docs/`
- `architecture/`

At minimum, the project should have:

1. requirements
2. architecture/design
3. task list
4. execution order
5. test plan
6. definition of done
7. changelog or decision log

Recommended rule:

- `requirements` define what must be true
- `design` defines how it will be built
- `tasks` define what must be done
- `execution order` defines what happens next

## 4. Delivery Model

Default delivery model:

- work feature by feature, not only layer by layer
- complete one task at a time
- finish the current task before starting the next
- after each task, report status and confirm before continuing if the project requires close control

Recommended sequence:

1. clarify requirements
2. record key decisions
3. define architecture
4. define tasks
5. define execution order
6. implement feature by feature
7. verify with tests
8. prepare release package

## 5. Branching Strategy

Recommended default Git flow:

- `main` = protected release branch
- `develop` = integration branch
- `feature/*` = task or feature branches

Rules:

- each feature or task should be developed in a separate branch
- finished work should go through merge request or pull request review
- only approved work should merge into `develop`
- promotion to `main` should be deliberate and controlled
- if release automation exists, it should usually trigger from `main`
- commit messages should follow a documented convention

Suggested branch naming:

- `feature/<short-feature-name>`
- `fix/<short-bug-name>`
- `chore/<short-maintenance-name>`

Recommended commit style:

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`

Recommended local enforcement:

- use Husky or equivalent Git hooks
- validate commit messages against the chosen convention
- run lint only against changed files where practical
- keep hook runtime fast enough for daily use

## 6. Review Model

Every project should define review ownership clearly.

Recommended split:

- implementation owner reviews local correctness before opening PR/MR
- technical reviewer checks architecture and code quality
- QA reviewer checks behavior and acceptance alignment
- release reviewer checks build, packaging, and release safety

Review should cover:

- requirement alignment
- architecture boundaries
- test impact
- security impact
- release impact
- documentation impact

## 7. Architecture Rules

Recommended defaults:

- keep domain/business logic independent from UI framework details
- isolate infrastructure details behind interfaces where practical
- avoid tight coupling between screens and storage/network code
- keep configuration and environment-specific values outside core logic
- prefer explicit composition over heavy dependency injection unless complexity demands more

If using clean architecture or layered architecture:

- domain should not import UI framework code
- application/use-case logic should depend on abstractions where possible
- infrastructure should be replaceable
- presentation should not contain hidden business rules

## 8. Documentation Rules

Update documentation when any of these change:

- scope
- acceptance criteria
- architecture
- release path
- security behavior
- operational workflow

Recommended docs:

- `REQUIREMENTS.md`
- `DESIGN.md`
- `TASKS.md`
- `EXECUTION_ORDER.md`
- `TEST_PLAN.md`
- `DONE.md`
- `CHANGELOG.md`
- `DECISIONS.md`

Recommended rule:

- if behavior changes, update the spec in the same task

## 9. Testing Rules

Every project should define its testing target early.

Recommended baseline:

- unit tests for business logic
- integration/use-case tests for important flows
- end-to-end or manual scenario tests for critical user journeys

Testing principles:

- test the highest-risk business logic first
- do not chase coverage with shallow tests
- keep test ownership clear
- record evidence for critical flows

If coverage targets exist:

- define the scope the target applies to
- report coverage automatically
- fail quality gates when agreed thresholds are missed

## 10. Quality Gates

Recommended quality gates before release:

- project builds successfully
- tests pass
- coverage target is met or exceptions are documented
- `npm audit` reports 0 known vulnerabilities
- static analysis passes
- required documentation is updated
- no known critical security issue remains unresolved

If using code-quality tooling such as SonarCloud:

- configure it early
- connect coverage reports
- define acceptable exclusions explicitly

## 11. Security Rules

Recommended minimum security posture:

- do not commit secrets
- do not log sensitive values unnecessarily
- validate untrusted inputs
- document prototype-only shortcuts honestly
- isolate security-sensitive logic from presentation code when possible
- after adding or changing packages, run `npm audit` and keep the result at 0 known vulnerabilities

If the project handles identity, money, or privileged actions:

- add security review tasks explicitly
- define audit expectations
- document threat assumptions

## 12. Release Rules

Recommended release preparation:

- define packaging method
- define installer/distribution method
- define run instructions
- define known limitations
- define demo path if the project is for assessment or presentation

If using CI/CD:

- build and test on every PR/MR where practical
- publish only from controlled branches
- document required secrets and signing prerequisites

## 13. Definition Of Done

A task is done when:

- acceptance criteria are satisfied
- required code is implemented
- required tests are added or updated
- documentation is updated if project truth changed
- reviewer expectations are satisfied

A feature is done when:

- the end-to-end flow works
- errors are handled safely
- required evidence exists
- release impact is understood

A release is done when:

- build/package is ready
- install/run steps are documented
- quality gates pass
- known limitations are documented

## 14. Escalation Rule

Escalate when:

- requirement is unclear
- architecture tradeoff is risky
- acceptance criteria conflict
- security implications are uncertain
- release consequences are non-obvious

Recommended escalation owners:

- Product Owner for scope and priority
- System Analyst for requirement/flow clarity
- Software Architect for technical design
- QA for acceptance and validation concerns
- Release owner for packaging and distribution concerns

## 15. Reuse Guidance

To reuse this file in another project:

1. copy `STEERING.md`
2. replace toolchain-specific notes if needed
3. adjust branching strategy if the team uses another flow
4. add project-specific quality gates
5. add project-specific source-of-truth paths

Recommended pattern:

- keep this file generic
- keep project-specific rules in `.codex/specs/` or `docs/`

## 16. Suggested Companion Files

If starting a new project, pair this file with:

- `README.md`
- `CHANGELOG.md`
- `.codex/specs/REQUIREMENTS.md`
- `.codex/specs/DESIGN.md`
- `.codex/specs/TASKS.md`
- `.codex/specs/EXECUTION_ORDER.md`
- `.codex/specs/TEST_PLAN.md`
- `.codex/specs/DONE.md`

## 17. Short Default Rule Set

If a team wants the shortest usable version, use this:

1. write requirements first
2. record key technical decisions
3. execute by feature, one task at a time
4. use separate feature branches
5. require review before merge
6. keep docs aligned with behavior
7. test critical logic early
8. release only from controlled branches
