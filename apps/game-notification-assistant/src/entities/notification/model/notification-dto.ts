// ===== Request DTOs =====

// 게임 알림 생성 요청 타입
export type CreateNotificationRequestDto = {
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
};

// 알림 수정 요청 타입
export type UpdateNotificationRequestDto = Partial<{
  title: string;
  description: string;
  gameName: string;
  imageUrl: string;
  is_active: boolean;
  notificationTimes?: Array<{
    id?: string;
    scheduledTime: string;
    isEnabled: boolean;
    rawText?: string;
    label?: string;
  }>;
}>;

// ===== Response DTOs =====

// 게임 알림 조회 응답 타입
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
  notification_times?: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: 'pending' | 'sent' | 'failed';
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

// 게임 알림 생성 응답 타입
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
  notification_times?: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: 'pending' | 'sent' | 'failed';
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

// 게임 알림 수정 응답 타입
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
  notification_times?: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: 'pending' | 'sent' | 'failed';
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

// 게임 알림 상태 업데이트 응답 타입
export type UpdateNotificationStatusResponseDto = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times?: {
    id: string;
    notification_id: string;
    scheduled_time: string;
    status: 'pending' | 'sent' | 'failed';
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
    sent_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
  }[];
};

// Google Vision API 응답 타입
export type GoogleVisionResponseDto = {
  text: string;
  individualTexts: { text: string }[];
};
