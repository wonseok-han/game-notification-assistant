// ===== 게임 알림 관련 타입 정의 =====

/**
 * 게임 알림 상태 타입
 */
type NotificationStatusType = 'pending' | 'active' | 'completed' | 'cancelled';

/**
 * 게임 알림 데이터 타입
 */
type GameNotificationType = {
  id: string;
  title: string;
  description?: string;
  gameName: string;
  gameCategory: GameCategoryType;
  imageUrl: string;
  scheduledTime: Date;
  status: NotificationStatusType;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

/**
 * 게임 알림 생성 요청 타입
 */
type CreateNotificationRequestType = {
  title: string;
  description?: string;
  gameName: string;
  gameCategory: GameCategoryType;
  imageFile: File;
  scheduledTime: Date;
};

/**
 * 게임 알림 수정 요청 타입
 */
type UpdateNotificationRequestType = {
  id: string;
  title?: string;
  description?: string;
  gameName?: string;
  gameCategory?: GameCategoryType;
  scheduledTime?: Date;
};

/**
 * 게임 알림 필터 타입
 */
type NotificationFilterType = {
  gameCategory?: GameCategoryType;
  status?: NotificationStatusType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
};

/**
 * 카카오톡 알림 설정 타입
 */
type KakaoNotificationSettingsType = {
  isEnabled: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId?: string;
  nickname?: string;
};

/**
 * 사용자 설정 타입
 */
type UserSettingsType = {
  id: string;
  kakaoNotification: KakaoNotificationSettingsType;
  timezone: string;
  language: 'ko' | 'en';
  theme: 'light' | 'dark' | 'auto';
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 이미지 업로드 응답 타입
 */
type ImageUploadResponseType = {
  imageUrl: string;
  imageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

/**
 * 알림 전송 결과 타입
 */
type NotificationSendResultType = {
  success: boolean;
  messageId?: string;
  sentAt: Date;
  error?: string;
  retryCount: number;
};
