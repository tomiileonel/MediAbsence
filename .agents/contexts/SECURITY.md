# Security Context — MediAbsence

## Authentication
- Auth.js v5 (`next-auth@5.0.0-beta.30`) con estrategia de sesión JWT.
- Credenciales validadas con bcrypt (cost factor 12).
- Mitigación de timing attack: comparación contra `DUMMY_BCRYPT_HASH` en usuarios no existentes.
- Throttle de login: máximo 5 intentos fallidos en una ventana de 15 minutos por correo electrónico (`src/lib/security/login-throttle.ts`).
- Auditoría de acceso: eventos `LOGIN_SUCCEEDED` y `LOGIN_FAILED` registrados en `AuditLog`.

## Authorization
- Control de acceso basado en roles (RBAC) en 3 capas de defensa:
  1. Middleware Edge (`auth.config.ts` via `resolveRouteDecision`): intercepción y redirección previa a la ejecución.
  2. Server Components de página: `requireRole` y verificación estricta de alcance.
  3. Server Actions: validación de rol con `requireRole("ADMIN", "JEFE")` y `requireAuth()`.
- Separación de funciones clínicas: prohibición de auto-dictamen en solicitudes de ausencia (`reviewerId !== target.userId`).
- Matriz de roles: `ADMIN`, `JEFE`, `PROFESIONAL`, `RESIDENTE`.

## Tenant model
- Entorno institucional hospitalario único. Separación lógica estricta a nivel de consulta mediante `userId` y `actorId`.

## Sensitive data
- Información de salud protegida (PHI) y datos de personal hospitalario: diagnósticos, motivos de licencia médica, salarios (`monthlySalaryMinor`).
- Contraseñas almacenadas exclusivamente como hashes bcrypt salteados.
- Headers de seguridad HTTP: CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer, HSTS.

## Compliance constraints
- Principio de retención de registros médicos (HIPAA §164.312): eliminación de usuarios restringida (`onDelete: Restrict`) para preservar asistencias y solicitudes.
- Trazabilidad y no repudio: cada mutación clínica registra una entrada inmutable en `audit_logs`.

## Trust boundaries
- Frontera cliente/servidor: todas las Server Actions validan entradas con esquemas Zod en el servidor y responden mediante el contrato seguro `ActionResult<T>`. Los errores internos nunca exponen trazas o mensajes de base de datos al cliente en producción.
