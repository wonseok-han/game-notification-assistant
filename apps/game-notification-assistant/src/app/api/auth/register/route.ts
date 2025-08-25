import { MiddlewareWithPOST } from '@server/custom-method';
import { NextResponse } from 'next/server';

/**
 * 회원가입
 * @param request - 요청 객체
 * @returns {ApiResponseType} 회원가입 응답 데이터
 */
export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { email, password, username } = await request.json();

    // 입력 검증
    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자명 길이 검증
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        {
          success: false,
          message: '사용자명은 2자 이상 20자 이하여야 합니다.',
        },
        { status: 400 }
      );
    }

    // 기존 사용자 확인 (인증은 미들웨어에서 처리됨)
    const { data: existingUser } = await request.auth.supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: '이미 사용 중인 이메일 또는 사용자명입니다.',
        },
        { status: 409 }
      );
    }

    // Supabase Auth를 통한 사용자 생성
    const { data: authData, error: authError } =
      await request.auth.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

    if (authError) {
      console.error('Supabase Auth 오류:', authError);
      return NextResponse.json(
        { success: false, message: '사용자 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: '사용자 정보를 생성할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 사용자 정보를 users 테이블에 저장
    const { data: userData, error: userError } = await request.auth.supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, email, username')
      .single();

    if (userError) {
      console.error('사용자 정보 저장 오류:', userError);

      // 사용자 정보 저장에 실패한 경우 생성된 Auth 계정 삭제
      // await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { success: false, message: '회원가입에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});
