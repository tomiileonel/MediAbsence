import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertLoginAllowed,
  registerFailedLogin,
  clearLoginFailures,
  resetAllLoginThrottles,
} from "@/lib/security/login-throttle";
import { ValidationError } from "@/lib/errors/domain-error";

describe("login-throttle", () => {
  beforeEach(() => {
    resetAllLoginThrottles();
    vi.useRealTimers();
  });

  it("allows attempts below threshold", () => {
    const email = "doc@hospital.org";
    for (let i = 0; i < 4; i++) {
      registerFailedLogin(email);
    }
    expect(() => assertLoginAllowed(email)).not.toThrow();
  });

  it("blocks login after 5 failed attempts within window", () => {
    const email = "doc@hospital.org";
    for (let i = 0; i < 5; i++) {
      registerFailedLogin(email);
    }
    expect(() => assertLoginAllowed(email)).toThrow(ValidationError);
    expect(() => assertLoginAllowed(email)).toThrow(
      "Demasiados intentos fallidos. Reintentá en unos minutos.",
    );
  });

  it("clears throttle when login succeeds", () => {
    const email = "doc@hospital.org";
    for (let i = 0; i < 5; i++) {
      registerFailedLogin(email);
    }
    expect(() => assertLoginAllowed(email)).toThrow(ValidationError);

    clearLoginFailures(email);
    expect(() => assertLoginAllowed(email)).not.toThrow();
  });

  it("resets lockout after expiration window", () => {
    vi.useFakeTimers();
    const email = "doc@hospital.org";

    for (let i = 0; i < 5; i++) {
      registerFailedLogin(email);
    }
    expect(() => assertLoginAllowed(email)).toThrow(ValidationError);

    // Advance 16 minutes (window is 15 minutes)
    vi.advanceTimersByTime(16 * 60 * 1000);
    expect(() => assertLoginAllowed(email)).not.toThrow();

    vi.useRealTimers();
  });

  it("shares throttle across case variations of the same email", () => {
    for (let i = 0; i < 5; i++) {
      registerFailedLogin("User@Hospital.ORG");
    }
    expect(() => assertLoginAllowed("user@hospital.org")).toThrow(ValidationError);
  });
});
