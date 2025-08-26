import type { NextResponse } from 'next/server';

import {
  createMiddlewareChain,
  type BaseHandler,
  type ExtendedRequest,
  type MiddlewareHandler,
} from './middleware';

/**
 * 간단한 API 핸들러 wrapper
 * - request만 받으면 됨 (auth 객체 자동 주입)
 * - request.auth.user, request.auth.supabase로 접근
 * - 기본 인증만 적용
 * - API별 추가 커스텀 미들웨어가 필요하면 arg로 직접 전달해 사용
 *
 * @example
 * export const GET = MiddlewareWithGET(async (request) => {
 *   const userId = request.auth.user.id;
 *   const data = await request.auth.supabase.from('table').select();
 *   return NextResponse.json({ userId, data });
 * });
 */

/**
 * GET 메서드용 미들웨어 wrapper
 * @param handler - 핸들러 함수 (request와 추가 매개변수 받음)
 * @returns 인증이 적용된 GET 핸들러
 */
export function MiddlewareWithGET<T = unknown>(
  handler: (request: ExtendedRequest, ...args: T[]) => Promise<NextResponse>,
  ...middlewares: Array<(h: MiddlewareHandler<T>) => MiddlewareHandler<T>>
): MiddlewareHandler<T> {
  // 간단한 핸들러를 BaseHandler로 변환
  const baseHandler: BaseHandler<T> = async (request, ...args) => {
    return await handler(request, ...args);
  };

  return createMiddlewareChain(baseHandler, ...middlewares);
}

/**
 * POST 메서드용 미들웨어 wrapper
 * @param handler - 핸들러 함수 (request와 추가 매개변수 받음)
 * @returns 인증이 적용된 POST 핸들러
 */
export function MiddlewareWithPOST<T = unknown>(
  handler: (request: ExtendedRequest, ...args: T[]) => Promise<NextResponse>,
  ...middlewares: Array<(h: MiddlewareHandler<T>) => MiddlewareHandler<T>>
): MiddlewareHandler<T> {
  // 간단한 핸들러를 BaseHandler로 변환
  const baseHandler: BaseHandler<T> = async (request, ...args) => {
    return await handler(request, ...args);
  };

  return createMiddlewareChain(baseHandler, ...middlewares);
}

/**
 * PATCH 메서드용 미들웨어 wrapper
 * @param handler - 핸들러 함수 (request와 추가 매개변수 받음)
 * @returns 인증이 적용된 PATCH 핸들러
 */
export function MiddlewareWithPATCH<T = unknown>(
  handler: (request: ExtendedRequest, ...args: T[]) => Promise<NextResponse>,
  ...middlewares: Array<(h: MiddlewareHandler<T>) => MiddlewareHandler<T>>
): MiddlewareHandler<T> {
  // 간단한 핸들러를 BaseHandler로 변환
  const baseHandler: BaseHandler<T> = async (request, ...args) => {
    return await handler(request, ...args);
  };

  return createMiddlewareChain(baseHandler, ...middlewares);
}

/**
 * DELETE 메서드용 미들웨어 wrapper
 * @param handler - 핸들러 함수 (request와 추가 매개변수 받음)
 * @returns 인증이 적용된 DELETE 핸들러
 */
export function MiddlewareWithDELETE<T = unknown>(
  handler: (request: ExtendedRequest, ...args: T[]) => Promise<NextResponse>,
  ...middlewares: Array<(h: MiddlewareHandler<T>) => MiddlewareHandler<T>>
): MiddlewareHandler<T> {
  // 간단한 핸들러를 BaseHandler로 변환
  const baseHandler: BaseHandler<T> = async (request, ...args) => {
    return await handler(request, ...args);
  };

  return createMiddlewareChain(baseHandler, ...middlewares);
}

/**
 * PUT 메서드용 미들웨어 wrapper
 * @param handler - 핸들러 함수 (request와 추가 매개변수 받음)
 * @returns 인증이 적용된 PUT 핸들러
 */
export function MiddlewareWithPUT<T = unknown>(
  handler: (request: ExtendedRequest, ...args: T[]) => Promise<NextResponse>,
  ...middlewares: Array<(h: MiddlewareHandler<T>) => MiddlewareHandler<T>>
): MiddlewareHandler<T> {
  // 간단한 핸들러를 BaseHandler로 변환
  const baseHandler: BaseHandler<T> = async (request, ...args) => {
    return await handler(request, ...args);
  };

  return createMiddlewareChain(baseHandler, ...middlewares);
}
