import { MiddlewareWithPOST } from '@shared/lib/api/server/custom-method';
import { NextResponse } from 'next/server';

/**
 * 로그인
 * @param request - 요청 객체
 * @returns {UserType} 로그인 응답 데이터
 */
export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { email, password } = await request.json();

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 인증 (인증은 미들웨어에서 처리됨)
    const { data: authData, error: authError } =
      await request.auth.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error('Supabase 인증 오류:', authError);
      return NextResponse.json(
        {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 정보 조회
    const { data: userData, error: userError } = await request.auth.supabase
      .from('users')
      .select('id, email, username')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      console.error('사용자 정보 조회 오류:', userError);
      return NextResponse.json(
        { success: false, message: '사용자 정보를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 세션 쿠키 설정 (Next.js 15 호환 방식)
    const responseObj = NextResponse.json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
      },
    });

    if (authData.session) {
      responseObj.cookies.set(
        'sb-access-token',
        authData.session.access_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7일
          path: '/',
        }
      );

      responseObj.cookies.set(
        'sb-refresh-token',
        authData.session.refresh_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30일
          path: '/',
        }
      );
    }

    return responseObj;
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
