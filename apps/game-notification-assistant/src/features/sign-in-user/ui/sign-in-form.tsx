'use client';

import { useAuthStore } from '@entities/auth/model/auth-store';
import { UserService } from '@entities/user/model/user-service';
import { ActionButton, useSnackbar } from '@repo/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignInForm() {
  const queryClient = useQueryClient();
  const userService = new UserService(queryClient);

  const router = useRouter();
  // ===== 상태 관리 =====
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ===== Store 사용 =====
  const { setLoading, setUser } = useAuthStore();

  const { showSnackbar } = useSnackbar();

  /**
   * 로그인 폼 제출 핸들러
   * @param event - 이벤트 객체
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      showSnackbar({
        message: '이메일과 비밀번호를 입력해주세요.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const user = await userService.login({ email, password });

      // 성공 시 상태 업데이트
      setUser(user);

      router.replace('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.';

      showSnackbar({
        message: errorMessage,
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
        <p className="text-gray-600">
          게임 알림 어시스턴트에 오신 것을 환영합니다
        </p>
      </div>

      <form noValidate className="space-y-6" onSubmit={handleSubmit}>
        {/* ===== 이메일 입력 ===== */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="email"
          >
            이메일
          </label>
          <input
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isLoading}
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            type="email"
            value={email}
          />
        </div>

        {/* ===== 비밀번호 입력 ===== */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isLoading}
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={password}
          />
        </div>

        {/* ===== 로그인 버튼 ===== */}
        <ActionButton
          className="w-full"
          disabled={isLoading}
          size="lg"
          type="submit"
          variant="primary"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              로그인 중...
            </div>
          ) : (
            '로그인'
          )}
        </ActionButton>
      </form>
    </div>
  );
}
