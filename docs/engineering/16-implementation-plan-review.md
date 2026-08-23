# Implementation plan review

Date: 2026-08-23
Status: Approved with constraints
Base: `main` / `1b9c485`

## Diagnosis

The verified root cause is missing contracts at trust boundaries, not an isolated set of bugs:

- external form data enters the domain through unchecked casts;
- Auth.js identity data has no application-level role contract;
- authorization is reduced to authentication and is not resource-scoped;
- business dates depend on the process timezone and are duplicated;
- database uniqueness errors are not translated into domain outcomes;
- the visible application surface is smaller than the README claims.

The current branch and `origin/refactor/portfolio-v2` point to the same commit. The audit and engineering files are local, untracked working material and must not be treated as implementation already completed.

## Decision

Use an incremental modular monolith. Keep Next.js App Router, Auth.js, Prisma and PostgreSQL, and introduce explicit application/domain boundaries behind thin Server Actions. Every important slice must pass a local diff review plus lint, typecheck and the most relevant tests before the next slice starts.

This is slower than a direct patch but preserves the existing schema intent, keeps deployment simple and makes authorization, date and concurrency behavior testable.

## Corrections to the supplied plan

1. A Neon project/branch is not verifiable from this checkout and no Neon connector is available in this execution context. No external database or secret is provisioned or mutated here. The migration is prepared locally; applying it requires an explicit `DATABASE_URL` in the user's environment.
2. The role matrix is not documented by the product. The implementation uses least privilege as a provisional technical baseline: users operate on their own attendance and absence requests; `ADMIN` and `JEFE` review requests; `ADMIN` owns administrative routes. This must be confirmed before expanding cross-user access.
3. The business timezone is made explicit and configurable through `BUSINESS_TIMEZONE`, defaulting to `America/Argentina/Buenos_Aires` for the current project context. Payroll must not silently infer a legal/financial policy from this default.
4. Payroll is split into a pure, policy-driven calculation module and persistence/UI wiring. The calculator can be implemented and tested now; salary storage and production deductions remain blocked until the compensation basis, rounding, holidays, partial-day rules and legal retention requirements are approved.
5. `reviewedBy` becomes a real nullable relation to `User`, and audit entries are persisted transactionally. This is a data-integrity improvement omitted from the initial minimal slice.

## Implementation blocks and gates

| Block | Scope | Exit gate |
|---|---|---|
| A | PostgreSQL schema/migration, typed Auth.js contract, credentials, guards, validation, business dates and error translation | G2/G3/G4 review, no secret or cross-scope access |
| B | Attendance/absence/review use cases, atomic check-in/out, audit log and thin actions | G1/G3/G4/G5 plus concurrency and negative-policy tests |
| C | Login, protected role shells, absence request/list/review UI and accessible states | G4/G6 plus manual/browser smoke check |
| D | Vitest baseline, CI, environment documentation, structured server logging and ADRs | G6/G7/G8 evidence; no release claim without a real DB/deployment check |
| E | Pure payroll deduction engine and tests | Policy contract documented; persistence wiring remains conditional on approval |

## Known blockers and limits

- Applying migrations against Neon or any production database is outside this local implementation until the connection and target are explicitly supplied.
- The repository has no verified production environment, backup, restore or rollback evidence; G8 remains conditional.
- The implementation cannot invent the medical-data retention/compliance policy or the payroll legal formula. Those are explicit follow-ups, not hidden defaults.
