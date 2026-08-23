import { describe, expect, it } from "vitest";
import { toAbsenceRequestSummary, toAbsenceRequestSummaries } from "@/modules/absences/absence-dto";
import type { AbsenceRequestView } from "@/modules/absences/application/absence-service";

describe("absence dto transformers", () => {
  const sampleView: AbsenceRequestView = {
    id: "req-1",
    userId: "user-1",
    type: "SICK_LEAVE",
    startDate: new Date("2026-09-01T00:00:00.000Z"),
    endDate: new Date("2026-09-05T00:00:00.000Z"),
    reason: "Reposo médico por neumonía",
    status: "APPROVED",
    reviewedBy: "chief-1",
    reviewDttm: new Date("2026-08-25T14:30:00.000Z"),
    reviewNotes: "Certificado validado",
    createdAt: new Date("2026-08-24T10:00:00.000Z"),
    updatedAt: new Date("2026-08-25T14:30:00.000Z"),
    user: { id: "user-1", name: "Dr. Gómez", email: "gomez@hospital.org" },
    reviewer: { id: "chief-1", name: "Dr. López", email: "lopez@hospital.org" },
  };

  it("converts Date instances to ISO date and dttm strings", () => {
    const summary = toAbsenceRequestSummary(sampleView);
    expect(summary.startDate).toBe("2026-09-01");
    expect(summary.endDate).toBe("2026-09-05");
    expect(summary.reviewDttm).toBe("2026-08-25T14:30:00.000Z");
    expect(summary.createdAt).toBe("2026-08-24T10:00:00.000Z");
    expect(summary.status).toBe("APPROVED");
    expect(summary.user.name).toBe("Dr. Gómez");
    expect(summary.reviewer?.name).toBe("Dr. López");
  });

  it("transforms an array of views", () => {
    const summaries = toAbsenceRequestSummaries([sampleView]);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].id).toBe("req-1");
  });
});
