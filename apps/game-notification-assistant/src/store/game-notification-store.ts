import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===== 게임 알림 Store 상태 인터페이스 =====
interface GameNotificationState {
  // 상태
  notifications: GameNotificationType[];
  isLoading: boolean;
  error: string | null;
  selectedNotification: GameNotificationType | null;
  filter: NotificationFilterType;
  hasHydrated: boolean;

  // 액션
  setNotifications: (notifications: GameNotificationType[]) => void;
  addNotification: (notification: GameNotificationType) => void;
  updateNotification: (
    id: string,
    updates: Partial<GameNotificationType>
  ) => void;
  deleteNotification: (id: string) => void;
  setSelectedNotification: (notification: GameNotificationType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<NotificationFilterType>) => void;
  clearFilter: () => void;
  updateNotificationStatus: (
    id: string,
    status: NotificationStatusType
  ) => void;
  getNotificationsByGame: (gameName: string) => GameNotificationType[];
  getNotificationsByCategory: (category: string) => GameNotificationType[];
  getUpcomingNotifications: (hours: number) => GameNotificationType[];
  setHasHydrated: (hydrated: boolean) => void;
}

// ===== 초기 상태 =====
const initialState = {
  notifications: [],
  isLoading: false,
  error: null,
  selectedNotification: null,
  filter: {},
  hasHydrated: false,
};

// ===== 게임 알림 Store 생성 =====
export const useGameNotificationStore = create<GameNotificationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== 액션 함수들 =====

      /**
       * 알림 목록 설정
       */
      setNotifications: (notifications) => {
        set({ notifications });
      },

      /**
       * 새 알림 추가
       */
      addNotification: (notification) => {
        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
      },

      /**
       * 알림 수정
       */
      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, ...updates, updatedAt: new Date() }
              : notification
          ),
        }));
      },

      /**
       * 알림 삭제
       */
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
          selectedNotification:
            state.selectedNotification?.id === id
              ? null
              : state.selectedNotification,
        }));
      },

      /**
       * 선택된 알림 설정
       */
      setSelectedNotification: (notification) => {
        set({ selectedNotification: notification });
      },

      /**
       * 로딩 상태 설정
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * 에러 상태 설정
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * 필터 설정
       */
      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      /**
       * 필터 초기화
       */
      clearFilter: () => {
        set({ filter: {} });
      },

      /**
       * 알림 상태 업데이트
       */
      updateNotificationStatus: (id, status) => {
        get().updateNotification(id, { status });
      },

      /**
       * 게임별 알림 조회
       */
      getNotificationsByGame: (gameName) => {
        const { notifications } = get();
        return notifications.filter((notification) =>
          notification.gameName.toLowerCase().includes(gameName.toLowerCase())
        );
      },

      /**
       * 카테고리별 알림 조회
       */
      getNotificationsByCategory: (category) => {
        const { notifications } = get();
        return notifications.filter(
          (notification) => notification.gameCategory === category
        );
      },

      /**
       * 예정된 알림 조회 (지정된 시간 내)
       */
      getUpcomingNotifications: (hours) => {
        const { notifications } = get();
        const now = new Date();
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

        return notifications
          .filter(
            (notification) =>
              notification.status === 'pending' &&
              notification.scheduledTime > now &&
              notification.scheduledTime <= futureTime
          )
          .sort(
            (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
          );
      },

      /**
       * Hydration 상태 설정
       */
      setHasHydrated: (hydrated) => {
        set({ hasHydrated: hydrated });
      },
    }),
    {
      name: 'game-notification-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
