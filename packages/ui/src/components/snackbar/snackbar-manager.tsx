'use client';

import { useCallback, useEffect, useState } from 'react';

import { Snackbar } from './snackbar';

type SnackbarItemType = {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  autoHideDuration?: number;
  className?: string;
};

interface SnackbarManagerProps {
  maxSnackbars?: number;
  className?: string;
}

/**
 * 스낵바 매니저 컴포넌트
 *
 * 여러 스낵바를 누적하여 표시하고 관리합니다.
 * 자동으로 전역 스낵바 함수를 등록하여 어디서든 사용할 수 있습니다.
 *
 * @param props
 * @param props.maxSnackbars - 최대 스낵바 개수 (기본값: 5)
 * @param props.className - 추가 CSS 클래스
 */
export function SnackbarManager({
  className = '',
  maxSnackbars = 5,
}: SnackbarManagerProps) {
  const [snackbars, setSnackbars] = useState<SnackbarItemType[]>([]);

  // 스낵바 추가 함수
  const addSnackbar = (snackbar: Omit<SnackbarItemType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newSnackbar: SnackbarItemType = {
      id,
      ...snackbar,
    };

    setSnackbars((prev) => {
      const updated = [...prev, newSnackbar];
      // 최대 개수 제한
      return updated.slice(-maxSnackbars);
    });
  };

  // 스낵바 제거 함수
  const removeSnackbar = (id: string) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  // 전역 함수로 등록
  useEffect(() => {
    (window as Window & { showSnackbar?: typeof addSnackbar }).showSnackbar =
      addSnackbar;

    return () => {
      delete (window as Window & { showSnackbar?: typeof addSnackbar })
        .showSnackbar;
    };
  }, [maxSnackbars]);

  // 위치별로 스낵바 그룹화
  const groupedSnackbars = snackbars.reduce(
    (acc, snackbar) => {
      const position = snackbar.position || 'bottom-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(snackbar);
      return acc;
    },
    {} as Record<string, SnackbarItemType[]>
  );

  return (
    <div className={className}>
      {Object.entries(groupedSnackbars).map(([position, positionSnackbars]) => (
        <div key={position}>
          {positionSnackbars.map((snackbar, index) => (
            <Snackbar
              key={snackbar.id}
              autoHideDuration={snackbar.autoHideDuration}
              className={snackbar.className}
              isVisible={true}
              message={snackbar.message}
              onClose={() => removeSnackbar(snackbar.id)}
              position={snackbar.position}
              style={{
                transform: `translateY(-${index * 60}px)`,
                zIndex: 1000 + (positionSnackbars.length - index),
              }}
              type={snackbar.type}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// 훅 타입 정의
type SnackbarType = 'error' | 'success' | 'info' | 'warning';
type SnackbarPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ShowSnackbarOptions {
  message: string;
  type?: SnackbarType;
  position?: SnackbarPosition;
  autoHideDuration?: number;
  className?: string;
}

/**
 * 스낵바를 쉽게 사용할 수 있는 커스텀 훅
 *
 * @returns showSnackbar 함수
 */
export function useSnackbar() {
  const showSnackbar = useCallback((options: ShowSnackbarOptions) => {
    const showSnackbarGlobal = (
      window as Window & {
        showSnackbar?: (options: ShowSnackbarOptions) => void;
      }
    ).showSnackbar;

    if (showSnackbarGlobal) {
      showSnackbarGlobal({
        type: 'info',
        position: 'bottom-right',
        autoHideDuration: 5000,
        ...options,
      });
    }
  }, []);

  return { showSnackbar };
}
