import NextAuth from 'next-auth';
import authConfig from '../auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
    // Configuro qué rutas son interceptadas por el Middleware
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
