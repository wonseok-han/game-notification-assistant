import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClientServer } from '@/utils/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // 카카오 관련 쿠키 삭제
    cookieStore.delete('kakao_access_token');
    cookieStore.delete('kakao_refresh_token');
    cookieStore.delete('kakao_expires_at');

    // OAuth 연결 상태를 DB에서 업데이트
    try {
      const supabase = await createClientServer();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        await supabase
          .from('oauth_connections')
          .update({
            is_connected: false,
            disconnected_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('provider', 'kakao');

        console.log('OAuth 연결 상태 업데이트 완료');
      }
    } catch (error) {
      console.error('OAuth 연결 상태 업데이트 실패:', error);
      // DB 업데이트 실패해도 쿠키는 정상적으로 삭제
    }

    console.log('카카오 연결 해제 완료 - 로컬 쿠키 정리 및 DB 상태 업데이트');

    return NextResponse.json({
      success: true,
      message: '연결 해제가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Kakao disconnect error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
