import type { NextRequest } from 'next/server';

import { createClientServer } from '@utils/supabase/server';
import { NextResponse } from 'next/server';

// ===== 세션 검증 응답 타입 =====
interface VerifyResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    username: string;
  };
}

// ===== GET 메서드 - 세션 검증 =====
export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 액세스 토큰 확인
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClientServer();

    // 토큰으로 사용자 정보 조회
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      // 토큰이 유효하지 않은 경우 쿠키 제거
      const responseObj = NextResponse.json(
        { success: false, message: '세션이 만료되었습니다.' },
        { status: 401 }
      );
      responseObj.cookies.delete('sb-access-token');
      responseObj.cookies.delete('sb-refresh-token');
      return responseObj;
    }

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

    // 응답 반환
    const response: VerifyResponse = {
      success: true,
      message: '세션이 유효합니다.',
      data: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('세션 검증 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
