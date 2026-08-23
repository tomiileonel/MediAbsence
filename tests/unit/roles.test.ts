import { describe, expect, it } from "vitest";
import {
  getRoleForPath,
  getRoleHomePath,
  assertRole,
  isAppRole,
} from "@/modules/auth/roles";

describe("role policy helpers", () => {
  it("maps dashboard paths to their required role", () => {
    expect(getRoleForPath("/admin/users")).toBe("ADMIN");
    expect(getRoleForPath("/jefe")).toBe("JEFE");
    expect(getRoleForPath("/profesional")).toBe("PROFESIONAL");
    expect(getRoleForPath("/residente")).toBe("RESIDENTE");
  });

  it("does not treat arbitrary paths or strings as roles", () => {
    expect(getRoleForPath("/login")).toBeNull();
    expect(getRoleForPath("/administered")).toBeNull();
    expect(isAppRole("SUPERUSER")).toBe(false);
    expect(isAppRole("ADMIN")).toBe(true);
  });

  it("returns a stable home path for every role", () => {
    expect(getRoleHomePath("ADMIN")).toBe("/admin");
    expect(getRoleHomePath("RESIDENTE")).toBe("/residente");
  });

  it("rejects a role outside the allowed server-side policy", () => {
    expect(() => assertRole("RESIDENTE", ["ADMIN", "JEFE"])).toThrow(
      "No tienes permisos",
    );
    expect(() => assertRole("JEFE", ["ADMIN", "JEFE"])).not.toThrow();
  });
});
