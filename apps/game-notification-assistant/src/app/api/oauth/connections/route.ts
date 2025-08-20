import { NextResponse } from 'next/server';

import { createClientServer } from '@/utils/supabase/server';

// ===== OAuth 연결 생성 =====
export async function POST(request: Request) {
  try {
    const supabase = await createClientServer();

    // 현재 인증된 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { accessToken, expiresAt, provider, providerUserId, refreshToken } =
      await request.json();

    if (
      !provider ||
      !providerUserId ||
      !accessToken ||
      !refreshToken ||
      !expiresAt
    ) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // OAuth 연결 정보 저장
    const { data, error } = await supabase.from('oauth_connections').upsert(
      {
        user_id: user.id,
        provider,
        provider_user_id: providerUserId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        is_connected: true,
        connected_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider',
      }
    );

    if (error) {
      console.error('OAuth 연결 저장 오류:', error);
      return NextResponse.json(
        { success: false, message: 'OAuth 연결 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OAuth 연결이 성공적으로 저장되었습니다.',
      data,
    });
  } catch (error) {
    console.error('OAuth 연결 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// ===== OAuth 연결 조회 =====
export async function GET(request: Request) {
  try {
    const supabase = await createClientServer();

    // 현재 인증된 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    let query = supabase
      .from('oauth_connections')
      .select('*')
      .eq('user_id', user.id);

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query;

    if (error) {
      console.error('OAuth 연결 조회 오류:', error);
      return NextResponse.json(
        { success: false, message: 'OAuth 연결 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('OAuth 연결 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
