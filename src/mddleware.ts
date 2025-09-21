import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define routes that are considered public (accessible without logging in)
  const isPublicPath = path === '/login' || path === '/register';

  // Check for the authentication token in the browser's cookies
  const token = request.cookies.get('accessToken')?.value || '';

  // If the user is on a public path AND has a token, redirect to the feed
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // If the user is on a protected path AND does NOT have a token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/feed',
    '/profile/:path*',
    '/notifications/:path*',
    '/post/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};