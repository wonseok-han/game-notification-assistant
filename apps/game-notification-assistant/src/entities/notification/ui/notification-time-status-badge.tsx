import type { ActiveOptionType } from '../model/notification-common';

interface NotificationTimeStatusBadgeProps {
  status: string;
}

export function NotificationTimeStatusBadge({
  status,
}: NotificationTimeStatusBadgeProps) {
  /**
   * 알림 시간 상태 설정
   * @param {string} status - 알림 시간 상태
   * @returns {ActiveOptionType} 알림 시간 상태 설정
   */
  const getStatusConfig = (status: string): Omit<ActiveOptionType, 'value'> => {
    switch (status) {
      case 'pending':
        return {
          label: '대기중',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
        };
      case 'sent':
        return {
          label: '전송됨',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
        };
      case 'failed':
        return {
          label: '실패',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
        };
      default:
        return {
          label: status,
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
