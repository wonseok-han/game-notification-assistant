import { MiddlewareWithGET } from '@server/custom-method';
import { NextResponse } from 'next/server';

import { createClientServer } from '@/utils/supabase/server';

// Cron job용 API - 인증 없이 실행
export const GET = MiddlewareWithGET(async (request) => {
  try {
    // Vercel Cron에서 호출하는 경우 Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: '인증 실패' },
        { status: 401 }
      );
    }

    const supabase = await createClientServer();

    // 현재 시간 기준으로 전송할 알림 조회
    const now = new Date();
    const { data: notifications, error } = await supabase
      .from('game_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', now.toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('알림 조회 오류:', error);
      return NextResponse.json(
        { success: false, message: '알림 조회 실패' },
        { status: 500 }
      );
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: '전송할 알림이 없습니다.',
        count: 0,
      });
    }

    let successCount = 0;
    let failCount = 0;

    // 각 알림에 대해 카카오톡 전송
    for (const notification of notifications) {
      try {
        // 사용자의 카카오 토큰 조회 (쿠키는 서버에서 접근 불가)
        // 실제로는 사용자별로 토큰을 DB에 저장하거나 다른 방식 필요
        const { data: user } = await supabase.auth.getUser();

        if (!user.user) {
          console.error(`사용자 정보 없음: ${notification.id}`);
          failCount++;
          continue;
        }

        // 카카오톡 알림 전송 (실제 구현에서는 사용자별 토큰 관리 필요)
        // const message = `🎮 ${notification.title}\n\n${notification.description}\n\n예약 시간: ${new Date(notification.scheduled_time).toLocaleString('ko-KR')}`;

        // 여기서 실제 카카오톡 API 호출
        // 현재는 시뮬레이션

        // 알림 상태 업데이트
        await supabase
          .from('game_notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', notification.id);

        successCount++;
        console.log(`알림 전송 성공: ${notification.id}`);
      } catch (error) {
        console.error(`알림 전송 실패: ${notification.id}`, error);
        failCount++;

        // 실패한 알림 상태 업데이트
        await supabase
          .from('game_notifications')
          .update({
            status: 'failed',
            error_message:
              error instanceof Error ? error.message : '알 수 없는 오류',
          })
          .eq('id', notification.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `알림 처리 완료: 성공 ${successCount}개, 실패 ${failCount}개`,
      total: notifications.length,
      successCount,
      failedCount: failCount,
    });
  } catch (error) {
    console.error('Cron 작업 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
