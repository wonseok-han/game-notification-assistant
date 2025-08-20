'use client';

import { useAuthStore } from '@store';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { hasHydrated, user } = useAuthStore();

  // 로그인 후 대시보드로 이동
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // 로그인 페이지로 이동
  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  // 회원가입 페이지로 이동
  const handleGoToRegister = () => {
    router.push('/auth/register');
  };

  // 로딩 중
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🎮 게임 알림 어시스턴트
              </h1>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  안녕하세요, {user.username}님!
                </span>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={handleGoToDashboard}
                >
                  대시보드로 이동
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={handleGoToLogin}
                >
                  로그인
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={handleGoToRegister}
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            게임 알림을 스마트하게
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            게임에서 중요한 순간을 놓치지 마세요. 이미지를 캡처하고 원하는
            시간에 카카오톡으로 알림을 받아보세요.
          </p>

          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                이미 로그인되어 있습니다. 게임 알림을 관리하려면 대시보드로
                이동하세요.
              </p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-lg"
                onClick={handleGoToDashboard}
              >
                🚀 대시보드로 이동
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                게임 알림을 시작하려면 계정을 만들어주세요.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-lg"
                  onClick={handleGoToLogin}
                >
                  🔑 로그인
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-lg"
                  onClick={handleGoToRegister}
                >
                  ✨ 회원가입
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 기능 소개 */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                스마트 알림 설정
              </h3>
              <p className="text-gray-600">
                원하는 시간에 맞춰 알림을 설정하고 일정을 관리하세요.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                카카오톡 연동
              </h3>
              <p className="text-gray-600">
                카카오톡으로 즉시 알림을 받아 중요한 순간을 놓치지 마세요.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 게임 알림 어시스턴트.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
