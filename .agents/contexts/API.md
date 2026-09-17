# API Context — MediAbsence

## API style
- Server Actions (Next.js App Router).
- Internal Server Actions en `src/app/actions/*`: `attendance.ts`, `absence.ts`, `auth.ts`.

## Versioning
- Internal application actions; no public third-party versioned REST exposed.

## Authentication
- Auth.js v5 JWT session cookies (`requireAuth()`).

## Authorization
- Policy model: RBAC (`requireRole("ADMIN", "JEFE")`, `requireAuth()`).
- Resource scoping: Verificación estricta de propiedad (`userId === actor.id`) o rol supervisor.

## Request conventions
- Validación: Esquemas Zod en `src/lib/validation/*` aplicados en el borde de cada Server Action.
- Parseo FormData seguro: `parseAbsenceRequestFormData`.

## Response conventions
- Envelope canónico: `ActionResult<T>` = `{ ok: true, data: T } | { ok: false, error: string }`.
- Helper constructores: `actionOk(data)` y `actionFailed(error)`.
- Error translation: `getActionErrorMessage` mapea `DomainError` a mensajes explicativos seguros en producción sin fugar detalles de infraestructura o base de datos.
