import { createAdminServer } from '@shared/lib/supabase/server';
import { NextResponse } from 'next/server';

// ===== 상수 정의 =====
const CRON_LOOKBACK_MINUTES = 10; // 10분 전부터 조회

// ===== 카카오 토큰 갱신 함수 =====
type TokenRefreshResultType = {
  access_token: string | null;
  refresh_token?: string;
  expires_in?: number;
};

type NotificationTimesResponseType = {
  id: string;
  scheduled_time: string;
  status: string;
  is_enabled: boolean;
  raw_text: string | null;
  label: string | null;
  notification_id: string;
  game_notifications: {
    id: string;
    title: string;
    description: string;
    game_name: string;
    user_id: string;
  };
}[];

/**
 * 카카오 토큰 갱신
 * @param refreshToken
 * @returns {TokenRefreshResultType} 토큰 갱신 결과
 */
async function refreshKakaoToken(
  refreshToken: string
): Promise<TokenRefreshResultType> {
  try {
    // 카카오 토큰 갱신 API 직접 호출
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.KAKAO_REST_API_KEY!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('카카오 토큰 갱신 실패:', errorData);
      return { access_token: null };
    }

    const data = await response.json();
    console.log('카카오 토큰 갱신 성공:', {
      access_token: data.access_token ? '갱신됨' : '없음',
      refresh_token: data.refresh_token ? '갱신됨' : '없음',
      expires_in: data.expires_in,
    });

    // 토큰 정보 전체 반환
    return {
      access_token: data.access_token || null,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  } catch (error) {
    console.error('카카오 토큰 갱신 오류:', error);
    return { access_token: null };
  }
}

