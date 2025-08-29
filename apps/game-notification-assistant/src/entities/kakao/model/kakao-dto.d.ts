// 카카오 상태 응답 타입
export type KakaoStatusResponseDto = {
  accessToken: string;
  expiresAt: string;
  isRefreshed: boolean;
};

// 카카오 인증 응답 타입
export type KakaoAuthResponseDto = {
  authUrl: string;
};
