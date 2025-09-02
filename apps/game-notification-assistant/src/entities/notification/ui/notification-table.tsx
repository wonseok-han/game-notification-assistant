import type {
  NotificationEditFormType,
  NotificationListType,
} from '../model/notificaion';

import { ActionButton, ActiveSwitch } from '@repo/ui';
import Image from 'next/image';

import { NotificationTimeStatusBadge } from './notification-time-status-badge';

interface NotificationTableProps {
  notifications: NotificationListType;
  onSelect: (notification: NotificationEditFormType) => void;
  onDelete: (id: string) => void;
  onActiveChange: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

/**
 * 테이블 스켈레톤 컴포넌트
 */
function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              이미지
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              게임
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              활성 상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              알림 시간
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: 1 }).map(() => (
            <tr
              key={`skeleton-${crypto.randomUUID()}`}
              className="animate-pulse"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <div className="w-12 h-8 bg-gray-200 rounded" />
                  <div className="w-12 h-8 bg-gray-200 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NotificationTable({
  isLoading = false,
  notifications,
  onActiveChange,
  onDelete,
  onSelect,
}: NotificationTableProps) {
  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return <TableSkeleton />;
  }

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              이미지
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              게임
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              활성 상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              알림 시간
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notifications.map((notification) => (
            <tr
              key={notification.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(notification)}
            >
              {/* 이미지 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    fill
                    alt={notification.title}
                    className="object-cover"
                    src={notification.imageUrl}
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
                  {notification.gameName}
                </span>
              </td>

              {/* 활성 상태 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <ActiveSwitch
                    isActive={notification.isActive}
                    onChange={(isActive) =>
                      onActiveChange(notification.id, isActive)
                    }
                  />
                </div>
              </td>

              {/* 알림 시간 */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {notification.notificationTimes &&
                  notification.notificationTimes.length > 0 ? (
                    notification.notificationTimes.map((time) => (
                      <div
                        key={time.id}
                        className="flex flex-row gap-1 items-center"
                      >
                        <span className="text-xs text-gray-600 truncate flex-1">
                          {time.scheduledTime.toLocaleString('ko-KR')}
                        </span>
                        <div className="">
                          <NotificationTimeStatusBadge status={time.status} />
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {time.isEnabled ? '활성' : '비활성'}
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
