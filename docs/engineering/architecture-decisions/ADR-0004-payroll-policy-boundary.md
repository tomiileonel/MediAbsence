# ADR-0004 — Policy-driven payroll calculation

- Status: Accepted for calculation only; persistence wiring pending business approval
- Date: 2026-08-23

## Context

The repository has no compensation model and no approved rule for salary basis, working days, holidays, partial days, rounding or legal retention. A payroll feature that guessed these values would create financial and compliance risk.

## Decision

Implement payroll as a pure function that receives an explicit policy and a date calendar. The function uses integer minor units for deterministic arithmetic and returns the calculation inputs and result. It is not connected to user salary data or payment mutations until the policy is approved.

## Consequences

- The engine is unit-testable and cannot silently apply a legal assumption.
- A later compensation model can provide policy data without changing the calculation core.
- Production payroll remains blocked until the business supplies the missing rules and audit/approval requirements.
