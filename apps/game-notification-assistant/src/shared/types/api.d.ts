// ===== 공통 API 응답 타입 =====
type ApiResponseType<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};
