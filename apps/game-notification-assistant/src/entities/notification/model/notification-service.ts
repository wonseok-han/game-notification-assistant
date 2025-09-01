import type {
  NotificationCreateFormType,
  NotificationEditFormType,
  NotificationListType,
} from './notificaion';
import type {
  GetNotificationsResponseDto,
  GoogleVisionResponseDto,
} from './notification-dto';

import { BaseService } from '@shared/lib/api/client/base-service';

import {
  createNotificationApi,
  getNotificationsApi,
  updateNotificationApi,
  deleteNotificationApi,
  updateNotificationActiveApi,
  googleVisionApi,
} from '../api/notification-api';

export class NotificationService extends BaseService {
  /**
   * 알림 생성
   * @param form 알림 데이터
   * @returns 알림 데이터
   */
  async create(
    form: NotificationCreateFormType
  ): Promise<NotificationCreateFormType> {
    try {
      const response = await createNotificationApi({
        title: form.title,
        description: form.description,
        game_name: form.gameName,
        image_url: form.imageUrl,
        notification_times: form.notificationTimes?.map((time) => ({
          scheduled_time: new Date(time.scheduledTime).toISOString(),
          is_enabled: time.isEnabled,
          raw_text: time.rawText,
          label: time.label,
        })),
      });

      // 알림 목록 캐시 무효화 (새 알림이 추가되었으므로)
      this.invalidateQueries(['notifications']);

      return {
        id: response.id,
        title: response.title,
        description: response.description,
        gameName: response.game_name,
        imageUrl: response.image_url,
        notificationTimes: response.notification_times.map((time) => ({
          id: time.id,
          notificationId: time.notification_id,
          scheduledTime: new Date(time.scheduled_time),
          status: time.status,
          isEnabled: time.is_enabled,
          rawText: time.raw_text,
          label: time.label,
        })),
      };
    } catch (error) {
      console.error('알림 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 목록 조회
   * @returns 알림 목록
   */
  async getNotifications(): Promise<NotificationListType> {
    try {
      const notifications = await getNotificationsApi();

      return notifications.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        gameName: item.game_name,
        imageUrl: item.image_url,
        isActive: item.is_active,
        notificationTimes: item.notification_times?.map((time) => ({
          id: time.id,
          notificationId: time.notification_id,
          scheduledTime: new Date(time.scheduled_time),
          status: time.status,
          isEnabled: time.is_enabled,
          rawText: time.raw_text || '',
          label: time.label || '',
        })),
      }));
    } catch (error) {
      // 조회 실패 시 캐시에서 제거
      this.removeQueries(['notifications']);
      console.error('알림 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 수정
   * @param id 알림 ID
   * @param form 수정할 알림 데이터
   * @returns 수정된 알림 데이터
   */
  async update(
    id: string,
    form: NotificationEditFormType
  ): Promise<NotificationEditFormType> {
    try {
      const response = await updateNotificationApi(id, {
        id: form.id,
        title: form.title,
        description: form.description,
        game_name: form.gameName,
        image_url: form.imageUrl,
        is_active: form.isActive,
        notification_times: form.notificationTimes.map((time) => ({
          id: time.id,
          notification_id: time.notificationId,
          scheduled_time: new Date(time.scheduledTime).toISOString(),
          is_enabled: time.isEnabled,
          raw_text: time.rawText,
          label: time.label,
        })),
      });

      // 알림 목록 캐시 무효화 (알림이 수정되었으므로)
      this.invalidateQueries(['notifications']);

      return {
        id: response.id,
        title: response.title,
        description: response.description,
        gameName: response.game_name,
        imageUrl: response.image_url,
        isActive: response.is_active,
        notificationTimes: response.notification_times.map((time) => ({
          id: time.id,
          notificationId: time.notification_id,
          scheduledTime: new Date(time.scheduled_time),
          status: time.status,
          isEnabled: time.is_enabled,
          rawText: time.raw_text,
          label: time.label,
        })),
      };
    } catch (error) {
      console.error('알림 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 삭제
   * @param id 알림 ID
   */
  async delete(id: string): Promise<ApiResponseType> {
    try {
      const response = await deleteNotificationApi(id);

      // 알림 목록 캐시 무효화 (알림이 삭제되었으므로)
      this.invalidateQueries(['notifications']);

      return response;
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 활성 상태 업데이트
   * @param id 알림 ID
   * @param isActive 활성 상태
   * @returns 업데이트된 알림 데이터
   */
  async updateActive(
    id: string,
    isActive: boolean
  ): Promise<NotificationEditFormType> {
    try {
      const response = await updateNotificationActiveApi(id, isActive);

      // 알림 목록 캐시 무효화 (상태가 변경되었으므로)
      this.invalidateQueries(['notifications']);

      return {
        id: response.id,
        title: response.title,
        description: response.description,
        gameName: response.game_name,
        imageUrl: response.image_url,
        isActive: response.is_active,
        notificationTimes: response.notification_times.map((time) => ({
          id: time.id,
          notificationId: time.notification_id,
          scheduledTime: new Date(time.scheduled_time),
          status: time.status,
          isEnabled: time.is_enabled,
          rawText: time.raw_text,
          label: time.label,
        })),
      };
    } catch (error) {
      console.error('알림 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * Google Vision API 호출
   * @param image 이미지 데이터
   * @returns Google Vision API 응답 데이터
   */
  async googleVision(image: string): Promise<GoogleVisionResponseDto> {
    try {
      const response = await googleVisionApi(image);
      return response;
    } catch (error) {
      console.error('Google Vision API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 캐시된 알림 목록 가져오기
   * @returns 캐시된 알림 목록 또는 null
   */
  getCachedNotifications(): GetNotificationsResponseDto[] | null {
    return this.getQueryData(['notifications']);
  }

  /**
   * 알림 목록 캐시 무효화
   */
  invalidateNotificationsCache(): void {
    this.invalidateQueries(['notifications']);
  }
}
