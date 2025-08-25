import { MiddlewareWithPOST } from '@server/custom-method';
import { NextResponse } from 'next/server';

/**
 * 로그아웃
 * @param request - 요청 객체
 * @returns {ApiResponseType} 로그아웃 응답 데이터
 */
export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { supabase } = request.auth;
    // Supabase 로그아웃 처리 (인증은 미들웨어에서 처리됨)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase 로그아웃 오류:', error);
      // 로그아웃 오류가 발생해도 성공으로 처리
    }

    // 응답 생성
    const response = {
      success: true,
      message: '로그아웃이 완료되었습니다.',
    };

    // 세션 쿠키 제거
    const responseObj = NextResponse.json(response);
    responseObj.cookies.delete('sb-access-token');
    responseObj.cookies.delete('sb-refresh-token');

    return responseObj;
  } catch (error) {
    console.error('로그아웃 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
