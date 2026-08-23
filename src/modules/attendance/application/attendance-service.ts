import type { Attendance } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBusinessDate } from "@/lib/dates/business-day";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/domain-error";
import { isPrismaUniqueConstraintError } from "@/lib/errors/prisma-error";
import { attendanceLocationSchema } from "@/lib/validation/attendance.schema";
import { recordAudit } from "@/modules/audit/record-audit";
import { logger } from "@/lib/observability/logger";

export type AttendanceRecord = Attendance;

function parseLocation(location: unknown): string | null {
  const parsedLocation = attendanceLocationSchema.safeParse(location);

  if (!parsedLocation.success) {
    throw new ValidationError("La ubicación indicada no es válida.");
  }

  return parsedLocation.data ?? null;
}

export async function getTodayAttendanceForUser(
  userId: string,
  now = new Date(),
): Promise<AttendanceRecord | null> {
  const date = getBusinessDate(now);

  return prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
  });
}

export async function checkInForUser(
  userId: string,
  location: unknown,
  now = new Date(),
): Promise<AttendanceRecord> {
  const parsedLocation = parseLocation(location);
  const date = getBusinessDate(now);

  try {
    const attendance = await prisma.$transaction(async (transaction) => {
      const attendance = await transaction.attendance.create({
        data: {
          userId,
          date,
          timeIn: now,
          location: parsedLocation,
          status: "PRESENT",
        },
      });

      await recordAudit(transaction, {
        actorId: userId,
        action: "ATTENDANCE_CHECKED_IN",
        entityType: "Attendance",
        entityId: attendance.id,
        metadata: { date: date.toISOString().slice(0, 10) },
      });

      return attendance;
    });

    logger.info("attendance.checked_in", { actorId: userId, attendanceId: attendance.id });
    return attendance;
  } catch (error: unknown) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ConflictError("Ya registraste tu ingreso para el día de hoy.");
    }

    throw error;
  }
}

export async function checkOutForUser(
  userId: string,
  now = new Date(),
): Promise<AttendanceRecord> {
  const date = getBusinessDate(now);

  const attendance = await prisma.$transaction(async (transaction) => {
    const existingAttendance = await transaction.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!existingAttendance) {
      throw new NotFoundError("No hay un ingreso registrado para el día de hoy.");
    }

    if (existingAttendance.timeOut) {
      throw new ConflictError("Ya registraste tu salida para el día de hoy.");
    }

    const updateResult = await transaction.attendance.updateMany({
      where: {
        id: existingAttendance.id,
        userId,
        timeOut: null,
      },
      data: {
        timeOut: now,
      },
    });

    if (updateResult.count !== 1) {
      throw new ConflictError("La asistencia fue actualizada por otra solicitud.");
    }

    const attendance = await transaction.attendance.findUnique({
      where: { id: existingAttendance.id },
    });

    if (!attendance) {
      throw new Error("La asistencia desapareció durante el cierre transaccional.");
    }

    await recordAudit(transaction, {
      actorId: userId,
      action: "ATTENDANCE_CHECKED_OUT",
      entityType: "Attendance",
      entityId: attendance.id,
      metadata: { date: date.toISOString().slice(0, 10) },
    });
    return attendance;
  });

  logger.info("attendance.checked_out", { actorId: userId, attendanceId: attendance.id });
  return attendance;
}
