import {
  MiddlewareWithPOST,
  MiddlewareWithGET,
} from '@shared/lib/api/server/custom-method';
import { NextResponse } from 'next/server';

/**
 * OAuth 연결 생성
 * @param request - 요청 객체
 * @returns {ApiResponseType} OAuth 연결 생성 응답 데이터
 */
export const POST = MiddlewareWithPOST(async (request) => {
  try {
    const { supabase, user } = request.auth;
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
});

/**
 * OAuth 연결 조회
 * @param request - 요청 객체
 * @returns {ApiResponseType} OAuth 연결 조회 응답 데이터
 */
export const GET = MiddlewareWithGET(async (request) => {
  try {
    const { supabase, user } = request.auth;
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
});
