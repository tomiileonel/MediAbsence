"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/modules/auth/guards";
import {
  checkInForUser,
  checkOutForUser,
  getTodayAttendanceForUser,
} from "@/modules/attendance/application/attendance-service";
import {
  toAttendanceSummary,
  type AttendanceSummary,
} from "@/modules/attendance/attendance-dto";
import {
  actionOk,
  actionFailed,
  type ActionResult,
} from "@/lib/actions/result";

export async function getTodayAttendance(): Promise<ActionResult<AttendanceSummary | null>> {
  try {
    const actor = await requireAuth();
    const attendance = await getTodayAttendanceForUser(actor.id);
    return actionOk(attendance ? toAttendanceSummary(attendance) : null);
  } catch (error: unknown) {
    return actionFailed(error);
  }
}

export async function checkIn(
  location?: string,
): Promise<ActionResult<AttendanceSummary>> {
  try {
    const actor = await requireAuth();
    const attendance = await checkInForUser(actor.id, location);
    revalidatePath("/");
    revalidatePath("/residente");
    revalidatePath("/profesional");
    return actionOk(toAttendanceSummary(attendance));
  } catch (error: unknown) {
    return actionFailed(error);
  }
}

export async function checkOut(): Promise<ActionResult<AttendanceSummary>> {
  try {
    const actor = await requireAuth();
    const attendance = await checkOutForUser(actor.id);
    revalidatePath("/");
    revalidatePath("/residente");
    revalidatePath("/profesional");
    return actionOk(toAttendanceSummary(attendance));
  } catch (error: unknown) {
    return actionFailed(error);
  }
}
