import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./src/lib/prisma";
import authConfig from "./auth.config";
import { authorizeUser } from "./src/modules/auth/authorize-credentials";

export { DUMMY_BCRYPT_HASH, credentialsSchema, authorizeUser } from "./src/modules/auth/authorize-credentials";

export const credentialsProvider = Credentials({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: authorizeUser,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [credentialsProvider],
});
