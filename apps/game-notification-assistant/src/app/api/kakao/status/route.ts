import { MiddlewareWithGET } from '@server/custom-method';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = MiddlewareWithGET(async (_request) => {
  try {
    const cookieStore = await cookies();

    // 쿠키에서 카카오 토큰 확인
    const accessToken = cookieStore.get('kakao_access_token');
    const expiresAt = cookieStore.get('kakao_expires_at');

    if (!accessToken || !expiresAt) {
      return NextResponse.json({ connected: false });
    }

    // 토큰 만료 확인
    const isExpired = new Date(expiresAt.value) <= new Date();

    return NextResponse.json({
      connected: !isExpired,
      expiresAt: expiresAt.value,
    });
  } catch (error) {
    console.error('Kakao status check error:', error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
});
