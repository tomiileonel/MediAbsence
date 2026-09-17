# Project Context — MediAbsence

## Product
- Name: MediAbsence
- Purpose: Sistema de gestión hospitalaria de asistencias, presentismo y licencias médicas para residencias médicas y personal asistencial.
- Primary users: Administradores, Jefes de Servicio, Médicos Profesionales y Médicos Residentes.

## Critical flows
- Autenticación y RBAC multicapa (`ADMIN`, `JEFE`, `PROFESIONAL`, `RESIDENTE`).
- Registro diario de ingreso y egreso hospitalario (`checkIn`, `checkOut`).
- Creación y dictamen de licencias médicas con prevención de solapamiento y auto-dictamen.
- Proyección salarial y cálculo de deducciones de nómina (Payroll ADR-0004).
- Pistas de auditoría inmutables para cumplimiento clínico (HIPAA).

## Scale
- Current users: Escala institucional hospitalaria.
- Peak requests/sec: Picos en horarios de cambio de guardia y fichaje matutino.

## Availability target
- 99.9%
