"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import { revalidatePath } from "next/cache";
import { RequestType } from "@prisma/client";

export async function createAbsenceRequest(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const type = formData.get("type") as RequestType;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const reason = formData.get("reason") as string;

    if (!type || !startDate || !endDate || !reason) {
        throw new Error("Faltan campos obligatorios.");
    }

    const request = await prisma.absenceRequest.create({
        data: {
            userId: session.user.id,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: "PENDING",
        },
    });

    revalidatePath("/solicitudes");
    return request;
}

export async function getMyRequests() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.absenceRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
}
