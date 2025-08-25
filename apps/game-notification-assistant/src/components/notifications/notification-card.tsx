import { ActiveSwitch } from '@repo/ui';
import Image from 'next/image';

import { ActiveBadge } from './active-badge';

interface NotificationCardProps {
  notification: GameNotificationType;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onActiveChange: (isActive: boolean) => void;
}

export function NotificationCard({
  isExpanded,
  notification,
  onActiveChange,
  onDelete,
  onEdit,
  onToggleExpand,
}: NotificationCardProps) {
  const getNextTime = () => {
    if (
      !notification.notification_times ||
      notification.notification_times.length === 0
    ) {
      return new Date();
    }

    const enabledTimes = notification.notification_times.filter(
      (time) => time.is_enabled
    );
    if (enabledTimes.length === 0) {
      return new Date();
    }

    return new Date(
      Math.min(
        ...enabledTimes.map((time) => new Date(time.scheduled_time).getTime())
      )
    );
  };

  const nextTime = getNextTime();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* 카드 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {notification.title}
              </h3>
              <ActiveBadge isActive={notification.is_active} />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {notification.description || '설명 없음'}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>게임: {notification.game_name}</span>
              <span>다음 알림: {nextTime.toLocaleString('ko-KR')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <ActiveSwitch
              isActive={notification.is_active}
              onChange={onActiveChange}
            />
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onToggleExpand}
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 카드 액션 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              onClick={onEdit}
            >
              수정
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              onClick={onDelete}
            >
              삭제
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {notification.notification_times?.filter(
                (time) => time.is_enabled
              ).length || 0}
              개 알림
            </span>
          </div>
        </div>
      </div>

      {/* 확장된 내용 */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 이미지 */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">게임 이미지</h4>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  fill
                  alt={notification.title}
                  className="object-cover"
                  src={notification.image_url}
                />
              </div>
            </div>

            {/* 알림 시간 목록 */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">알림 시간</h4>
              {notification.notification_times &&
              notification.notification_times.length > 0 ? (
                <div className="space-y-2">
                  {notification.notification_times.map((time) => (
                    <div
                      key={time.id}
                      className="p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(time.scheduled_time).toLocaleString(
                            'ko-KR'
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {time.is_enabled ? '활성' : '비활성'}
                        </span>
                      </div>
                      {time.raw_text && (
                        <p className="text-xs text-gray-600 mb-1">
                          원본: {time.raw_text}
                        </p>
                      )}
                      {time.label && (
                        <p className="text-xs text-gray-600">
                          라벨: {time.label}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  설정된 알림 시간이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
