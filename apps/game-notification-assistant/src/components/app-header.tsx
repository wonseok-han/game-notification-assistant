'use client';

import { ActionButton } from '@repo/ui';
import Link from 'next/link';
import React from 'react';

interface AppHeaderProps {
  title?: string;
  username?: string | null;
  variant?: 'solid' | 'translucent';
  onGoDashboard?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => Promise<void> | void;
}

/**
 * 반응형 상단 헤더 컴포넌트
 * - 모바일에서 세로 스택, 데스크톱에서 가로 정렬
 * - 사용자 인증 상태에 따라 우측 액션 영역 변경
 */
export function AppHeader({
  onGoDashboard,
  onLogin,
  onLogout,
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
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </Link>

            {/* 우측 액션 영역 */}
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                <div className="flex justify-between items-center w-full gap-2">
                  <span className="text-gray-700">
                    안녕하세요, {username}님!
                  </span>
                  {onGoDashboard ? (
                    <ActionButton
                      onClick={onGoDashboard}
                      size="md"
                      variant="primary"
                    >
                      대시보드로 이동
                    </ActionButton>
                  ) : null}
                  {onLogout ? (
                    <ActionButton
                      onClick={() => void onLogout()}
                      size="md"
                      variant="danger"
                    >
                      로그아웃
                    </ActionButton>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                <div className="flex items-center w-full gap-2">
                  {onLogin ? (
                    <ActionButton
                      onClick={onLogin}
                      size="md"
                      variant="secondary"
                    >
                      로그인
                    </ActionButton>
                  ) : null}
                  {onRegister ? (
                    <ActionButton
                      onClick={onRegister}
                      size="md"
                      variant="primary"
                    >
                      회원가입
                    </ActionButton>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
