'use client';

import { useState, useEffect, useRef } from 'react';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ className = '', items, onChange, value }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const buttonsRef = useRef<HTMLDivElement>(null);
  const activeIndex = items.findIndex((item) => item.id === value);

  useEffect(() => {
    if (buttonsRef.current && activeIndex !== -1) {
      // 버튼 컨테이너에서 직접 activeIndex 사용
      const activeTab = buttonsRef.current.children[activeIndex] as HTMLElement;
      if (activeTab) {
        setIndicatorStyle({
          width: activeTab.offsetWidth - 8,
          left: activeTab.offsetLeft,
        });
      }
    }
  }, [activeIndex, items, value]);

  return (
    <div className={`relative ${className}`}>
      {/* 탭 컨테이너 */}
      <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 relative">
        {/* 슬라이딩 인디케이터 */}
        <div
          className="absolute inset-y-1 bg-blue-600 rounded-md transition-all duration-200 ease-out"
          style={{
            width: indicatorStyle.width,
            transform: `translateX(${indicatorStyle.left}px)`,
          }}
        />

        {/* 탭 버튼들 */}
        <div className="flex" ref={buttonsRef}>
          {items.map((item) => (
            <button
              key={item.id}
              className={`
                relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${
                  value === item.id
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }
              `}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
