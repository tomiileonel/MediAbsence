# Observability Context — MediAbsence

## Logging
- Format: JSON estructurado via `src/lib/observability/logger.ts`.
- Levels: `info`, `warn`, `error`.
- Sensitive-data redaction: No se registran contraseñas ni datos personales identificables crudos; solo IDs (`actorId`, `attendanceId`, `requestId`).

## Audit Traces
- Tabla inmutable `audit_logs` con `action`, `actorId`, `entityType`, `entityId`, `metadata` (JSONB) y timestamp `created_at`.
- Eventos de autenticación: `LOGIN_SUCCEEDED`, `LOGIN_FAILED`.
- Eventos asistenciales: `ATTENDANCE_CHECKED_IN`, `ATTENDANCE_CHECKED_OUT`.
- Eventos de licencias: `ABSENCE_CREATED`, `ABSENCE_APPROVED`, `ABSENCE_REJECTED` (con metadata de deducción salarial proyectada).

## Metrics & Health
- Verificación de consistencia de base de datos vía consultas estructuradas e índices únicos.
- SLI de disponibilidad: 99.9% uptime en App Router y base de datos.
