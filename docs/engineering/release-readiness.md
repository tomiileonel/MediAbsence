# Release readiness

Estado: **CONDITIONAL / no es un release de producción**.

## Evidencia local

- `pnpm install --frozen-lockfile --ignore-scripts`: PASS.
- Prisma validate/format y client generation: PASS.
- ESLint: PASS.
- TypeScript strict: PASS.
- Vitest: PASS (13 tests).
- Next build: PASS con variables dummy locales.
- Smoke HTTP local: `/` y `/login` responden 200; `/solicitar`, `/solicitudes` y `/admin` redirigen sin sesión; `/forbidden` responde 200.

## Bloqueadores G8

- No se aplicó la migración a una base PostgreSQL real desde este checkout.
- No hay evidencia de backup, restore, observabilidad de producción ni plataforma de despliegue.
- El seed requiere un secreto que debe proporcionarse sólo en el entorno de desarrollo.
- No existe una política de payroll aprobada ni modelo de compensación persistido.
- No existe una licencia legal confirmada para el repositorio.

## Procedimiento de despliegue pendiente

1. Provisionar/revisar PostgreSQL de producción y obtener `DATABASE_URL` fuera del repositorio.
2. Ejecutar `pnpm db:deploy` como paso controlado de release; no usar `db push`.
3. Verificar el schema, índices, constraint de rango y Foreign Keys.
4. Ejecutar smoke tests autenticados con usuarios de prueba no productivos.
5. Confirmar logs de login, asistencia, solicitud y revisión sin payloads médicos ni credenciales.

## Recuperación

Antes de aplicar la migración debe existir un backup verificable y un procedimiento de restore. Si la aplicación nueva falla, el rollback de código no revierte automáticamente el schema: la recuperación debe usar backup/restore o una migración compensatoria revisada. No se declara rollback operativo hasta probarlo en staging.
