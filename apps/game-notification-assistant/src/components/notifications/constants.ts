import type { ActiveOptionType } from './active-badge';

// ===== 활성 상태 옵션 =====
export const ACTIVE_OPTIONS: ActiveOptionType[] = [
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
];
