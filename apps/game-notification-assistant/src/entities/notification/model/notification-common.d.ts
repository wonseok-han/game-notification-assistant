/**
 * 알림 활성 옵션 타입
 */
export type ActiveOptionType = {
  value: boolean;
  label: string;
  color: string;
  bgColor: string;
};

/**
 * 알림 시간 상태 타입
 */
export type NotificationTimeStatusType = 'pending' | 'sent' | 'failed';
