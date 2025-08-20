'use client';

import { useEffect, useState } from 'react';

interface SnackbarProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 스낵바 컴포넌트
 *
 * @param props
 * @param props.message - 표시할 메시지
 * @param props.type - 메시지 타입 (기본값: 'info')
 * @param props.isVisible - 표시 여부
 * @param props.onClose - 닫기 콜백
 * @param props.autoHideDuration - 자동 숨김 시간 (ms, 기본값: 5000ms)
 * @param props.position - 위치 (기본값: 'bottom-right')
 * @param props.className - 추가 CSS 클래스
 */
export function Snackbar({
  autoHideDuration = 5000,
  className = '',
  isVisible,
  message,
  onClose,
  position = 'bottom-right',
  style,
  type = 'info',
}: SnackbarProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      // 자동 숨김
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoHideDuration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // 애니메이션 완료 후 닫기
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-900/90 border-red-700 text-red-100';
      case 'success':
        return 'bg-green-900/90 border-green-700 text-green-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-700 text-yellow-100';
      case 'info':
        return 'bg-blue-900/90 border-blue-700 text-blue-100';
      default:
        return 'bg-gray-900/90 border-gray-700 text-gray-100';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4 sm:top-10 sm:left-10 transform-none';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2 sm:top-10';
      case 'top-right':
        return 'top-4 right-4 sm:top-10 sm:right-10 transform-none';
      case 'bottom-left':
        return 'bottom-4 left-4 sm:bottom-10 sm:left-10 transform-none';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-10';
      case 'bottom-right':
        return 'bottom-4 right-4 sm:bottom-10 sm:right-10 transform-none';
      default:
        return 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-10';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-200 ${getPositionStyles()} ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${className}`}
      style={style}
    >
      <div
        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg border shadow-lg max-w-[280px] sm:max-w-md mx-auto ${getTypeStyles()}`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm flex-1">{message}</p>
          <button
            aria-label="닫기"
            className="text-current hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
            onClick={handleClose}
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
