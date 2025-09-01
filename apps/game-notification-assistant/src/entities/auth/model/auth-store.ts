import type { AuthStateType } from './auth';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===== 초기 상태 =====
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasHydrated: false,
};

// ===== 인증 Store 생성 =====
export const useAuthStore = create<AuthStateType>()(
  persist(
    (set) => ({
      ...initialState,

      // ===== 액션 함수들 =====

      /**
       * 사용자 정보 설정
       * @param {UserType | null} user - 사용자 정보
       */
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      /**
       * 인증 상태 설정
       * @param {boolean} authenticated - 인증 상태
       */
      setAuthenticated: (authenticated) => {
        set({ isAuthenticated: authenticated });
      },

      /**
       * 로딩 상태 설정
       * @param {boolean} loading - 로딩 상태
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Hydration 상태 설정
       * @param {boolean} hydrated - Hydration 상태
       */
      setHasHydrated: (hydrated) => {
        set({ hasHydrated: hydrated });
      },

      /**
       * 상태 초기화
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
