// ===== Request DTOs =====

// 로그인 요청 타입
export type LoginRequestDto = {
  email: string;
  password: string;
};

// 회원가입 요청 타입
export type RegisterRequestDto = {
  email: string;
  password: string;
  username: string;
};

// ===== Response DTOs =====

// 로그인 응답 타입
export type LoginResponseDto = {
  id: string;
  email: string;
  username: string;
};

// 회원가입 응답 타입
export type RegisterResponseDto = {
  id: string;
  email: string;
  username: string;
};

// 세션 검증 응답 타입
export type VerifyResponseDto = {
  id: string;
  email: string;
  username: string;
};
