# 14 — Target Architecture (Propuesta)

**Estado: PROPOSED / NOT APPROVED.** No es una autorización de implementación.

```text
Presentation (App Router / UI)
          │
          ▼
Route & Server Action boundary
          │  schema validation + authn
          ▼
Authorization Policy Layer
          │  role + resource ownership + tenant scope
          ▼
Application Services / Use Cases
          │
          ├── Attendance policy
          ├── Absence workflow
          └── Review / approval policy
          ▼
Domain Model & Invariants
          ▼
Repositories / Prisma boundary
          ▼
MySQL (engine decision pending)
```

## Design principles

- Authentication y authorization son capas separadas.
- La autorización es server-side y centralizada, pero cada caso de uso conserva su scope.
- Inputs externos se validan en el borde con schemas runtime.
- Ownership y tenant scope acompañan toda query/mutación protegida.
- Fechas de negocio usan una política explícita de timezone.
- El dominio no depende de Prisma ni de componentes UI.
- Tests de dominio, policy y Server Actions preceden al E2E.

## Decisiones pendientes

1. ¿Credentials es el mecanismo oficial o código muerto?
2. ¿Cuál es la matriz real `role × action × resource × condition`?
3. ¿Existe tenant/organización o es single-tenant?
4. ¿MySQL es la fuente efectiva o el contexto debe corregirse?
5. ¿Se conserva monolito modular o se separa una API/BFF?

Hasta responderlas, el target es una propuesta `INFERRED`, no un ADR aprobado.
