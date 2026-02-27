---
name: project-conventions
description: "Project-wide coding conventions and style guide. Use when checking naming rules (snake_case variables, camelCase functions, PascalCase components), file naming patterns (.svelte, .css.ts, .test.ts), import/export ordering, Svelte 5 component structure, Vanilla Extract CSS naming, Git commit format, or environment variable setup. Detailed reference for AGENTS.md."
---

# 프로젝트 컨벤션

이 Skill은 모든 에이전트가 참조하는 프로젝트 전체 컨벤션을 제공합니다.
AGENTS.md의 상세 버전입니다.

## 네이밍 컨벤션 (상세)

### 변수명: snake_case

```typescript
// ✅ 올바른 예
const user_count = 10;
const max_retry_count = 3;
const is_authenticated = true;
const api_response_data = {};
const total_price_with_tax = 100;

// 배열
const user_list = [];
const active_sessions = [];

// 불리언
const is_loading = false;
const has_permission = true;
const can_edit = false;

// ❌ 잘못된 예
const userCount = 10;
const maxRetryCount = 3;
const IsAuthenticated = true;
```

### 함수명: camelCase

```typescript
// ✅ 올바른 예
function calculateTotal() {}
function fetchUserData() {}
function isValidEmail(email: string): boolean {}
async function processPayment() {}

// 동사로 시작
function getUserById(id: string) {}
function validateInput(data: any) {}
function createNewOrder() {}

// 불리언 반환: is/has/can
function isAdmin() {}
function hasPermission() {}
function canEdit() {}

// ❌ 잘못된 예
function calculate_total() {}
function FetchUserData() {}
function user() {} // 동사 없음
```

### 클래스명: PascalCase

```typescript
// ✅ 올바른 예
class UserManager {}
class PaymentProcessor {}
class ApiClient {}
class DatabaseConnection {}

// ❌ 잘못된 예
class userManager {}
class payment_processor {}
class apiClient {}
```

### 상수: UPPER_SNAKE_CASE

```typescript
// ✅ 올바른 예
const MAX_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT_MS = 5000;
const ERROR_MESSAGES = {
  NOT_FOUND: 'Not found',
  UNAUTHORIZED: 'Unauthorized'
};

// ❌ 잘못된 예
const maxAttempts = 3;
const apiBaseUrl = 'https://api.example.com';
const MaxAttempts = 3;
```

### 인터페이스/타입: PascalCase

```typescript
// ✅ 올바른 예
interface User {
  id: string;
  email: string;
}

type UserRole = 'admin' | 'user';

interface ApiResponse<T> {
  data: T;
  status: number;
}

// ❌ 잘못된 예
interface user {}
interface IUser {} // I 접두사 지양
type userRole = 'admin';
```

---

## 파일명 컨벤션

### 일반 TypeScript/JavaScript 파일

```
snake_case.ts

✅ 올바른 예:
- url_service.ts
- api_client.ts
- auth_middleware.ts
- format_date.ts

❌ 잘못된 예:
- UserService.ts    // PascalCase는 컴포넌트만
- user-service.ts   // kebab-case 사용하지 않음
- apiClient.ts      // camelCase는 hook만
```

### React 컴포넌트

```
PascalCase.tsx

✅ 올바른 예:
- Button.tsx
- UserProfile.tsx
- NavigationBar.tsx

❌ 잘못된 예:
- button.tsx
- user-profile.tsx
```

### Svelte 컴포넌트

```
PascalCase.svelte

✅ 올바른 예:
- Button.svelte
- ActionBar.svelte
- ServerPanel.svelte

❌ 잘못된 예:
- button.svelte
- action-bar.svelte
```

### Hook 파일

```
camelCase.ts

✅ 올바른 예:
- useAuth.ts
- useTheme.ts
- useLocalStorage.ts

❌ 잘못된 예:
- use_auth.ts
- UseAuth.ts
```

---

## 코드 구조

### Import 순서

```typescript
// 1. 외부 라이브러리
import { onMount } from 'svelte';
import express from 'express';

// 2. 모노레포 패키지
import { Button } from '@personal/uikit';

// 3. 내부 절대 경로 (Node.js subpath imports)
import { buildEc5Url } from '#services/url_service';
import type { ParsedUrl } from '#types/server';

// 4. 상대 경로
import { helper } from './helper';
import { config } from '../config';
```

