'use client';

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'button' | 'avatar';
  className?: string;
}

/**
 * 스켈레톤 로딩 컴포넌트
 */
export function LoadingSkeleton({
  className = '',
  type = 'text',
}: LoadingSkeletonProps) {
  const skeletonTypes = {
    text: (
      <div className={`h-4 bg-gray-200 rounded animate-pulse ${className}`} />
    ),
    card: (
      <div
        className={`bg-white rounded-lg shadow p-4 animate-pulse ${className}`}
      >
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    ),
    button: (
      <div className={`h-10 bg-gray-200 rounded animate-pulse ${className}`} />
    ),
    avatar: (
      <div
        className={`w-10 h-10 bg-gray-200 rounded-full animate-pulse ${className}`}
      />
    ),
  };

  return skeletonTypes[type];
}
