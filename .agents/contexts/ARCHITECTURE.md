# Architecture Context — MediAbsence

## Pattern
- Next.js 15/16 App Router con arquitectura modular en capas (`src/modules/*`) y Server Actions como puntos de entrada de mutaciones.
- Separación de responsabilidades:
  - Dominio puro (`domain/`): lógica sin efectos colaterales (ej. `payroll/domain/deduction-service.ts`).
  - Aplicación (`application/`): orquestación de casos de uso y persistencia (`absence-service.ts`, `attendance-service.ts`).
  - Presentación: Server Components para lectura inicial + Client Components para interactividad local y estados transitorios.

## Module layout
- `src/modules/absences`: gestión de licencias médicas y solicitudes de ausencia.
- `src/modules/attendance`: registro y control de fichaje diario de médicos residentes y profesionales.
- `src/modules/audit`: registro atómico de auditoría clínica y de acceso.
- `src/modules/auth`: roles, guardias RBAC y autenticación de credenciales.
- `src/modules/payroll`: cálculo de deducciones salariales por ausencias (ADR-0004).
- `src/app`: rutas de App Router, layouts, páginas RSC y Server Actions.

## Cross-cutting concerns
- **Auditoría**: `recordAudit` ejecutado de manera atómica dentro de las mismas transacciones `$transaction`.
- **Validación**: Esquemas Zod en `src/lib/validation/*`.
- **Manejo de errores**: `DomainError` y jerarquía tipada (`ConflictError`, `ForbiddenError`, `NotFoundError`, `ValidationError`) encapsulados via `ActionResult<T>`.
- **Logging**: Logger estructurado en `src/lib/observability/logger.ts`.

## State management
- Servidor como fuente única de verdad; revalidación con `revalidatePath` tras mutaciones.
- Estado cliente mínimo con React hooks (`useState`, `useTransition`) y `react-hook-form`.

## Async processing
- Operaciones transaccionales sincrónicas de alta consistencia en PostgreSQL.

## Invariants
- 0 imports de Prisma dentro de `src/app/` (ADR-0002).
- Toda acción de mutación retorna `ActionResult<T>`.
- Una única asistencia principal por médico por día (`[userId, date]`).
- Cero solapamiento entre solicitudes activas del mismo médico.
