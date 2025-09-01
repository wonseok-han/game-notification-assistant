'use client';

import type {
  NotificationEditFormType,
  NotificationListType,
} from '@entities/notification/model/notificaion';

import { NotificationService } from '@entities/notification/model/notification-service';
import { NotificationFilters } from '@entities/notification/ui/notification-filters';
import { NotificationTable } from '@entities/notification/ui/notification-table';
import { NotificationEditModal } from '@features/edit-notification/ui';
import { useSnackbar } from '@repo/ui';
import { QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

export function NotificationList() {
  const notificationService = new NotificationService(queryClient);

  // ===== 상태 관리 =====
  const [notifications, setNotifications] = useState<NotificationListType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotification, setEditingNotification] =
    useState<NotificationEditFormType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { showSnackbar } = useSnackbar();

  // ===== 알림 목록 가져오기 =====
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const result = await notificationService.getNotifications();
        setNotifications(result || []);
      } catch (error) {
        console.error('알림 목록 조회 오류:', error);
        showSnackbar({
          message: '알림 목록을 가져오는 중 오류가 발생했습니다.',
          type: 'error',
          position: 'bottom-right',
          autoHideDuration: 6000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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

    try {
      const response = await notificationService.delete(id);

      if (response?.message) {
        showSnackbar({
          message: response.message,
          type: 'success',
          position: 'bottom-right',
          autoHideDuration: 4000,
        });

        // 목록에서 삭제된 알림 제거
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('알림 삭제 오류:', error);
      showSnackbar({
        message: '알림 삭제 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    }
  };

  /**
   * 알림 수정 핸들러
   * @param {NotificationEditFormType} notification - 알림 정보
   */
  const handleEdit = (notification: NotificationEditFormType) => {
    setEditingNotification(notification);
    setIsEditModalOpen(true);
  };

  /**
   * 알림 저장 핸들러
   * @param {NotificationEditFormType} form - 알림 정보
   * @returns {Promise<void>} 알림 저장 핸들러 결과
   */
  const handleSave = async (form: NotificationEditFormType) => {
    try {
      // 디버깅: 받은 값들 확인
      console.log('handleSave에서 받은 값들:', {
        id: form.id,
        title: form.title,
        isActive: form.isActive,
        editingTimesCount: form.notificationTimes.length,
      });

      const response = await notificationService.update(form.id, form);

      if (response) {
        showSnackbar({
          message: '알림이 수정되었습니다.',
          type: 'success',
          position: 'bottom-right',
          autoHideDuration: 4000,
        });

        // 전체 목록을 다시 가져와서 UI 최신화
        const result = await notificationService.getNotifications();
        setNotifications(result || []);
      }
    } catch (error) {
      console.error('알림 수정 오류:', error);
      showSnackbar({
        message: '알림 수정 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
      throw error;
    }
  };

  /**
   * 활성 상태 변경 핸들러
   * @param {string} id - 알림 ID
   * @param {boolean} isActive - 활성 상태
   * @returns {Promise<void>} 활성 상태 변경 핸들러 결과
   */
  const handleActiveChange = async (id: string, isActive: boolean) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      if (!notification) return;

      // is_active만 업데이트
      await notificationService.updateActive(id, isActive);

      // 성공 메시지 표시
      showSnackbar({
        message: `알림이 ${isActive ? '활성화' : '비활성화'}되었습니다.`,
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 3000,
      });

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isActive: isActive } : n))
      );
    } catch (error) {
      console.error('활성 상태 변경 오류:', error);
      showSnackbar({
        message: '활성 상태 변경 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    }
  };

  /**
   * 모달 닫기
   */
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingNotification(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">알림 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      <NotificationFilters
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
      />

      {/* 알림 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            알림 목록 ({filteredNotifications.length}개)
          </h2>
        </div>

        <NotificationTable
          notifications={filteredNotifications}
          onActiveChange={handleActiveChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      {/* 수정 모달 */}
      <NotificationEditModal
        isOpen={isEditModalOpen}
        notification={editingNotification}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