### 경로 별칭 (Subpath Imports)

프로젝트 내부 모듈 참조에는 Node.js subpath imports (`#`) 를 사용합니다.
Vite의 `resolve.alias` 대신 `package.json`의 `imports` 필드와 `tsconfig.json`의 `paths`를 동기화합니다.

```jsonc
// package.json
{
  "imports": {
    "#services/*": "./src/services/*",
    "#stores/*": "./src/stores/*",
    "#types/*": "./src/types/*"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "#services/*": ["src/services/*"],
      "#stores/*": ["src/stores/*"],
      "#types/*": ["src/types/*"]
    }
  }
}
```

### Export 순서

```typescript
// 1. 타입
export type { User, UserRole };
export interface UserData {}

// 2. 상수
export const MAX_COUNT = 10;

// 3. 함수
export function calculateTotal() {}

// 4. 클래스
export class UserService {}

// 5. Default export (파일 끝)
export default UserService;
```

---

## 주석 규칙

### JSDoc: Public API만

```typescript
/**
 * 사용자를 생성합니다.
 * 
 * @param email - 사용자 이메일
 * @param name - 사용자 이름
 * @returns 생성된 사용자 객체
 */
export function createUser(email: string, name: string): User {
  // 구현...
}
```

### 인라인 주석: 왜(Why)를 설명

```typescript
// ✅ 좋은 예: "왜"를 설명
// 메모리 누수 방지를 위해 캐시 크기 제한
if (cache.size > MAX_SIZE) {
  cache.delete(oldestKey);
}

// ❌ 나쁜 예: "무엇"을 반복
// cache 크기가 MAX_SIZE보다 크면 oldestKey 삭제
if (cache.size > MAX_SIZE) {
  cache.delete(oldestKey);
}
```

### TODO/FIXME

```typescript
// TODO: 성능 최적화 필요 (이슈 #123)
function slowFunction() {}

// FIXME: 타임존 처리 버그 (이슈 #456)
function formatDate(date: Date) {}
```

---

## 에러 처리

### 명확한 에러 클래스

```typescript
// ✅ 좋은 예
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid email', 'email');

// ❌ 나쁜 예
throw new Error('error'); // 모호함
throw 'error'; // string throw 금지
```

### 에러 로깅

```typescript
// ✅ 좋은 예
try {
  await fetchData();
} catch (error) {
  logger.error('Failed to fetch data', {
    error,
    context: { user_id, timestamp: new Date() }
  });
  throw new DataFetchError('Unable to retrieve data', { cause: error });
}

// ❌ 나쁜 예
try {
  await fetchData();
} catch (error) {
  console.log(error); // console.log 지양
  // 에러 무시 금지
}
```

---

## 테스트 컨벤션

### 테스트 파일명

```
source_file.test.ts

✅ 올바른 예:
- url_service.test.ts
- format_date.test.ts

❌ 잘못된 예:
- url-service.spec.ts
- test_url_service.ts
```

### 테스트 구조

```typescript
describe('calculateTotal', () => {
  // 정상 케이스
  it('should return sum of all items', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });
  
  // 엣지 케이스
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  // 에러 케이스
  it('should throw error for negative numbers', () => {
    expect(() => calculateTotal([-1])).toThrow('Negative numbers not allowed');
  });
});
```

---

## Git 컨벤션

