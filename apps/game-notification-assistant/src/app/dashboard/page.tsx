'use client';

import {
  AppHeader,
  KakaoConnection,
  NotificationForm,
  NotificationList,
} from '@components';
import { logoutUser } from '@services/auth';
import { useAuthStore } from '@store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        onLogout={async () => {
          try {
            await logoutUser();
          } catch (error) {
            console.error('로그아웃 오류:', error);
          } finally {
            useAuthStore.getState().reset();
            window.location.href = '/';
          }
        }}
        title="게임 알림 어시스턴트"
        username={user?.username ?? null}
        variant="solid"
      />

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
