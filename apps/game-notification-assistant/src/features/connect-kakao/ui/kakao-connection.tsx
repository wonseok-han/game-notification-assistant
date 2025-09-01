'use client';

import { KakaoService } from '@entities/kakao/model/kakao-service';
import { useSnackbar, ActionButton } from '@repo/ui';
import { QueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const queryClient = new QueryClient();

export function KakaoConnection() {
  const kakaoService = new KakaoService(queryClient);

  // ===== 상태 관리 =====
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showSnackbar } = useSnackbar();

  // ===== 초기 연결 상태 확인 =====
  useEffect(() => {
    checkConnectionStatus();

    // postMessage 이벤트 리스너 추가
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'kakao-login-success') {
        setIsLoading(false);
        checkConnectionStatus();
      }
    };

    window.addEventListener('message', handleMessage);

    // 클린업
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  /**
   * 카카오톡 연결 상태 확인
   */
  const checkConnectionStatus = async () => {
    try {
      const data = await kakaoService.status();

      if (data.accessToken) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('연결 상태 확인 실패:', error);
      setIsConnected(false);
    }
  };

  /**
   * 카카오톡 로그인 핸들러
   * @returns {Promise<void>} 카카오톡 로그인 핸들러 결과
   */
  const handleKakaoLogin = async () => {
    setIsLoading(true);

    try {
      // 서버에서 카카오 OAuth URL 생성
      const data = await kakaoService.auth();

      if (data.authUrl) {
        // 팝업 창 열기
        const popup = window.open(
          data.authUrl,
          'kakao-login',
          'width=500,height=600,scrollbars=yes,resizable=yes,status=yes'
        );

        if (!popup) {
          showSnackbar({
            message: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.',
            type: 'warning',
            position: 'bottom-right',
            autoHideDuration: 6000,
          });
          setIsLoading(false);
          return;
        }

        // 팝업에서 로그인 완료 후 처리
        const checkLoginStatus = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkLoginStatus);
            setIsLoading(false);

            // 로그인 성공 여부 확인
            setTimeout(() => {
              checkConnectionStatus();
            }, 500);
          }
        }, 1000);

        // 팝업이 너무 오래 열려있으면 자동으로 닫기
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
            setIsLoading(false);
            showSnackbar({
              message: '로그인 시간이 초과되었습니다. 다시 시도해주세요.',
              type: 'error',
              position: 'bottom-right',
              autoHideDuration: 6000,
            });
          }
        }, 300000); // 5분
      } else {
        showSnackbar({
          message: '카카오 로그인 URL 생성에 실패했습니다.',
          type: 'error',
          position: 'bottom-right',
          autoHideDuration: 6000,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('카카오톡 로그인 오류:', error);
      showSnackbar({
        message: '카카오톡 로그인에 실패했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
      setIsLoading(false);
    }
  };

  /**
   * 카카오톡 연결 해제 핸들러
   * @returns {Promise<void>} 카카오톡 연결 해제 핸들러 결과
   */
  const handleDisconnect = async () => {
    if (!confirm('카카오톡 연결을 해제하시겠습니까?')) return;

    try {
      await kakaoService.disconnect();

      setIsConnected(false);
    } catch (error) {
      console.error('연결 해제 오류:', error);
      showSnackbar({
        message: '연결 해제에 실패했습니다.',
        type: 'error',
        position: 'bottom-right',
        autoHideDuration: 6000,
      });
    }
  };

  // ===== 연결된 상태 표시 =====
  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">카</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">카카오톡 사용자</p>
              <p className="text-sm text-green-600">연결됨</p>
            </div>
          </div>

          <ActionButton
            onClick={handleDisconnect}
            size="lg"
            variant="secondary"
          >
            연결 해제
          </ActionButton>
        </div>

        <div className="mt-3 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            카카오톡 알림이 활성화되어 있습니다. 게임 알림을 설정하면 지정된
            시간에 카카오톡으로 알림을 받을 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // ===== 연결되지 않은 상태 표시 =====
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-500 text-2xl">📱</span>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          카카오톡 연결이 필요합니다
        </h3>

        <p className="text-gray-600 mb-6">
          게임 알림을 카카오톡으로 받으려면 카카오톡 계정과 연결해야 합니다.
        </p>

        <ActionButton
          disabled={isLoading}
          onClick={handleKakaoLogin}
          size="lg"
          variant="primary"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
              연결 중...
            </div>
          ) : (
            <div className="flex items-center">
              <svg
                className="mr-2 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 3C6.477 3 2 6.477 2 12c0 4.411 2.865 8.138 6.839 9.439l-1.197 4.377a.5.5 0 0 0 .766.53l5.113-3.437c6.086-.392 10.48-5.422 10.48-10.909C24 6.477 19.523 3 12 3zm.374 13.931a.75.75 0 0 1-1.248-.832l2.203-3.303H9.841a.75.75 0 0 1 0-1.5h6.283a.75.75 0 0 1 .624 1.166l-2.203 3.303h2.488a.75.75 0 0 1 0 1.5h-4.659z" />
              </svg>
              카카오톡으로 연결하기
            </div>
          )}
        </ActionButton>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            💡 카카오톡 연결 후에는 게임 알림을 설정한 시간에 맞춰 카카오톡으로
            알림을 받을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