/**
 * 카카오톡 메시지 전송
 * @param accessToken
 * @param notification
 * @param notificationTime
 * @returns {boolean} 메시지 전송 결과
 */
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
    if (notificationTime.label) {
      message += `"${notificationTime.label}"`;
    } else if (notificationTime.raw_text) {
      message += `"${notificationTime.raw_text}"`;
    } else {
      message += `"알림"`;
    }

    // 실제 남은 시간 계산
    const scheduledTime = new Date(notificationTime.scheduled_time);
    const now = new Date();
    const timeDiffMs = now.getTime() - scheduledTime.getTime();
    const timeDiffMinutes = Math.round(timeDiffMs / (1000 * 60));

    // 시간 차이에 따른 메시지 생성
    let timeMessage = '';
    if (timeDiffMinutes < 0) {
      // 이미 지난 시간
      const absMinutes = Math.abs(timeDiffMinutes);
      if (absMinutes < 60) {
        timeMessage = `${absMinutes}분 전에 지났어요`;
      } else {
        const hours = Math.floor(absMinutes / 60);
        const minutes = absMinutes % 60;
        if (minutes === 0) {
          timeMessage = `${hours}시간 전에 지났어요`;
        } else {
          timeMessage = `${hours}시간 ${minutes}분 전에 지났어요`;
        }
      }
    } else if (timeDiffMinutes === 0) {
      // 정확히 지금
      timeMessage = '지금이에요!!';
    } else if (timeDiffMinutes < 60) {
      // 1시간 미만 남음
      timeMessage = `까지 ${timeDiffMinutes}분 남았어요!!`;
    } else {
      // 1시간 이상 남음
      const hours = Math.floor(timeDiffMinutes / 60);
      const minutes = timeDiffMinutes % 60;
      if (minutes === 0) {
        timeMessage = `까지 ${hours}시간 남았어요!!`;
      } else {
        timeMessage = `까지 ${hours}시간 ${minutes}분 남았어요!!`;
      }
    }

    message += `${timeMessage}\n\n`;

    // 시간 정보
    message += `시간: ${new Date(
      notificationTime.scheduled_time
    ).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

    const responseData = await response.json();
    console.log('카카오톡 API 응답:', responseData);

    // 응답에서 성공 여부 확인
    if (responseData.result_code === 0) {
      console.log('카카오톡 메시지 전송 성공');
      return true;
    }

    console.error('카카오톡 메시지 전송 실패:', responseData);
    return false;
  } catch (error) {
    console.error('카카오톡 메시지 전송 오류:', error);
    return false;
  }
}

/**
 * Cron job용 API - 인증 없이 실행
 * @param request - 요청 객체
 * @returns {ApiResponseType} 알림 처리 결과
 */
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

    // 현재 시간 기준으로 처리할 알림 시간 조회 (10분 전부터)
    const now = new Date();
    const tenMinutesAgo = new Date(
      now.getTime() - CRON_LOOKBACK_MINUTES * 60 * 1000
    );
    console.log(`[CRON] 현재 시간: ${now.toISOString()}`);
    console.log(
      `[CRON] ${CRON_LOOKBACK_MINUTES}분 전: ${tenMinutesAgo.toISOString()}`
    );

    const { data: notificationTimes, error } = await supabase
      .from('notification_times')
      .select(
        `
        id,
        scheduled_time,
        status,
        is_enabled,
        raw_text,
        label,
        notification_id,
        game_notifications (
          id,
          title,
          description,
          game_name,
          user_id
        )
      `
      )
      .eq('status', 'pending')
      .eq('is_enabled', true)
      .eq('game_notifications.is_active', true)
      .lte('scheduled_time', now.toISOString()) // 현재 시간 이하
      .gte('scheduled_time', tenMinutesAgo.toISOString()) // 10분 전 이상
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('알림 시간 조회 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 시간 조회 실패' },
        { status: 500 }
      );
    }

    if (!notificationTimes || notificationTimes.length === 0) {
      console.log('[CRON] 처리할 알림이 없습니다.');
      return NextResponse.json({
        success: true,
        message: '처리할 알림이 없습니다.',
        count: 0,
      });
    }

    console.log(`[CRON] 처리할 알림 ${notificationTimes.length}개 발견`);

    let successCount = 0;
    let failCount = 0;

    // 각 알림 시간에 대해 카카오톡 전송
    for (const notificationTime of notificationTimes as unknown as NotificationTimesResponseType) {
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
            const tokenResult = await refreshKakaoToken(
              oauthConnection.refresh_token
            );
            if (tokenResult.access_token) {
              accessToken = tokenResult.access_token;
              console.log(`토큰 갱신 성공: 사용자 ${notification.user_id}`);

              // DB에 새로운 토큰 정보 업데이트
              const updateData: Record<string, unknown> = {
                access_token: tokenResult.access_token,
                updated_at: new Date().toISOString(),
              };

              // 새로운 refresh_token이 있다면 함께 업데이트
              if (tokenResult.refresh_token) {
                updateData.refresh_token = tokenResult.refresh_token;
                console.log(
                  `새로운 refresh_token도 업데이트됨: 사용자 ${notification.user_id}`
                );
              }

              // expires_at 업데이트 (현재 시간 + expires_in)
              if (tokenResult.expires_in) {
                const newExpiresAt = new Date(
                  Date.now() + tokenResult.expires_in * 1000
                );
                updateData.expires_at = newExpiresAt.toISOString();
                console.log(
                  `새로운 expires_at 설정: ${newExpiresAt.toISOString()}`
                );
              }

              const { error: updateError } = await supabase
                .from('oauth_connections')
                .update({
                  ...updateData,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', oauthConnection.id);

              if (updateError) {
                console.error(
                  `토큰 정보 DB 업데이트 실패: 사용자 ${notification.user_id}`,
                  updateError
                );
              } else {
                console.log(
                  `토큰 정보 DB 업데이트 성공: 사용자 ${notification.user_id}`
                );
              }
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

        // 카카오톡 알림 발송
        console.log(
          `카카오톡 알림 발송 시도: ${notification.title} - ${notificationTime.scheduled_time}`
        );

        const isNotificationSent = await sendKakaoNotification(
          accessToken,
          notification,
          notificationTime
        );

        if (isNotificationSent) {
          // 알림 시간 상태를 sent로 업데이트
          console.log(`상태 업데이트 시도: ${notificationTime.id} -> sent`);

          const { error: updateError } = await supabase
            .from('notification_times')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', notificationTime.id);

          if (updateError) {
            console.error(
              `상태 업데이트 실패: ${notificationTime.id}`,
              updateError
            );
          } else {
            console.log(`상태 업데이트 성공: ${notificationTime.id} -> sent`);
          }

          successCount++;
          console.log(`알림 발송 성공: ${notificationTime.id}`);
        } else {
          // 발송 실패 시 상태를 failed로 업데이트
          console.log(`상태 업데이트 시도: ${notificationTime.id} -> failed`);

          const { error: updateError } = await supabase
            .from('notification_times')
            .update({
              status: 'failed',
              error_message: '카카오톡 메시지 발송에 실패했습니다.',
              updated_at: new Date().toISOString(),
            })
            .eq('id', notificationTime.id);

          if (updateError) {
            console.error(
              `상태 업데이트 실패: ${notificationTime.id}`,
              updateError
            );
          } else {
            console.log(`상태 업데이트 성공: ${notificationTime.id} -> failed`);
          }

          failCount++;
          console.log(`알림 발송 실패: ${notificationTime.id}`);
        }
      } catch (error) {
        console.error(`알림 발송 실패: ${notificationTime.id}`, error);
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
