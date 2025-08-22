import type { NextRequest } from 'next/server';

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, options, value }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}

export async function checkAuthStatus(request: NextRequest) {
  const { supabase } = await updateSession(request);

  // 세션 새로고침
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // 401 응답 + 쿠키 제거 + 전역 로그아웃
    const response = NextResponse.json(
      { success: false, message: '세션이 만료되었습니다.' },
      { status: 401 }
    );
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    // signOut은 실패해도 무시 (최대한 정리 시도)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // noop
    }

    return { response };
  }

  return { user, supabase };
}
