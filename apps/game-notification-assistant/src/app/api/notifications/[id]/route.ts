import type { NextRequest } from 'next/server';

import { createClientServer } from '@utils/supabase/server';
import { NextResponse } from 'next/server';

type UpdateNotificationBody = Partial<{
  description: string;
  gameName: string;
  imageUrl: string;
  status: string;
  title: string;
  notificationTimes?: Array<{
    id?: string;
    scheduledTime: string;
    isEnabled: boolean;
    rawText?: string;
    label?: string;
  }>;
}>;

// ===== PATCH: 알림 수정 =====
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClientServer();

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body: UpdateNotificationBody = await request.json();

    // 업데이트 필드 매핑 (snake_case)
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.gameName !== undefined) updates.game_name = body.gameName;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.status !== undefined) updates.status = body.status;

    updates.updated_at = new Date().toISOString();

    const { data: notification, error } = await supabase
      .from('game_notifications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('알림 수정 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!notification) {
      return NextResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // notification_times 업데이트
    if (body.notificationTimes !== undefined) {
      // 기존 시간들 삭제
      await supabase
        .from('notification_times')
        .delete()
        .eq('notification_id', id);

      // 새로운 시간들 삽입
      if (body.notificationTimes.length > 0) {
        const timeEntries = body.notificationTimes.map((time) => ({
          notification_id: id,
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
          console.error('알림 시간 업데이트 오류:', timeError);
          console.warn(
            '알림 시간 업데이트에 실패했지만 메인 알림은 수정되었습니다.'
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '알림이 수정되었습니다.',
      data: notification,
    });
  } catch (err) {
    console.error('알림 수정 처리 오류:', err);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// ===== DELETE: 알림 삭제 =====
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClientServer();

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // notification_times 먼저 삭제 (외래키 제약조건)
    await supabase
      .from('notification_times')
      .delete()
      .eq('notification_id', id);

    // 게임 알림 삭제
    const { data, error } = await supabase
      .from('game_notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id')
      .single();

    if (error) {
      console.error('알림 삭제 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '알림이 삭제되었습니다.',
    });
  } catch (err) {
    console.error('알림 삭제 처리 오류:', err);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
