'use client';

import { useAuthStore } from '@entities/auth/model/auth-store';
import { UserService } from '@entities/user/model/user-service';
import { ActionButton, useSnackbar } from '@repo/ui';
import { LoadingSpinner } from '@shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignUpForm() {
  const queryClient = useQueryClient();
  const userService = new UserService(queryClient);

  const router = useRouter();

  // ===== 상태 관리 =====
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { showSnackbar } = useSnackbar();

  // ===== Store 사용 =====
  const { setLoading, setUser } = useAuthStore();

  /**
   * 회원가입 폼 제출 핸들러
   * @param event - 이벤트 객체
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let errorMessage;

    // 입력 검증
    if (!email || !username || !password || !confirmPassword) {
      errorMessage = '모든 필드를 입력해주세요.';
    } else if (password !== confirmPassword) {
      errorMessage = '비밀번호가 일치하지 않습니다.';
    } else if (password.length < 6) {
      errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
    } else if (username.length < 2 || username.length > 20) {
      errorMessage = '사용자명은 2자 이상 20자 이하여야 합니다.';
    }

    if (errorMessage) {
      showSnackbar({
        message: errorMessage,
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });

      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const user = await userService.register({ email, password, username });

      // 성공 시 상태 업데이트
      setUser(user);

      showSnackbar({
        message: '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.',
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });

      router.replace('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.';

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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
        <p className="text-gray-600">
          게임 알림 어시스턴트 계정을 만들어보세요
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

        {/* ===== 사용자명 입력 ===== */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="username"
          >
            사용자명
          </label>
          <input
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isLoading}
            id="username"
            maxLength={20}
            minLength={2}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명을 입력하세요"
            type="text"
            value={username}
          />
          <p className="text-xs text-gray-500 mt-1">
            2-20자 사이로 입력해주세요
          </p>
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
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={password}
          />
          <p className="text-xs text-gray-500 mt-1">
            최소 6자 이상 입력해주세요
          </p>
        </div>

        {/* ===== 비밀번호 확인 ===== */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="confirmPassword"
          >
            비밀번호 확인
          </label>
          <input
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isLoading}
            id="confirmPassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            type="password"
            value={confirmPassword}
          />
        </div>

        {/* ===== 회원가입 버튼 ===== */}
        <ActionButton
          className="w-full"
          disabled={isLoading}
          size="lg"
          type="submit"
          variant="success"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner color="white" size="sm" />
              회원가입 중...
            </div>
          ) : (
            '회원가입'
          )}
        </ActionButton>
      </form>
    </div>
  );
}
