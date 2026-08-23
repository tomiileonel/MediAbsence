import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./src/lib/prisma";
import authConfig from "./auth.config";
import { isAppRole, type AppRole } from "./src/modules/auth/roles";

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});
const credentialsProvider = Credentials({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const parsedCredentials = credentialsSchema.safeParse(credentials);

    if (!parsedCredentials.success) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsedCredentials.data.email },
    });

    if (!user?.password || !isAppRole(user.role)) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(
      parsedCredentials.data.password,
      user.password,
    );

    if (!passwordMatches) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role as AppRole,
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [credentialsProvider],
});
