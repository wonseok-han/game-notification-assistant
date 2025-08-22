import { MiddlewareWithPOST } from '@server/custom-method';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface NotificationTime {
  id: string;
  scheduled_time: string;
  status: string;
  is_enabled: boolean;
  raw_text: string | null;
  label: string | null;
}

interface GameNotification {
  id: string;
  title: string;
  description: string | null;
  game_name: string;
  image_url: string | null;
  notification_times: NotificationTime[] | null;
}

export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { supabase, user } = request.auth;
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

    // 사용자 인증은 이미 미들웨어에서 처리됨

    // 사용자의 게임 알림 데이터 조회
    const { data: notifications, error: notificationsError } = await supabase
      .from('game_notifications')
      .select(
        `
        *,
        notification_times (
          id,
          scheduled_time,
          status,
          is_enabled,
          raw_text,
          label
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5); // 최근 5개 알림만 조회

    if (notificationsError) {
      console.error('알림 데이터 조회 오류:', notificationsError);
      return NextResponse.json(
        { success: false, message: '알림 데이터를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 알림 데이터가 없는 경우
    if (!notifications || notifications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '전송할 알림이 없습니다. 먼저 게임 알림을 생성해주세요.',
        },
        { status: 404 }
      );
    }

    // 테스트용으로 첫 번째 알림을 선택하여 메시지 생성
    const testNotification = notifications[0] as GameNotification;
    const enabledTimes =
      testNotification.notification_times?.filter(
        (time: NotificationTime) => time.is_enabled
      ) || [];

    // 메시지 구성
    let message = '';

    // 게임 이름과 알림 제목 조합
    if (testNotification.description) {
      message += `${testNotification.game_name}(${testNotification.title})에서 설정한 `;
    } else {
      message += `${testNotification.game_name}에서 설정한 `;
    }

    // 설정된 시간 알림 설명/컨텍스트
    if (enabledTimes.length > 0) {
      const firstTime = enabledTimes[0];
      if (firstTime?.raw_text) {
        message += `"${firstTime.raw_text}"`;
      } else if (firstTime?.label) {
        message += `"${firstTime.label}"`;
      } else {
        message += `"알림"`;
      }
      message += `시간이 도래했어요!!\n\n`;

      // 시간 정보
      if (firstTime) {
        message += `시간: ${new Date(firstTime.scheduled_time).toLocaleString(
          'ko-KR',
          {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }
        )}`;
      }

      // 추가 시간 정보가 있는 경우
      if (enabledTimes.length > 1) {
        message += `\n\n추가 알림 시간:\n`;
        enabledTimes.slice(1).forEach((time, index) => {
          const scheduledTime = new Date(time.scheduled_time);
          const localTime = scheduledTime.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          message += `${index + 2}. ${localTime}`;
          if (time.raw_text) {
            message += ` (${time.raw_text})`;
          }
          if (time.label) {
            message += ` - ${time.label}`;
          }
          message += `\n`;
        });
      }
    } else {
      message += `"알림"시간이 도래했어요!!\n\n`;
      message += `시간: 설정된 알림 시간이 없습니다.`;
    }

    // 카카오톡 메모 API로 메시지 전송
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
      messageLength: message.length,
      notificationCount: notifications.length,
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
      message: '실제 게임 알림 데이터로 테스트 알림이 전송되었습니다!',
      data: {
        notificationTitle: testNotification.title,
        gameName: testNotification.game_name,
        timeCount: enabledTimes.length,
        messagePreview: `${message.substring(0, 100)}...`,
      },
    });
  } catch (error) {
    console.error('테스트 알림 전송 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
