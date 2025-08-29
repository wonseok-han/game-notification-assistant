import type {
  NotificationCreateFormType,
  NotificationEditFormType,
  NotificationListType,
} from './notificaion-domain';
import type {
  CreateNotificationRequestDto,
  CreateNotificationResponseDto,
  GetNotificationsResponseDto,
  UpdateNotificationActiveResponseDto,
  UpdateNotificationRequestDto,
  UpdateNotificationResponseDto,
} from './notification-dto';

// ===== Get List =====

/**
 * Get List DTO를 List 도메인 타입으로 변환
 * @param dto - DTO 데이터
 * @returns 도메인 타입 데이터
 */
export function notificationsDtoToList(
  dto: GetNotificationsResponseDto[]
): NotificationListType {
  return dto.map((item) => ({
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
}

// ===== Create =====

/**
 * Create Form 도메인 타입을 Create DTO 타입으로 변환
 * @param form - 도메인 타입 데이터
 * @returns DTO 타입 데이터
 */
export function notificationCreateFormToDto(
  form: NotificationCreateFormType
): CreateNotificationRequestDto {
  return {
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
  };
}

/**
 * Create DTO를 Create 도메인 타입으로 변환
 * @param dto - DTO 데이터
 * @returns 도메인 타입 데이터
 */
export function notificationDtoToCreate(
  dto: CreateNotificationResponseDto
): NotificationCreateFormType {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    gameName: dto.game_name,
    imageUrl: dto.image_url,
    notificationTimes: dto.notification_times?.map((time) => ({
      id: time.id,
      notificationId: time.notification_id,
      scheduledTime: new Date(time.scheduled_time),
      status: time.status,
      isEnabled: time.is_enabled,
      rawText: time.raw_text,
      label: time.label,
    })),
  };
}

// ===== Update =====

/**
 * Update Form 도메인 타입을 Update DTO 타입으로 변환
 * @param form - 도메인 타입 데이터
 * @returns DTO 타입 데이터
 */
export function notificationUpdateFormToDto(
  form: NotificationEditFormType
): UpdateNotificationRequestDto {
  return {
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
  };
}

/**
 * Update DTO를 Edit 도메인 타입으로 변환
 * @param dto - DTO 데이터
 * @returns 도메인 타입 데이터
 */
export function notificationDtoToUpdate(
  dto: UpdateNotificationResponseDto
): NotificationEditFormType {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    gameName: dto.game_name,
    imageUrl: dto.image_url,
    isActive: dto.is_active,
    notificationTimes: dto.notification_times.map((time) => ({
      id: time.id,
      notificationId: time.notification_id,
      scheduledTime: new Date(time.scheduled_time),
      status: time.status,
      isEnabled: time.is_enabled,
      rawText: time.raw_text,
      label: time.label,
    })),
  };
}

/**
 * Update Active DTO를 Update Active 도메인 타입으로 변환
 * @param dto - DTO 데이터
 * @returns 도메인 타입 데이터
 */
export function notificationDtoToUpdateActive(
  dto: UpdateNotificationActiveResponseDto
): NotificationEditFormType {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    gameName: dto.game_name,
    imageUrl: dto.image_url,
    isActive: dto.is_active,
    notificationTimes: dto.notification_times?.map((time) => ({
      id: time.id,
      notificationId: time.notification_id,
      scheduledTime: new Date(time.scheduled_time),
      status: time.status,
      isEnabled: time.is_enabled,
      rawText: time.raw_text,
      label: time.label,
    })),
  };
}
