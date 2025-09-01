import type { QueryClient } from '@tanstack/react-query';

/**
 * 모든 서비스의 베이스 클래스
 * QueryClient 관리를 중앙화하고 공통 메서드들을 제공
 */
export abstract class BaseService {
  protected queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * 쿼리 캐시 무효화
   * @param queryKey 무효화할 쿼리 키
   */
  protected invalidateQueries(
    queryKey: (string | Record<string, unknown>)[]
  ): void {
    try {
      this.queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error('쿼리 무효화 실패:', error);
    }
  }

  /**
   * 쿼리 캐시에서 모든 데이터 무효화
   * @param queryKey 무효화할 쿼리 키
   */
  protected invalidateAllQueries(
    queryKey: (string | Record<string, unknown>)[]
  ): void {
    try {
      this.queryClient.invalidateQueries({
        queryKey,
        exact: true,
      });
    } catch (error) {
      console.error('쿼리 무효화 실패:', error);
    }
  }

  /**
   * 쿼리 캐시에서 데이터 제거
   * @param queryKey 제거할 쿼리 키
   */
  protected removeQueries(
    queryKey: (string | Record<string, unknown>)[]
  ): void {
    try {
      this.queryClient.removeQueries({ queryKey });
    } catch (error) {
      console.error('쿼리 제거 실패:', error);
    }
  }

  /**
   * 쿼리 캐시에서 모든 데이터 제거
   * @param queryKey 제거할 쿼리 키
   */
  protected removeAllQueries(
    queryKey: (string | Record<string, unknown>)[]
  ): void {
    try {
      this.queryClient.removeQueries({
        queryKey,
        exact: true,
      });
    } catch (error) {
      console.error('쿼리 제거 실패:', error);
    }
  }

  /**
   * 쿼리 캐시에 데이터 설정
   * @param queryKey 설정할 쿼리 키
   * @param data 설정할 데이터
   */
  protected setQueryData<T>(
    queryKey: (string | Record<string, unknown>)[],
    data: T
  ): void {
    try {
      this.queryClient.setQueryData(queryKey, data);
    } catch (error) {
      console.error('쿼리 데이터 설정 실패:', error);
    }
  }

  /**
   * 쿼리 캐시에서 데이터 가져오기
   * @param queryKey 가져올 쿼리 키
   * @returns 캐시된 데이터 또는 null
   */
  protected getQueryData<T>(
    queryKey: (string | Record<string, unknown>)[]
  ): T | null {
    try {
      return this.queryClient.getQueryData(queryKey) || null;
    } catch (error) {
      console.error('쿼리 데이터 조회 실패:', error);
      return null;
    }
  }

  /**
   * 전체 캐시 정리
   */
  protected clearCache(): void {
    try {
      this.queryClient.clear();
    } catch (error) {
      console.error('캐시 정리 실패:', error);
    }
  }

  /**
   * 에러 처리 래퍼
   * @param operation 수행할 작업
   * @param errorMessage 에러 메시지
   * @returns 작업 결과
   */
  protected async handleError<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw error;
    }
  }
}
