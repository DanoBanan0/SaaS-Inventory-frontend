import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login'];

// Rutas protegidas que requieren autenticación
const protectedPaths = [
    '/dashboard',
    '/inventory',
    '/purchases',
    '/units',
    '/employees',
    '/users',
    '/roles',
    '/audits',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Obtener token de las cookies (Next.js no tiene acceso a localStorage en middleware)
    // El token debe ser pasado como cookie desde el cliente
    const token = request.cookies.get('auth_token')?.value;

    // Si es una ruta pública, permitir acceso
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Si es la raíz, redirigir según autenticación
    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Si es ruta pública y tiene token, redirigir a dashboard
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si es ruta protegida y no tiene token, redirigir a login
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    if (isProtectedPath && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
};
