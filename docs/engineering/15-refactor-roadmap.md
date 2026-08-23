# 15 — Refactor Roadmap (Propuesta)

## Estado

Roadmap inicial de discovery. No se ejecutaron pasos de implementación.

| Fase | Entregable | Gate previo | Estado |
|---|---|---|---|
| 0 | Runtime Engineering System verified | runtime E2E | VERIFIED |
| 1 | Current-state + specialist audits | read-only | COMPLETE / PARTIAL native dispatch; remaining synthesis by main agent |
| 2 | Requisitos, dominio y matriz de permisos | G0/G1 | BLOCKED |
| 3 | ADR de arquitectura, engine y auth | G2 | BLOCKED |
| 4 | TEST-001 baseline determinista | G6 | BLOCKED |
| 5 | Diseño RBAC/auth/API/FormData | G4 | BLOCKED |
| 6 | Implementación controlada por slices | G4/G5 | BLOCKED |
| 7 | Tests auth/RBAC/actions/domain/E2E | G6 | BLOCKED |
| 8 | Review independiente y performance | G7 | BLOCKED |
| 9 | CI/CD, backup, rollback y release | G8 | BLOCKED |

## Orden recomendado

1. Confirmar actores y reglas de dominio sin cambiar código.
2. Resolver `RISK-001` como diseño: autenticación, RBAC, API y ownership.
3. Decidir MySQL vs contexto declarado y estrategia de migraciones.
4. Crear baseline de tests antes de tocar seguridad.
5. Aprobar ADRs.
6. Implementar en cambios pequeños, cada uno con gates.

## Tests futuros

- `TEST-001`: deterministic test baseline.
- `TEST-002`: authentication tests.
- `TEST-003`: authorization/RBAC tests.
- `TEST-004`: Server Action tests.
- `TEST-005`: domain/invariant tests.
- `TEST-006`: critical E2E flows.

## Prohibición

No hacer package upgrades, migraciones, fixes de RBAC, cambios de Auth.js o refactor de Server Actions como parte de este roadmap inicial.
