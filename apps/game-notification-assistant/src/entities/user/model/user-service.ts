import type {
  LoginRequestDto,
  RegisterRequestDto,
  LoginResponseDto,
  RegisterResponseDto,
  VerifyResponseDto,
} from './user-dto';
import type { QueryClient } from '@tanstack/react-query';

import {
  loginUserApi,
  registerUserApi,
  logoutUserApi,
  verifyUserSessionApi,
} from '../api/user-api';

export class UserService {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * 사용자 로그인
   * @param credentials 로그인 정보
   * @returns 로그인된 사용자 정보
   * @throws 로그인 실패 시 에러
   */
  async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const user = await loginUserApi(credentials);

      // 캐시에 사용자 정보 저장
      this.queryClient.setQueryData(['user'], user);

      return user;
    } catch (error) {
      // 캐시에서 사용자 정보 제거 (로그인 실패 시)
      this.queryClient.removeQueries({ queryKey: ['user'] });

      // 에러를 다시 던져서 상위에서 처리할 수 있도록
      throw error;
    }
  }

  /**
   * 사용자 회원가입
   * @param userData 회원가입 정보
   * @returns 가입된 사용자 정보
   * @throws 회원가입 실패 시 에러
   */
  async register(userData: RegisterRequestDto): Promise<RegisterResponseDto> {
    try {
      const user = await registerUserApi(userData);

      // 캐시에 사용자 정보 저장
      this.queryClient.setQueryData(['user'], user);

      return user;
    } catch (error) {
      // 회원가입 실패 시 캐시 정리
      this.queryClient.removeQueries({ queryKey: ['user'] });

      throw error;
    }
  }

  /**
   * 사용자 로그아웃
   * @throws 로그아웃 실패 시 에러
   */
  async logout(): Promise<void> {
    try {
      await logoutUserApi();
    } catch (error) {
      // 로그아웃 API 실패해도 캐시는 정리
      console.error('로그아웃 API 실패:', error);
    } finally {
      // 성공/실패 관계없이 캐시에서 사용자 정보 제거
      this.queryClient.removeQueries({ queryKey: ['user'] });
      this.queryClient.clear();
    }
  }

  /**
   * 세션 검증
   * @returns 사용자 정보 또는 null
   */
  async verifySession(): Promise<VerifyResponseDto | null> {
    try {
      const user = await verifyUserSessionApi();

      if (user) {
        // 유효한 세션이면 캐시에 저장
        this.queryClient.setQueryData(['user'], user);
      } else {
        // 유효하지 않은 세션이면 캐시에서 제거
        this.queryClient.removeQueries({ queryKey: ['user'] });
      }

      return user;
    } catch (error) {
      // 세션 검증 실패 시 캐시에서 제거
      this.queryClient.removeQueries({ queryKey: ['user'] });
      console.error('세션 검증 실패:', error);
      return null;
    }
  }

  /**
   * 캐시된 사용자 정보 가져오기
   * @returns 캐시된 사용자 정보 또는 null
   */
  getCachedUser(): VerifyResponseDto | null {
    try {
      return this.queryClient.getQueryData(['user']) || null;
    } catch (error) {
      console.error('캐시된 사용자 정보 조회 실패:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 캐시 무효화
   */
  invalidateUserCache(): void {
    try {
      this.queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      console.error('사용자 캐시 무효화 실패:', error);
    }
  }
}
