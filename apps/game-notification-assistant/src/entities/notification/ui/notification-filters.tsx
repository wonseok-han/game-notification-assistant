import { Tabs } from '@repo/ui';

import NOTIFICATION_CONFIG from '../config/notification-config';

interface NotificationFiltersProps {
  selectedStatus: 'all' | 'true' | 'false';
  searchTerm: string;
  onStatusChange: (status: 'all' | 'true' | 'false') => void;
  onSearchChange: (term: string) => void;
}

export function NotificationFilters({
  onSearchChange,
  onStatusChange,
  searchTerm,
  selectedStatus,
}: NotificationFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 상태 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            활성 상태
          </label>
          <Tabs
            activeTextColor="text-white"
            backgroundColor="bg-gray-100"
            containerClassName="bg-white border-none"
            hoverTextColor="hover:text-gray-800"
            inactiveTextColor="text-gray-600"
            indicatorColor="bg-blue-500"
            items={[
              { id: 'all', label: '전체' },
              ...NOTIFICATION_CONFIG.ACTIVE_OPTIONS.map((option) => ({
                id: option.value.toString(),
                label: option.label,
              })),
            ]}
            onChange={(value) =>
              onStatusChange(value as 'all' | 'true' | 'false')
            }
            size="md"
            value={selectedStatus}
            variant="default"
          />
        </div>

        {/* 검색 */}
        <div className="flex-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="search"
          >
            검색
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            id="search"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="제목, 게임명, 설명으로 검색..."
            type="text"
            value={searchTerm}
          />
        </div>
      </div>
    </div>
  );
}
