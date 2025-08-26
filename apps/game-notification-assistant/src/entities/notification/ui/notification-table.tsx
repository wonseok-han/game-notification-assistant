import type { GameNotificationType } from '../model/notification-domain';

import { ActionButton, ActiveSwitch } from '@repo/ui';
import Image from 'next/image';

import { NotificationTimeStatusBadge } from './notification-time-status-badge';

interface NotificationTableProps {
  notifications: GameNotificationType[];
  onEdit: (notification: GameNotificationType) => void;
  onDelete: (id: string) => void;
  onActiveChange: (id: string, isActive: boolean) => void;
}

export function NotificationTable({
  notifications,
  onActiveChange,
  onDelete,
  onEdit,
}: NotificationTableProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              이미지
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              게임
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              활성 상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              알림 시간
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notifications.map((notification) => (
            <tr
              key={notification.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onEdit(notification)}
            >
              {/* 이미지 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    fill
                    alt={notification.title}
                    className="object-cover"
                    src={notification.image_url}
                  />
                </div>
              </td>

              {/* 제목 및 설명 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="max-w-xs">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </div>
                  {notification.description && (
                    <div className="text-sm text-gray-500 truncate">
                      {notification.description}
                    </div>
                  )}
                </div>
              </td>

              {/* 게임명 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {notification.game_name}
                </span>
              </td>

              {/* 활성 상태 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <ActiveSwitch
                    isActive={notification.is_active}
                    onChange={(isActive) =>
                      onActiveChange(notification.id, isActive)
                    }
                  />
                </div>
              </td>

              {/* 알림 시간 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {notification.notification_times &&
                  notification.notification_times.length > 0 ? (
                    notification.notification_times.map((time) => (
                      <div key={time.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          {new Date(time.scheduled_time).toLocaleString(
                            'ko-KR'
                          )}
                        </span>
                        <NotificationTimeStatusBadge status={time.status} />
                        <span className="text-xs text-gray-500">
                          {time.is_enabled ? '활성' : '비활성'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">
                      설정된 시간 없음
                    </span>
                  )}
                </div>
              </td>

              {/* 액션 */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ActionButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(notification.id);
                    }}
                    variant="danger"
                  >
                    삭제
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
