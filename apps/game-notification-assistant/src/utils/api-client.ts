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
 * API URL을 생성합니다
 * @param path - API 경로 (예: '/api/cve')
 * @param params - 쿼리 파라미터 (선택사항)
 * @returns 완전한 API URL
 */
export function createApiUrl(
  path: string,
  params?: Record<string, string>
): string {
  const baseUrl = getApiBaseUrl();
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}

/**
 * 공통 fetch 함수
 * @param url - API URL
 * @param options - fetch 옵션
 * @returns fetch 응답
 */
export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, {
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
 * API 응답을 파싱합니다
 * @param response - fetch 응답
 * @returns 파싱된 데이터
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  return data;
}
