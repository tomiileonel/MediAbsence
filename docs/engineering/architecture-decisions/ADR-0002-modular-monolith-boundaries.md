# ADR-0002 — Modular monolith boundaries

- Status: Accepted for the incremental refactor
- Date: 2026-08-23

## Context

The application is a small Next.js App Router project. Current Server Actions combine authentication, validation, business rules and Prisma calls. The project has no evidence that independent deployment, queueing or service isolation is required.

## Decision

Keep a modular monolith with this dependency direction:

```text
App Router / Server Actions
  -> application use cases and policies
  -> domain types and invariants
  -> infrastructure adapters (Prisma/Auth.js)
```

Server Actions remain adapters. UI code does not access Prisma directly, and domain policies do not depend on React or Auth.js APIs.

## Alternatives

- A direct Server Action patch is smaller but preserves the current coupling.
- A separate API/BFF would add operational and authentication boundaries without evidence that current scale needs them.

The modular monolith provides the best balance of testability, delivery speed and operational simplicity for the observed scale.

## Consequences

- New use cases require a small amount of boundary code.
- The repository remains deployable as one Next.js application.
- A future split is possible only after measured scale, team or failure-isolation requirements justify it.
