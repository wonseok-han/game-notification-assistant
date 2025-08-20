// ===== 카카오톡 알림 서비스 유틸리티 =====

// ===== 카카오톡 메시지 전송 (나에게 보내기) =====
export async function sendKakaoMemo(
  accessToken: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(
      'https://kapi.kakao.com/v2/api/talk/memo/default/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          template_object: JSON.stringify({
            object_type: 'text',
            text: message,
            link: {
              web_url: process.env.NEXT_PUBLIC_SITE_URL,
              mobile_web_url: process.env.NEXT_PUBLIC_SITE_URL,
            },
          }),
        }),
      }
    );

    const data = await response.json();

    if (data.result_code === 0) {
      return { success: true, messageId: `memo_${Date.now()}` };
    }
    return { success: false, error: data.msg || '메모 전송 실패' };
  } catch (error) {
    console.error('카카오톡 메모 전송 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

// ===== 게임 알림 메시지 생성 =====
export function createGameNotificationMessage(notification: {
  title: string;
  gameName: string;
  description?: string;
  scheduledTime: string;
}): string {
  return `🎮 ${notification.title}

게임: ${notification.gameName}
설명: ${notification.description || '설명 없음'}
알림 시간: ${new Date(notification.scheduledTime).toLocaleString('ko-KR')}

지금 바로 게임을 시작해보세요! 🚀`;
}
