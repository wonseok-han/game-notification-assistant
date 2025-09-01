import type { CreateNotificationRequestDto } from '@entities/notification/model/notification-dto';

import {
  MiddlewareWithGET,
  MiddlewareWithPOST,
} from '@shared/lib/api/server/custom-method';
import { NextResponse } from 'next/server';

/**
 * 알림 생성
 * @param request - 요청 객체
 * @returns {CreateNotificationResponseDto} 알림 생성 응답 데이터
 */
export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { supabase, user } = request.auth;
    const notificationData: CreateNotificationRequestDto = await request.json();

    // 입력 검증
    if (!notificationData.title || !notificationData.game_name) {
      return NextResponse.json(
        { success: false, message: '필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 게임 알림 생성
    const { data: notification, error } = await supabase
      .from('game_notifications')
      .insert({
        user_id: user.id,
        title: notificationData.title,
        description: notificationData.description,
        game_name: notificationData.game_name,
        image_url: notificationData.image_url,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('알림 생성 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // notification_times 테이블에 시간 정보 삽입
    if (
      notificationData.notification_times &&
      notificationData.notification_times.length > 0
    ) {
      const timeEntries = notificationData.notification_times.map((time) => ({
        notification_id: notification.id,
        scheduled_time: time.scheduled_time,
        status: 'pending',
        is_enabled: time.is_enabled,
        raw_text: time.raw_text ?? null,
        label: time.label ?? null,
      }));

      const { error: timeError } = await supabase
        .from('notification_times')
        .insert(timeEntries);

      if (timeError) {
        console.error('알림 시간 생성 오류:', timeError);
        // 시간 생성 실패 시에도 메인 알림은 성공으로 처리
        console.warn('알림 시간 생성에 실패했지만 메인 알림은 생성되었습니다.');
      }
    }

    // 생성된 notification_times 조회
    const { data: createdNotificationTimes, error: timeFetchError } =
      await supabase
        .from('notification_times')
        .select('*')
        .eq('notification_id', notification.id)
        .order('scheduled_time', { ascending: true });

    if (timeFetchError) {
      console.error('생성된 알림 시간 조회 오류:', timeFetchError);
      return NextResponse.json(
        { success: false, message: '알림 시간 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 알림과 알림 시간을 함께 반환
    const responseData = {
      ...notification,
      notification_times: createdNotificationTimes || [],
    };

    return NextResponse.json(
      {
        success: true,
        message: '게임 알림이 성공적으로 생성되었습니다.',
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('알림 생성 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

/**
 * 사용자의 알림 목록 조회
 * @param request - 요청 객체
 * @returns {GetNotificationsResponseDto} 알림 목록 조회 응답 데이터
 */
export const GET = MiddlewareWithGET(async (request) => {
  try {
    const { supabase, user } = request.auth;

    // 사용자의 게임 알림 목록 조회 (notification_times 포함)
    const { data: notifications, error } = await supabase
      .from('game_notifications')
      .select(
        `
        *,
        notification_times (
          id,
          scheduled_time,
          status,
          raw_text,
          label,
          is_enabled,
          sent_at,
          error_message,
          created_at,
          updated_at
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('알림 목록 조회 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 목록을 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '알림 목록을 성공적으로 가져왔습니다.',
      data: notifications,
    });
  } catch (error) {
    console.error('알림 목록 조회 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
