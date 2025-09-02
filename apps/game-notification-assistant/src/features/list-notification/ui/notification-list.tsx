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
    queryKey: notificationService.queryKey.notifications({
      status: selectedStatus,
      search: searchTerm,
    }),
    queryFn: () =>
      notificationService.getNotifications({
        status: selectedStatus,
        search: searchTerm,
      }),
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

  return (
    <div className="space-y-6">
      <NotificationFilters
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
      />

      <NotificationTable
        isLoading={isLoading}
        notifications={notifications}
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
