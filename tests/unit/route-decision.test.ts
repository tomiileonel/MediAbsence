import { describe, expect, it } from "vitest";
import { resolveRouteDecision } from "../../auth.config";
import { APP_ROLES, type AppRole } from "@/modules/auth/roles";

const PROTECTED_ROLE_PATHS: Record<AppRole, string> = {
  ADMIN: "/admin",
  JEFE: "/jefe",
  PROFESIONAL: "/profesional",
  RESIDENTE: "/residente",
};

const TEST_PATHS = [
  "/admin",
  "/jefe",
  "/profesional",
  "/residente",
  "/solicitar",
  "/login",
];

describe("resolveRouteDecision", () => {
  describe.each(APP_ROLES)("role: %s matrix", (role) => {
    it.each(TEST_PATHS)("resolves correct decision for path %s", (path) => {
      const decision = resolveRouteDecision({
        isAuthenticated: true,
        role,
        path,
      });

      if (path === "/login") {
        expect(decision).toEqual({
          type: "redirect",
          to: PROTECTED_ROLE_PATHS[role],
        });
      } else if (path === "/solicitar") {
        expect(decision).toEqual({ type: "allow" });
      } else if (path === PROTECTED_ROLE_PATHS[role]) {
        expect(decision).toEqual({ type: "allow" });
      } else {
        expect(decision).toEqual({
          type: "redirect",
          to: "/forbidden",
        });
      }
    });
  });

  describe("unauthenticated access", () => {
    it.each(["/admin", "/jefe", "/profesional", "/residente"])(
      "redirects unauthenticated user from %s to /login",
      (path) => {
        const decision = resolveRouteDecision({
          isAuthenticated: false,
          role: null,
          path,
        });
        expect(decision).toEqual({ type: "redirect", to: "/login" });
      },
    );

    it("allows unauthenticated access to /login", () => {
      const decision = resolveRouteDecision({
        isAuthenticated: false,
        role: null,
        path: "/login",
      });
      expect(decision).toEqual({ type: "allow" });
    });

    it("allows unauthenticated access to unmapped path /solicitar (handled at page level)", () => {
      const decision = resolveRouteDecision({
        isAuthenticated: false,
        role: null,
        path: "/solicitar",
      });
      expect(decision).toEqual({ type: "allow" });
    });
  });

  describe("edge cases", () => {
    it("redirects corrupt or unknown role to /forbidden on protected paths", () => {
      const decision = resolveRouteDecision({
        isAuthenticated: true,
        role: "HACKER",
        path: "/admin",
      });
      expect(decision).toEqual({ type: "redirect", to: "/forbidden" });
    });

    it("does not redirect corrupt role to home from /login", () => {
      const decision = resolveRouteDecision({
        isAuthenticated: true,
        role: "INVALID_ROLE",
        path: "/login",
      });
      expect(decision).toEqual({ type: "allow" });
    });

    it("allows public root path", () => {
      const decision = resolveRouteDecision({
        isAuthenticated: true,
        role: "RESIDENTE",
        path: "/",
      });
      expect(decision).toEqual({ type: "allow" });
    });
  });
});
