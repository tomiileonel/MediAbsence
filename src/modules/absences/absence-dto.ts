import type { AbsenceRequestView } from "./application/absence-service";

export interface AbsenceRequestSummary {
  id: string;
  userId: string;
  type: AbsenceRequestView["type"];
  startDate: string;
  endDate: string;
  reason: string;
  status: AbsenceRequestView["status"];
  reviewedBy: string | null;
  reviewDttm: string | null;
  reviewNotes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  reviewer: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}
export function toAbsenceRequestSummary(
  request: AbsenceRequestView,
): AbsenceRequestSummary {
  return {
    id: request.id,
    userId: request.userId,
    type: request.type,
    startDate: request.startDate.toISOString().slice(0, 10),
    endDate: request.endDate.toISOString().slice(0, 10),
    reason: request.reason,
    status: request.status,
    reviewedBy: request.reviewedBy,
    reviewDttm: request.reviewDttm?.toISOString() ?? null,
    reviewNotes: request.reviewNotes,
    createdAt: request.createdAt.toISOString(),
    user: request.user,
    reviewer: request.reviewer,
  };
}

export function toAbsenceRequestSummaries(
  requests: AbsenceRequestView[],
): AbsenceRequestSummary[] {
  return requests.map(toAbsenceRequestSummary);
}
