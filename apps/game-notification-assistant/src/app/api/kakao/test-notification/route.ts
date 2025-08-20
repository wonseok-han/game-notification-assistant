import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('kakao_access_token');
    const expiresAt = cookieStore.get('kakao_expires_at');

    if (!accessToken || !expiresAt) {
      return NextResponse.json(
        { success: false, message: '카카오 연결이 필요합니다.' },
        { status: 401 }
      );
    }

    // 토큰 만료 확인 및 갱신
    if (new Date(expiresAt.value) <= new Date()) {
      try {
        // 토큰 재갱신 API 호출
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/kakao/refresh-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ provider: 'kakao' }),
          }
        );

        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.json();
          return NextResponse.json(
            {
              success: false,
              message: errorData.message || '토큰 갱신에 실패했습니다.',
            },
            { status: 401 }
          );
        }

        const refreshData = await refreshResponse.json();

        // 응답에서 토큰 정보를 받아서 즉시 사용
        if (refreshData.success && refreshData.data) {
          accessToken = {
            name: 'kakao_access_token',
            value: refreshData.data.accessToken,
          };
          console.log('카카오 토큰 재갱신 완료 - 응답값 사용');
        } else {
          // 응답이 실패한 경우 쿠키에서 다시 가져오기 (fallback)
          const newAccessToken = cookieStore.get('kakao_access_token');
          if (newAccessToken) {
            accessToken = newAccessToken;
            console.log('카카오 토큰 재갱신 완료 - 쿠키에서 가져옴');
          }
        }
      } catch (error) {
        console.error('토큰 갱신 오류:', error);
        return NextResponse.json(
          { success: false, message: '토큰 갱신 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    // accessToken이 있는지 확인
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: '카카오 액세스 토큰을 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    const { message = '테스트 알림입니다! 🎮' } = await request.json();

    // 카카오톡 채널 메시지 전송

    // 임시로 기존 메모 API 사용 (채널 메시지 API 문제 해결 전까지)
    const apiUrl = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';
    const requestBody = new URLSearchParams({
      template_object: JSON.stringify({
        object_type: 'text',
        text: message,
        link: {
          web_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          mobile_web_url:
            process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        },
      }),
    });

    // 디버깅을 위한 로그
    console.log('카카오 API 호출 정보:', {
      apiUrl,
      accessToken: `${accessToken.value.substring(0, 10)}...`,
      requestBody: requestBody.toString(),
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: requestBody,
    });

    console.log('카카오 API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('카카오톡 API 오류:', errorData);
      return NextResponse.json(
        { success: false, message: '카카오톡 알림 전송에 실패했습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '테스트 알림이 전송되었습니다!',
    });
  } catch (error) {
    console.error('테스트 알림 전송 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
