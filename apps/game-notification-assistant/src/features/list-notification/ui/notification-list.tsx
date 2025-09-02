'use client';

import type { NotificationEditFormType } from '@entities/notification/model/notificaion';

import { NotificationService } from '@entities/notification/model/notification-service';
import { NotificationFilters } from '@entities/notification/ui/notification-filters';
import { NotificationTable } from '@entities/notification/ui/notification-table';
import { NotificationEditModal } from '@features/edit-notification/ui';
import { useSnackbar } from '@repo/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function NotificationList() {
  const queryClient = useQueryClient();
  const notificationService = new NotificationService(queryClient);

  // ===== 상태 관리 =====
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotification, setEditingNotification] =
    useState<NotificationEditFormType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { showSnackbar } = useSnackbar();

  // ===== React Query 훅 =====
  const {
    data: notifications = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: notificationService.queryKey.notifications(),
    queryFn: () => notificationService.getNotifications(),
  });

  // ===== Mutations =====
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: (response) => {
      showSnackbar({
        message: response?.message || '알림이 삭제되었습니다.',
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 4000,
      });
    },
    onError: (error) => {
      console.error('알림 삭제 오류:', error);
      showSnackbar({
        message: '알림 삭제 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    },
  });

  const updateActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      notificationService.updateActive(id, isActive),
    onSuccess: (response, { isActive }) => {
      showSnackbar({
        message: `알림이 ${isActive ? '활성화' : '비활성화'}되었습니다.`,
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 3000,
      });
    },
    onError: (error) => {
      console.error('활성 상태 변경 오류:', error);
      showSnackbar({
        message: '활성 상태 변경 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    },
  });

  // ===== 에러 처리 =====
  if (error) {
    showSnackbar({
      message: '알림 목록을 가져오는 중 오류가 발생했습니다.',
      type: 'error',
      position: 'bottom-right',
      autoHideDuration: 6000,
    });
  }

  // ===== 필터링된 알림 목록 =====
  const filteredNotifications = notifications.filter((notification) => {
    // 상태 필터링
    if (
      selectedStatus !== 'all' &&
      notification.isActive.toString() !== selectedStatus
    ) {
      return false;
    }

    // 검색어 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.gameName.toLowerCase().includes(searchLower) ||
        notification.description?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  /**
   * 알림 삭제 핸들러
   * @param {string} id - 알림 ID
   * @returns {Promise<void>} 알림 삭제 핸들러 결과
   */
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 알림을 삭제하시겠습니까?')) {
      return;
    }

    deleteMutation.mutate(id);
  };

  /**
   * 알림 수정 핸들러
   * @param {NotificationEditFormType} notification - 알림 정보
   */
  const handleSelect = (notification: NotificationEditFormType) => {
    setEditingNotification(notification);
    setIsEditModalOpen(true);
  };

  /**
   * 활성 상태 변경 핸들러
   * @param {string} id - 알림 ID
   * @param {boolean} isActive - 활성 상태
   * @returns {Promise<void>} 활성 상태 변경 핸들러 결과
   */
  const handleActiveChange = async (id: string, isActive: boolean) => {
    updateActiveMutation.mutate({ id, isActive });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        {/* 알림 카드 스켈레톤 3개 */}
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`skeleton-${index}`}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
          >
            <div className="space-y-4">
              {/* 제목과 상태 스켈레톤 */}
              <div className="flex items-start justify-between">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
              {/* 설명 스켈레톤 */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              {/* 게임명과 이미지 스켈레톤 */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              {/* 알림 시간 스켈레톤 */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-28" />
              </div>
              {/* 액션 버튼 스켈레톤 */}
              <div className="flex space-x-2 pt-2">
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationFilters
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
      />

      <NotificationTable
        notifications={filteredNotifications}
        onActiveChange={handleActiveChange}
        onDelete={handleDelete}
        onSelect={handleSelect}
      />

      {editingNotification && (
        <NotificationEditModal
          id={editingNotification.id}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingNotification(null);
          }}
        />
      )}
    </div>
  );
}
