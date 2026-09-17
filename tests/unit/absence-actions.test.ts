import { describe, expect, it, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import {
  createAbsenceRequest,
  getMyRequests,
  getPendingRequests,
  reviewAbsenceRequest,
} from "@/app/actions/absence";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("@/modules/absences/application/absence-service", () => ({
  createAbsenceRequestForUser: vi.fn(),
  listAbsenceRequestsForUser: vi.fn(),
  listPendingAbsenceRequests: vi.fn(),
  reviewAbsenceRequestForUser: vi.fn(),
}));

import { requireAuth, requireRole } from "@/modules/auth/guards";
import {
  createAbsenceRequestForUser,
  listAbsenceRequestsForUser,
  listPendingAbsenceRequests,
  reviewAbsenceRequestForUser,
} from "@/modules/absences/application/absence-service";

describe("absence actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates and creates absence request from FormData, returning actionOk and revalidating", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "u-1",
      role: "RESIDENTE",
      name: "Dr. Ana",
      email: "ana@hospital.org",
    });

    const fakeView = {
      id: "req-1",
      userId: "u-1",
      type: "SICK_LEAVE" as const,
      startDate: new Date("2026-09-01T00:00:00Z"),
      endDate: new Date("2026-09-03T00:00:00Z"),
      reason: "Gripe A",
      status: "PENDING" as const,
      reviewedBy: null,
      reviewDttm: null,
      reviewNotes: null,
      createdAt: new Date("2026-08-23T10:00:00Z"),
      updatedAt: new Date("2026-08-23T10:00:00Z"),
      user: { id: "u-1", name: "Dr. Ana", email: "ana@hospital.org" },
      reviewer: null,
    };

    vi.mocked(createAbsenceRequestForUser).mockResolvedValue(fakeView);

    const formData = new FormData();
    formData.set("type", "SICK_LEAVE");
    formData.set("startDate", "2026-09-01");
    formData.set("endDate", "2026-09-03");
    formData.set("reason", "Gripe A");

    const result = await createAbsenceRequest(formData);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("req-1");
      expect(result.data.status).toBe("PENDING");
    }
    expect(createAbsenceRequestForUser).toHaveBeenCalledWith("u-1", {
      type: "SICK_LEAVE",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-03T00:00:00.000Z"),
      reason: "Gripe A",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/solicitar");
    expect(revalidatePath).toHaveBeenCalledWith("/solicitudes");
  });

  it("rejects invalid form data returning actionFailed with validation message", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "u-1",
      role: "RESIDENTE",
      name: "Dr. Ana",
      email: "ana@hospital.org",
    });

    const formData = new FormData();
    formData.set("type", "INVALID_TYPE");
    formData.set("startDate", "invalid-date");
    formData.set("endDate", "2026-09-03");
    formData.set("reason", "");

    const result = await createAbsenceRequest(formData);
    expect(result).toEqual({
      ok: false,
      error: "Revisa el tipo, las fechas y el motivo de la solicitud.",
    });
  });

  it("fetches requests for the authenticated user wrapped in actionOk", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "u-1",
      role: "RESIDENTE",
      name: "Dr. Ana",
      email: "ana@hospital.org",
    });
    vi.mocked(listAbsenceRequestsForUser).mockResolvedValue([]);

    const result = await getMyRequests();
    expect(result).toEqual({ ok: true, data: [] });
    expect(listAbsenceRequestsForUser).toHaveBeenCalledWith("u-1");
  });

  it("fetches pending requests requiring ADMIN or JEFE role wrapped in actionOk", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "chief-1",
      role: "JEFE",
      name: "Jefe",
      email: "jefe@hospital.org",
    });
    vi.mocked(listPendingAbsenceRequests).mockResolvedValue([]);

    const result = await getPendingRequests();
    expect(result).toEqual({ ok: true, data: [] });
    expect(requireRole).toHaveBeenCalledWith("ADMIN", "JEFE");
  });

  it("reviews absence request with role authorization and validation, returning actionOk", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "chief-1",
      role: "JEFE",
      name: "Jefe",
      email: "jefe@hospital.org",
    });

    const fakeReviewed = {
      id: "req-1",
      userId: "u-1",
      type: "SICK_LEAVE" as const,
      startDate: new Date("2026-09-01T00:00:00Z"),
      endDate: new Date("2026-09-03T00:00:00Z"),
      reason: "Gripe A",
      status: "APPROVED" as const,
      reviewedBy: "chief-1",
      reviewDttm: new Date(),
      reviewNotes: "Aprobado",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: "u-1", name: "Dr. Ana", email: "ana@hospital.org" },
      reviewer: { id: "chief-1", name: "Jefe", email: "jefe@hospital.org" },
    };

    vi.mocked(reviewAbsenceRequestForUser).mockResolvedValue(fakeReviewed);

    const result = await reviewAbsenceRequest("req-1", "APPROVED", "Aprobado");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("APPROVED");
    }
    expect(reviewAbsenceRequestForUser).toHaveBeenCalledWith("chief-1", {
      requestId: "req-1",
      decision: "APPROVED",
      notes: "Aprobado",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/jefe");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/solicitudes");
  });

  it("rejects invalid review input returning actionFailed", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "chief-1",
      role: "JEFE",
      name: "Jefe",
      email: "jefe@hospital.org",
    });

    const result = await reviewAbsenceRequest("", "APPROVED");
    expect(result).toEqual({
      ok: false,
      error: "Revisa la decisión, el identificador y las notas.",
    });
  });
});
