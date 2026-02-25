"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import { revalidatePath } from "next/cache";

export async function getTodayAttendance() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId: session.user.id,
                date: today,
            },
        },
    });
}

export async function checkIn(location?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId: session.user.id,
                date: today,
            },
        },
    });

    if (existing) throw new Error("Ya registraste tu ingreso hoy.");

    const attendance = await prisma.attendance.create({
        data: {
            userId: session.user.id,
            date: today,
            timeIn: new Date(),
            location: location || null,
            status: "PRESENT",
        },
    });

    revalidatePath("/"); // Refrescar UI que dependa de esto
    return attendance;
}

export async function checkOut() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId: session.user.id,
                date: today,
            },
        },
    });

    if (!existing) throw new Error("No hay ingreso registrado hoy.");
    if (existing.timeOut) throw new Error("Ya registraste tu salida hoy.");

    const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
            timeOut: new Date(),
        },
    });

    revalidatePath("/");
    return attendance;
}
