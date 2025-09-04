import { MiddlewareWithPOST } from '@shared/lib/api/server/custom-method';
import { createAdminServer } from '@shared/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * E2E 테스트 데이터 초기화 API
 * 테스트용 이메일들에 대한 모든 데이터를 삭제합니다.
 */
export const POST = MiddlewareWithPOST(async () => {
  try {
    const supabase = await createAdminServer();

    // E2E 테스트용 이메일 목록
    const testEmails = [
      'e2e-test@example.com',
      'e2e-test-chromium@example.com',
      'e2e-test-firefox@example.com',
      'e2e-test-webkit@example.com',
      'e2e-test-mobile-chrome@example.com',
      'e2e-test-mobile-safari@example.com',
    ];

    console.log('🗑️ E2E 테스트 데이터 초기화 시작...');

    // 1. User ID 조회
    const { data: testUsers, error: usersQueryError } = await supabase
      .from('users')
      .select('id, email')
      .in('email', testEmails);

    if (usersQueryError) {
      console.error('테스트 사용자 조회 오류:', usersQueryError);
      throw usersQueryError;
    }

    const testUserIds = testUsers?.map((user) => user.id) || [];
    console.log(
      `📋 테스트 사용자 ${testUserIds.length}명 발견:`,
      testUsers?.map((u) => u.email)
    );

    if (testUserIds.length === 0) {
      console.log('ℹ️ 삭제할 테스트 사용자가 없습니다.');
      return NextResponse.json({
        success: true,
        message: '삭제할 테스트 데이터가 없습니다.',
        deletedEmails: [],
      });
    }

    // 2. OAuth 커넥션 삭제
    const { error: oauthError } = await supabase
      .from('oauth_connections')
      .delete()
      .in('user_id', testUserIds);

    if (oauthError) {
      console.error('OAuth 커넥션 삭제 오류:', oauthError);
    } else {
      console.log('✅ OAuth 커넥션 삭제 완료');
    }

    // 3. 게임 알림 ID 조회
    const { data: notifications, error: notificationsQueryError } =
      await supabase
        .from('game_notifications')
        .select('id')
        .in('user_id', testUserIds);

    if (notificationsQueryError) {
      console.error('게임 알림 조회 오류:', notificationsQueryError);
    }

    const notificationIds = notifications?.map((n) => n.id) || [];

    // 4. 알림 시간 삭제
    if (notificationIds.length > 0) {
      const { error: timesError } = await supabase
        .from('notification_times')
        .delete()
        .in('notification_id', notificationIds);

      if (timesError) {
        console.error('알림 시간 삭제 오류:', timesError);
      } else {
        console.log('✅ 알림 시간 삭제 완료');
      }
    }

    // 5. 게임 알림 삭제
    const { error: notificationsError } = await supabase
      .from('game_notifications')
      .delete()
      .in('user_id', testUserIds);

    if (notificationsError) {
      console.error('게임 알림 삭제 오류:', notificationsError);
    } else {
      console.log('✅ 게임 알림 삭제 완료');
    }

    // 6. 사용자 삭제 (users 테이블)
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .in('id', testUserIds);

    if (usersError) {
      console.error('사용자 삭제 오류:', usersError);
    } else {
      console.log('✅ 사용자 삭제 완료');
    }

    // 7. Supabase Auth 사용자 삭제 (auth.users 테이블에서 직접 삭제)
    for (const userId of testUserIds) {
      supabase.auth.admin.deleteUser(userId);
    }

    console.log('🎉 E2E 테스트 데이터 초기화 완료!');

    return NextResponse.json({
      success: true,
      message: 'E2E 테스트 데이터 초기화 완료',
      deletedEmails: testEmails,
    });
  } catch (error) {
    console.error('E2E 데이터 초기화 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'E2E 데이터 초기화 중 서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
