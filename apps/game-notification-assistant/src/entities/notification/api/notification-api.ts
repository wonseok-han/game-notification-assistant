import type {
  CreateNotificationRequestDto,
  CreateNotificationResponseDto,
  GetNotificationsResponseDto,
  GoogleVisionResponseDto,
  UpdateNotificationRequestDto,
  UpdateNotificationResponseDto,
  UpdateNotificationStatusResponseDto,
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
 * @param {CreateNotificationRequestType} notificationData 알림 데이터
 * @returns {CreateNotificationResponseDto} 알림 데이터
 */
export async function createNotification(
  notificationData: CreateNotificationRequestDto
): Promise<CreateNotificationResponseDto> {
  try {
    const response = await apiPost('/api/notifications', notificationData);

    const result =
      await parseApiResponse<ApiResponseType<CreateNotificationResponseDto>>(
        response
      );

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
 * @returns {GetNotificationsResponseDto[]} 알림 목록
 */
export async function getNotifications(): Promise<
  GetNotificationsResponseDto[]
> {
  try {
    const response = await apiGet('/api/notifications');

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

/**
 * 게임 알림 수정
 * @param {string} id 알림 ID
 * @param {UpdateNotificationRequestDto} body 알림 수정 데이터
 * @returns {UpdateNotificationResponseDto} 알림 수정 결과
 */
export async function updateNotification(
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
export async function deleteNotification(id: string): Promise<ApiResponseType> {
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
 * 게임 알림 상태 업데이트
 * @param {string} id 알림 ID
 * @param {string} status 알림 상태
 * @returns {UpdateNotificationStatusResponseDto} 알림 상태 업데이트 결과
 */
export async function updateNotificationStatus(
  id: string,
  status: string
): Promise<UpdateNotificationStatusResponseDto> {
  try {
    const response = await apiPatch(`/api/notifications/${id}`, { status });

    const result =
      await parseApiResponse<
        ApiResponseType<UpdateNotificationStatusResponseDto>
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
export async function googleVision(
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
