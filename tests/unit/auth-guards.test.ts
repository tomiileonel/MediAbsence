import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors/domain-error";
import type { Session } from "next-auth";

vi.mock("../../auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "../../auth";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UnauthorizedError when session is missing or invalid", async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireAuth()).rejects.toThrow(UnauthorizedError);

    mockAuth.mockResolvedValueOnce({
      user: { id: "u1", role: "INVALID_ROLE" },
      expires: "2099-01-01",
    } as unknown as Session);
    await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
  });

  it("returns AuthenticatedActor when session has a valid app role", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "user-123",
        role: "PROFESIONAL",
        name: "Dra. García",
        email: "garcia@hospital.org",
      },
      expires: "2099-01-01",
    } as unknown as Session);

    const actor = await requireAuth();
    expect(actor).toEqual({
      id: "user-123",
      role: "PROFESIONAL",
      name: "Dra. García",
      email: "garcia@hospital.org",
    });
  });

  it("enforces allowed roles with requireRole", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "user-456",
        role: "RESIDENTE",
        name: "Dr. Pérez",
        email: "perez@hospital.org",
      },
      expires: "2099-01-01",
    } as unknown as Session);

    await expect(requireRole("ADMIN", "JEFE")).rejects.toThrow(ForbiddenError);

    const actor = await requireRole("RESIDENTE", "PROFESIONAL");
    expect(actor.role).toBe("RESIDENTE");
  });
});


