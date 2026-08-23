import type { NextAuthConfig } from "next-auth";
import { getRoleForPath, getRoleHomePath, isAppRole } from "./src/modules/auth/roles";

export default {
  // El middleware Edge no importa Prisma ni bcrypt. El provider real vive en auth.ts.
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const isAuthRoute = path === "/login";
      const requiredRole = getRoleForPath(path);

      if (requiredRole) {
        if (!auth?.user) {
          return false;
        }

        if (!isAppRole(auth.user.role) || auth.user.role !== requiredRole) {
          return Response.redirect(new URL("/forbidden", nextUrl));
        }
      }

      if (auth?.user && isAuthRoute && isAppRole(auth.user.role)) {
        return Response.redirect(new URL(getRoleHomePath(auth.user.role), nextUrl));
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
