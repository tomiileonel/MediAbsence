import { describe, expect, it, vi, beforeEach } from "vitest";
import { loginAction } from "@/app/actions/auth";
vi.mock("../../auth", () => ({
  signIn: vi.fn(),
}));

vi.mock("next-auth", () => {
  class AuthError extends Error {
    type: string;
    constructor(type = "CredentialsSignin") {
      super("Auth error");
      this.type = type;
      this.name = "AuthError";
    }
  }
  return { AuthError };
});

import { signIn } from "../../auth";
import { AuthError } from "next-auth";


describe("login action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error on empty or invalid email", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("password", "secret");

    const result = await loginAction({ error: null }, formData);
    expect(result.error).toBe("Ingresa un email y una contraseña válidos.");
  });

  it("returns validation error on empty password", async () => {
    const formData = new FormData();
    formData.set("email", "doctor@hospital.org");
    formData.set("password", "");

    const result = await loginAction({ error: null }, formData);
    expect(result.error).toBe("Ingresa un email y una contraseña válidos.");
  });

  it("handles AuthError gracefully with friendly message", async () => {
    const formData = new FormData();
    formData.set("email", "doctor@hospital.org");
    formData.set("password", "wrong-password");

    vi.mocked(signIn).mockRejectedValueOnce(new AuthError("CredentialsSignin"));

    const result = await loginAction({ error: null }, formData);
    expect(result.error).toBe("Las credenciales no son válidas.");
  });

  it("calls signIn with sanitized credentials on valid input", async () => {
    const formData = new FormData();
    formData.set("email", "Doctor@Hospital.Org");
    formData.set("password", "correct-password");

    vi.mocked(signIn).mockResolvedValueOnce(undefined);

    const result = await loginAction({ error: null }, formData);
    expect(result.error).toBeNull();
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "Doctor@Hospital.Org",
      password: "correct-password",
      redirectTo: "/",
    });
  });
});
