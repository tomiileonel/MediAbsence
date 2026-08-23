# AGENTS.md — MediAbsence

## Resumen del proyecto

Aplicación Next.js App Router con TypeScript, React, Tailwind CSS v4, Prisma y Auth.js para gestionar asistencias de médicos residentes.

## Equipo de ingeniería

La entrada única es `fullstack-orchestrator`, definido en `.agents/agents/fullstack-orchestrator.md`. Aplicar también `../AGENTS.md` cuando esté disponible. Skills prioritarias: `nextjs-architecture`, `typescript-reliability`, `prisma-postgres`, `auth-security`, `ui-system`, `testing-quality` y `release-engineering`.

## Setup, desarrollo y validación

- `pnpm install`
- Desarrollo: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck manual: `pnpm exec tsc --noEmit` (no hay script dedicado).
- Build: `pnpm build`
- Tests: no hay script declarado; documentar el check adicional si se incorpora.

## Arquitectura y estilo

Respetar App Router, Server Components/Actions y las capas de dominio existentes. Validar DTOs en el borde, mantener TypeScript estricto y evitar consultas N+1. Los cambios de Prisma deben pasar por `database-prisma` y un gate de seguridad cuando afecten datos o permisos.

## Seguridad

Auth.js no reemplaza autorización: cada mutación y lectura protegida debe comprobar sesión, rol y alcance server-side. No exponer secretos ni usar variables `.env` en respuestas, logs o commits.

## Flujo de contribución

Feature: G0–G5, QA/accessibility/observability, code/security/performance review y release según corresponda. Revisar `git diff --check`, lint, typecheck y build antes de cerrar.
