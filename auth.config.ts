import type { NextAuthConfig } from "next-auth";
import { getRoleForPath, getRoleHomePath, isAppRole } from "./src/modules/auth/roles";

export type RouteDecision =
  | { type: "allow" }
  | { type: "redirect"; to: string };

export function resolveRouteDecision(args: {
  isAuthenticated: boolean;
  role: unknown;
  path: string;
}): RouteDecision {
  const requiredRole = getRoleForPath(args.path);
  if (requiredRole) {
    if (!args.isAuthenticated) {
      return { type: "redirect", to: "/login" };
    }

    if (!isAppRole(args.role) || args.role !== requiredRole) {
      return { type: "redirect", to: "/forbidden" };
    }
  }

  if (args.isAuthenticated && isAppRole(args.role) && args.path === "/login") {
    return { type: "redirect", to: getRoleHomePath(args.role) };
  }

  return { type: "allow" };
}

export default {
  // El middleware Edge no importa Prisma ni bcrypt. El provider real vive en auth.ts.
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const decision = resolveRouteDecision({
        isAuthenticated: Boolean(auth?.user),
        role: auth?.user?.role,
        path: nextUrl.pathname,
      });

      if (decision.type === "redirect") {
        return Response.redirect(new URL(decision.to, nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user && isAppRole(token.role)) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user?.role && isAppRole(user.role)) {
        token.role = user.role;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
