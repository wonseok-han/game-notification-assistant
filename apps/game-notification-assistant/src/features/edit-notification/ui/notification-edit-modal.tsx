import type { NotificationEditFormType } from '@entities/notification/model/notificaion';

import { NotificationService } from '@entities/notification/model/notification-service';
import { ActionButton, ActiveSwitch, useSnackbar } from '@repo/ui';
import { formatForDatetimeLocal } from '@shared/lib/date';
import { BaseModal, LoadingSpinner } from '@shared/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface NotificationEditModalProps {
  id: NotificationEditFormType['id'];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 알림 수정 모달 스켈레톤 컴포넌트
 */
function NotificationEditModalSkeleton() {
  return (
    <div className="space-y-4">
      {/* 제목 입력 스켈레톤 */}
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* 설명 입력 스켈레톤 */}
      <div>
        <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-24 w-full bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* 활성 상태 스켈레톤 */}
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* 알림 시간 설정 스켈레톤 */}
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={`skeleton-${index}`}
              className="p-3 border border-gray-200 rounded-md bg-gray-50"
            >
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="mb-2">
                <div className="h-3 w-20 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-3 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 알림 수정 모달 액션 버튼 스켈레톤 컴포넌트
 */
function ActionButtonsSkeleton() {
  return (
    <>
      <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
    </>
  );
}

export function NotificationEditModal({
  id,
  isOpen,
  onClose,
}: NotificationEditModalProps) {
  const queryClient = useQueryClient();
  const notificationService = new NotificationService(queryClient);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingTimes, setEditingTimes] = useState<
    NotificationEditFormType['notificationTimes']
  >([]);

  const { showSnackbar } = useSnackbar();

  // ===== React Query 훅 =====
  const { data: notification, error } = useQuery({
    queryKey: notificationService.queryKey.notification(id),
    queryFn: () => notificationService.getNotification(id),
  });

  // ===== Mutations =====
  const updateMutation = useMutation({
    mutationFn: ({
      form,
      id,
    }: {
      id: string;
      form: NotificationEditFormType;
    }) => notificationService.update(id, form),
    onSuccess: () => {
      showSnackbar({
        message: '알림이 수정되었습니다.',
        type: 'success',
        position: 'bottom-right',
        autoHideDuration: 4000,
      });
      onClose();
    },
    onError: (error) => {
      console.error('알림 수정 오류:', error);
      showSnackbar({
        message: '알림 수정 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    },
  });

  useEffect(() => {
    if (notification) {
      setTitle(notification.title);
      setDescription(notification.description || '');
      setIsActive(notification.isActive);
      setEditingTimes(notification.notificationTimes);
    }
  }, [notification]);

  useEffect(() => {
    if (error) {
      console.error('알림 상세 조회 오류:', error);
      showSnackbar({
        message: '알림 상세 조회 중 오류가 발생했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    }
  }, [error]);

  /**
   * 알림 수정 저장
   * @returns {Promise<void>} 알림 수정 저장 결과
   */
  const handleSave = async () => {
    if (!notification) return;

    try {
      // 제목이 비어있으면 기존 제목 사용
      const finalTitle = title.trim() || notification.title;
      const finalDescription =
        description.trim() || notification.description || '';

      // 디버깅: 전달되는 값들 확인
      console.log('모달 저장 시 전달되는 값들:', {
        id: notification.id,
        title: finalTitle,
        description: finalDescription,
        isActive,
        editingTimesCount: editingTimes.length,
      });

      await updateMutation.mutate({
        id: notification.id,
        form: {
          id: notification.id,
          title: finalTitle,
          description: finalDescription,
          gameName: notification.gameName,
          imageUrl: notification.imageUrl,
          isActive,
          notificationTimes: editingTimes.map((time) => ({
            id: time.id,
            notificationId: time.notificationId,
            scheduledTime: time.scheduledTime,
            status: time.status,
            isEnabled: time.isEnabled,
            rawText: time.rawText,
            label: time.label,
          })),
        },
      });
      // onClose();
    } catch (error) {
      console.error('저장 오류:', error);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="2xl" title="알림 수정">
      {/* 메인 콘텐츠 - 스켈레톤 또는 실제 폼 */}
      {!notification ? (
        <NotificationEditModalSkeleton />
      ) : (
        <div className="space-y-4">
          {/* 제목 입력 */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="edit-title"
            >
              알림 제목
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              id="edit-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 제목을 입력하세요"
              type="text"
              value={title}
            />
          </div>

          {/* 설명 입력 */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="edit-description"
            >
              설명
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              id="edit-description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="알림에 대한 설명을 입력하세요 (선택사항)"
              rows={3}
              value={description}
            />
          </div>

          {/* 활성 상태 스위치 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              활성 상태
            </label>
            <div className="flex items-center gap-3">
              <ActiveSwitch isActive={isActive} onChange={setIsActive} />
              <span className="text-sm text-gray-600">
                {isActive ? '활성' : '비활성'}
              </span>
            </div>
          </div>

          {/* 알림 시간 편집 */}
          {editingTimes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 시간 설정
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {editingTimes.map((time, index) => (
                  <div
                    key={time.id}
                    className="p-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {/* 시간 */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          설정 시간
                        </label>
                        <input
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onChange={(e) => {
                            const newTimes = [...editingTimes];
                            if (newTimes[index]) {
                              newTimes[index].scheduledTime = new Date(
                                e.target.value
                              );
                              setEditingTimes(newTimes);
                            }
                          }}
                          type="datetime-local"
                          value={formatForDatetimeLocal(time.scheduledTime)}
                        />
                      </div>

                      {/* 활성화 여부 */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          사용 여부
                        </label>
                        <ActiveSwitch
                          isActive={time.isEnabled}
                          onChange={(isEnabled) => {
                            const newTimes = [...editingTimes];
                            if (newTimes[index]) {
                              newTimes[index].isEnabled = isEnabled;
                              setEditingTimes(newTimes);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* 원본 텍스트 */}
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        원본 텍스트
                      </label>
                      <input
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
                          const newTimes = [...editingTimes];
                          if (newTimes[index]) {
                            newTimes[index].rawText = e.target.value;
                            setEditingTimes(newTimes);
                          }
                        }}
                        placeholder="원본 텍스트"
                        type="text"
                        value={time.rawText}
                      />
                    </div>

                    {/* 라벨 */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        알림 시간 설명
                      </label>
                      <input
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
                          const newTimes = [...editingTimes];
                          if (newTimes[index]) {
                            newTimes[index].label = e.target.value;
                            setEditingTimes(newTimes);
                          }
                        }}
                        placeholder="라벨"
                        type="text"
                        value={time.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 - 스켈레톤 또는 실제 버튼 */}
      <div className="flex justify-end gap-3 mt-6">
        {!notification ? (
          <ActionButtonsSkeleton />
        ) : (
          <>
            <ActionButton
              disabled={updateMutation.isPending}
              onClick={onClose}
              variant="secondary"
            >
              취소
            </ActionButton>
            <ActionButton
              disabled={updateMutation.isPending}
              onClick={handleSave}
              variant="primary"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner color="white" size="sm" />
                  저장 중...
                </div>
              ) : (
                '저장'
              )}
            </ActionButton>
          </>
        )}
      </div>
    </BaseModal>
  );
}
