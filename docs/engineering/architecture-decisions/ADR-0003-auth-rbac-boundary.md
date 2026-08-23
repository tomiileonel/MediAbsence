# ADR-0003 — Auth.js and server-side RBAC boundary

- Status: Accepted with provisional role matrix
- Date: 2026-08-23

## Context

The credentials provider currently returns `null`, the role field is untyped, and middleware only checks whether a user exists. The product does not yet document a complete resource matrix.

## Decision

Keep Auth.js responsible for authentication/session material and expose typed application guards for authorization:

- `requireAuth()` establishes an authenticated actor with an id and role;
- `requireRole()` enforces route/action roles server-side;
- owner-scoped operations always use the actor id in the Prisma predicate;
- `ADMIN` and `JEFE` may review absence requests; all authenticated roles may manage their own attendance and requests;
- role path checks in middleware are an early redirect only, never the sole authorization control.

This matrix is intentionally least privilege and must be expanded only from a confirmed product requirement.

## Alternatives

- Middleware-only RBAC is easy to add but bypassable from server actions and route handlers.
- Per-page ad-hoc checks duplicate rules and drift over time.

Central server-side guards plus owner predicates keep the trust boundary explicit while leaving UI checks as a usability optimization.

## Consequences

- Unauthorized and forbidden outcomes are explicit and testable.
- The current schema remains single-tenant; tenant isolation must be added before multi-organization access is introduced.
