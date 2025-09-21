import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to protect routes.
 *
 * It checks for the presence of an 'accessToken' cookie to determine if a user
 * is authenticated.
 *
 * - If a user is unauthenticated and tries to access a protected route,
 *   they are redirected to the '/login' page.
 * - If a user is authenticated and tries to access a public-only route (like '/login'),
 *   they are redirected to the '/feed' page.
 *
 * The `matcher` config at the bottom specifies which routes this middleware applies to.
 */
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

// See "Matching Paths" below to learn more
export const config = {
  // The matcher specifies which routes the middleware will run on.
  // It's configured to run on all main app routes and the auth pages,
  // while ignoring static files and API routes.
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