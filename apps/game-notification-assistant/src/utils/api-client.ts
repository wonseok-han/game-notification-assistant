/**
 * 공통 API 유틸리티
 */

/**
 * API base URL을 가져옵니다
 */
export function getApiBaseUrl(): string {
  // 서버 사이드에서는 환경 변수 사용
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  }

  // 클라이언트 사이드에서는 현재 도메인 사용
  return window.location.origin;
}

/**
 * API 호출을 위한 통합 함수
 * @param path - API 경로 (예: '/api/auth/login')
 * @param options - fetch 옵션
 * @param params - 쿼리 파라미터 (선택사항)
 * @returns fetch 응답
 */
export async function apiCall(
  path: string,
  options?: RequestInit,
  params?: Record<string, string>
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(path, baseUrl);

  // 쿼리 파라미터 추가
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // 서버에서 돌아온 에러 메시지 사용
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || `HTTP ${response.status} 에러가 발생했습니다.`;
    throw new Error(errorMessage);
  }

  return response;
}

/**
 * GET 요청을 위한 헬퍼 함수
 * @param path - API 경로
 * @param params - 쿼리 파라미터 (선택사항)
 * @param options - 추가 fetch 옵션 (선택사항)
 * @returns fetch 응답
 */
export async function apiGet(
  path: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<Response> {
  return apiCall(path, { ...options, method: 'GET' }, params);
}

/**
 * POST 요청을 위한 헬퍼 함수
 * @param path - API 경로
 * @param data - 요청 본문 데이터
 * @param options - 추가 fetch 옵션 (선택사항)
 * @returns fetch 응답
 */
export async function apiPost<T = unknown>(
  path: string,
  data?: T,
  options?: RequestInit
): Promise<Response> {
  return apiCall(path, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 요청을 위한 헬퍼 함수
 * @param path - API 경로
 * @param data - 요청 본문 데이터
 * @param options - 추가 fetch 옵션 (선택사항)
 * @returns fetch 응답
 */
export async function apiPut<T = unknown>(
  path: string,
  data?: T,
  options?: RequestInit
): Promise<Response> {
  return apiCall(path, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH 요청을 위한 헬퍼 함수
 * @param path - API 경로
 * @param data - 요청 본문 데이터
 * @param options - 추가 fetch 옵션 (선택사항)
 * @returns fetch 응답
 */
export async function apiPatch<T = unknown>(
  path: string,
  data?: T,
  options?: RequestInit
): Promise<Response> {
  return apiCall(path, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청을 위한 헬퍼 함수
 * @param path - API 경로
 * @param options - 추가 fetch 옵션 (선택사항)
 * @returns fetch 응답
 */
export async function apiDelete(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return apiCall(path, { ...options, method: 'DELETE' });
}

/**
 * API 응답을 파싱합니다
 * @param response - fetch 응답
 * @returns 파싱된 데이터
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  return data;
}
