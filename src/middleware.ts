import NextAuth from 'next-auth';
import authConfig from '../auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
    // Configuro qué rutas son interceptadas por el Middleware
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
