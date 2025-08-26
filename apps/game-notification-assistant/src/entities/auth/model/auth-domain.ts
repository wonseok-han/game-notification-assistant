// 인증 상태 타입
export interface AuthStateType {
  // 상태
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  // 액션
  setUser: (user: UserType | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;

  // 상태 초기화
  reset: () => void;
}

// 사용자 정보 타입
export type UserType = {
  id: string;
  email: string;
  username: string;
};
