import type { Attendance } from "@prisma/client";

export interface AttendanceSummary {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: Attendance["status"];
  location: string | null;
}
export function toAttendanceSummary(attendance: Attendance | null): AttendanceSummary | null {
  if (!attendance) {
    return null;
  }

  return {
    id: attendance.id,
    date: attendance.date.toISOString().slice(0, 10),
    timeIn: attendance.timeIn.toISOString(),
    timeOut: attendance.timeOut?.toISOString() ?? null,
    status: attendance.status,
    location: attendance.location,
  };
}
