'use client';

import { IconLogo } from '@assets/icons';
import { UserProfile } from '@entities/user/ui';
import { ActionButton } from '@repo/ui';
import Link from 'next/link';
import React from 'react';

interface AppHeaderProps {
  title?: string;
  username?: string | null;
  variant?: 'solid' | 'translucent';
  onLogin?: () => void;
  onRegister?: () => void;
}

/**
 * 반응형 상단 헤더 컴포넌트
 * - 모바일에서 세로 스택, 데스크톱에서 가로 정렬
 * - 사용자 인증 상태에 따라 우측 액션 영역 변경
 */
export function AppHeader({
  onLogin,
  onRegister,
  title = '게임 알림 어시스턴트',
  username,
  variant = 'solid',
}: AppHeaderProps) {
  const containerClass =
    variant === 'translucent'
      ? 'bg-white/80 backdrop-blur-sm border-b border-white/20'
      : 'bg-white shadow-sm border-b border-gray-200';

  const isAuthenticated = Boolean(username);

  return (
    <header className={containerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link href={isAuthenticated ? '/dashboard' : '/'}>
              <div className="flex items-center gap-3">
                <IconLogo />
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            </Link>

            {/* 우측 액션 영역 */}
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <div className="flex items-center gap-3">
                {onLogin && (
                  <ActionButton onClick={onLogin} size="md" variant="secondary">
                    로그인
                  </ActionButton>
                )}
                {onRegister && (
                  <ActionButton
                    onClick={onRegister}
                    size="md"
                    variant="primary"
                  >
                    회원가입
                  </ActionButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
