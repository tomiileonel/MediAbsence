import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export default {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // En Edge, no podemos importar PrismaClient directamente a menos que usemos Prisma Accelerate
                // Dado que estamos usando WampServer local, validaremos usando fetch o saltándonos adapter localmente en middleware.
                // Pero en la config principal 'auth.ts' que corre en servidor de Node sí podemos.
                // Por ahora lo delegamos para evitar errores de Edge DB connection.
                return null;
            }
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const path = nextUrl.pathname;

            const isApiRoute = path.startsWith('/api');
            const isAuthRoute = path === '/login';

            if (isApiRoute) return true;

            // Si el usuario trata de entrar a un dashboard
            if (path.startsWith('/admin') || path.startsWith('/jefe') || path.startsWith('/profesional') || path.startsWith('/residente')) {
                if (!isLoggedIn) return false; // Redirige al login
            }

            // Proteger rutas por rol: Esto se puede extender
            if (isLoggedIn && isAuthRoute) {
                return Response.redirect(new URL('/', nextUrl));
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        }
    },
} satisfies NextAuthConfig;
