# Implementation status

Date: 2026-08-23

## Completed locally

- Typed Auth.js role/session contract and server-side guards.
- Credentials authentication against Prisma with bcrypt and normalized email lookup.
- PostgreSQL Prisma schema, initial migration, date-range check and seed requiring `SEED_PASSWORD`.
- Zod validation for absence requests and bounded attendance location input.
- Explicit business timezone and date-only handling.
- Atomic attendance check-in/check-out behavior with translated conflicts.
- Absence creation/review use cases, reviewer FK and transactional audit records.
- Login, role dashboards, absence request/list/review routes and accessible feedback states.
- Vitest baseline with date, validation, role and payroll-domain tests.
- CI workflow and structured event logging without credentials or medical payloads.

## Intentionally conditional

- No migration was applied to Neon or another external database from this checkout.
- No compensation table or payroll mutation is wired. The calculation engine requires an explicit policy and uses integer minor units; legal/business policy is still pending.
- No tenant model, user administration workflow or medical-data retention policy is invented.

## Evidence from this turn

- Prisma schema validation: pass.
- Prisma client generation: pass.
- TypeScript strict check: pass after each reviewed block.
- ESLint on changed implementation: pass.
- Unit tests: pass (13 tests) after fixing date/validation defects found by the suite.
- Next production build: pass with non-secret local placeholder variables; Next 16 reports only the known middleware-to-proxy deprecation warning.
