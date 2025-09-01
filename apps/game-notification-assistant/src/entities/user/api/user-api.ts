// ===== 인증 관련 API 함수들 =====

import type {
  LoginRequestDto,
  RegisterRequestDto,
  LoginResponseDto,
  RegisterResponseDto,
  VerifyResponseDto,
} from '../model/user-dto';

import {
  apiPost,
  apiGet,
  parseApiResponse,
} from '@shared/lib/api/client/client';

/**
 * 사용자 로그인
 * @param {LoginRequestType} credentials 로그인 정보
 * @returns {LoginResponseDto} 사용자 정보
 */
export async function loginUserApi(
  credentials: LoginRequestDto
): Promise<LoginResponseDto> {
  const response = await apiPost('/api/user/login', credentials);

  const result =
    await parseApiResponse<ApiResponseType<LoginResponseDto>>(response);

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
export async function registerUserApi(
  userData: RegisterRequestDto
): Promise<RegisterResponseDto> {
  const response = await apiPost('/api/user/register', userData);

  const result =
    await parseApiResponse<ApiResponseType<RegisterResponseDto>>(response);

  if (!result.success || !result.data) {
    throw new Error(result.message || '회원가입에 실패했습니다.');
  }

  return result.data;
}

/**
 * 사용자 로그아웃
 * @returns {void} 로그아웃 결과
 */
export async function logoutUserApi(): Promise<void> {
  const response = await apiPost('/api/user/logout');

  const result = await parseApiResponse<ApiResponseType>(response);

  if (!result.success) {
    throw new Error(result.message || '로그아웃에 실패했습니다.');
  }
}

/**
 * 세션 검증
 * @returns {VerifyResponseDto | null} 사용자 정보 또는 null
 */
export async function verifyUserSessionApi(): Promise<VerifyResponseDto | null> {
  try {
    const response = await apiGet('/api/user/verify');
    const result =
      await parseApiResponse<ApiResponseType<VerifyResponseDto>>(response);

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (_error) {
    // 세션이 유효하지 않은 경우 null 반환
    return null;
  }
}
