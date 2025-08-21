'use client';

import {
  KakaoConnection,
  NotificationForm,
  NotificationList,
} from '@components';
import { ActionButton } from '@repo/ui';
import { logoutUser } from '@services/auth';

import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🎮 게임 알림 어시스턴트
              </h1>
            </div>

            {/* 사용자 프로필 및 로그아웃 */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                안녕하세요, {user?.username || '사용자'}님!
              </span>
              <ActionButton
                onClick={async () => {
                  try {
                    // 로그아웃 API 호출
                    await logoutUser();
                  } catch (error) {
                    console.error('로그아웃 오류:', error);
                  } finally {
                    // 홈페이지로 이동
                    useAuthStore.getState().reset();
                    window.location.href = '/';
                  }
                }}
                size="lg"
                variant="danger"
              >
                로그아웃
              </ActionButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            게임 알림 관리
          </h2>
          <p className="text-gray-600">게임 알림을 설정하고 관리하세요.</p>
        </div>

        {/* 카카오톡 연결 상태 */}
        <div className="mb-8">
          <KakaoConnection />
        </div>

        {/* 알림 등록 폼 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              새 알림 등록
            </h2>
            <NotificationForm />
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            등록된 알림 목록
          </h2>
          <NotificationList />
        </div>
      </div>
    </div>
  );
}
