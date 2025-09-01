import AUTH_CONFIG from '@shared/config/auth';
import { checkAuthStatus } from '@shared/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase 인증 상태 확인
  const { user } = await checkAuthStatus(request);

  // 보호된 라우트에 접근하려는 경우
  if (
    AUTH_CONFIG.PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    if (!user) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/user/sign-in', request.url));
    }
  }

  // 인증 페이지에 접근하려는 경우 (이미 로그인된 경우)
  if (
    AUTH_CONFIG.USER_AUTH_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    if (user) {
      // 이미 로그인된 경우 대시보드로 리다이렉트
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
