import {
  MiddlewareWithPATCH,
  MiddlewareWithDELETE,
} from '@server/custom-method';
import { NextResponse } from 'next/server';

// ===== PATCH 메서드 - 알림 수정 =====
export const PATCH = MiddlewareWithPATCH<{ params: Promise<{ id: string }> }>(
  async (request, { params }) => {
    try {
      const { id } = await params;
      const { supabase, user } = request.auth;
      const updateData = await request.json();

      // 알림이 사용자 소유인지 확인
      const { data: existingNotification, error: fetchError } = await supabase
        .from('game_notifications')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existingNotification) {
        return NextResponse.json(
          { success: false, message: '알림을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 트랜잭션 시작: 알림과 알림 시간을 함께 업데이트
      const { data: updatedNotification, error: updateError } = await supabase
        .from('game_notifications')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('알림 수정 오류:', updateError);
        return NextResponse.json(
          { success: false, message: '알림 수정에 실패했습니다.' },
          { status: 500 }
        );
      }

      // notification_times 업데이트
      if (
        updateData.notificationTimes &&
        Array.isArray(updateData.notificationTimes)
      ) {
        // 기존 알림 시간들 삭제
        const { error: timeDeleteError } = await supabase
          .from('notification_times')
          .delete()
          .eq('notification_id', id);

        if (timeDeleteError) {
          console.error('기존 알림 시간 삭제 오류:', timeDeleteError);
          return NextResponse.json(
            { success: false, message: '알림 시간 업데이트에 실패했습니다.' },
            { status: 500 }
          );
        }

        // 새로운 알림 시간들 추가
        if (updateData.notificationTimes.length > 0) {
          const timeData = updateData.notificationTimes.map(
            (time: {
              scheduledTime: string;
              isEnabled?: boolean;
              rawText?: string;
              label?: string;
            }) => ({
              notification_id: id,
              scheduled_time: time.scheduledTime,
              status: 'pending',
              is_enabled: time.isEnabled ?? true,
              raw_text: time.rawText ?? null,
              label: time.label ?? null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          );

          const { error: timeInsertError } = await supabase
            .from('notification_times')
            .insert(timeData);

          if (timeInsertError) {
            console.error('새 알림 시간 추가 오류:', timeInsertError);
            return NextResponse.json(
              { success: false, message: '알림 시간 추가에 실패했습니다.' },
              { status: 500 }
            );
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: '알림이 성공적으로 수정되었습니다.',
        data: updatedNotification,
      });
    } catch (error) {
      console.error('알림 수정 처리 오류:', error);
      return NextResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

// ===== DELETE 메서드 - 알림 삭제 =====
export const DELETE = MiddlewareWithDELETE<{ params: Promise<{ id: string }> }>(
  async (request, { params }) => {
    try {
      const { id } = await params;
      const { supabase, user } = request.auth;

      // 알림이 사용자 소유인지 확인
      const { data: existingNotification, error: fetchError } = await supabase
        .from('game_notifications')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existingNotification) {
        return NextResponse.json(
          { success: false, message: '알림을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 관련된 notification_times 먼저 삭제
      const { error: timeDeleteError } = await supabase
        .from('notification_times')
        .delete()
        .eq('notification_id', id);

      if (timeDeleteError) {
        console.error('알림 시간 삭제 오류:', timeDeleteError);
        // 시간 삭제 실패 시에도 메인 알림은 삭제 시도
        console.warn(
          '알림 시간 삭제에 실패했지만 메인 알림 삭제는 계속 진행합니다.'
        );
      }

      // 게임 알림 삭제
      const { error: deleteError } = await supabase
        .from('game_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('알림 삭제 오류:', deleteError);
        return NextResponse.json(
          { success: false, message: '알림 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '알림이 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      console.error('알림 삭제 처리 오류:', error);
      return NextResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);
