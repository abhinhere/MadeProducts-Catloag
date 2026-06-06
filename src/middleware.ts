import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const isAuthenticated = !!request.cookies.get('dummy_auth')?.value;
  const { pathname } = request.nextUrl;

  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthenticated && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
