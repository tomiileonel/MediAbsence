# Database Context — MediAbsence

## Engine/version
- PostgreSQL 16+ (compatible con Neon serverless Postgres y PostgreSQL estándar).
- Prisma ORM 5.22.0 con cliente `@prisma/client`.
- Driver adapter: PostgreSQL standard connection string via `DATABASE_URL`.

## Tenancy model
- Single-tenant hospital/institution model. Todos los usuarios (médicos residentes, jefes de servicio, administradores) comparten la base de datos institucional con aislamiento mediante RBAC y relaciones foráneas.

## Main aggregates
1. **User**: Cuenta de profesional médico, rol del sistema (`ADMIN`, `JEFE`, `PROFESIONAL`, `RESIDENTE`), credenciales bcrypt y salario mensual (`monthlySalaryMinor`).
2. **Attendance**: Registro diario de fichaje/asistencia hospitalaria (`PRESENT`, `ABSENT`, `LATE`), timestamps de entrada y salida (`timeIn`, `timeOut`), y geolocalización o consultorio (`location`). Clave única: `[userId, date]`.
3. **AbsenceRequest**: Solicitud de licencia médica o ausencia (`SICK_LEAVE`, `VACATION`, `PERSONAL`, `CONGRESS`, `OTHER`), rango de fechas `[startDate, endDate]`, motivo, estado (`PENDING`, `APPROVED`, `REJECTED`), notas y referencia al dictaminador (`reviewedBy`).
4. **AuditLog**: Pistas de auditoría inmutables para eventos clínicos, asistencias, solicitudes y autenticación (`AuditAction`).

## Constraints
- **Exclusión de solapamiento**: `absence_requests_user_active_range_excl` vía extensión PostgreSQL `btree_gist`: impide que un usuario tenga dos solicitudes activas (`PENDING` o `APPROVED`) con rangos de fecha solapados.
- **Chequeo de fechas**: `absence_requests_date_range_check` (`endDate >= startDate`).
- **Unicidad de fichaje diario**: `[userId, date]` en `attendances`.
- **Integridad referencial clínica**: `onDelete: Restrict` en relaciones de usuario con asistencias y solicitudes para cumplimiento HIPAA y retención de historial médico.

## Index strategy
- `attendances`: `@@unique([userId, date])`.
- `absence_requests`: `@@index([userId, createdAt])`, `@@index([status, startDate])`, `@@index([reviewedBy])`.
- `audit_logs`: `@@index([entityType, entityId, createdAt])`, `@@index([actorId, createdAt])`.

## Migration policy
- Migraciones gestionadas con `prisma migrate dev` en desarrollo y `prisma migrate deploy` en CI/producción.
- Constraints raw de PostgreSQL no soportadas en el DSL de Prisma (`btree_gist` exclusion, CHECK) residen en migraciones versionadas y están documentadas como `raw-whitelisted`.

## Backup/recovery
- Snapshots automatizados de PostgreSQL / Neon. Point-in-time recovery habilitado en producción.