### 커밋 메시지

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서만 변경
- `style`: 포매팅 (코드 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

**예시:**
```
feat: add user authentication

- Add login/logout endpoints
- Implement JWT token generation
- Add session management

Closes #123
```

### 브랜치명

```
<type>/<description>

✅ 올바른 예:
- feature/user-auth
- fix/login-bug
- refactor/api-client

❌ 잘못된 예:
- new-feature
- bug-fix
- my-branch
```

---

## 환경 변수

### .env 파일

```bash
# Database
DATABASE_URL=postgresql://localhost:5432/db
DATABASE_POOL_SIZE=10

# API
API_KEY=your-api-key
API_TIMEOUT_MS=5000

# Server
PORT=3000
NODE_ENV=development
```

### 사용

```typescript
// ✅ 좋은 예: 검증 포함
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY is required');
}

// ❌ 나쁜 예: 검증 없음
const API_KEY = process.env.API_KEY;
// API_KEY가 undefined일 수 있음
```

---

---

## 프레임워크별 컨벤션

### Svelte 프로젝트

> 상세 규칙은 `developer/svelte-conventions.md` 참조.

**핵심 원칙**: 컴포넌트 내부(`.svelte`)는 `camelCase` 사용, 외부 `.ts` 파일은 `snake_case` 유지.

#### 파일/폴더 네이밍

| 대상 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 파일 | `PascalCase.svelte` | `Button.svelte` |
| 컴포넌트 폴더 | `PascalCase/` | `Button/` |
| 스타일 파일 | `snake_case.css.ts` | `button_group.css.ts` |
| 스토어 파일 | `snake_case.ts` | `current_tab.ts` |
| 서비스 파일 | `snake_case.ts` | `url_service.ts` |

#### 컴포넌트 내부 네이밍 (camelCase 예외 구역)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  // ✅ Props 인터페이스: PascalCase + Props suffix
  interface ButtonProps {
    variant?: 'primary' | 'secondary';  // camelCase 속성
    fullWidth?: boolean;                  // camelCase 속성
    onclick?: () => void;                 // 소문자 (DOM 이벤트)
    onToggle?: () => void;                // onXxx camelCase (커스텀 이벤트)
    children: Snippet;
  }

  // ✅ $props 구조분해: camelCase
  let { variant, fullWidth, onclick, onToggle, children }: ButtonProps = $props();

  // ✅ $state / $derived: camelCase
  let isActive = $state(false);
  let currentClass = $derived(variant === 'primary' ? 'btn-primary' : 'btn-secondary');

  // ✅ 함수명: camelCase
  const getClassNames = (): string => { return ''; };

  // ✅ 이벤트 핸들러: handleXxx camelCase
  const handleClick = () => { onclick?.(); };
</script>
```

#### CSS/스타일 네이밍 (snake_case 유지)

```typescript
// button_group.css.ts - ✅ snake_case 유지
export const button_group_container = style({...});
export const button_variant_primary = style({...});
export const theme_vars = createThemeContract({...});
```

#### 디렉토리 구조

```
src/
  components/
    Button/
      Button.svelte       # PascalCase/PascalCase.svelte
      index.ts            # barrel export
  design/
    styles/
      button.css.ts       # snake_case.css.ts
      button_group.css.ts # snake_case.css.ts (다단어)
    theme/
      contract.css.ts
  stores/
    current_tab.ts        # snake_case.ts
  services/
    url_service.ts        # snake_case.ts
```

**TypeScript 설정**:
- `verbatimModuleSyntax: false` (Svelte 컴파일러와 호환 안됨)
- `jsx: "preserve"` (Svelte가 처리)
- ESLint: `eslint-plugin-svelte` 사용

### React 프로젝트

**TypeScript 설정**:
- `verbatimModuleSyntax: true` 사용 가능
- `jsx: "react-jsx"`

**디렉토리 구조**:
```
src/
  components/
    Button.tsx            # PascalCase.tsx
  hooks/
    useAuth.ts            # camelCase.ts
  utils/
    format_date.ts        # snake_case.ts
```

### Node.js 프로젝트

**TypeScript 설정**:
- `esModuleInterop: true` (CommonJS 호환)
- `verbatimModuleSyntax: false` (CJS/ESM 혼용 시)
- `noEmit: false` (빌드 출력 필요)

---

## 완료 기준

이 컨벤션을 모든 코드에 일관되게 적용:

- [ ] 네이밍: snake_case, camelCase, PascalCase
- [ ] 파일명: snake_case.ts (일반), PascalCase.tsx/.svelte (컴포넌트)
- [ ] Import 순서 준수
- [ ] 에러 처리 명확
- [ ] 테스트 네이밍 일관
- [ ] Git 커밋 형식 준수
- [ ] 프레임워크별 TypeScript 설정 준수
