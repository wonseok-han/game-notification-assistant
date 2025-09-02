'use client';

import { useState, useEffect, useRef } from 'react';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export type TabsVariantType = 'default' | 'pills' | 'underline' | 'minimal';
export type TabsSizeType = 'sm' | 'md' | 'lg';

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
  variant?: TabsVariantType;
  size?: TabsSizeType;
  showIndicator?: boolean;
  indicatorColor?: string;
  backgroundColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  hoverTextColor?: string;
}

/**
 * 탭 컴포넌트
 * @param props.className - 탭 컨테이너 클래스
 * @param props.containerClassName - 탭 컨테이너 클래스
 * @param props.items - 탭 아이템
 * @param props.onChange - 탭 변경 이벤트
 * @param props.value - 탭 값
 * @param props.variant - 탭 스타일 변형
 * @param props.size - 탭 크기
 * @param props.showIndicator - 인디케이터 표시 여부
 * @param props.indicatorColor - 인디케이터 색상
 * @param props.backgroundColor - 배경 색상
 * @param props.activeTextColor - 활성 텍스트 색상
 * @param props.inactiveTextColor - 비활성 텍스트 색상
 * @param props.hoverTextColor - 호버 텍스트 색상
 */
export function Tabs({
  activeTextColor = 'text-white',
  backgroundColor = 'bg-gray-800',
  className = '',
  containerClassName = '',
  hoverTextColor = 'hover:text-gray-200',
  inactiveTextColor = 'text-gray-400',
  indicatorColor = 'bg-blue-600',
  items,
  onChange,
  showIndicator = true,
  size = 'md',
  value,
  variant = 'default',
}: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const buttonsRef = useRef<HTMLDivElement>(null);
  const activeIndex = items.findIndex((item) => item.id === value);

  // 크기별 스타일 설정
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // 변형별 스타일 설정
  const variantStyles = {
    default: {
      container: `flex rounded-lg p-1 border border-gray-700 ${backgroundColor}`,
      indicator:
        'absolute inset-y-1 rounded-md transition-all duration-200 ease-out',
      button:
        'relative z-10 rounded-md transition-colors duration-200 cursor-pointer',
    },
    pills: {
      container: 'flex gap-1',
      indicator: 'hidden', // pills에서는 인디케이터 숨김
      button: 'rounded-full transition-colors duration-200 cursor-pointer',
    },
    underline: {
      container: 'flex border-b border-gray-200',
      indicator: 'absolute bottom-0 h-0.5 transition-all duration-200 ease-out',
      button:
        'relative transition-colors duration-200 cursor-pointer border-b-2 border-transparent',
    },
    minimal: {
      container: 'flex',
      indicator: 'hidden', // minimal에서는 인디케이터 숨김
      button: 'transition-colors duration-200 cursor-pointer',
    },
  };

  useEffect(() => {
    if (buttonsRef.current && activeIndex !== -1 && showIndicator) {
      const updateIndicatorPosition = () => {
        const activeTab = buttonsRef.current?.children[
          activeIndex
        ] as HTMLElement;
        const container = buttonsRef.current;

        if (activeTab && container) {
          const containerRect = container.getBoundingClientRect();
          const tabRect = activeTab.getBoundingClientRect();

          // 컨테이너 기준으로 상대적 위치 계산
          const relativeLeft = tabRect.left - containerRect.left;

          setIndicatorStyle({
            width: tabRect.width - (variant === 'underline' ? 0 : 8),
            left: relativeLeft + (variant === 'underline' ? 0 : 4),
          });
        }
      };

      // DOM 업데이트 후 위치 계산
      requestAnimationFrame(updateIndicatorPosition);
    }
  }, [activeIndex, items, value, showIndicator, variant]);

  return (
    <div className={`relative ${className}`}>
      {/* 탭 컨테이너 */}
      <div
        className={`${variantStyles[variant].container} ${containerClassName}`}
      >
        {/* 슬라이딩 인디케이터 */}
        {showIndicator && variant !== 'pills' && variant !== 'minimal' && (
          <div
            className={`${variantStyles[variant].indicator} ${indicatorColor}`}
            style={{
              width: indicatorStyle.width,
              transform: `translateX(${indicatorStyle.left}px)`,
            }}
          />
        )}

        {/* 탭 버튼들 */}
        <div className="flex" ref={buttonsRef}>
          {items.map((item) => {
            const isActive = value === item.id;
            const isDisabled = item.disabled;

            // 변형별 활성 상태 스타일
            const getActiveStyles = () => {
              switch (variant) {
                case 'pills':
                  return isActive
                    ? `${indicatorColor} ${activeTextColor} font-semibold`
                    : `${inactiveTextColor} ${hoverTextColor}`;
                case 'underline':
                  return isActive
                    ? `${activeTextColor} font-semibold border-blue-600`
                    : `${inactiveTextColor} ${hoverTextColor}`;
                case 'minimal':
                  return isActive
                    ? `${activeTextColor} font-semibold`
                    : `${inactiveTextColor} ${hoverTextColor}`;
                default:
                  return isActive
                    ? `${activeTextColor} font-semibold`
                    : `${inactiveTextColor} ${hoverTextColor}`;
              }
            };

            return (
              <button
                key={item.id}
                className={`
                  ${variantStyles[variant].button}
                  ${sizeStyles[size]}
                  font-medium
                  ${getActiveStyles()}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={isDisabled}
                onClick={() => !isDisabled && onChange(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
