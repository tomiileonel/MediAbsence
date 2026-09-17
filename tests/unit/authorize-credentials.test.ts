import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { authorizeUser, DUMMY_BCRYPT_HASH } from "@/modules/auth/authorize-credentials";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/modules/audit/record-audit";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/modules/audit/record-audit", () => ({
  recordAudit: vi.fn(),
}));

describe("authorizeUser credentials provider", () => {
  const samplePassword = "Password1234!";
  let passwordHash: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    passwordHash = await bcrypt.hash(samplePassword, 10);
  });

  it("returns user object when credentials match valid user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-1",
      email: "residente@hospital.org",
      name: "Dra. Juana",
      image: null,
      password: passwordHash,
      role: "RESIDENTE",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      monthlySalaryMinor: null,
    });

    const user = await authorizeUser({
      email: "residente@hospital.org",
      password: samplePassword,
    });

    expect(user).toEqual({
      id: "u-1",
      email: "residente@hospital.org",
      name: "Dra. Juana",
      image: null,
      role: "RESIDENTE",
    });

    expect(recordAudit).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: "LOGIN_SUCCEEDED",
        actorId: "u-1",
      }),
    );
  });

  it("returns null and audits failure on incorrect password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-1",
      email: "residente@hospital.org",
      name: "Dra. Juana",
      image: null,
      password: passwordHash,
      role: "RESIDENTE",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      monthlySalaryMinor: null,
    });

    const user = await authorizeUser({
      email: "residente@hospital.org",
      password: "WrongPassword!",
    });

    expect(user).toBeNull();
    expect(recordAudit).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: "LOGIN_FAILED",
        actorId: "u-1",
      }),
    );
  });

  it("executes constant-time comparison against dummy hash for nonexistent user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const compareSpy = vi.spyOn(bcrypt, "compare");

    const user = await authorizeUser({
      email: "inexistente@hospital.org",
      password: "AnyPassword123!",
    });

    expect(user).toBeNull();
    expect(compareSpy).toHaveBeenCalledWith("AnyPassword123!", DUMMY_BCRYPT_HASH);
    expect(recordAudit).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: "LOGIN_FAILED",
        actorId: null,
        metadata: { reason: "unknown_user" },
      }),
    );
  });

  it("returns null when user exists but has no password set (OAuth-only account)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-2",
      email: "oauth@hospital.org",
      name: "OAuth User",
      image: null,
      password: null,
      role: "PROFESIONAL",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      monthlySalaryMinor: null,
    });

    const user = await authorizeUser({
      email: "oauth@hospital.org",
      password: "SomePassword!",
    });

    expect(user).toBeNull();
  });

  it("normalizes email to lowercase for database lookup", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await authorizeUser({
      email: "Dr.Ana@Hospital.ORG",
      password: samplePassword,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "dr.ana@hospital.org" },
    });
  });

  it("returns null without querying database if payload is invalid", async () => {
    const user = await authorizeUser({
      email: "not-an-email",
      password: "",
    });

    expect(user).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
