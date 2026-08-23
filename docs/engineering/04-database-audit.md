# 04 — Database Audit

## VERIFIED

- Prisma datasource: `mysql` (`prisma/schema.prisma`).
- Auth.js models: `Account`, `Session`, `VerificationToken`, `User`.
- Core models: `User`, `Attendance`, `AbsenceRequest`.
- Roles: `ADMIN`, `JEFE`, `PROFESIONAL`, `RESIDENTE`.
- `Attendance` tiene `@@unique([userId, date])`.
- `AbsenceRequest` usa `RequestStatus` y `RequestType`, con reviewer opcional y fechas `@db.Date`.
- Relaciones User → Attendance/AbsenceRequest usan `onDelete: Cascade`.
- No se observó directorio `prisma/migrations` ni evidencia de schema vivo; G3 no puede cerrarse con el único `schema.prisma` (`DB-001`).
- `User.email` es nullable y unique; el comportamiento de múltiples `NULL` depende del motor y no sustituye una política de identidad (`DB-004`).

## INCONSISTENCIA DE CONTEXTO

`.agents/contexts/STACK.md` declara PostgreSQL/SQLite, mientras el schema verificable usa MySQL. Esto es `BLOCKING` para G3 hasta reconciliarlo con el entorno real.

## Riesgos

- **DB-001:** ausencia de `prisma/migrations` visible; política y estado de migración desconocidos (`G3 UNKNOWN`).
- **DB-002:** `reviewedBy` es un String sin relación referencial con User; integridad del reviewer no está garantizada (`MEDIUM`).
- **DB-003:** `AbsenceRequest` no muestra índices explícitos para consultas por status, reviewer o rangos de fecha (`MEDIUM`, performance/data access pendiente).
- **DB-004:** `@db.Date` más `new Date()` local puede producir desplazamientos de día según timezone (`HIGH`, requiere decisión temporal).
- **DB-005:** cascada de eliminación de User a historial médico/asistencia puede ser incompatible con retención/auditoría (`HIGH`, requiere requisito legal/operativo).
- **DB-006:** `reviewedBy` es un scalar sin FK; puede apuntar a una identidad inexistente (`MEDIUM`).
- **DB-007:** la secuencia `findUnique → create` de check-in permite una carrera entre solicitudes concurrentes; la constraint evita duplicidad persistida, pero no ofrece semántica idempotente (`HIGH`).
- **DB-008:** `getMyRequests` filtra por `userId` y ordena por `createdAt`, sin índice compuesto explícito visible (`MEDIUM`, confirmar con volumen real).

## UNKNOWN

- Engine y versión efectiva de producción.
- Estado de migraciones aplicadas.
- Estado real del schema y engine en runtime.
- Política de backup, restore y retención.
- Volumen de usuarios, cardinalidad y consultas críticas.

## No ejecutado

No se ejecutaron Prisma CLI, migraciones, introspection, conexión de base de datos ni comandos de escritura.
