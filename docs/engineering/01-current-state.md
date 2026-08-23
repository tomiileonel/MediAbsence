# 01 — Current State

## Estado de auditoría

- **Modo:** READ-ONLY.
- **Proyecto:** `C:\wamp64\www\proyectos\MediAbsence`.
- **Fuente normativa:** `ingenieria/.agents`; BIBLIOTECA sólo complementa.
- **Resultado:** modelo actual documentado; ninguna solución implementada.
- **Dispatch de especialistas en este turno:** `PARTIAL`. El intento de fan-out completo alcanzó el límite de hilos del controlador. Sí completaron workers nativos de `codebase-auditor`, `software-architect`, `backend-application`, `security-review`, `database-prisma` y `domain-architect`; los restantes fueron consolidados por el main agent con inspección local read-only. La ejecución nativa anterior está documentada en `C:\wamp64\www\proyectos\docs\engineering\runtime-e2e-validation.md`.

## VERIFIED

- Next.js App Router 16.1.6, React 19.2.3 y TypeScript strict están declarados en `package.json`, lockfile y `tsconfig.json`.
- Prisma 5.22.0 usa datasource `mysql` en `prisma/schema.prisma`.
- Auth.js/NextAuth 5 beta usa `auth.config.ts`, `auth.ts`, middleware y route handler `/api/auth/[...nextauth]`.
- El código funcional visible es pequeño: una página principal, dos módulos de Server Actions, un route handler de Auth.js y componentes UI reutilizables.
- Los workers nativos confirmaron que la página raíz enlaza `/login` y `/solicitar`, pero esas rutas no aparecen en el árbol actual.
- No existe script de tests ni runner E2E declarado.
- No se encontraron workflows CI/CD, Dockerfile, configuración Vercel ni directorio Prisma migrations en el árbol inspeccionado.

## INFERRED

- La aplicación pretende ser un monolito modular Next.js con persistencia Prisma y autorización basada en roles.
- Las Server Actions son actualmente el límite principal de aplicación/persistencia.
- La superficie implementada es menor que la descrita por el README: no hay rutas visibles para dashboards, login o solicitar licencia en el árbol inspeccionado.

## UNKNOWN

- Estado real de la base de datos y usuarios existentes.
- Funcionamiento end-to-end de login y sesiones.
- Entorno de despliegue, variables requeridas, backups y rollback.
- Reglas de negocio completas y matriz real rol/recurso/acción.

## BLOCKING

- `G4`: autorización RBAC server-side no está evidenciada.
- `G4`: el proveedor Credentials retorna `null` y la ruta personalizada `/login` no está materializada.
- `G2`: no se encontró ADR de arquitectura de aplicación registrado.
- `G3`: datasource real y política de migraciones requieren reconciliación con el contexto del proyecto.
- `G6`: no existe baseline automatizado de pruebas.

## Gates al cierre de discovery

| Gate | Estado | Motivo |
|---|---|---|
| G0 | UNKNOWN | Requisitos y criterios de aceptación no están formalizados |
| G1 | PARTIAL | Entidades inferibles; actores y reglas de negocio presentan drift |
| G2 | BLOCKED | Límites visibles, pero faltan ADR, dirección de dependencias y trade-offs aprobados |
| G3 | PARTIAL | Schema visible; migraciones y engine del contexto son inconsistentes |
| G4 | FAIL | Autorización por rol y `/api` no están cerradas server-side |
| G5 | UNKNOWN | No corresponde evaluar implementación sin baseline |
| G6 | FAIL | No hay suite ni runner declarado |
| G7 | BLOCKED | G4 y G6 mantienen abierto el límite de seguridad y la evidencia de calidad |
| G8 | UNKNOWN | No hay evidencia operativa suficiente |

## Evidencia principal

`package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `auth.config.ts`, `auth.ts`, `src/middleware.ts`, `src/app/actions/*.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `prisma/schema.prisma`, `AGENTS.md`, `.agents/contexts/*`.
