import { apiFetch, createApiUrl, parseApiResponse } from '@utils/api-client';

// ===== 게임 알림 생성 요청 타입 =====
export interface CreateNotificationRequest {
  title: string;
  description?: string;
  gameName: string;
  imageUrl: string;
  notificationTimes?: Array<{
    scheduledTime: string;
    isEnabled: boolean;
    rawText?: string;
    label?: string;
  }>;
}

// ===== 알림 시간 타입 =====
export interface NotificationTime {
  id: string;
  notification_id: string;
  scheduled_time: string;
  status: string;
  is_enabled: boolean;
  raw_text?: string;
  label?: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// ===== 게임 알림 타입 =====
export interface GameNotification {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  scheduled_time: string;
  status: string;
  created_at: string;
  updated_at: string;
  notification_times?: NotificationTime[];
}

// ===== 알림 수정 요청 타입 =====
export type UpdateNotificationRequest = Partial<{
  title: string;
  description: string;
  gameName: string;
  imageUrl: string;
  status: string;
  notificationTimes?: Array<{
    id?: string;
    scheduledTime: string;
    isEnabled: boolean;
    rawText?: string;
    label?: string;
  }>;
}>;

// ===== 게임 알림 생성 =====
export async function createNotification(
  notificationData: CreateNotificationRequest
): Promise<GameNotification> {
  try {
    const url = createApiUrl('/api/notifications');
    const response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });

    const result =
      await parseApiResponse<ApiResponseType<GameNotification>>(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 생성에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 생성 오류:', error);
    throw error;
  }
}

// ===== 게임 알림 목록 조회 =====
export async function getNotifications(): Promise<GameNotification[]> {
  try {
    const url = createApiUrl('/api/notifications');
    const response = await apiFetch(url, {
      method: 'GET',
    });

    const result =
      await parseApiResponse<ApiResponseType<GameNotification[]>>(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 목록을 가져올 수 없습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 목록 조회 오류:', error);
    throw error;
  }
}

// ===== 게임 알림 삭제 =====
export async function deleteNotification(id: string): Promise<ApiResponseType> {
  try {
    const url = createApiUrl(`/api/notifications/${id}`);
    const response = await apiFetch(url, {
      method: 'DELETE',
    });

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

// ===== 게임 알림 상태 업데이트 =====
export async function updateNotificationStatus(
  id: string,
  status: string
): Promise<GameNotification> {
  try {
    const url = createApiUrl(`/api/notifications/${id}`);
    const response = await apiFetch(url, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    const result =
      await parseApiResponse<ApiResponseType<GameNotification>>(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 상태 업데이트에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 상태 업데이트 오류:', error);
    throw error;
  }
}

// ===== 게임 알림 수정 =====
export async function updateNotification(
  id: string,
  body: UpdateNotificationRequest
): Promise<GameNotification> {
  try {
    const url = createApiUrl(`/api/notifications/${id}`);
    const response = await apiFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    const result =
      await parseApiResponse<ApiResponseType<GameNotification>>(response);

    if (!result.success || !result.data) {
      throw new Error(result.message || '알림 수정에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('알림 수정 오류:', error);
    throw error;
  }
}
