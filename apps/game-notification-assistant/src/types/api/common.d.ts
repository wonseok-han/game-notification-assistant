interface ApiResponseType<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ===== 사용자 정보 타입 =====
interface UserType {
  id: string;
  email: string;
  username: string;
}

// ===== 로그인 요청 타입 =====
interface LoginRequestType {
  email: string;
  password: string;
}

// ===== 회원가입 요청 타입 =====
interface RegisterRequestType {
  email: string;
  password: string;
  username: string;
}
