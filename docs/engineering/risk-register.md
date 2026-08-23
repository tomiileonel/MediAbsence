# Risk Register

## Convenciones

- `VERIFIED`: observado directamente en archivos o contratos.
- `INFERRED`: deducción razonable pendiente de confirmación.
- `UNKNOWN`: no existe evidencia suficiente.
- `BLOCKING`: impide avanzar el gate correspondiente.

| ID | Severity | Domain | Gate | Status | Classification | Evidence |
|---|---|---|---|---|---|---|
| RISK-001 | BLOCKER | Security / Credentials | G4 | OPEN | VERIFIED | `auth.config.ts:7-19`; `authorize()` retorna `null` |
| RISK-002 | BLOCKER | Security / RBAC | G4 | OPEN | VERIFIED | `auth.config.ts:36-38`; sólo `isLoggedIn` |
| RISK-003 | HIGH | Security / API | G4 | OPEN | VERIFIED | `/api` allow-by-default y middleware excluyente |
| RISK-004 | BLOCKER | Testing | G6 | OPEN | VERIFIED | sin test script, runner o test files |
| RISK-005 | HIGH | Architecture | G2 | OPEN | VERIFIED | no ADR de aplicación visible |
| RISK-006 | HIGH | Database | G3 | OPEN | VERIFIED | MySQL en schema vs PostgreSQL/SQLite en context |
| RISK-007 | HIGH | Backend | G4/G5 | OPEN | VERIFIED | casts de FormData y fechas sin schema |
| RISK-008 | HIGH | Domain | G1 | OPEN | INFERRED | roles README/context/schema no coinciden |
| RISK-009 | HIGH | Database | G3 | OPEN | INFERRED | cascada User → historial sin política de retención |
| RISK-010 | HIGH | Operations | G8 | OPEN | UNKNOWN | no CI/CD, backup, rollback ni environments definidos |
| RISK-011 | HIGH | Dependencies | G4/G8 | OPEN | VERIFIED | NextAuth `5.0.0-beta.30` en auth crítica |
| RISK-012 | MEDIUM | Performance | G3/G6 | OPEN | UNKNOWN | sin métricas, paginación o benchmarks |
| RISK-013 | MEDIUM | Tenancy | G4 | OPEN | UNKNOWN | no tenant/organization en schema o context operativo |
| RISK-014 | BLOCKER | Security / Login route | G4 | OPEN | VERIFIED | Auth.js configura `/login`, pero no existe ruta visible |
| RISK-015 | HIGH | Backend / Concurrency | G5 | OPEN | INFERRED | `checkIn` ejecuta `findUnique` y `create` en operaciones separadas |
| RISK-016 | MEDIUM | Database / Reviewer integrity | G3/G4 | OPEN | VERIFIED | `AbsenceRequest.reviewedBy` es `String` nullable sin FK |
| RISK-017 | HIGH | Domain / Business rules | G1 | OPEN | UNKNOWN | no hay reglas verificables para solapamiento, revisión o transiciones |

## Gate policy

Mientras exista un riesgo `BLOCKING` abierto en G4 o G6, la implementación permanece bloqueada. Ningún worker está autorizado a cerrarlo mediante una modificación durante discovery.

## Próximas evidencias necesarias

- matriz real de roles, acciones, recursos y condiciones;
- decisión de autenticación y provisioning;
- engine/entorno de base de datos y política de migraciones;
- ADR de arquitectura y datasource;
- baseline de tests y pruebas negativas de autorización;
- entorno de despliegue, backup y rollback.
- ruta de login real y mecanismo de provisioning/verificación de credenciales;
- política de timezone, idempotencia y concurrencia de asistencia.
