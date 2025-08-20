'use client';

import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * 아코디언 컴포넌트
 *
 * 접을 수 있는 콘텐츠 영역을 제공합니다.
 * 기본적으로 접혀있으며, 클릭 시 펼쳐집니다.
 *
 * @param props
 * @param props.title - 아코디언 제목
 * @param props.children - 아코디언 내용
 * @param props.defaultOpen - 기본 펼침 상태 (기본값: false)
 * @param props.className - 추가 CSS 클래스
 */
export function Accordion({
  children,
  className = '',
  defaultOpen = false,
  title,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border border-gray-700 rounded-lg ${className}`}>
      {/* ===== 아코디언 헤더 ===== */}
      <button
        aria-controls={`accordion-content-${title}`}
        aria-expanded={isOpen}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        onClick={handleToggle}
      >
        <span className="font-semibold text-gray-200">{title}</span>
        <span
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {/* ===== 아코디언 콘텐츠 ===== */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        id={`accordion-content-${title}`}
      >
        <div className="p-4 border-t border-gray-700">{children}</div>
      </div>
    </div>
  );
}
