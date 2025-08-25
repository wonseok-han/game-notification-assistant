/**
 * 게임 알림 상태 타입
 */
type NotificationTimeStatusType = 'pending' | 'sent' | 'failed';

// ===== 알림 시간 타입 =====
type NotificationTimeType = {
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
};

// ===== 게임 알림 타입 =====
type GameNotificationType = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  game_name: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  notification_times?: NotificationTimeType[];
};

// ===== 게임 알림 생성 요청 타입 =====
type CreateNotificationRequestType = {
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

// ===== 알림 수정 요청 타입 =====
type UpdateNotificationRequest = Partial<{
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
