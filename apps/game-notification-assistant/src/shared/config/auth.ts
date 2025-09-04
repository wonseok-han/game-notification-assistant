const AUTH_CONFIG = {
  // 보호된 라우트 (로그인 필요)
  PROTECTED_ROUTES: [
    '/dashboard', // 대시보드
  ],
  // 인증 페이지 (이미 로그인된 경우 접근 불가)
  USER_AUTH_ROUTES: [
    '/user/sign-in', // 로그인
    '/user/sign-up', // 회원가입
  ],
  // server middleware 인증 체크 생략 API 리스트
  AUTH_SKIP_ROUTES: [
    '/api/user/login', // 로그인
    '/api/user/logout', // 로그아웃
    '/api/user/register', // 회원가입
    '/api/user/verify', // 토큰 검증
    '/api/cron/notifications', // 알림 전송
    '/api/e2e/reset', // E2E 테스트 데이터 초기화
  ],
};

export default AUTH_CONFIG;
