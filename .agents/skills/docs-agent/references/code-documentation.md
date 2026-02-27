---
name: code-documentation
description: JSDoc/TSDoc 작성 가이드
---

# 코드 문서화 가이드

이 Skill은 문서화 에이전트가 코드 주석(JSDoc/TSDoc)을 작성하는 방법을 제공합니다.

## 문서화 원칙

### 1. 코드가 문서다
- 명확한 코드 > 주석
- 주석은 "왜"를 설명, "무엇"은 코드가 설명

### 2. 최신 상태 유지
- 코드 변경 시 주석도 업데이트
- 오래된 주석은 혼란을 줌

### 3. 선택적 문서화
- 모든 코드에 주석 불필요
- Public API, 복잡한 로직만

---

## 문서화 대상

### ✅ 반드시 문서화

#### 1. Public API
```typescript
/**
 * 사용자를 생성합니다.
 * 
 * @param email - 사용자 이메일 (유효성 검증 필수)
 * @param name - 사용자 이름
 * @returns 생성된 사용자 객체
 * @throws {ValidationError} 이메일 형식이 잘못된 경우
 * @throws {DuplicateError} 이미 존재하는 이메일인 경우
 * 
 * @example
 * ```typescript
 * const user = await createUser('test@example.com', 'Test User');
 * console.log(user.id); // '123'
 * ```
 */
export async function createUser(
  email: string, 
  name: string
): Promise<User> {
  // 구현...
}
```

#### 2. 복잡한 알고리즘
```typescript
/**
 * Quick Sort 알고리즘을 사용하여 배열을 정렬합니다.
 * 
 * 시간 복잡도: 
 * - 평균: O(n log n)
 * - 최악: O(n²)
 * 
 * 공간 복잡도: O(log n)
 * 
 * @param arr - 정렬할 숫자 배열
 * @returns 정렬된 배열 (원본 수정 없음)
 */
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}
```

#### 3. 외부 라이브러리 래퍼
```typescript
/**
 * Axios를 사용하여 HTTP 요청을 수행합니다.
 * 
 * 자동으로 다음을 처리합니다:
 * - 인증 토큰 추가
 * - 타임아웃 설정 (5초)
 * - 에러 로깅
 * 
 * @param url - 요청 URL
 * @param options - Axios 옵션
 * @returns 응답 데이터
 */
async function httpRequest<T>(
  url: string, 
  options?: AxiosRequestConfig
): Promise<T> {
  // 구현...
}
```

#### 4. 타입 정의 (복잡한 경우)
```typescript
/**
 * 사용자 객체
 * 
 * @property id - 고유 식별자 (UUID v4)
 * @property email - 이메일 주소 (소문자로 저장)
 * @property name - 표시 이름
 * @property created_at - 생성 시간 (ISO 8601)
 * @property is_active - 활성 상태 (false면 로그인 불가)
 */
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}
```

---

### ❌ 문서화 불필요

#### 1. 자명한 코드
```typescript
// ❌ 나쁜 예: 당연한 설명
/**
 * 사용자 수를 반환합니다.
 */
function getUserCount(): number {
  return users.length;  // 코드가 충분히 명확
}

// ✅ 좋은 예: 주석 없음
function getUserCount(): number {
  return users.length;
}
```

#### 2. Private 함수 (간단한 경우)
```typescript
// ✅ 주석 불필요
function formatEmail(email: string): string {
  return email.toLowerCase().trim();
}
```

#### 3. 테스트 코드
```typescript
// ✅ 테스트 이름이 문서 역할
it('should return 0 for empty array', () => {
  expect(sum([])).toBe(0);
});
```

---

## JSDoc/TSDoc 형식

### 기본 구조

```typescript
/**
 * 한 줄 요약
 * 
 * 상세 설명 (여러 줄 가능)
 * 
 * @param param_name - 파라미터 설명
 * @returns 반환값 설명
 * @throws {ErrorType} 에러 조건
 * 
 * @example
 * 사용 예시
 */
```

### 주요 태그

#### @param
```typescript
/**
 * @param email - 사용자 이메일
 * @param options - 선택적 설정
 * @param options.timeout - 타임아웃 (밀리초)
 * @param options.retry - 재시도 횟수
 */
function sendEmail(
  email: string, 
  options?: { timeout?: number; retry?: number }
) {}
```

#### @returns
```typescript
/**
 * @returns 사용자 객체 또는 null (없는 경우)
 */
function findUser(id: string): User | null {}

/**
 * @returns Promise<User[]> 모든 사용자 배열
 */
async function getUsers(): Promise<User[]> {}
```

#### @throws
```typescript
/**
 * @throws {ValidationError} 이메일 형식 오류
 * @throws {NetworkError} 네트워크 연결 실패
 * @throws {TimeoutError} 요청 타임아웃 (5초)
 */
async function registerUser(email: string) {}
```

#### @example
```typescript
/**
 * @example
 * ```typescript
 * const user = await createUser('test@example.com', 'Test');
 * console.log(user.id); // '123'
 * ```
 * 
 * @example
 * 여러 예시 가능
 * ```typescript
 * const admin = await createUser('admin@example.com', 'Admin');
 * ```
 */
```

