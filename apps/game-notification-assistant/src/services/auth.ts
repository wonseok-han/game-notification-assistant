// ===== 인증 관련 API 함수들 =====

import { apiPost, apiGet, parseApiResponse } from '@utils/api-client';

/**
 * 사용자 로그인
 * @param {LoginRequestType} credentials 로그인 정보
 * @returns {UserType} 사용자 정보
 */
export async function loginUser(
  credentials: LoginRequestType
): Promise<UserType> {
  const response = await apiPost('/api/auth/login', credentials);

  const result = await parseApiResponse<ApiResponseType<UserType>>(response);

  if (!result.success || !result.data) {
    throw new Error(result.message || '로그인에 실패했습니다.');
  }

  return result.data;
}

/**
 * 사용자 회원가입
 * @param {RegisterRequestType} userData 회원가입 정보
 * @returns {UserType} 사용자 정보
 */
export async function registerUser(
  userData: RegisterRequestType
): Promise<UserType> {
  const response = await apiPost('/api/auth/register', userData);

  const result = await parseApiResponse<ApiResponseType<UserType>>(response);

  if (!result.success || !result.data) {
    throw new Error(result.message || '회원가입에 실패했습니다.');
  }

  return result.data;
}

/**
 * 사용자 로그아웃
 * @returns {void} 로그아웃 결과
 */
export async function logoutUser(): Promise<void> {
  await apiPost('/api/auth/logout');
}

/**
 * 세션 검증
 * @returns {UserType | null} 사용자 정보 또는 null
 */
export async function verifyUserSession(): Promise<UserType | null> {
  try {
    const response = await apiGet('/api/auth/verify');
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
