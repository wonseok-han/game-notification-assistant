# FSD + Service Layer + React Query 아키텍처 가이드

본 프로젝트는 **Feature-Sliced Design**을 기반으로 **Service Layer**, **HTTP Request Functions**, **React Query**를 결합한 아키텍처 패턴을 적용하여 확장 가능하고 유지보수하기 쉬운 구조로 설계되었습니다.

## 목차

- [아키텍처 개요](#아키텍처-개요)
- [프로젝트 구조](#프로젝트-구조)
- [레이어별 역할](#레이어별-역할)
- [세그먼트 구조](#세그먼트-구조)
- [핵심 원칙](#핵심-원칙)
- [개발 가이드라인](#개발-가이드라인)
- [실제 예시](#실제-예시)

## 아키텍처 개요

### 결합된 패턴들

1. **Feature-Sliced Design (FSD)**: 레이어와 슬라이스 기반 구조화
2. **Service Layer Pattern**: 비즈니스 로직과 API 호출 중앙화
3. **React Query (TanStack Query)**: 서버 상태 관리 및 캐싱

### 아키텍처의 목표

- **확장성**: 새로운 기능 추가가 용이
- **예측 가능성**: 코드의 위치와 역할이 명확
- **제어 가능성**: 변경의 영향 범위가 제한적
- **재사용성**: 컴포넌트와 로직의 재사용이 쉬움
- **캐시 관리**: React Query를 통한 효율적인 서버 상태 관리
- **일관성**: 서비스를 통한 중앙화된 API 호출

## 프로젝트 구조

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
│   │   ├── api/                 # HTTP Request Functions
│   │   ├── model/               # 도메인 모델 & 서비스
│   │   └── ui/                  # UI 컴포넌트
│   ├── notification/            # 알림 엔티티
│   │   ├── api/                 # HTTP Request Functions
│   │   ├── config/              # 설정
│   │   ├── lib/                 # 비즈니스 로직
│   │   ├── model/               # 도메인 모델 & 서비스
│   │   └── ui/                  # UI 컴포넌트
│   └── kakao/                   # 카카오 엔티티
│       ├── api/                 # HTTP Request Functions
│       └── model/               # 도메인 모델
└── shared/                       # Shared Layer - 공통 코드
    ├── config/                  # 설정
    ├── lib/                     # 공통 라이브러리
    │   ├── api/                 # API 클라이언트
    │   └── supabase/            # Supabase 클라이언트
    ├── providers/               # React Provider
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
- React Query 훅과 서비스 클래스 사용
- 독립적인 기능 단위

**예시**:
```typescript
// features/create-notification/ui/notification-form.tsx
import { useMutation } from '@tanstack/react-query';
import { NotificationService } from '@entities/notification/model/notification-service';

export function NotificationForm() {
  const createMutation = useMutation({
    mutationFn: (data) => notificationService.create(data),
    onSuccess: () => {
      // 성공 처리
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 알림 생성 폼 */}
    </form>
  );
}
```

### Entities Layer
**역할**: 비즈니스 엔티티, 도메인 모델, 서비스
- 비즈니스 도메인의 핵심 개념
- 데이터 모델과 관련 로직
- 재사용 가능한 UI 컴포넌트
- API 호출을 담당하는 서비스 클래스

**예시**:
```typescript
// entities/notification/model/notification-service.ts
export class NotificationService extends BaseService {
  async create(form: NotificationCreateFormType): Promise<NotificationCreateFormType> {
    const response = await createNotificationApi(form);
    this.invalidateQueries(['notifications']);
    return response;
  }
}

// entities/notification/ui/notification-card.tsx
export function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <div className="notification-card">
      <h3>{notification.title}</h3>
      <p>{notification.description}</p>
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
- React Provider

**예시**:
```typescript
// shared/lib/api/client/client.ts
export const apiClient = {
  get: <T>(url: string) => fetch(url).then(res => res.json() as T),
  post: <T>(url: string, data: unknown) => 
    fetch(url, { method: 'POST', body: JSON.stringify(data) })
};

// shared/providers/custom-query-client-provider.tsx
export function CustomQueryClientProvider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
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
├── api/          # HTTP Request Functions
│   ├── slice-api.ts      # API 요청 함수
│   └── index.ts          # Public API
├── config/       # 설정 파일
│   ├── constants.ts      # 상수
│   └── index.ts
├── lib/          # 비즈니스 로직, 유틸리티
│   ├── utils.ts          # 유틸리티 함수
│   ├── validators.ts     # 검증 로직
│   └── index.ts
├── model/        # 도메인 모델, 서비스, 상태 관리
│   ├── slice-dto.ts      # DTO 타입 정의
│   ├── slice-service.ts  # 서비스 클래스
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
import { NotificationService } from '@entities/notification/model/notification-service'; // ✅ feature → entity
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

### 4. 서비스 중심 아키텍처

모든 API 호출은 서비스 클래스를 통해 처리됩니다.

```typescript
// ✅ 올바른 방식
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
const notificationService = new NotificationService(queryClient);
await notificationService.create(formData);

// ❌ 잘못된 방식 (직접 API 호출)
await createNotificationApi(formData);
```

### 5. React Query 통합

서버 상태 관리는 React Query를 통해 처리됩니다.

```typescript
// ✅ 올바른 방식
const { data, isLoading } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => notificationService.getNotifications()
});

// ✅ 올바른 방식
const createMutation = useMutation({
  mutationFn: (data) => notificationService.create(data),
  onSuccess: () => {
    showSnackbar({
      message: '게임 알림이 성공적으로 생성되었습니다!',
      type: 'success',
      position: 'bottom-right',
      autoHideDuration: 6000,
    });
  }
});
```

## 개발 가이드라인

### 새로운 기능 추가 시

1. **Entity부터 정의**: 도메인 모델과 서비스 클래스
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

// HTTP Request Functions: 도메인-api
user-api.ts
notification-api.ts

// 서비스 클래스: 도메인-service
user-service.ts
notification-service.ts

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
  description: string;
  game_name: string;
  image_url: string;
  notification_times: {
    scheduled_time: string;
    is_enabled: boolean;
    raw_text?: string;
    label?: string;
  }[];
}

// entities/notification/api/notification-api.ts
export async function createNotificationApi(data: CreateNotificationRequestDto) {
  return apiPost('/api/notifications', data);
}

// entities/notification/model/notification-service.ts
export class NotificationService extends BaseService {
  async create(form: NotificationCreateFormType): Promise<NotificationCreateFormType> {
    const response = await createNotificationApi({
      title: form.title,
      description: form.description,
      game_name: form.gameName,
      image_url: form.imageUrl,
      notification_times: form.notificationTimes?.map((time) => ({
        scheduled_time: new Date(time.scheduledTime).toISOString(),
        is_enabled: time.isEnabled,
        raw_text: time.rawText,
        label: time.label,
      })),
    });

    this.invalidateQueries(['notifications']);
    return response;
  }
}

// features/create-notification/ui/notification-form.tsx
export function NotificationForm() {
  const createMutation = useMutation({
    mutationFn: (formData) => notificationService.create(formData),
    onSuccess: () => {
      showSnackbar({
        message: '게임 알림이 성공적으로 생성되었습니다!',
        type: 'success',
      });
    },
  });
  
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

### 3. 서비스 클래스 패턴

```typescript
// shared/lib/api/client/base-service.ts
export class BaseService {
  protected queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  protected invalidateQueries(queryKey: string[]): void {
    this.queryClient.invalidateQueries({ queryKey });
  }

  protected removeQueries(queryKey: string[]): void {
    this.queryClient.removeQueries({ queryKey });
  }

  protected setQueryData<T>(queryKey: string[], data: T): void {
    this.queryClient.setQueryData(queryKey, data);
  }

  protected getQueryData<T>(queryKey: string[]): T | undefined {
    return this.queryClient.getQueryData(queryKey);
  }

  protected clearCache(): void {
    this.queryClient.clear();
  }

  /**
   * 에러 처리 래퍼
   * @param operation 수행할 작업
   * @param errorMessage 에러 메시지
   * @returns 작업 결과
   */
  protected async handleError<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw error;
    }
  }
}

// entities/notification/model/notification-service.ts
export class NotificationService extends BaseService {
  async create(form: NotificationCreateFormType): Promise<NotificationCreateFormType> {
    return this.handleError(
      async () => {
        const response = await createNotificationApi(form);
        this.invalidateQueries(['notifications']);
        return response;
      },
      '알림 생성 실패'
    );
  }

  async getNotifications(): Promise<NotificationListType> {
    return this.handleError(
      async () => {
        const notifications = await getNotificationsApi();
        return notifications.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          gameName: item.game_name,
          imageUrl: item.image_url,
          isActive: item.is_active,
          notificationTimes: item.notification_times?.map((time) => ({
            id: time.id,
            notificationId: time.notification_id,
            scheduledTime: new Date(time.scheduled_time),
            status: time.status,
            isEnabled: time.is_enabled,
            rawText: time.raw_text || '',
            label: time.label || '',
          })),
        }));
      },
      '알림 목록 조회 실패'
    );
  }
}
```

### 4. React Query 훅 사용

```typescript
// features/list-notification/ui/notification-list.tsx
export function NotificationList() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      // 캐시 무효화는 서비스에서 처리됨
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationDto }) =>
      notificationService.update(id, data),
    onSuccess: () => {
      // 캐시 무효화는 서비스에서 처리됨
    },
  });

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      {notifications?.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDelete={() => deleteMutation.mutate(notification.id)}
          onUpdate={(data) => updateMutation.mutate({ id: notification.id, data })}
        />
      ))}
    </div>
  );
}
```

## 아키텍처 도입 효과

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

### ✅ 서비스 중심 아키텍처
- 모든 API 호출이 서비스를 통해 중앙화
- 캐시 관리와 에러 처리가 일관성 있게 처리
- React Query와의 통합이 용이

### ✅ 효율적인 캐시 관리
- React Query를 통한 자동 캐싱
- 서비스 레벨에서 캐시 무효화 처리
- 백그라운드 데이터 동기화

## 참고 자료

- [FSD 공식 문서](https://feature-sliced.design/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