#### @deprecated
```typescript
/**
 * @deprecated 대신 createUserV2를 사용하세요
 */
function createUser() {}
```

#### @see
```typescript
/**
 * @see createUser - 사용자 생성
 * @see https://docs.example.com/api - API 문서
 */
```

---

## 문서화 패턴

### 패턴 1: 함수 문서화

```typescript
/**
 * 주어진 배열의 평균을 계산합니다.
 * 
 * 빈 배열의 경우 0을 반환합니다.
 * 
 * @param numbers - 숫자 배열
 * @returns 평균값
 * 
 * @example
 * ```typescript
 * average([1, 2, 3, 4, 5]); // 3
 * average([]);              // 0
 * ```
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
```

### 패턴 2: 클래스 문서화

```typescript
/**
 * 사용자 관리 서비스
 * 
 * 사용자 생성, 조회, 수정, 삭제 기능을 제공합니다.
 * 
 * @example
 * ```typescript
 * const service = new UserService(db);
 * const user = await service.create('test@example.com');
 * ```
 */
class UserService {
  /**
   * @param db - 데이터베이스 연결
   */
  constructor(private db: Database) {}
  
  /**
   * 새 사용자를 생성합니다.
   * 
   * @param email - 사용자 이메일
   * @returns 생성된 사용자
   * @throws {DuplicateError} 이미 존재하는 이메일
   */
  async create(email: string): Promise<User> {
    // 구현...
  }
}
```

### 패턴 3: 인터페이스 문서화

```typescript
/**
 * API 요청 옵션
 */
interface RequestOptions {
  /**
   * 요청 타임아웃 (밀리초)
   * @default 5000
   */
  timeout?: number;
  
  /**
   * 재시도 횟수
   * @default 3
   */
  retry?: number;
  
  /**
   * 커스텀 헤더
   */
  headers?: Record<string, string>;
}
```

### 패턴 4: 제네릭 함수

```typescript
/**
 * 배열에서 조건을 만족하는 첫 번째 요소를 찾습니다.
 * 
 * @template T - 배열 요소 타입
 * @param arr - 검색할 배열
 * @param predicate - 조건 함수
 * @returns 찾은 요소 또는 undefined
 * 
 * @example
 * ```typescript
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * const user = find(users, u => u.id === 1);
 * console.log(user?.name); // 'Alice'
 * ```
 */
function find<T>(
  arr: T[], 
  predicate: (item: T) => boolean
): T | undefined {
  return arr.find(predicate);
}
```

---

## 주석 작성 가이드

### ✅ 좋은 주석

#### 1. "왜"를 설명
```typescript
// 메모리 누수 방지를 위해 캐시 크기 제한
if (cache.size > MAX_SIZE) {
  cache.delete(oldestKey);
}
```

#### 2. 복잡한 로직 설명
```typescript
// Fisher-Yates 알고리즘으로 배열 섞기
// 뒤에서부터 무작위로 교환하여 O(n) 시간에 완료
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
```

#### 3. 예상치 못한 동작 설명
```typescript
// Edge에서는 addEventListener가 once 옵션을 지원하지 않음
// 수동으로 removeEventListener 호출 필요
element.addEventListener('click', handler);
setTimeout(() => element.removeEventListener('click', handler), 0);
```

#### 4. TODO/FIXME
```typescript
// TODO: 성능 최적화 필요 (현재 O(n²))
function findDuplicates(arr: number[]): number[] {
  // ...
}

// FIXME: 타임존 처리 버그
function formatDate(date: Date): string {
  // ...
}
```

---

### ❌ 나쁜 주석

#### 1. 코드 반복
```typescript
// ❌ 나쁜 예
// user_count를 1 증가
user_count++;

// ✅ 주석 불필요
user_count++;
```

#### 2. 쓸모없는 설명
```typescript
// ❌ 나쁜 예
// 반복문
for (let i = 0; i < 10; i++) {
  // i 출력
  console.log(i);
}
```

#### 3. 주석 처리된 코드
```typescript
// ❌ 나쁜 예
function process() {
  // const old_code = doSomething();
  // return old_code * 2;
  
  return newImplementation();
}

// ✅ 좋은 예: 삭제
function process() {
  return newImplementation();
}
```

---

## 체크리스트

문서화 완료 후:

### 필수 문서화
- [ ] Public API 모두 문서화
- [ ] 복잡한 알고리즘 설명
- [ ] 에러 조건 명시 (@throws)
- [ ] 사용 예시 포함 (@example)

### 품질
- [ ] 한 줄 요약 명확
- [ ] 파라미터 설명 충분
- [ ] 반환값 설명 명확
- [ ] 타입 정보와 일치

### 유지보수
- [ ] 오래된 주석 제거
- [ ] 주석 처리된 코드 삭제
- [ ] TODO/FIXME 문서화

---

## 완료 기준

- [ ] Public API 100% 문서화
- [ ] 복잡한 로직 주석 추가
- [ ] @example 포함 (주요 함수)
- [ ] JSDoc/TSDoc 형식 준수
- [ ] 불필요한 주석 제거
