# 12 — Technical Debt

| ID | Debt | Evidence | Severity | Gate | Status |
|---|---|---|---|---|---|
| TD-001 | `authorize()` retorna `null` | `auth.config.ts:13-18` | BLOCKER | G4 | OPEN |
| TD-002 | No hay RBAC server-side efectivo | `auth.config.ts:36-38`, Server Actions | BLOCKER | G4 | OPEN |
| TD-003 | `/api` allow-by-default | `auth.config.ts:30-33`, middleware matcher | HIGH | G4 | OPEN |
| TD-004 | Server Actions sin schemas runtime | `absence.ts`, `attendance.ts` | HIGH | G4/G5 | OPEN |
| TD-005 | Contexto datasource contradice Prisma | `.agents/contexts/STACK.md` vs schema | HIGH | G3 | OPEN |
| TD-006 | Sin capa de dominio/application services | árbol `src` | MEDIUM | G1/G2 | OPEN |
| TD-007 | Sin tests ni E2E runner | `package.json`, tree | BLOCKER | G6 | OPEN |
| TD-008 | Sin ADR de arquitectura | `AGENT-MATRIX.md` exige ADR; no encontrado | HIGH | G2 | OPEN |
| TD-009 | Sin CI/CD, rollback o backup evidenciado | tree y ENVIRONMENTS placeholder | HIGH | G8 | OPEN |
| TD-010 | README y árbol de rutas divergen | README vs `src/app` | MEDIUM | G0/G1 | OPEN |
| TD-011 | Date/time local implícito | `setHours`, `new Date`, `@db.Date` | HIGH | G3 | OPEN |
| TD-012 | Dependencia NextAuth beta | `package.json` | HIGH | G4 | OPEN |
| TD-013 | `/login` configurado pero no materializado | `auth.config.ts`, tree `src/app` | BLOCKER | G4 | OPEN |
| TD-014 | `reviewedBy` sin relación referencial | `prisma/schema.prisma` | MEDIUM | G3/G4 | OPEN |
| TD-015 | Check-in no idempotente ante carrera | `src/app/actions/attendance.ts` | HIGH | G5 | OPEN |
| TD-016 | Ausencia de invariantes de dominio verificables | `absence.ts`, `schema.prisma`, contextos vacíos | HIGH | G1/G5 | OPEN |

No se implementa ninguna deuda en esta fase.
