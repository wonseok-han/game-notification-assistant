import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.KAKAO_REST_API_KEY;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/kakao/callback`;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: '카카오 API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 카카오 OAuth 인증 URL 생성
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email,talk_message',
    });
    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('카카오 OAuth URL 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
