import { MiddlewareWithGET, MiddlewareWithPOST } from '@server/custom-method';
import { NextResponse } from 'next/server';

// ===== 게임 알림 생성 요청 타입 =====
interface CreateNotificationRequest {
  title: string;
  description?: string;
  gameName: string;
  imageUrl: string;
  notificationTimes?: Array<{
    scheduledTime: string;
    isEnabled: boolean;
    rawText?: string;
    label?: string;
  }>;
}

// ===== POST 메서드 - 알림 생성 =====
export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { supabase, user } = request.auth;
    const notificationData: CreateNotificationRequest = await request.json();

    // 입력 검증
    if (!notificationData.title || !notificationData.gameName) {
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
        game_name: notificationData.gameName,
        image_url: notificationData.imageUrl,
        status: 'pending',
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
      notificationData.notificationTimes &&
      notificationData.notificationTimes.length > 0
    ) {
      const timeEntries = notificationData.notificationTimes.map((time) => ({
        notification_id: notification.id,
        scheduled_time: time.scheduledTime,
        status: 'pending',
        is_enabled: time.isEnabled,
        raw_text: time.rawText ?? null,
        label: time.label ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    return NextResponse.json(
      {
        success: true,
        message: '게임 알림이 성공적으로 생성되었습니다.',
        data: notification,
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

// ===== GET 메서드 - 사용자의 알림 목록 조회 =====
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
