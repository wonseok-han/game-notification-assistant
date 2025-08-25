import {
  apiPost,
  apiGet,
  apiPatch,
  apiDelete,
  parseApiResponse,
} from '@utils/api-client';

/**
 * 게임 알림 생성
 * @param {CreateNotificationRequestType} notificationData 알림 데이터
 * @returns {GameNotificationType} 알림 데이터
 */
export async function createNotification(
  notificationData: CreateNotificationRequestType
): Promise<GameNotificationType> {
  try {
    const response = await apiPost('/api/notifications', notificationData);

    const result =
      await parseApiResponse<ApiResponseType<GameNotificationType>>(response);

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
 * @returns {GameNotificationType[]} 알림 목록
 */
export async function getNotifications(): Promise<GameNotificationType[]> {
  try {
    const response = await apiGet('/api/notifications');

    const result =
      await parseApiResponse<ApiResponseType<GameNotificationType[]>>(response);

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
 * @returns {GameNotificationType} 알림 상태 업데이트 결과
 */
export async function updateNotificationStatus(
  id: string,
  status: string
): Promise<GameNotificationType> {
  try {
    const response = await apiPatch(`/api/notifications/${id}`, { status });

    const result =
      await parseApiResponse<ApiResponseType<GameNotificationType>>(response);

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
 * 게임 알림 수정
 * @param {string} id 알림 ID
 * @param {UpdateNotificationRequestType} body 알림 수정 데이터
 * @returns {GameNotificationType} 알림 수정 결과
 */
export async function updateNotification(
  id: string,
  body: UpdateNotificationRequestType
): Promise<GameNotificationType> {
  try {
    const response = await apiPatch(`/api/notifications/${id}`, body);

    const result =
      await parseApiResponse<ApiResponseType<GameNotificationType>>(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 수정에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 수정 오류:', error);
    throw error;
  }
}
