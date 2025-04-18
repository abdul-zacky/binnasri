import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Check for auth cookie
  const session = request.cookies.get('session');
  const isAuthPath = path === '/login';
  
  // If accessing login page with session, redirect to dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If accessing protected route without session, redirect to login
  if (!isAuthPath && !session && !path.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Don't run middleware on specific paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/session).*)']
};