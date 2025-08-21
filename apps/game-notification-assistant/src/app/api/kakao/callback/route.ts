import type { NextRequest } from 'next/server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClientServer } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, message: '코드가 없습니다.' },
        { status: 400 }
      );
    }

    // 1. code로 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/kakao/callback`,
      }),
    });

    console.log('Kakao tokenData Response:', tokenResponse);
    const tokenData = await tokenResponse.json();
    console.log('Kakao tokenData Json:', tokenData);

    if (!tokenResponse.ok) {
      console.error('Kakao token error:', tokenData);
      return NextResponse.json(
        { success: false, message: '토큰 교환 실패' },
        { status: 400 }
      );
    }

    // 2. 카카오 사용자 정보 조회
    const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Kakao user info error', userInfoResponse);
      return NextResponse.json(
        { success: false, message: '사용자 정보 조회 실패' },
        { status: 400 }
      );
    }

    const userInfo = await userInfoResponse.json();

    const kakaoUserId = userInfo.id.toString();

    // 2. 토큰을 HTTP-only 쿠키에 저장 (보안 강화)
    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // 3. OAuth 연결 정보를 DB에 저장
    try {
      const supabase = await createClientServer();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        await supabase.from('oauth_connections').upsert(
          {
            user_id: user.id,
            provider: 'kakao',
            provider_user_id: kakaoUserId,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt.toISOString(),
            is_connected: true,
            connected_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,provider',
          }
        );

        console.log('OAuth 연결 정보 저장 완료');
      }
    } catch (error) {
      console.error('OAuth 연결 정보 저장 실패:', error);
      // OAuth 연결 저장 실패해도 토큰은 정상적으로 저장
    }

    // 액세스 토큰을 HTTP-only 쿠키에 저장
    cookieStore.set('kakao_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    // 리프레시 토큰을 HTTP-only 쿠키에 저장
    cookieStore.set('kakao_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    // 만료 시간을 쿠키에 저장
    cookieStore.set('kakao_expires_at', expiresAt.toISOString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    // 3. HTML 응답으로 팝업 자동 닫기
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>연결 완료</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            try {
              // 부모 창에 성공 메시지 전달
              if (window.opener) {
                window.opener.postMessage({ type: 'kakao-login-success' }, '*');
              }
              // 팝업 자동으로 닫기
              window.close();
            } catch (error) {
              // 에러가 발생해도 팝업은 닫기
              window.close();
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Kakao callback error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
