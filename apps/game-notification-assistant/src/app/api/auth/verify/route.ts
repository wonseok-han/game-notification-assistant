import { MiddlewareWithGET } from '@server/custom-method';
import { NextResponse } from 'next/server';

/**
 * 세션 검증
 * @param request - 요청 객체
 * @returns {UserType} 사용자 정보
 */
export const GET = MiddlewareWithGET(async (request) => {
  try {
    // 인증은 미들웨어에서 처리됨
    const { supabase, user } = request.auth;

    // 사용자 정보 조회
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return NextResponse.json(
        { success: false, message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '세션이 유효합니다.',
      data: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
      },
    });
  } catch (error) {
    console.error('세션 검증 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
