# Environments Context — MediAbsence

## Dev
- Local runtime: Node.js 24+ (mínimo 22.13+), pnpm 11+.
- Database: PostgreSQL local o branch Neon Serverless (`DATABASE_URL`).
- Auth Secret: `AUTH_SECRET` generado localmente.
- Commands: `pnpm dev`, `pnpm test`, `pnpm typecheck`, `pnpm lint`.

## Test/CI
- Runner: GitHub Actions (`ubuntu-latest`).
- Service: PostgreSQL 16 containerizado en CI para ejecución de tests de base de datos y guardias de migración.
- Pipeline: lint, typecheck, unit/integration tests con Vitest, Prisma drift guard y build de producción.

## Staging
- Pre-producción espejo en cloud / Vercel con branch dedicada en Neon Postgres.
- Hardening HTTP activo (CSP, XFO, HSTS).

## Production
- Despliegue en plataforma serverless/edge con base de datos Neon PostgreSQL de alta disponibilidad.
- Headers de seguridad estrictos para protección de PHI.
- Registro inmutable de auditoría para trazabilidad médica.

## Secrets/config management
- Variables de entorno gestionadas vía `.env` local (ignorado en git) y variables secretas inyectadas por plataforma en CI/CD y producción.
- Antigravity Safety Gate bloquea cualquier lectura o exfiltración de `.env` o claves privadas.
