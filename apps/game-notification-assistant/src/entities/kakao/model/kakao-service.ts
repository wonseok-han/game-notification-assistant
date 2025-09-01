import type { KakaoAuthResponseDto, KakaoStatusResponseDto } from './kakao-dto';
import type { QueryClient } from '@tanstack/react-query';

import { authApi, disconnectApi, statusApi } from '../api/kakao-api';

export class KakaoService {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * 카카오 연결 상태 조회
   * @returns 카카오 연결 정보
   */
  async status(): Promise<KakaoStatusResponseDto> {
    try {
      const response = await statusApi();
      return response;
    } catch (error) {
      console.error('카카오 연결 상태 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 카카오 인증
   * @returns 카카오 인증 정보
   */
  async auth(): Promise<KakaoAuthResponseDto> {
    try {
      const response = await authApi();
      return response;
    } catch (error) {
      console.error('카카오 인증 실패:', error);
      throw error;
    }
  }

  /**
   * 카카오 연결 해제
   * @returns void
   */
  async disconnect(): Promise<void> {
    try {
      const response = await disconnectApi();
      return response;
    } catch (error) {
      console.error('카카오 연결 해제 실패:', error);
      throw error;
    }
  }
}
