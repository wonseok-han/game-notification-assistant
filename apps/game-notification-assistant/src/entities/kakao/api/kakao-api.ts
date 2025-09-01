import type {
  KakaoAuthResponseDto,
  KakaoStatusResponseDto,
} from '../model/kakao-dto';

import {
  apiGet,
  apiPost,
  parseApiResponse,
} from '@shared/lib/api/client/client';

/**
 * 카카오 연결 상태 조회
 * @returns {KakaoStatusResponseDto} 카카오 연결 상태
 */
export async function statusApi(): Promise<KakaoStatusResponseDto> {
  try {
    const response = await apiPost('/api/kakao/status');

    const result =
      await parseApiResponse<ApiResponseType<KakaoStatusResponseDto>>(response);

    if (!result.success || !result.data) {
      throw new Error(
        result.message || '카카오 연결 상태 조회에 실패했습니다.'
      );
    }

    return result.data;
  } catch (error) {
    console.error('알림 생성 오류:', error);
    throw error;
  }
}

/**
 * 카카오 인증
 * @returns {KakaoAuthResponseDto} 카카오 인증 정보
 */
export async function authApi(): Promise<KakaoAuthResponseDto> {
  try {
    const response = await apiGet('/api/kakao/auth');

    const result =
      await parseApiResponse<ApiResponseType<KakaoAuthResponseDto>>(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '카카오 인증에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('카카오 인증 오류:', error);
    throw error;
  }
}

/**
 * 카카오 연결 해제
 * @returns {void} 연결 해제 결과
 */
export async function disconnectApi(): Promise<void> {
  try {
    const response = await apiPost('/api/kakao/disconnect');

    const result = await parseApiResponse<ApiResponseType<void>>(response);

    if (!result.success) {
      throw new Error(result.message || '카카오 연결 해제에 실패했습니다.');
    }
  } catch (error) {
    console.error('카카오 연결 해제 오류:', error);
    throw error;
  }
}
