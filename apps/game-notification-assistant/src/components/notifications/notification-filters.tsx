import { ACTIVE_OPTIONS } from './constants';

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
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            활성 상태
          </label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onStatusChange('all')}
            >
              전체
            </button>
            {ACTIVE_OPTIONS.map((option) => (
              <button
                key={option.value.toString()}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedStatus === option.value.toString()
                    ? `${option.bgColor} ${option.color} border border-current`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() =>
                  onStatusChange(option.value.toString() as 'true' | 'false')
                }
              >
                {option.label}
              </button>
            ))}
          </div>
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
