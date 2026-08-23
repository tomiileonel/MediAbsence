# 09 — Performance Audit

## VERIFIED

- Las queries visibles son `findUnique`, `findMany`, `create` y `update` sobre modelos pequeños.
- `getMyRequests` ordena por `createdAt` pero no se observa paginación.
- `Attendance` tiene constraint compuesta `userId/date`, adecuada para el lookup de asistencia diaria.
- Revalidación de rutas ocurre después de mutaciones.
- No hay métricas, tracing, SLOs ni benchmarks declarados.

## INFERRED

- La carga actual parece baja y el principal riesgo futuro está en listados de ausencias sin paginación y filtros/indexes no definidos.
- `new Date()` y cálculo de día local pueden producir errores funcionales antes que una degradación de rendimiento.

## UNKNOWN

- Volumen de datos y cardinalidad por usuario.
- Latencia p95/p99.
- Cache hit rate, Web Vitals, bundle size y runtime regional.
- Planes de consulta e índices efectivos en MySQL.

## Riesgos

- **PERF-001:** `getMyRequests` sin paginación (`MEDIUM`).
- **PERF-002:** índices para status/reviewer/rangos no evidenciados (`MEDIUM`, G3).
- **PERF-003:** falta de observabilidad para demostrar regresiones (`HIGH`, G6/G8).
- **PERF-004:** lectura de fecha local puede causar inconsistencia de día (`HIGH`, G3).

No se ejecutaron benchmarks ni servidor.
