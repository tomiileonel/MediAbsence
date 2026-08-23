# 03 — Security Audit

## Estado

**G4 = FAIL / BLOCKING.** Este informe diagnostica; no modifica autenticación, autorización ni rutas.

## VERIFIED

- `auth.config.ts` define Credentials, JWT/session callbacks y un callback `authorized`.
- `authorize()` retorna `null` en el proveedor Credentials (`auth.config.ts:13-18`); no hay validación observable de credenciales en ese punto.
- Las rutas `/admin`, `/jefe`, `/profesional` y `/residente` sólo exigen `isLoggedIn` (`auth.config.ts:36-38`); no se compara `session.user.role` con el prefijo.
- `authorized()` retorna `true` para cualquier ruta `/api` (`auth.config.ts:30-33`).
- El middleware excluye `/api` de su matcher (`src/middleware.ts:6-8`).
- Las Server Actions verifican `session.user.id`, pero no una policy de rol/recurso.
- `createAbsenceRequest` convierte `FormData` mediante casts y crea fechas sin schema validation (`src/app/actions/absence.ts:12-27`).
- La ruta de login configurada por Auth.js (`/login`) no existe en el árbol visible (`SEC-G4-002`).
- El claim de rol se copia al JWT en el callback, pero no existe revalidación observable del rol durante la vida de la sesión (`SEC-G4-007`, `INFERRED`).

## Modelo de control que debe investigarse

```text
Authentication
  → Authorization
  → Route protection
  → Server Action protection
  → API protection
  → Resource ownership
```

La matriz real `role × action × resource × condition` no se asume durante discovery. Debe derivarse de dominio, UI, schema y requisitos.

## Riesgos

### RISK-001 — Missing server-side RBAC

- **Severity:** BLOCKER.
- **Gate:** G4.
- **Status:** OPEN.
- **Evidence:** `auth.config.ts:36-38`, `auth.config.ts:50-57`.
- **Impact:** un usuario autenticado podría alcanzar áreas protegidas por prefijo sin que se verifique que su rol corresponda.

### RISK-002 — `/api` allow-by-default

- **Severity:** HIGH.
- **Gate:** G4.
- **Status:** OPEN.
- **Evidence:** `auth.config.ts:30-33`, `src/middleware.ts:6-8`.
- **Impact:** endpoints futuros fuera de Auth.js pueden quedar sin protección por defecto.

### RISK-003 — Credentials flow unresolved

- **Severity:** HIGH.
- **Gate:** G4.
- **Status:** OPEN.
- **Evidence:** `auth.config.ts:13-18` retorna `null`.
- **Unknown:** si existe otro mecanismo de provisioning/login o si el provider es código muerto.

### RISK-004 — Unvalidated Server Action input

- **Severity:** HIGH.
- **Gate:** G4/G5.
- **Status:** OPEN.
- **Evidence:** casts de `FormData` y `new Date()` en `absence.ts`.

### Evidencia del worker de seguridad

| ID | Classification | Severity | Finding |
|---|---|---|---|
| SEC-G4-001 | BLOCKING | BLOCKER | `Credentials.authorize()` retorna `null`; no hay lookup ni verificación de contraseña observable. |
| SEC-G4-002 | BLOCKING | BLOCKER | Auth.js apunta a `/login`, pero no existe la página/ruta en el árbol actual. |
| SEC-G4-003 | BLOCKING | HIGH | No hay autorización efectiva por rol. |
| SEC-G4-004 | BLOCKING | HIGH | `/api` queda permitido globalmente y fuera del matcher del middleware. |
| SEC-G4-005 | VERIFIED | MEDIUM | Validación runtime de entradas insuficiente. |
| SEC-G4-006 | UNKNOWN | MEDIUM | No existe modelo de tenant/organización verificable. |
| SEC-G4-007 | INFERRED | MEDIUM | El rol podría quedar stale porque se copia al JWT sin revalidación observable. |
| SEC-OWN-001 | INFO | INFO | Las operaciones actuales derivan el ownership desde `session.user.id`; no se observó IDOR en las acciones inspeccionadas. |

Validación del worker: `read_only=PASS`, `scope=PASS`, `G4=BLOCKING`, `G7=BLOCKED_BY_G4`, confianza `HIGH`.

## Prohibición de esta fase

No implementar RBAC, no cambiar `authorized`, no alterar `/api`, no activar Credentials y no introducir Zod durante discovery.
