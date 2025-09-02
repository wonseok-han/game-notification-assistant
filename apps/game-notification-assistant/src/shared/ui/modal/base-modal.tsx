import type { ModalStatusType } from '@shared/types/modal';
import type { AnimationWrapperProps } from '@shared/ui';

import { AnimationWrapper } from '@shared/ui';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps extends Omit<AnimationWrapperProps, 'isStart'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  status?: ModalStatusType | null;
}

/**
 * 공통 기본 모달 컴포넌트
 *
 * @param props
 * @param props.isOpen - 모달 열림 상태
 * @param props.onClose - 모달 닫기 함수
 * @param props.title - 모달 제목 (선택사항)
 * @param props.children - 모달 내용
 * @param props.size - 모달 크기 (sm, md, lg, xl, 2xl, full)
 * @param props.showCloseButton - 닫기 버튼 표시 여부 (기본값: true)
 * @param props.closeOnBackdropClick - 백드롭 클릭 시 닫기 여부 (기본값: true)
 * @param props.animation - 애니메이션 타입
 * @param props.animationDirection - 애니메이션 방향
 * @param props.animationDuration - 애니메이션 지속 시간
 */
export function BaseModal({
  animation = 'scale',
  animationDirection = 'center',
  animationDuration = 200,
  children,
  closeOnBackdropClick = true,
  isOpen,
  onClose,
  showCloseButton = true,
  size = 'md',
  status: statusProp,
  title,
}: BaseModalProps) {
  const [status, setStatus] = useState<ModalStatusType>('exited');

  // CSSTransition 방식의 상태 관리
  useEffect(() => {
    if (isOpen) {
      // 열기: entering -> entered
      setStatus('entering');
      requestAnimationFrame(() => {
        setStatus('entered');
      });
    } else {
      // 닫기: exiting -> exited
      setStatus('exiting');
      setTimeout(() => {
        setStatus('exited');
        onClose();
      }, animationDuration);
    }
  }, [isOpen, animationDuration, onClose]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (status === 'entering' || status === 'entered') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 body 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [status]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        (status === 'entering' || status === 'entered')
      ) {
        onClose();
      }
    };

    if (status === 'entering' || status === 'entered') {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [status, onClose]);

  // 상태를 전달받아 강제로 닫기
  useEffect(() => {
    if (statusProp === 'exiting') {
      handleClose();
    }
  }, [statusProp]);

  // CSSTransition 방식: state가 'exited'일 때만 컴포넌트 제거
  if (status === 'exited') return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  const handleClose = () => {
    setStatus('exiting');
    // 애니메이션 완료 후 onClose 호출
    setTimeout(() => {
      onClose();
    }, animationDuration);
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      handleClose();
    }
  };

  // 포탈을 사용해서 모달을 body에 직접 렌더링
  const modalContent = (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <AnimationWrapper
        animation={animation}
        animationDirection={animationDirection}
        animationDuration={animationDuration}
        className={`w-full max-h-svh ${sizeClasses[size]}`}
        isStart={status === 'entering' || status === 'entered'}
      >
        <div
          className={`bg-white backdrop-blur-md rounded-lg overflow-y-auto shadow-2xl border border-white/40`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  aria-label="모달 닫기"
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={handleClose}
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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
              )}
            </div>
          )}

          {/* 내용 */}
          <div className="p-6 pt-4">{children}</div>
        </div>
      </AnimationWrapper>
    </div>
  );

  // 포탈을 사용해서 modal-root에 렌더링
  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, modalRoot);
}
