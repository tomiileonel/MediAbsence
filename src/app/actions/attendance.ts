"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/modules/auth/guards";
import {
  checkInForUser,
  checkOutForUser,
  getTodayAttendanceForUser,
} from "@/modules/attendance/application/attendance-service";
import { toAttendanceSummary } from "@/modules/attendance/attendance-dto";

export async function getTodayAttendance() {
  const actor = await requireAuth();
  return toAttendanceSummary(await getTodayAttendanceForUser(actor.id));
}
export async function checkIn(location?: string) {
  const actor = await requireAuth();
  const attendance = await checkInForUser(actor.id, location);
  revalidatePath("/");
  revalidatePath("/residente");
  revalidatePath("/profesional");
  return toAttendanceSummary(attendance);
}

export async function checkOut() {
  const actor = await requireAuth();
  const attendance = await checkOutForUser(actor.id);
  revalidatePath("/");
  revalidatePath("/residente");
  revalidatePath("/profesional");
  return toAttendanceSummary(attendance);
}
