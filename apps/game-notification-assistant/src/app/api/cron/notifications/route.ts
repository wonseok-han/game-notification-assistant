import { createAdminServer } from '@utils/supabase/server';
import { NextResponse } from 'next/server';

// ===== 카카오 토큰 갱신 함수 =====
async function refreshKakaoToken(
  _refreshToken: string
): Promise<string | null> {
  try {
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
      console.error('토큰 갱신 실패:', refreshResponse.status);
      return null;
    }

    const refreshData = await refreshResponse.json();
    if (refreshData.success && refreshData.data) {
      return refreshData.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('토큰 갱신 중 오류:', error);
    return null;
  }
}

// ===== 카카오톡 메시지 전송 함수 =====
async function sendKakaoNotification(
  accessToken: string,
  notification: {
    game_name: string;
    title: string;
    description: string | null;
  },
  notificationTime: {
    scheduled_time: string;
    raw_text: string | null;
    label: string | null;
  }
): Promise<boolean> {
  try {
    // 메시지 구성
    let message = '';

    // 게임 이름과 알림 제목 조합
    if (notification.description) {
      message += `${notification.game_name}(${notification.title})에서 설정한 `;
    } else {
      message += `${notification.game_name}에서 설정한 `;
    }

    // 설정된 시간 알림 설명/컨텍스트
    if (notificationTime.raw_text) {
      message += `"${notificationTime.raw_text}"`;
    } else if (notificationTime.label) {
      message += `"${notificationTime.label}"`;
    } else {
      message += `"알림"`;
    }
    message += `시간이 도래했어요!!\n\n`;

    // 시간 정보
    message += `시간: ${new Date(
      notificationTime.scheduled_time
    ).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('카카오톡 API 오류:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('카카오톡 메시지 전송 오류:', error);
    return false;
  }
}

// Cron job용 API - 인증 없이 실행
export async function GET(request: Request) {
  try {
    // Cron-job.org에서 호출하는 경우 Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: '인증 실패' },
        { status: 401 }
      );
    }

    const supabase = await createAdminServer();

    // 현재 시간 기준으로 전송할 알림 시간 조회
    const now = new Date();
    console.log(`[CRON] 현재 시간: ${now.toISOString()}`);

    const { data: notificationTimes, error } = await supabase
      .from('notification_times')
      .select(
        `
        *,
        game_notifications (
          id,
          title,
          description,
          game_name,
          image_url,
          user_id
        )
      `
      )
      .eq('status', 'pending')
      .eq('is_enabled', true)
      .gte('scheduled_time', now.toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('알림 시간 조회 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 시간 조회 실패' },
        { status: 500 }
      );
    }

    if (!notificationTimes || notificationTimes.length === 0) {
      console.log('[CRON] 전송할 알림이 없습니다.');
      return NextResponse.json({
        success: true,
        message: '전송할 알림이 없습니다.',
        count: 0,
      });
    }

    console.log(`[CRON] 전송할 알림 ${notificationTimes.length}개 발견`);

    let successCount = 0;
    let failCount = 0;

    // 각 알림 시간에 대해 카카오톡 전송
    for (const notificationTime of notificationTimes) {
      try {
        const notification = notificationTime.game_notifications;
        if (!notification) {
          console.error(`알림 정보 없음: ${notificationTime.id}`);
          failCount++;
          continue;
        }

        // 사용자의 OAuth 연결 정보 조회 (카카오톡 토큰)
        const { data: oauthConnection, error: oauthError } = await supabase
          .from('oauth_connections')
          .select('*')
          .eq('user_id', notification.user_id)
          .eq('provider', 'kakao')
          .eq('is_connected', true)
          .single();

        if (oauthError || !oauthConnection) {
          console.error(`카카오톡 연결 없음: 사용자 ${notification.user_id}`);

          // OAuth 연결이 없는 경우 알림 시간 상태를 failed로 업데이트
          await supabase
            .from('notification_times')
            .update({
              status: 'failed',
              error_message: '카카오톡 연결이 설정되지 않았습니다.',
              updated_at: new Date().toISOString(),
            })
            .eq('id', notificationTime.id);

          failCount++;
          continue;
        }

        // 액세스 토큰 확인 및 갱신
        let accessToken = oauthConnection.access_token;
        const expiresAt = oauthConnection.expires_at;

        // 토큰 만료 확인 및 갱신
        if (expiresAt && new Date(expiresAt) <= new Date()) {
          console.log(`토큰 만료됨, 갱신 시도: 사용자 ${notification.user_id}`);

          if (oauthConnection.refresh_token) {
            const newAccessToken = await refreshKakaoToken(
              oauthConnection.refresh_token
            );
            if (newAccessToken) {
              accessToken = newAccessToken;
              console.log(`토큰 갱신 성공: 사용자 ${notification.user_id}`);

              // DB에 새로운 토큰 정보 업데이트
              await supabase
                .from('oauth_connections')
                .update({
                  access_token: newAccessToken,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', oauthConnection.id);
            } else {
              console.error(`토큰 갱신 실패: 사용자 ${notification.user_id}`);

              // 토큰 갱신 실패 시 알림 시간 상태를 failed로 업데이트
              await supabase
                .from('notification_times')
                .update({
                  status: 'failed',
                  error_message: '카카오톡 토큰 갱신에 실패했습니다.',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', notificationTime.id);

              failCount++;
              continue;
            }
          } else {
            console.error(`리프레시 토큰 없음: 사용자 ${notification.user_id}`);

            await supabase
              .from('notification_times')
              .update({
                status: 'failed',
                error_message: '카카오톡 리프레시 토큰이 없습니다.',
                updated_at: new Date().toISOString(),
              })
              .eq('id', notificationTime.id);

            failCount++;
            continue;
          }
        }

        // 카카오톡 알림 전송
        console.log(
          `카카오톡 알림 전송 시도: ${notification.title} - ${notificationTime.scheduled_time}`
        );

        const isNotificationSent = await sendKakaoNotification(
          accessToken,
          notification,
          notificationTime
        );

        if (isNotificationSent) {
          // 알림 시간 상태를 sent로 업데이트
          await supabase
            .from('notification_times')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', notificationTime.id);

          successCount++;
          console.log(`알림 전송 성공: ${notificationTime.id}`);
        } else {
          // 전송 실패 시 상태를 failed로 업데이트
          await supabase
            .from('notification_times')
            .update({
              status: 'failed',
              error_message: '카카오톡 메시지 전송에 실패했습니다.',
              updated_at: new Date().toISOString(),
            })
            .eq('id', notificationTime.id);

          failCount++;
          console.log(`알림 전송 실패: ${notificationTime.id}`);
        }
      } catch (error) {
        console.error(`알림 전송 실패: ${notificationTime.id}`, error);
        failCount++;

        // 실패한 알림 시간 상태 업데이트
        await supabase
          .from('notification_times')
          .update({
            status: 'failed',
            error_message:
              error instanceof Error ? error.message : '알 수 없는 오류',
            updated_at: new Date().toISOString(),
          })
          .eq('id', notificationTime.id);
      }
    }

    console.log(
      `[CRON] 알림 처리 완료: 성공 ${successCount}개, 실패 ${failCount}개`
    );

    return NextResponse.json({
      success: true,
      message: `알림 처리 완료: 성공 ${successCount}개, 실패 ${failCount}개`,
      total: notificationTimes.length,
      successCount,
      failedCount: failCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron 작업 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
