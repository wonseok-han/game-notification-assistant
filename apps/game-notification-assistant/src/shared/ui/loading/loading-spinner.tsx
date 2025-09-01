'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'danger' | 'white';
  className?: string;
}

/**
 * 스피너 로딩 컴포넌트
 */
export function LoadingSpinner({
  className = '',
  color = 'primary',
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorClasses = {
    primary: 'border-gray-200 border-t-blue-500',
    secondary: 'border-gray-200 border-t-gray-600',
    danger: 'border-gray-200 border-t-red-500',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}
