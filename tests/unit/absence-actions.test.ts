import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createAbsenceRequest,
  getMyRequests,
  getPendingRequests,
  reviewAbsenceRequest,
} from "@/app/actions/absence";
import { ValidationError } from "@/lib/errors/domain-error";

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

  it("validates and creates absence request from FormData", async () => {
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

    const summary = await createAbsenceRequest(formData);
    expect(summary.id).toBe("req-1");
    expect(summary.status).toBe("PENDING");
    expect(createAbsenceRequestForUser).toHaveBeenCalledWith("u-1", {
      type: "SICK_LEAVE",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-03T00:00:00.000Z"),
      reason: "Gripe A",
    });
  });

  it("rejects invalid form data with ValidationError", async () => {
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

    await expect(createAbsenceRequest(formData)).rejects.toThrow(ValidationError);
  });

  it("fetches requests for the authenticated user", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "u-1",
      role: "RESIDENTE",
      name: "Dr. Ana",
      email: "ana@hospital.org",
    });
    vi.mocked(listAbsenceRequestsForUser).mockResolvedValue([]);

    const result = await getMyRequests();
    expect(result).toEqual([]);
    expect(listAbsenceRequestsForUser).toHaveBeenCalledWith("u-1");
  });

  it("fetches pending requests requiring ADMIN or JEFE role", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      id: "chief-1",
      role: "JEFE",
      name: "Jefe",
      email: "jefe@hospital.org",
    });
    vi.mocked(listPendingAbsenceRequests).mockResolvedValue([]);

    const result = await getPendingRequests();
    expect(result).toEqual([]);
    expect(requireRole).toHaveBeenCalledWith("ADMIN", "JEFE");
  });

  it("reviews absence request with role authorization and validation", async () => {
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

    const summary = await reviewAbsenceRequest("req-1", "APPROVED", "Aprobado");
    expect(summary.status).toBe("APPROVED");
    expect(reviewAbsenceRequestForUser).toHaveBeenCalledWith("chief-1", {
      requestId: "req-1",
      decision: "APPROVED",
      notes: "Aprobado",
    });
  });
});
