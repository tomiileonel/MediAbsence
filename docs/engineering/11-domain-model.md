# 11 — Domain Model

## VERIFIED desde schema

### Actores/roles técnicos

`ADMIN`, `JEFE`, `PROFESIONAL`, `RESIDENTE`.

### Entidades

```text
User
 ├── Account / Session
 ├── Attendance[*]
 └── AbsenceRequest[*]

Attendance
 ├── date, timeIn, timeOut
 ├── status: PRESENT | ABSENT | LATE
 └── unique(userId, date)

AbsenceRequest
 ├── type: SICK_LEAVE | VACATION | PERSONAL | CONGRESS | OTHER
 ├── startDate, endDate, reason
 ├── status: PENDING | APPROVED | REJECTED
 └── reviewedBy, reviewDttm, reviewNotes
```

### Invariantes observables

- Un usuario no tiene más de un Attendance principal por día.
- Una AbsenceRequest pertenece a un usuario.
- Una solicitud puede tener estado y datos de revisión.
- El borrado de User cascada sobre attendance/absence.
- `reviewedBy` conserva sólo un `String` opcional; no hay identidad referencial ni auditoría fuerte del revisor (`DM-007`).

## INCONSISTENCIAS

- `.agents/contexts/PROJECT.md` menciona Admin, Doctor, HR y Employee; el schema usa cuatro roles distintos.
- README habla de residentes, administradores y deducciones salariales; no hay modelo salarial ni deducción en schema visible.
- La matriz real de permisos no está definida.
- No hay evidencia de reglas de solapamiento de ausencias, transiciones protegidas o acciones de revisión (`DM-009`, `DM-011`).
- El enum `AttendanceStatus` no demuestra por sí solo que todas las transiciones `PRESENT/ABSENT/LATE` estén implementadas (`DM-010`).

## UNKNOWN / no asumir

- Si JEFE equivale a HR o supervisor.
- Quién puede aprobar/rechazar cada tipo de ausencia.
- Si PROFESIONAL puede consultar a otros usuarios.
- Retención y legalidad del historial médico.
- Reglas de solapamiento de fechas.

G1 permanece `PARTIAL` hasta cerrar actores, invariantes y ownership con requisitos de negocio.

Validación del worker de dominio: `read_only=PASS`, `scope=PARTIAL`, `G1=PARTIAL`, confianza `MEDIUM`. El worker también marcó como `UNKNOWN` las reglas críticas no documentadas y como `BLOCKER` la ausencia de evidencia de scope real por rol.
