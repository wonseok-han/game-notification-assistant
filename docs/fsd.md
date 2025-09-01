# Feature-Sliced Design (FSD) 가이드

본 프로젝트는 **Feature-Sliced Design** 아키텍처 패턴을 적용하여 확장 가능하고 유지보수하기 쉬운 구조로 설계되었습니다.

## 목차

- [FSD란?](#fsd란)
- [앱 구조](#앱-구조)
- [레이어별 역할](#레이어별-역할)
- [세그먼트 구조](#세그먼트-구조)
- [핵심 원칙](#핵심-원칙)
- [개발 가이드라인](#개발-가이드라인)
- [실제 예시](#실제-예시)

## FSD란?

**Feature-Sliced Design**은 프론트엔드 애플리케이션을 위한 아키텍처 패턴으로, 코드를 **레이어(Layers)**와 **슬라이스(Slices)**, **세그먼트(Segment)**로 구조화하여 복잡성을 관리합니다.

### FSD의 목표

- **확장성**: 새로운 기능 추가가 용이
- **예측 가능성**: 코드의 위치와 역할이 명확
- **제어 가능성**: 변경의 영향 범위가 제한적
- **재사용성**: 컴포넌트와 로직의 재사용이 쉬움

## 앱 구조

```
apps/game-notification-assistant/src/
├── app/                          # App Layer - Next.js App Router
│   ├── api/                      # API Routes
│   ├── dashboard/                # 페이지 컴포넌트
│   ├── user/                     # 사용자 관련 페이지
│   ├── layout.tsx                # 전역 레이아웃
│   └── page.tsx                  # 홈페이지
├── widgets/                      # Widgets Layer - 복합 UI 블록
│   └── layout/
│       └── app-header.tsx        # 앱 헤더 위젯
├── features/                     # Features Layer - 비즈니스 기능
│   ├── connect-kakao/           # 카카오 연결 기능
│   ├── create-notification/     # 알림 생성 기능
│   ├── edit-notification/       # 알림 수정 기능
│   ├── list-notification/       # 알림 목록 기능
│   ├── sign-in-user/           # 로그인 기능
│   └── sign-up-user/           # 회원가입 기능
├── entities/                     # Entities Layer - 비즈니스 엔티티
│   ├── auth/                    # 인증 엔티티
│   │   └── model/               # 도메인 모델 & 상태
│   ├── user/                    # 사용자 엔티티
│   │   ├── api/                 # API 통신
│   │   ├── model/               # 도메인 모델
│   │   └── ui/                  # UI 컴포넌트
│   ├── notification/            # 알림 엔티티
│   │   ├── api/                 # API 통신
│   │   ├── config/              # 설정
│   │   ├── lib/                 # 비즈니스 로직
│   │   ├── model/               # 도메인 모델
│   │   └── ui/                  # UI 컴포넌트
│   └── kakao/                   # 카카오 엔티티
│       ├── api/                 # API 통신
│       └── model/               # 도메인 모델
└── shared/                       # Shared Layer - 공통 코드
    ├── config/                  # 설정
    ├── lib/                     # 공통 라이브러리
    │   ├── api/                 # API 클라이언트
    │   └── supabase/            # Supabase 클라이언트
    └── types/                   # 공통 타입 정의
```

## 레이어별 역할

### App Layer
**역할**: 애플리케이션 초기화, 라우팅, 글로벌 설정
- Next.js 페이지 컴포넌트
- 레이아웃 컴포넌트
- 글로벌 스타일
- 애플리케이션 진입점

**예시**:
```typescript
// app/dashboard/page.tsx
import { DashboardContent } from '@widgets/dashboard';
import { RequireAuth } from '@features/auth';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
```

### Widgets Layer
**역할**: 복합 UI 블록, 페이지의 독립적인 섹션
- 여러 feature를 조합한 복합 컴포넌트
- 페이지 레벨의 레이아웃 블록
- 비즈니스 로직을 포함하지 않는 UI 조합체

**예시**:
```typescript
// widgets/layout/app-header.tsx
import { UserProfile } from '@entities/user';
import { KakaoConnection } from '@features/connect-kakao';
import { NotificationFilters } from '@entities/notification';

export function AppHeader() {
  return (
    <header className="app-header">
      <NotificationFilters />
      <KakaoConnection />
      <UserProfile />
    </header>
  );
}
```

### Features Layer
**역할**: 사용자 상호작용, 비즈니스 기능
- 사용자가 수행할 수 있는 행동
- 비즈니스 로직과 UI의 조합
- 독립적인 기능 단위

**예시**:
```typescript
// features/create-notification/ui/notification-form.tsx
import { useCreateNotification } from '../model/create-notification-store';
import { NotificationCard } from '@entities/notification';

export function NotificationForm() {
  const { createNotification, isLoading } = useCreateNotification();
  
  return (
    <form onSubmit={createNotification}>
      {/* 알림 생성 폼 */}
    </form>
  );
}
```

### Entities Layer
**역할**: 비즈니스 엔티티, 도메인 모델
- 비즈니스 도메인의 핵심 개념
- 데이터 모델과 관련 로직
- 재사용 가능한 UI 컴포넌트

**예시**:
```typescript
// entities/notification/model/notification-domain.ts
export interface Notification {
  id: string;
  title: string;
  content: string;
  scheduledAt: Date;
  gameId: string;
  userId: string;
  status: 'pending' | 'sent' | 'failed';
}

// entities/notification/ui/notification-card.tsx
export function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <div className="notification-card">
      <h3>{notification.title}</h3>
      <p>{notification.content}</p>
    </div>
  );
}
```

### Shared Layer
**역할**: 재사용 가능한 공통 코드
- 유틸리티 함수
- 공통 컴포넌트
- 공통 타입
- 외부 라이브러리

**예시**:
```typescript
// shared/lib/api/client.ts
export const apiClient = {
  get: <T>(url: string) => fetch(url).then(res => res.json() as T),
  post: <T>(url: string, data: unknown) => 
    fetch(url, { method: 'POST', body: JSON.stringify(data) })
};

// shared/types/api.d.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

## 슬라이스와 세그먼트

### 용어 정의
- **슬라이스(Slices)**: 레이어 내에서 비즈니스 도메인별로 나뉜 단위 (예: `user`, `notification`, `auth`)
- **세그먼트(Segments)**: 슬라이스 내에서 기술적 목적별로 나뉜 단위 (예: `api`, `model`, `ui`)

### 세그먼트 구조

각 슬라이스 내부는 다음과 같은 세그먼트로 구성됩니다:

```
slice-name/
├── api/          # API 통신 로직
│   ├── hooks.ts          # React Query 훅
│   ├── requests.ts       # API 요청 함수
│   └── index.ts          # Public API
├── config/       # 설정 파일
│   ├── constants.ts      # 상수
│   └── index.ts
├── lib/          # 비즈니스 로직, 유틸리티
│   ├── utils.ts          # 유틸리티 함수
│   ├── validators.ts     # 검증 로직
│   └── index.ts
├── model/        # 도메인 모델, 상태 관리
│   ├── types.ts          # 타입 정의
│   ├── store.ts          # 상태 관리
│   └── index.ts
├── ui/           # UI 컴포넌트
│   ├── component.tsx     # 컴포넌트
│   ├── component.module.css  # 스타일
│   └── index.ts
└── index.ts      # 슬라이스 Public API
```

## 핵심 원칙

### 1. 레이어별 의존성 규칙

```
App → Widgets → Features → Entities → Shared
```

- **상위 레이어는 하위 레이어를 import 가능**
- **하위 레이어는 상위 레이어를 import 금지**
- **같은 레이어 간에는 직접 import 금지**

#### 의존성 매트릭스

| From \ To | shared | entities | features | widgets | app |
|-----------|--------|----------|----------|---------|-----|
| **shared** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **entities** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **features** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **widgets** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **app** | ✅ | ✅ | ✅ | ✅ | ❌ |

**의존성 규칙 설명**:
- **shared**: 가장 낮은 레벨, 다른 레이어에 의존하지 않음 (공통 유틸리티, 타입, 컴포넌트)
- **entities**: shared만 사용 가능, 다른 레이어에 의존하지 않음 (비즈니스 도메인 모델)
- **features**: shared와 entities 사용 가능, 다른 features나 widgets 사용 불가 (비즈니스 기능)
- **widgets**: shared, entities, features 사용 가능, 다른 widgets 사용 불가 (복합 UI 블록)
- **app**: 모든 레이어 사용 가능 (최상위 레벨, Next.js 페이지 및 레이아웃)



```typescript
// ✅ 올바른 예시
// features/create-notification/ui/form.tsx
import { NotificationCard } from '@entities/notification'; // ✅ feature → entity
import { Button } from '@shared/ui'; // ✅ feature → shared

// ❌ 잘못된 예시
// entities/notification/ui/card.tsx
import { CreateForm } from '@features/create-notification'; // ❌ entity → feature
```

### 2. 단일 책임

각 레이어와 슬라이스는 명확한 하나의 책임을 가집니다.

```typescript
// features/create-notification/ - 알림 생성 기능만 담당
// entities/user/ - 사용자 엔티티만 관리
// shared/api/ - API 통신만 담당
```

### 3. 재사용성

하위 레이어일수록 재사용 가능한 코드로 구성됩니다.

## 개발 가이드라인

### 새로운 기능 추가 시

1. **Entity부터 정의**: 도메인 모델과 기본 UI 컴포넌트
2. **Feature 구현**: 사용자 상호작용과 비즈니스 로직
3. **Widget 조합**: 여러 feature를 결합한 복합 UI
4. **App에서 사용**: 페이지에서 위젯을 배치

### 파일 네이밍 규칙

기본적으로 **kebab-case**를 사용하며, 도메인-명사 형태로 구성합니다.

```
// 컴포넌트 및 도메인 관련: 도메인-명사
notification-card.tsx
user-profile.tsx
notification.ts

// 설정 파일: 도메인-config
auth-config.ts
notification-config.ts

// DTO 타입: 도메인-dto
user-dto.ts
notification-dto.ts

// API 호출부: 도메인-api
user-api.ts
notification-api.ts

// Features: 동사-도메인 (사용자 행동 중심)
create-notification/      # 알림 생성
edit-notification/        # 알림 수정
list-notification/        # 알림 목록
sign-in-user/            # 사용자 로그인
sign-up-user/            # 사용자 회원가입
connect-kakao/           # 카카오 연결
```

## 실제 예시

### 1. 알림 생성 기능 구현

```typescript
// entities/notification/model/notification-dto.ts
export interface CreateNotificationRequestDto {
  title: string;
  content: string;
  scheduledAt: Date;
  gameId: string;
}

// entities/notification/api/notification-api.ts
export async function createNotification(data: CreateNotificationRequestDto) {
  return apiClient.post('/api/notifications', data);
}

// features/create-notification/model/create-notification-store.ts
export const useCreateNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const create = async (data: CreateNotificationRequestDto) => {
    setIsLoading(true);
    try {
      await createNotification(data);
      // 성공 처리
    } finally {
      setIsLoading(false);
    }
  };
  
  return { create, isLoading };
};

// features/create-notification/ui/notification-form.tsx
export function NotificationForm() {
  const { create, isLoading } = useCreateNotification();
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 구현 */}
    </form>
  );
}
```

### 2. 위젯에서 조합

```typescript
// widgets/layout/app-header.tsx
import { NotificationForm } from '@features/create-notification';
import { NotificationList } from '@features/list-notification';
import { NotificationFilters } from '@entities/notification';
import { KakaoConnection } from '@features/connect-kakao';

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-content">
        <NotificationFilters />
        <KakaoConnection />
      </div>
    </header>
  );
}
```

## FSD 도입 효과

### ✅ 확장성
- 새로운 기능 추가 시 기존 코드에 미치는 영향 최소화
- 레이어별로 독립적인 개발 가능

### ✅ 유지보수성
- 변경의 영향 범위가 명확
- 코드의 위치를 쉽게 예측 가능

### ✅ 테스트 용이성
- 레이어별로 격리된 단위 테스트 가능
- Mock과 Stub 적용이 쉬움

### ✅ 팀 협업
- 기능별로 작업을 분할하여 병렬 개발 가능
- 코드 리뷰 시 변경 범위가 명확

### ✅ 코드 이해도
- 직관적이고 예측 가능한 구조
- 새로운 팀원의 온보딩이 빠름

## 참고 자료

- [FSD 공식 문서](https://feature-sliced.design/)
- [FSD 실전 적용 가이드](https://velog.io/@floatletter91/FSDFeature-Sliced-Design%EB%A5%BC-%EC%A0%95%EB%A7%90-%EC%9E%98-%EC%A0%81%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
