/**
 * 알림 시간 도메인 기본 타입
 */
export type NotificationTimeBaseType = {
  id?: string;
  notificationId?: string;
  scheduledTime: Date;
  status?: NotificationTimeStatusType;
  isEnabled: boolean;
  rawText?: string;
  label?: string;
};

/**
 * 알림 도메인 기본 타입
 */
export type NotificationBaseType = {
  id?: string;
  title: string;
  description?: string;
  gameName: string;
  imageUrl: string;
  isActive?: boolean;
  notificationTimes?: NotificationTimeBaseType[];
};

/**
 * 알림 목록 도메인 타입
 */
export interface NotificationViewType extends NotificationBaseType {
  id: string;
  isActive: boolean;
  notificationTimes: (NotificationTimeBaseType & {
    id: string;
    notificationId: string;
    status: NotificationTimeStatusType;
  })[];
}
export type NotificationListType = NotificationViewType[];

/**
 * 알림 생성 폼 도메인 타입
 */
export type NotificationCreateFormType = NotificationBaseType;

/**
 * 알림 수정 폼 도메인 타입
 */
export interface NotificationEditFormType extends NotificationBaseType {
  id: string;
  isActive: boolean;
  notificationTimes: (NotificationTimeBaseType & {
    id: string;
    notificationId: string;
    status: NotificationTimeStatusType;
  })[];
}
