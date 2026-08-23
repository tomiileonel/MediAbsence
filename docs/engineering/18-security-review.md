# Security review — implemented slices

Date: 2026-08-23
Scope: Auth.js, RBAC, Server Actions, Prisma ownership predicates and input boundaries.

## Resolved in code

- Credentials authorization now validates input, normalizes email, reads the user server-side and compares bcrypt hashes. Invalid credentials return the same generic outcome.
- Session/JWT roles are augmented and runtime-checked; no `@ts-ignore` remains.
- Middleware performs role-path redirects, while each page/action repeats authorization server-side.
- Attendance and absence reads/mutations use the authenticated actor id; reviewer actions are restricted to `ADMIN`/`JEFE`.
- FormData, review parameters and attendance location are parsed/length-bounded at the boundary.
- Prisma uniqueness conflicts are translated; attendance updates use a conditional predicate for concurrency.
- Audit records are written in the same transaction as critical mutations and never include passwords, reasons or credential material in logs.
- Error UI exposes a generic message and does not render server exception details.

## Residual findings

| Severity | Finding | Treatment |
|---|---|---|
| MEDIUM | The schema is single-tenant and has no organization/resource scope | Explicitly documented; must be solved before multi-organization access |
| MEDIUM | Credentials provider is on an Auth.js beta and has no rate-limit/MFA layer | Operational/security follow-up before production exposure |
| MEDIUM | Integration tests against a real PostgreSQL instance are not executed in this checkout | Requires a test database URL and isolated data lifecycle |
| LOW | Next 16 reports the `middleware` to `proxy` convention deprecation | Build passes; migration should be planned separately |

No unresolved CRITICAL/HIGH finding was introduced by the implemented slices. G4 remains conditional until authenticated integration tests and the target database are available.
