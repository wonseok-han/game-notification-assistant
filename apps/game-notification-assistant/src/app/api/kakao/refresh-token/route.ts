import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClientServer } from '@/utils/supabase/server';

// ===== 카카오 토큰 재갱신 API =====
export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClientServer();

    // 현재 인증된 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // DB에서 카카오 OAuth 연결 정보 조회
    const { data: oauthData, error: oauthError } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'kakao')
      .eq('is_connected', true)
      .single();

    if (oauthError || !oauthData) {
      return NextResponse.json(
        { success: false, message: '카카오 연결 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 토큰 만료 확인
    if (new Date(oauthData.expires_at) > new Date()) {
      return NextResponse.json({
        success: true,
        message: '토큰이 아직 유효합니다.',
        data: {
          accessToken: oauthData.access_token,
          expiresAt: oauthData.expires_at,
          isRefreshed: false,
        },
      });
    }

    // 카카오 토큰 재갱신
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        refresh_token: oauthData.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('카카오 토큰 재갱신 실패:', errorData);
      return NextResponse.json(
        { success: false, message: '토큰 재갱신에 실패했습니다.' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || oauthData.refresh_token; // 새 리프레시 토큰이 없으면 기존 것 사용
    const newExpiresIn = tokenData.expires_in;

    // 새로운 만료 시간 계산
    const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000);

    // DB 업데이트
    const { error: updateError } = await supabase
      .from('oauth_connections')
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', oauthData.id);

    if (updateError) {
      console.error('OAuth 연결 정보 업데이트 실패:', updateError);
      return NextResponse.json(
        { success: false, message: '토큰 정보 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 쿠키 업데이트
    cookieStore.set('kakao_access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: newExpiresAt,
    });

    if (newRefreshToken !== oauthData.refresh_token) {
      cookieStore.set('kakao_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: newExpiresAt,
      });
    }

    cookieStore.set('kakao_expires_at', newExpiresAt.toISOString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: newExpiresAt,
    });

    console.log('카카오 토큰 재갱신 완료');

    // 응답으로 토큰 정보 반환 (호출하는 쪽에서 즉시 사용 가능)
    return NextResponse.json({
      success: true,
      message: '토큰이 성공적으로 재갱신되었습니다.',
      data: {
        accessToken: newAccessToken,
        expiresAt: newExpiresAt.toISOString(),
        isRefreshed: true,
      },
    });
  } catch (error) {
    console.error('카카오 토큰 재갱신 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
