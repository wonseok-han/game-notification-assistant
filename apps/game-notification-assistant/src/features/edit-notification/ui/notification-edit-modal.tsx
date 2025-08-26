import type {
  EditingTimeType,
  GameNotificationType,
} from '@entities/notification/model/notification-domain';

import { ActionButton, ActiveSwitch } from '@repo/ui';
import { useEffect, useState } from 'react';

interface NotificationEditModalProps {
  notification: GameNotificationType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    title: string,
    description: string,
    isActive: boolean,
    editingTimes: EditingTimeType[]
  ) => Promise<void>;
}

export function NotificationEditModal({
  isOpen,
  notification,
  onClose,
  onSave,
}: NotificationEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingTimes, setEditingTimes] = useState<EditingTimeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때마다 초기값 설정
  useEffect(() => {
    if (notification) {
      console.log('모달 초기값 설정:', {
        title: notification.title,
        is_active: notification.is_active,
        notification_times_count: notification.notification_times?.length || 0,
      });

      setTitle(notification.title);
      setDescription(notification.description || '');
      setIsActive(notification.is_active);

      // notification_times 초기화
      if (notification.notification_times) {
        console.log(
          'notification.notification_times',
          notification.notification_times
        );
        setEditingTimes(
          notification.notification_times.map((time) => ({
            id: time.id,
            scheduledTime: new Date(time.scheduled_time)
              .toLocaleString('sv-SE')
              .slice(0, 16),
            isEnabled: time.is_enabled,
            rawText: time.raw_text || '',
            label: time.label || '',
          }))
        );
      }
    }
  }, [notification]);

  /**
   * 알림 수정 저장
   * @returns {Promise<void>} 알림 수정 저장 결과
   */
  const handleSave = async () => {
    if (!notification) return;

    setIsLoading(true);
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

      await onSave(
        notification.id,
        finalTitle,
        finalDescription,
        isActive,
        editingTimes
      );
      onClose();
    } catch (error) {
      console.error('저장 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 수정</h2>

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
                              newTimes[index].scheduledTime = e.target.value;
                              setEditingTimes(newTimes);
                            }
                          }}
                          type="datetime-local"
                          value={time.scheduledTime.slice(0, 16)}
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

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <ActionButton
            disabled={isLoading}
            onClick={onClose}
            variant="secondary"
          >
            취소
          </ActionButton>
          <ActionButton
            disabled={isLoading}
            onClick={handleSave}
            variant="primary"
          >
            {isLoading ? '저장 중...' : '저장'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
