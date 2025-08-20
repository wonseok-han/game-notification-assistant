// ===== 인증 관련 API 함수들 =====

import { apiFetch, createApiUrl, parseApiResponse } from '@utils/api-client';

/**
 * 사용자 로그인
 * @param credentials - 로그인 정보
 * @returns 사용자 정보
 */
export async function loginUser(
  credentials: LoginRequestType
): Promise<UserType> {
  const url = createApiUrl('/api/auth/login');
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  const result = await parseApiResponse<ApiResponseType<UserType>>(response);

  if (!result.success || !result.data) {
    throw new Error(result.message || '로그인에 실패했습니다.');
  }

  return result.data;
}

/**
 * 사용자 회원가입
 * @param userData - 회원가입 정보
 * @returns 사용자 정보
 */
export async function registerUser(
  userData: RegisterRequestType
): Promise<UserType> {
  const url = createApiUrl('/api/auth/register');
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  const result = await parseApiResponse<ApiResponseType<UserType>>(response);

  if (!result.success || !result.data) {
    throw new Error(result.message || '회원가입에 실패했습니다.');
  }

  return result.data;
}

/**
 * 사용자 로그아웃
 */
export async function logoutUser(): Promise<void> {
  const url = createApiUrl('/api/auth/logout');
  await apiFetch(url, {
    method: 'POST',
  });
}

/**
 * 세션 검증
 * @returns 사용자 정보 또는 null
 */
export async function verifyUserSession(): Promise<UserType | null> {
  try {
    const url = createApiUrl('/api/auth/verify');
    const response = await apiFetch(url);
    const result = await parseApiResponse<ApiResponseType<UserType>>(response);

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (_error) {
    // 세션이 유효하지 않은 경우 null 반환
    return null;
  }
}
