'use client';

import { useSnackbar } from '@repo/ui';
import {
  deleteNotification,
  getNotifications,
  updateNotification,
  type GameNotification,
} from '@services/notification';
import { useEffect, useState } from 'react';

import { NotificationEditModal } from './notification-edit-modal';
import { NotificationFilters } from './notification-filters';
import { NotificationTable } from './notification-table';
import { type EditingTimeType } from './types';

// ===== 알림 목록 컴포넌트 =====
export function NotificationList() {
  // ===== 상태 관리 =====
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotification, setEditingNotification] =
    useState<GameNotification | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { showSnackbar } = useSnackbar();

  // ===== 알림 목록 가져오기 =====
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const result = await getNotifications();
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
      notification.is_active.toString() !== selectedStatus
    ) {
      return false;
    }

    // 검색어 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.game_name.toLowerCase().includes(searchLower) ||
        notification.description?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // ===== 알림 삭제 핸들러 =====
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteNotification(id);

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

  // ===== 알림 수정 핸들러 =====
  const handleEdit = (notification: GameNotification) => {
    setEditingNotification(notification);
    setIsEditModalOpen(true);
  };

  // ===== 알림 저장 핸들러 =====
  const handleSave = async (
    id: string,
    title: string,
    description: string,
    isActive: boolean,
    editingTimes: EditingTimeType[]
  ) => {
    try {
      // 디버깅: 받은 값들 확인
      console.log('handleSave에서 받은 값들:', {
        id,
        title,
        isActive,
        editingTimesCount: editingTimes.length,
      });

      const response = await updateNotification(id, {
        title,
        description,
        is_active: isActive,
      });

      if (response) {
        // notification_times 업데이트
        if (editingTimes.length > 0) {
          // notification_times를 UpdateNotificationRequest 형식으로 변환
          const notificationTimes = editingTimes.map((time) => ({
            id: time.id,
            scheduledTime: time.scheduledTime,
            isEnabled: time.isEnabled,
            rawText: time.rawText,
            label: time.label,
          }));

          // notification_times와 is_active를 함께 업데이트
          await updateNotification(id, {
            is_active: isActive,
            notificationTimes,
          });
        } else {
          // notification_times가 없는 경우 is_active만 업데이트
          await updateNotification(id, {
            is_active: isActive,
          });
        }

        showSnackbar({
          message: '알림이 수정되었습니다.',
          type: 'success',
          position: 'bottom-right',
          autoHideDuration: 4000,
        });

        // 전체 목록을 다시 가져와서 UI 최신화
        const result = await getNotifications();
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

  // ===== 활성 상태 변경 핸들러 =====
  const handleActiveChange = async (id: string, isActive: boolean) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      if (!notification) return;

      // is_active만 업데이트
      await updateNotification(id, {
        is_active: isActive,
      });

      // 성공 메시지 표시
      showSnackbar({
        message: `알림이 ${isActive ? '활성화' : '비활성화'}되었습니다.`,
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 3000,
      });

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_active: isActive } : n))
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

  // ===== 모달 닫기 =====
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingNotification(null);
  };

  // ===== 로딩 상태 =====
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
