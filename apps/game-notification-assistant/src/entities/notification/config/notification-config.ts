import type { ActiveOptionType } from '../model/notification-common';

export const NOTIFICATION_CONFIG = {
  ACTIVE_OPTIONS: [
    {
      value: true,
      label: '활성',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    {
      value: false,
      label: '비활성',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
    },
  ] as ActiveOptionType[],
};

export default NOTIFICATION_CONFIG;
