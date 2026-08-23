# 05 — Backend Audit

## VERIFIED

Server Actions observables:

- `createAbsenceRequest(formData)`
- `getMyRequests()`
- `getTodayAttendance()`
- `checkIn(location?)`
- `checkOut()`

Todas llaman `auth()` antes de operar, pero las mutaciones no aplican policy de rol. `createAbsenceRequest` usa `FormData` sin schema y retorna directamente el resultado Prisma. `checkIn` evita duplicado con la constraint compuesta; `checkOut` valida existencia y salida previa.

El worker backend confirmó adicionalmente que `authorize()` retorna `null`, `/login` no está materializado, `/api` queda permitido por configuración y las acciones no tienen consumidores visibles en el árbol actual.

## INFERRED

- La Server Action funciona como controller, caso de uso y acceso a persistencia al mismo tiempo.
- Los errores se propagan como `Error` genérico, sin envelope ni códigos de dominio observables.
- No hay repositorios, servicios de dominio ni DTOs explícitos en el árbol inspeccionado.

## Riesgos

- **BE-001:** validación de borde insuficiente para enum, fechas, límites de texto y orden temporal (`HIGH`, G4/G5).
- **BE-002:** falta de autorización específica para aprobar/revisar solicitudes; no se observan acciones de reviewer (`HIGH`, G4).
- **BE-003:** respuestas exponen objetos Prisma directamente (`MEDIUM`, contrato API desconocido).
- **BE-004:** `getMyRequests` devuelve `[]` si no hay sesión, mientras otras acciones lanzan `Unauthorized`; semántica inconsistente (`LOW/MEDIUM`).
- **BE-005:** `new Date()` y `setHours(0,0,0,0)` usan timezone local implícito (`HIGH`, G3).
- **BE-006:** `checkIn` tiene una ventana check-then-act; una colisión puede terminar como error Prisma no traducido (`MEDIUM`, G5).
- **BE-007:** no se valida `startDate <= endDate`, fechas inválidas, pertenencia al enum, límites de texto ni `location` (`HIGH`, G4/G5).
- **BE-008:** no existe flujo observable de revisión de solicitudes ni contrato de transición de estados (`HIGH`, G1/G4).

## UNKNOWN

- Requisitos de autorización para ADMIN/JEFE/PROFESIONAL.
- Contratos de error consumidos por UI.
- Idempotencia necesaria para reintentos de check-in/check-out.

## Estado

No se implementan cambios. G5 queda `BLOCKED` hasta completar requisitos, dominio, datos, seguridad y validación runtime. Worker backend: `read_only=PASS`, confianza `HIGH`.
