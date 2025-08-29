// 알림 활성 옵션 타입
export type ActiveOptionType = {
  value: boolean;
  label: string;
  color: string;
  bgColor: string;
};

// 알림 시간 상태 타입
export type NotificationTimeStatusType = 'pending' | 'sent' | 'failed';

export type NotificationTimeType = {
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

// 게임 알림 타입
export type GameNotificationType = {
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

// 알림 시간 수정 타입
export type EditingTimeType = {
  id: string;
  scheduledTime: string;
  isEnabled: boolean;
  rawText?: string;
  label?: string;
};
