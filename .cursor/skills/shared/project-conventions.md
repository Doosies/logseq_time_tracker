---
name: project-conventions
description: 프로젝트 전체 컨벤션 - AGENTS.md 상세 버전
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

### TypeScript/JavaScript

```
kebab-case.ts

✅ 올바른 예:
- user-service.ts
- api-client.ts
- auth-middleware.ts
- calculate-total.ts

❌ 잘못된 예:
- UserService.ts
- user_service.ts
- apiClient.ts
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

---

## 코드 구조

### Import 순서

```typescript
// 1. 외부 라이브러리
import React from 'react';
import express from 'express';

// 2. 내부 절대 경로
import { UserService } from '@/services';
import { User } from '@/types';

// 3. 상대 경로
import { helper } from './helper';
import { config } from '../config';

// 4. 타입 import
import type { ApiResponse } from './types';
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
source-file.test.ts

✅ 올바른 예:
- user-service.test.ts
- calculate-total.test.ts

❌ 잘못된 예:
- user-service.spec.ts
- test-user-service.ts
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

## 완료 기준

이 컨벤션을 모든 코드에 일관되게 적용:

- [ ] 네이밍: snake_case, camelCase, PascalCase
- [ ] 파일명: kebab-case
- [ ] Import 순서 준수
- [ ] 에러 처리 명확
- [ ] 테스트 네이밍 일관
- [ ] Git 커밋 형식 준수
