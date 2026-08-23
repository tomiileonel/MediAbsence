# MediAbsence

MediAbsence es una aplicación Next.js para gestionar asistencia y solicitudes de ausencia de personal de salud con control de acceso por rol.

## Estado implementado

- Login con Auth.js Credentials, bcrypt y sesión JWT tipada.
- RBAC server-side para `ADMIN`, `JEFE`, `PROFESIONAL` y `RESIDENTE`.
- Registro atómico de ingreso/salida con día de negocio configurable.
- Solicitud, consulta y revisión de ausencias.
- Auditoría transaccional de cambios críticos.
- Prisma sobre PostgreSQL con migración versionada y seed seguro.
- Tests unitarios con Vitest y workflow de CI.

El motor de payroll existe como cálculo puro orientado por política. No se conecta todavía a salarios ni genera deducciones reales: faltan reglas de negocio y legales aprobadas para divisor, feriados, jornadas parciales, redondeo, retención y autorización.

## Stack

- Next.js 16 App Router, React 19 y TypeScript strict.
- Prisma 5.22 sobre PostgreSQL.
- Auth.js 5 beta con Credentials y Prisma Adapter.
- Tailwind CSS v4 y componentes Radix/shadcn existentes.
- pnpm 11.19.

## Desarrollo local

1. Instala Node.js 20+ y pnpm 11.19.
2. Instala dependencias:

   ```bash
   pnpm install
   ```

3. Copia `.env.example` a `.env` y define `DATABASE_URL`, `AUTH_SECRET`, `BUSINESS_TIMEZONE` y, sólo para seed, `SEED_PASSWORD`.
4. Genera el cliente y aplica la migración en una base PostgreSQL de desarrollo:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. Inicia la aplicación:

   ```bash
   pnpm dev
   ```

No se deben ejecutar `db:migrate` o `db:seed` contra producción sin revisar el plan de migración y la recuperación.

## Quality gates

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

La migración inicial es una cutover de PostgreSQL para un esquema sin migraciones previas. No contiene una migración automática de datos desde el MySQL histórico; esa operación requiere un plan separado y validación de integridad.

## Roles provisionales

- `RESIDENTE` y `PROFESIONAL`: gestionan su asistencia y sus propias solicitudes.
- `JEFE` y `ADMIN`: pueden revisar solicitudes pendientes.
- `ADMIN`: dispone del dashboard administrativo.

Esta matriz es una política least-privilege técnica hasta que el negocio confirme el alcance por organización/servicio. No existe aislamiento multi-tenant en el schema actual.

## Documentación de ingeniería

- [Revisión del plan de implementación](docs/engineering/16-implementation-plan-review.md)
- [Estado de implementación](docs/engineering/17-implementation-status.md)
- [ADRs](docs/engineering/architecture-decisions/)
- [Preparación de release](docs/engineering/release-readiness.md)

La ausencia de un archivo `LICENSE` sigue siendo una decisión legal pendiente; no se inventa una licencia por código.
