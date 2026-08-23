# 08 — Dependency Audit

## VERIFIED

Versiones fijadas por `package.json`/`pnpm-lock.yaml`:

- Next.js `16.1.6`.
- React/React DOM `19.2.3`.
- NextAuth `5.0.0-beta.30`.
- Prisma/Client `5.22.0`.
- TypeScript lock `5.9.3`.
- ESLint lock `9.39.3`.
- Tailwind/PostCSS lock `4.2.1`.
- Zod `4.3.6`.
- bcryptjs `3.0.3`.

El proyecto tiene `pnpm-lock.yaml` pero README documenta tanto npm como pnpm. Eso crea una convención de instalación ambigua.

## Riesgos

- **DEP-001:** `next-auth` beta en superficie crítica de autenticación (`HIGH`, G4).
- **DEP-002:** Prisma 5.22 y Next 16 deben validarse conjuntamente con el engine MySQL real (`MEDIUM`, G3).
- **DEP-003:** package ranges `^` permiten drift si lockfile no se respeta (`MEDIUM`, G8).
- **DEP-004:** no hay evidencia de política de vulnerability scanning o SBOM (`UNKNOWN`, G8).
- **DEP-005:** README mezcla npm/pnpm mientras el lockfile canónico es pnpm (`LOW/MEDIUM`, G8).

## UNKNOWN

- Vulnerabilidades actuales.
- Licencias y advisories aceptables.
- Compatibilidad efectiva del runtime Node de despliegue.

No se ejecutó `pnpm audit`, `npm audit`, actualización ni instalación.
