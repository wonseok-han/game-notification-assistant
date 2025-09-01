'use client';

import React from 'react';

import { LoadingSpinner } from './loading-spinner';

interface LoadingInlineProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'danger' | 'white';
  className?: string;
  textClassName?: string;
}

/**
 * 인라인 로딩 컴포넌트 (텍스트와 함께)
 */
export function LoadingInline({
  className = '',
  color = 'primary',
  size = 'sm',
  text = '로딩 중...',
  textClassName = '',
}: LoadingInlineProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner color={color} size={size} />
      <span className={`text-gray-600 text-sm ${textClassName}`}>{text}</span>
    </div>
  );
}
