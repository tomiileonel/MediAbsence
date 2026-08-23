# ADR-0001 — Read-only discovery boundary

- **Status:** Accepted for Phase 1 only.
- **Date:** 2026-08-23.
- **Scope:** MediAbsence discovery and specialist audit.

## Context

El Engineering System debe producir un modelo actual fiable antes de iniciar un refactor. La auditoría ya detectó riesgos en autenticación, autorización, datos y testing; aplicar soluciones durante discovery contaminaría la evidencia y podría cerrar gates sin entender el dominio.

## Decision

Durante Phase 1 todos los workers y el main agent operan read-only sobre código, configuración y schema. Sólo se permiten documentos de auditoría dentro de `docs/engineering/`. Quedan prohibidos cambios funcionales, instalaciones, upgrades, migraciones, builds mutantes, escrituras de base de datos y modificaciones de configuración.

## Consequences

- Los riesgos permanecen abiertos deliberadamente.
- G4 no puede cerrarse por iniciativa de un worker.
- Los ADR de solución requieren evidencia posterior de dominio, requisitos y seguridad.
- La documentación producida es auditable y separa VERIFIED/INFERRED/UNKNOWN/BLOCKING.

## Rejected alternatives

- Aplicar RBAC mientras se descubre el dominio: riesgo de diseñar permisos incorrectos.
- Actualizar dependencias durante el audit: mezcla causa y efecto y rompe reproducibilidad.
- Ejecutar migraciones o tests con estado externo: viola el perímetro read-only.
