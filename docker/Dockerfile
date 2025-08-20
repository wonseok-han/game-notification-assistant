# ===== 기본 스테이지 =====
FROM --platform=$BUILDPLATFORM node:22.17.0-alpine AS base

# pnpm 설치 및 설정
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# ===== 의존성 설치 스테이지 =====
FROM base AS deps

# 작업 디렉토리 설정
WORKDIR /app

# 소스 코드 복사 (node_modules 제외)
COPY . .

# 모든 패키지의 의존성 설치 (prepare 스크립트 제외)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ===== 빌드 스테이지 =====
FROM base AS builder

# deps 스테이지에서 소스 코드 복사
COPY --from=deps /app /app

# /app 디렉토리로 이동
WORKDIR /app

# 빌드 실행
RUN pnpm run build

# ===== 프로덕션 스테이지 =====
FROM base AS runner

# 시스템 사용자 생성 (보안 강화)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 작업 디렉토리 설정
WORKDIR /app

# Next.js standalone 출력에서 필요한 파일들만 복사
COPY --from=builder --chown=nextjs:nodejs /app/apps/dev-kit/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dev-kit/.next/static ./apps/dev-kit/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dev-kit/public ./apps/dev-kit/public

# 사용자 전환
USER nextjs

# 포트 노출
EXPOSE 3001

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# health 체크 (curl 대신 wget 사용)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pgrep -f "node.*server.js" || exit 1

# 애플리케이션 실행
CMD ["node", "apps/dev-kit/server.js"]
