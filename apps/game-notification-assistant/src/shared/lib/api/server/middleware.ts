import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

import AUTH_CONFIG from '@shared/config/auth';
import { createClientServer } from '@shared/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * 인증 관련 정보를 담는 객체
 */
export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
}

/**
 * Request 객체를 확장하여 auth 객체를 포함
 */
export interface ExtendedRequest extends NextRequest {
  auth: AuthContext;
}

// ===== 기본 핸들러 타입 정의 =====
export type BaseHandler<T = unknown> = (
  request: ExtendedRequest,
  ...args: T[]
) => Promise<NextResponse>;

export type MiddlewareHandler<T = unknown> = (
  request: NextRequest,
  ...args: T[]
) => Promise<NextResponse>;

// ===== 개별 미들웨어들 =====

/**
 * 인증 미들웨어
 * @param handler - 원본 API 핸들러 함수
 * @returns 인증이 적용된 API 핸들러
 */
function withAuthentication<T = unknown>(
  handler: BaseHandler<T>
): MiddlewareHandler<T> {
  return async (request: NextRequest, ...args: T[]): Promise<NextResponse> => {
    try {
      const supabase = await createClientServer();

      // WHITE_LIST에 있는 API는 인증 검사 생략
      if (
        AUTH_CONFIG.AUTH_SKIP_ROUTES.some(
          (path) => request.nextUrl.pathname === path
        )
      ) {
        const extendedRequest = request as ExtendedRequest;
        extendedRequest.auth = { supabase } as AuthContext;
        return await handler(extendedRequest, ...args);
      }

      // 사용자 인증 확인
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // 401 응답 + 쿠키 제거 + 전역 로그아웃
        const response = NextResponse.json(
          { success: false, message: '인증이 만료되었습니다.' },
          { status: 401 }
        );

        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch {
          // noop
        }

        return response;
      }

      // request 객체에 auth 객체 추가
      const extendedRequest = request as ExtendedRequest;
      extendedRequest.auth = { user, supabase };

      // 인증 성공 시 원본 핸들러 실행 (request만 전달)
      return await handler(extendedRequest, ...args);
    } catch (error) {
      console.error('인증 처리 중 오류:', error);
      return NextResponse.json(
        { success: false, message: '인증 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  };
}

/**
 * 로깅 미들웨어
 * @param handler - 원본 API 핸들러 함수
 * @returns 로깅이 적용된 API 핸들러
 */
function withLogging<T = unknown>(
  handler: MiddlewareHandler<T>
): MiddlewareHandler<T> {
  return async (request: NextRequest, ...args: T[]): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.nextUrl.pathname;

    try {
      console.log(`[${method}] ${url}`);
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;
      console.log(`[API] ${method} ${url} (${duration}ms)`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[API] ${method} ${url} 실패 (${duration}ms):`, error);
      throw error;
    }
  };
}

/**
 * 속도 제한 미들웨어
 * @param handler - 원본 API 핸들러 함수
 * @returns 속도 제한이 적용된 API 핸들러
 */
export function withRateLimit<T = unknown>(
  handler: MiddlewareHandler<T>
): MiddlewareHandler<T> {
  return async (request: NextRequest, ...args: T[]): Promise<NextResponse> => {
    // 실제로는 Redis 등을 사용한 속도 제한 로직
    // 예시: IP 기반 속도 제한
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    console.log(`Rate limit check for IP: ${clientIP}`);

    // 속도 제한 로직이 여기에...

    return await handler(request, ...args);
  };
}

/**
 * 미들웨어 체인을 구성하는 함수
 * @param handler - 기본 핸들러
 * @param middlewares - 적용할 미들웨어들 (오른쪽부터 적용)
 * @returns 미들웨어가 체인된 핸들러
 */
export function createMiddlewareChain<T = unknown>(
  handler: BaseHandler<T>,
  ...middlewares: Array<(h: MiddlewareHandler<T>) => MiddlewareHandler<T>>
): MiddlewareHandler<T> {
  // 기본 미들웨어들을 순서대로 적용
  let composed = withAuthentication(handler);
  composed = withLogging(composed);

  // 사용자 정의 미들웨어들을 오른쪽부터 적용
  return middlewares.reduceRight(
    (acc, middleware) => middleware(acc),
    composed
  );
}
