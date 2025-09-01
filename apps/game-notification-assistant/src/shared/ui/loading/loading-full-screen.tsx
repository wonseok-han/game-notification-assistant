'use client';

import React from 'react';

import { LoadingSpinner } from './loading-spinner';

interface LoadingFullScreenProps {
  text?: string;
  className?: string;
}

/**
 * 전체 화면 로딩 컴포넌트
 */
export function LoadingFullScreen({
  className = '',
  text = '로딩 중...',
}: LoadingFullScreenProps) {
  return (
    <div
      className={`flex items-center justify-center min-h-[200px] ${className}`}
    >
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}
