'use client';

import { useAuthStore } from '@entities/auth/model/auth-store';
import { UserService } from '@entities/user/model/user-service';
import { KakaoConnection } from '@features/connect-kakao/ui/kakao-connection';
import { NotificationForm } from '@features/create-notification/ui/notification-form';
import { NotificationList } from '@features/list-notification/ui/notification-list';
import { useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '@widgets/layout/app-header';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const userService = new UserService(queryClient);

  const { reset, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        onLogout={async () => {
          try {
            await userService.logout();
            reset();
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
