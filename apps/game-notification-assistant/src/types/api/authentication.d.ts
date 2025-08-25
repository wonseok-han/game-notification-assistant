// ===== 사용자 정보 타입 =====
type UserType = {
  id: string;
  email: string;
  username: string;
};

// ===== 로그인 요청 타입 =====
type LoginRequestType = {
  email: string;
  password: string;
};

// ===== 회원가입 요청 타입 =====
type RegisterRequestType = {
  email: string;
  password: string;
  username: string;
};
