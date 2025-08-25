export type ActiveOptionType = {
  value: boolean;
  label: string;
  color: string;
  bgColor: string;
};

interface ActiveBadgeProps {
  isActive: boolean;
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  /**
   * 활성 상태 설정
   * @param {boolean} isActive - 활성 상태
   * @returns {ActiveOptionType} 활성 상태 설정
   */
  const getActiveConfig = (isActive: boolean): ActiveOptionType => {
    return isActive
      ? {
          value: true,
          label: '활성',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
        }
      : {
          value: false,
          label: '비활성',
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
        };
  };

  const config = getActiveConfig(isActive);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
