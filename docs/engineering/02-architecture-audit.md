# 02 — Architecture Audit

## VERIFIED

```text
Next.js App Router
  ├── src/app/page.tsx
  ├── src/app/layout.tsx
  ├── src/app/actions/*.ts       → auth() + Prisma + revalidatePath
  ├── src/app/api/auth/...        → Auth.js handlers
  ├── src/components              → UI primitives / theme
  ├── src/lib/prisma.ts            → Prisma singleton
  └── prisma/schema.prisma         → MySQL model
```

`src/app`, `src/components`, `src/lib` y `prisma` son límites observables. No existe una capa de dominio o aplicación independiente de las Server Actions.

## INFERRED

- Arquitectura actual: monolito modular con lógica de aplicación y persistencia acopladas en Server Actions.
- El flujo de autenticación atraviesa middleware → Auth.js → JWT → Server Actions.
- La revalidación de rutas se usa como mecanismo de actualización de UI después de mutaciones.

## UNKNOWN

- Contratos HTTP fuera de Auth.js.
- Flujos de dashboard que el README describe pero que no aparecen en el árbol actual.
- Decisiones de arquitectura aprobadas, ADRs de dominio y estrategia de escalado.

## BLOCKING / G2

G2 queda `BLOCKED/PARTIAL`: hay límites de módulo verificables, pero no hay evidencia de un ADR registrado que explique la arquitectura actual, dirección de dependencias, datasource, límites de autorización o decisiones de Server Actions. Los contextos `ARCHITECTURE.md`, `DATABASE.md` y `API.md` están sin materializar.

## Hallazgos del worker arquitectónico

- `ARCH-001` (`VERIFIED`): monolito Next.js visible, sin servicios separados, colas, caché o integraciones externas observables.
- `ARCH-002` (`BLOCKING`): las Server Actions acoplan autenticación, persistencia y flujo; no se puede verificar dirección de dependencias ni trade-offs aprobados.
- `ARCH-003` (`VERIFIED/HIGH`): la superficie funcional visible no respalda todos los flujos declarados por README/UI.
- `ARCH-009` (`UNKNOWN`): despliegue, pooling, backups, recuperación, observabilidad y objetivo 99.9% no son verificables en esta fase.

Validación del worker: `read_only=PASS`, `scope=PASS`, `G2=BLOCKED`, confianza `MEDIUM`.

No se crea un ADR de target architecture todavía. El único ADR aceptado en esta fase documenta el límite read-only; las decisiones de RBAC, autenticación y datos requieren evidencia adicional.

## Alternativas para target architecture

1. **Modular monolith reforzado:** agregar dominio/policies/validación detrás de Server Actions. Menor coste y menor cambio operativo.
2. **Application services explícitos:** separar casos de uso, policies y repositorios. Mejor testabilidad, mayor refactor inicial.
3. **API/BFF separado:** mayor aislamiento y escalabilidad, pero añade contratos, despliegue y superficie de seguridad.

## Decisión provisional

Mantener el monolito modular durante discovery y diseñar una capa de policies + application services antes de considerar separación de servicios. Es una propuesta, no una decisión aprobada.
