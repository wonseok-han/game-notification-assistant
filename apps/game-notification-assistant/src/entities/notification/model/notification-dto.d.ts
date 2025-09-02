import type { NotificationTimeStatusType } from './notification-common';

// ===== Request DTOs =====

/**
 * 알림 목록 조회 요청 타입
 */
export type GetNotificationsRequestDto = {
  /** 활성 상태 필터 ('all' | 'true' | 'false') */
  status?: 'all' | 'true' | 'false';
  /** 검색어 (제목, 게임명, 설명에서 검색) */
  search?: string;
  /** 페이지 번호 (페이징 지원) */
  page?: number;
  /** 페이지당 항목 수 (페이징 지원) */
  limit?: number;
};

/**
 * 알림 생성 요청 타입
 */
export type CreateNotificationRequestDto = {
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  notification_times?: {
    scheduled_time: string;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
  }[];
};

/**
 * 알림 수정 요청 타입
 */
export type UpdateNotificationRequestDto = {
  id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  notification_times: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
  }[];
};

/**
 * 알림 활성 상태 업데이트 요청 타입
 */
export type UpdateNotificationActiveRequestDto = {
  id: string;
  is_active: boolean;
};

// ===== Response DTOs =====

/**
 * 알림 목록 조회 응답 타입
 */
export type GetNotificationsResponseDto = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: NotificationTimeStatusType;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

/**
 * 알림 상세 조회 응답 타입
 */
export type GetNotificationResponseDto = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: NotificationTimeStatusType;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

/**
 * 알림 생성 응답 타입
 */
export type CreateNotificationResponseDto = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: NotificationTimeStatusType;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

/**
 * 알림 수정 응답 타입
 */
export type UpdateNotificationResponseDto = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: NotificationTimeStatusType;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

/**
 * 알림 활성 상태 업데이트 응답 타입
 */
export type UpdateNotificationActiveResponseDto = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: NotificationTimeStatusType;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

/**
 * Google Vision API 응답 타입
 */
export type GoogleVisionResponseDto = {
  text: string;
  individualTexts: { text: string }[];
};
