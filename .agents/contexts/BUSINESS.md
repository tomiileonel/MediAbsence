# Business Context — MediAbsence

## Domain
- Sistema de control de asistencias, presentismo y gestión de licencias médicas para residencias hospitalarias y personal de salud.

## Key workflows
1. **Fichaje de Asistencia Hospitalaria**:
   - Ingreso diario (`checkIn`) con registro de horario exacto y consultorio/ubicación.
   - Egreso diario (`checkOut`) con validación de ingreso previo y cálculo de horas de guardia/residencia.
2. **Solicitud de Licencia Médica**:
   - Creación de solicitud (`createAbsenceRequest`) con tipo de ausencia (`SICK_LEAVE`, `VACATION`, `PERSONAL`, `CONGRESS`, `OTHER`), rango de fechas y fundamentación.
   - Restricción estricta de no solapamiento con solicitudes previas pendientes o aprobadas.
3. **Bandeja de Dictamen y Revisión**:
   - Evaluación por Jefes de Servicio o Administradores (`reviewAbsenceRequest`).
   - Prohibición de auto-dictamen (separación de funciones).
4. **Proyección Salarial / Deducciones de Nómina (Payroll)**:
   - Al aprobar una ausencia, cálculo de deducción salarial con base en el salario mensual del médico (`monthlySalaryMinor`), divisor de días reglamentario (30) y redondeo financiero (`HALF_UP`).

## Roles/actors
- **ADMIN**: Administrador hospitalario con acceso global a métricas, configuraciones y revisión.
- **JEFE**: Jefe de servicio o residente jefe responsable de dictaminar solicitudes y supervisar el servicio.
- **PROFESIONAL**: Médico de planta o especialista con registro de asistencia y solicitud de ausencias.
- **RESIDENTE**: Médico en formación bajo régimen de residencia médica con seguimiento de guardias y presentismo.

## Regulatory/compliance
- Cumplimiento de normativas de confidencialidad médica (HIPAA §164.312), trazabilidad completa en auditoría y retención inmutable de registros.

## Operational cycles
- Ciclos diarios de fichaje y guardias; ciclo mensual de liquidación salarial y cálculo de deducciones.
