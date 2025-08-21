'use client';

import { useState } from 'react';

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  feedbackDuration?: number;
  feedbackText?: string;
  useFeedback?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
}

const variantStyles = {
  primary: {
    default: 'bg-blue-600 hover:bg-blue-700 cursor-not-allowed',
    feedback: 'bg-blue-500 hover:bg-blue-600 cursor-not-allowed',
  },
  success: {
    default: 'bg-green-600 hover:bg-green-700 cursor-not-allowed',
    feedback: 'bg-green-500 hover:bg-green-600 cursor-not-allowed',
  },
  danger: {
    default: 'bg-red-600 hover:bg-red-700 cursor-not-allowed',
    feedback: 'bg-red-500 hover:bg-red-600 cursor-not-allowed',
  },
  secondary: {
    default: 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed',
    feedback: 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function ActionButton({
  children,
  className = '',
  disabled = false,
  feedbackDuration = 2000,
  feedbackText,
  onClick,
  size = 'md',
  type = 'button',
  useFeedback = type === 'submit' ? false : true,
  variant = 'primary',
  ...props
}: ActionButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isActive || disabled) return; // debounce

    onClick?.(event);

    if (useFeedback) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), feedbackDuration);
    }
  };

  const variantClass = isActive
    ? variantStyles[variant].feedback
    : variantStyles[variant].default;
  const sizeClass = sizeStyles[size];
  const disabledClass =
    isActive || disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      {...props}
      className={`text-white rounded transition-all ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={isActive || disabled}
      onClick={handleClick}
      type={type}
    >
      {isActive && feedbackText ? `✓ ${feedbackText}` : children}
    </button>
  );
}
