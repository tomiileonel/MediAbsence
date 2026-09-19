# AGENTS.md — Equipo de Ingeniería MediAbsence

Este repositorio es trabajado por un **equipo de ingeniería organizado como una empresa profesional**. Si eres un agente o una persona que llega aquí, lee esto primero.

## Cómo se trabaja

1. **Todo pedido entra por `fullstack-orchestrator`**, el líder del programa técnico. Es la única interfaz con el usuario.
2. El orquestador **planifica, organiza, dirige y controla**: no ejecuta todo él mismo. Delega en especialistas con un **traspaso estructurado** y un **único responsable** por tarea.
3. **Quien construye no aprueba.** Los verificadores (calidad, seguridad, revisión de código, rendimiento, release) son independientes y **pueden bloquear**.
4. **Sin evidencia real no hay "terminado"** (comando + salida, no "debería pasar").
5. **Se escala antes que adivinar** cuando una decisión cruza datos, producción, proveedores, contratos públicos o seguridad.

## Lectura obligatoria (en este orden)

| # | Archivo | Para qué |
|---|---|---|
| 1 | `.agents/rules/00-core.md` | Qué está prohibido / es obligatorio |
| 2 | `.agents/rules/05-organization.md` | **Cómo funciona el equipo** (doctrina organizacional) |
| 3 | `.agents/governance/ORGANIZATION.md` | Organigrama, niveles, comités |
| 4 | `.agents/governance/RACI.md` | Quién es responsable de qué (un solo `A`) |
| 5 | `.agents/governance/QUALITY-GATES.md` | Gates G0–G8 |
| 6 | `.agents/governance/HANDOFF-PROTOCOL.md` | Cómo se traspasa el trabajo |
| 7 | `.agents/governance/ESCALATION.md` | Cuándo y cómo escalar |
| 8 | `.agents/contexts/PROJECT.md`, `STACK.md` | Qué es el proyecto y con qué se construye |

## Principio de verdad

> **El repositorio (`package.json`, configuración, código) es la fuente de verdad del stack.** Los contextos pueden estar vacíos o desactualizados; los prompts de los agentes describen una especialidad, no el proyecto. **Nunca asumas** Next.js, Prisma, PostgreSQL, Auth.js ni un servidor propio sin verificarlo.

MediAbsence declara:
- **Framework**: Next.js App Router (React 19 / TypeScript 5.x)
- **Estilos**: Tailwind CSS v4
- **ORM & BD**: Prisma ORM con PostgreSQL
- **Autenticación**: Auth.js / NextAuth con RBAC multicapa (`ADMIN`, `JEFE`, `PROFESIONAL`, `RESIDENTE`)
- **Testing**: Vitest (`vitest run` — suite de regresión completa)

## Resumen del proyecto

Sistema de gestión hospitalaria de asistencias, presentismo y licencias médicas para residencias médicas y personal asistencial:
- Autenticación y RBAC multicapa hospitalario.
- Registro diario hospitalario (`checkIn`, `checkOut`).
- Gestión y dictamen de licencias médicas con prevención de solapamiento y auto-dictamen.
- Proyección salarial y cálculo de deducciones de nómina (Payroll ADR-0004).
- Pistas de auditoría inmutables para cumplimiento clínico (HIPAA).

## Setup, desarrollo y validación

Desde la raíz del proyecto:
- `pnpm install`
- Desarrollo: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm run typecheck` (`tsc --noEmit`)
- Tests: `pnpm test` (`vitest run`)
- Build: `pnpm build`

## Estructura de `.agents/`

```
.agents/
├── agents/         20 agentes (frontmatter + posición, contrato, procedimiento, criterios)
├── skills/         16 skills (conocimiento reutilizable)
├── workflows/      8 flujos de trabajo (nueva funcionalidad, bug, refactor, BD, API, seguridad, incidente, release)
├── governance/     Organigrama, RACI, gates, traspaso, decisión, escalamiento, ciclo de vida
├── policies/       Políticas normativas (core, arquitectura, seguridad, datos, tests, git, agentes, release)
├── rules/          Reglas que se cargan siempre
├── contexts/       Hechos del proyecto (PROJECT, STACK, etc.)
└── templates/      Plantillas (tarea, feature, ADR, endpoint, revisiones, release, postmortem)
```

## Estado actual del proyecto (brechas conocidas)

| Brecha | Consecuencia | Acción |
|---|---|---|
| Esquema clínico regulado | Modificaciones de datos requieren pistas de auditoría obligatorias | Gate G4 y G3 reforzados |

## Para el humano: qué te pedirá el equipo

Solo lo que **no puede decidir solo**: despliegues a producción, migraciones destructivas, proveedores nuevos, cambios de contrato público, excepciones a un gate, y las reglas de negocio ambiguas. Siempre con el formato *bloqueo → decisión afectada → opciones seguras → recomendación*.
