import {
  MiddlewareWithDELETE,
  MiddlewareWithGET,
  MiddlewareWithPATCH,
} from '@shared/lib/api/server/custom-method';
import { NextResponse } from 'next/server';

/**
 * @param request - 요청 객체
 * @param params - 요청 파라미터
 * @returns {GetNotificationResponseDto} 알림 상세 조회 응답 데이터
 */
export const GET = MiddlewareWithGET<{ params: Promise<{ id: string }> }>(
  async (request, { params }) => {
    try {
      const { id } = await params;
      const { supabase, user } = request.auth;

      // 알림 상세 정보 조회 (사용자 소유 확인 포함)
      const { data: notification, error: fetchError } = await supabase
        .from('game_notifications')
        .select(
          `
          *,
          notification_times (*)
        `
        )
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !notification) {
        return NextResponse.json(
          { success: false, message: '알림을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '알림 상세 정보를 성공적으로 조회했습니다.',
        data: notification,
      });
    } catch (error) {
      console.error('알림 상세 조회 처리 오류:', error);
      return NextResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

/**
 * @param request - 요청 객체
 * @param params - 요청 파라미터
 * @returns {UpdateNotificationResponseDto} 알림 수정 응답 데이터
 */
export const PATCH = MiddlewareWithPATCH<{ params: Promise<{ id: string }> }>(
  async (request, { params }) => {
    try {
      const { id } = await params;
      const { supabase, user } = request.auth;
      const updateData = await request.json();

      // 디버깅: 받은 데이터 확인
      console.log('PATCH 요청 데이터:', { id, updateData, userId: user.id });

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
      const updateFields: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // title이 제공된 경우 업데이트
      if (updateData.title !== undefined) {
        updateFields.title = updateData.title;
      }

      // is_active가 제공된 경우 업데이트
      if (updateData.is_active !== undefined) {
        updateFields.is_active = updateData.is_active;
      }

      // description이 제공된 경우 업데이트
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description;
      }

      // gameName이 제공된 경우 업데이트
      if (updateData.game_name !== undefined) {
        updateFields.game_name = updateData.game_name;
      }

      // imageUrl이 제공된 경우 업데이트
      if (updateData.image_url !== undefined) {
        updateFields.image_url = updateData.image_url;
      }

      // 디버깅: 업데이트할 필드들 확인
      console.log('업데이트할 필드들:', updateFields);

      const { data: updatedNotification, error: updateError } = await supabase
        .from('game_notifications')
        .update(updateFields)
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
        updateData.notification_times &&
        Array.isArray(updateData.notification_times)
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
        if (updateData.notification_times.length > 0) {
          const timeData = updateData.notification_times.map(
            (time: {
              scheduled_time: string;
              is_enabled?: boolean;
              raw_text?: string;
              label?: string;
            }) => ({
              notification_id: id,
              scheduled_time: time.scheduled_time,
              status: 'pending',
              is_enabled: time.is_enabled ?? true,
              raw_text: time.raw_text ?? null,
              label: time.label ?? null,
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

      // 업데이트된 notification_times 조회
      const { data: updatedNotificationTimes, error: timeFetchError } =
        await supabase
          .from('notification_times')
          .select('*')
          .eq('notification_id', id)
          .order('scheduled_time', { ascending: true });

      if (timeFetchError) {
        console.error('업데이트된 알림 시간 조회 오류:', timeFetchError);
        return NextResponse.json(
          { success: false, message: '알림 시간 조회에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 알림과 알림 시간을 함께 반환
      const responseData = {
        ...updatedNotification,
        notification_times: updatedNotificationTimes || [],
      };

      return NextResponse.json({
        success: true,
        message: '알림이 성공적으로 수정되었습니다.',
        data: responseData,
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

/**
 * @param request - 요청 객체
 * @param params - 요청 파라미터
 * @returns {ApiResponseType} 알림 삭제 응답 데이터
 */
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
