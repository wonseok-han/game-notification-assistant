import type {
  CreateNotificationRequestDto,
  CreateNotificationResponseDto,
  GetNotificationResponseDto,
  GetNotificationsResponseDto,
  GoogleVisionResponseDto,
  GetNotificationsRequestDto,
  UpdateNotificationActiveResponseDto,
  UpdateNotificationRequestDto,
  UpdateNotificationResponseDto,
} from '../model/notification-dto';

import {
  apiPost,
  apiGet,
  apiPatch,
  apiDelete,
  parseApiResponse,
} from '@shared/lib/api/client/client';

/**
 * 게임 알림 생성
 * @param {CreateNotificationRequestDto} notificationData 알림 데이터
 * @returns {CreateNotificationResponseDto} 알림 데이터
 */
export async function createNotificationApi(
  notificationData: CreateNotificationRequestDto
): Promise<CreateNotificationResponseDto> {
  try {
    const response = await apiPost('/api/notifications', notificationData);

    const result =
      await parseApiResponse<ApiResponseType<CreateNotificationResponseDto>>(
        response
      );

    console.log('이거 타는거 아니야?', result);
    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 생성에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 생성 오류:', error);
    throw error;
  }
}

/**
 * 게임 알림 목록 조회
 * @param {GetNotificationsRequestDto} filters 필터 조건
 * @returns {GetNotificationsResponseDto[]} 알림 목록
 */
export async function getNotificationsApi(
  filters?: GetNotificationsRequestDto
): Promise<GetNotificationsResponseDto[]> {
  try {
    // 쿼리 파라미터 생성
    const queryParams = new URLSearchParams();

    if (filters?.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }

    if (filters?.search) {
      queryParams.append('search', filters.search);
    }

    if (filters?.page) {
      queryParams.append('page', filters.page.toString());
    }

    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    const url = queryParams.toString()
      ? `/api/notifications?${queryParams.toString()}`
      : '/api/notifications';

    const response = await apiGet(url);

    const result =
      await parseApiResponse<ApiResponseType<GetNotificationsResponseDto[]>>(
        response
      );

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 목록을 가져올 수 없습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 목록 조회 오류:', error);
    throw error;
  }
}

export async function getNotificationApi(
  id: string
): Promise<GetNotificationResponseDto> {
  try {
    const response = await apiGet(`/api/notifications/${id}`);
    const result =
      await parseApiResponse<ApiResponseType<GetNotificationResponseDto>>(
        response
      );

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 정보를 가져올 수 없습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 상세 조회 오류:', error);
    throw error;
  }
}

/**
 * 게임 알림 수정
 * @param {string} id 알림 ID
 * @param {UpdateNotificationRequestDto} body 알림 수정 데이터
 * @returns {UpdateNotificationResponseDto} 알림 수정 결과
 */
export async function updateNotificationApi(
  id: string,
  body: UpdateNotificationRequestDto
): Promise<UpdateNotificationResponseDto> {
  try {
    const response = await apiPatch(`/api/notifications/${id}`, body);

    const result =
      await parseApiResponse<ApiResponseType<UpdateNotificationResponseDto>>(
        response
      );

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 수정에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 수정 오류:', error);
    throw error;
  }
}

/**
 * 게임 알림 삭제
 * @param {string} id 알림 ID
 * @returns {ApiResponseType} 알림 삭제 결과
 */
export async function deleteNotificationApi(
  id: string
): Promise<ApiResponseType> {
  try {
    const response = await apiDelete(`/api/notifications/${id}`);

    const result = await parseApiResponse<ApiResponseType>(response);

    if (!result.success) {
      throw new Error(result.message || '알림 삭제에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('알림 삭제 오류:', error);
    throw error;
  }
}

/**
 * 게임 알림 활성 상태 업데이트
 * @param {string} id 알림 ID
 * @param {boolean} isActive 알림 상태
 * @returns {UpdateNotificationActiveResponseDto} 알림 상태 업데이트 결과
 */
export async function updateNotificationActiveApi(
  id: string,
  isActive: boolean
): Promise<UpdateNotificationActiveResponseDto> {
  try {
    const response = await apiPatch(`/api/notifications/${id}`, {
      is_active: isActive,
    });

    const result =
      await parseApiResponse<
        ApiResponseType<UpdateNotificationActiveResponseDto>
      >(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 상태 업데이트에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 상태 업데이트 오류:', error);
    throw error;
  }
}

/**
 * Google Vision API 호출
 * @param image - 이미지 데이터
 * @returns {GoogleVisionResponseDto} Google Vision API 응답 데이터
 */
export async function googleVisionApi(
  image: string
): Promise<GoogleVisionResponseDto> {
  try {
    const response = await apiPost('/api/ocr/google-vision', { image });

    const result =
      await parseApiResponse<ApiResponseType<GoogleVisionResponseDto>>(
        response
      );

    if (!result.success || !result.data) {
      throw new Error(
        result.message || 'Google Vision API 호출에 실패했습니다.'
      );
    }

    return result.data;
  } catch (error) {
    console.error('Google Vision API 호출 오류:', error);
    throw error;
  }
}
