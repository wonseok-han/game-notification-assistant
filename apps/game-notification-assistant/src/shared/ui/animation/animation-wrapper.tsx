import type {
  AnimationDirection,
  AnimationType,
} from '@shared/types/animation';

import { useEffect, useState } from 'react';

export interface AnimationWrapperProps {
  children: React.ReactNode;
  isStart: boolean;
  animation?: AnimationType;
  animationDirection?: AnimationDirection;
  animationDuration?: number;
  className?: string;
}

/**
 * 애니메이션을 관리하는 재사용 가능한 wrapper 컴포넌트
 *
 * @param props
 * @param props.children - 애니메이션이 적용될 자식 요소
 * @param props.isStart - 애니메이션 시작 여부
 * @param props.animation - 애니메이션 타입
 * @param props.animationDirection - 애니메이션 방향 (slide 애니메이션에만 적용)
 * @param props.animationDuration - 애니메이션 지속 시간 (ms)
 * @param props.className - 추가 CSS 클래스
 */
export function AnimationWrapper({
  animation = 'fade',
  animationDirection = 'center',
  animationDuration = 200,
  children,
  className = '',
  isStart,
}: AnimationWrapperProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isStart);

  useEffect(() => {
    if (isStart) {
      setShouldRender(true);
      // 다음 프레임에서 애니메이션 시작
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      setIsAnimating(false);
      // 애니메이션 완료 후 컴포넌트 제거
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isStart, animationDuration]);

  if (!shouldRender) return null;

  // 애니메이션 클래스 생성 함수
  const getAnimationClasses = () => {
    if (animation === 'none') {
      return '';
    }

    const baseClasses = `transition-all duration-${animationDuration} ease-out`;

    if (animation === 'fade') {
      return `${baseClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;
    }

    if (animation === 'scale') {
      return `${baseClasses} transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`;
    }

    if (animation === 'slide') {
      const directionClasses = {
        up: isAnimating ? 'translate-y-0' : 'translate-y-16',
        down: isAnimating ? 'translate-y-0' : '-translate-y-16',
        left: isAnimating ? 'translate-x-0' : 'translate-x-16',
        right: isAnimating ? 'translate-x-0' : '-translate-x-16',
        center: isAnimating ? 'translate-y-0' : 'translate-y-16',
      };

      return `${baseClasses} transform ${directionClasses[animationDirection]} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;
    }

    if (animation === 'bounce') {
      return `${baseClasses} transform ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-110 opacity-0 translate-y-8'}`;
    }

    if (animation === 'zoom') {
      return `${baseClasses} transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`;
    }

    // 기본값 (fade)
    return `${baseClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;
  };

  return (
    <div className={`${getAnimationClasses()} ${className}`}>{children}</div>
  );
}
