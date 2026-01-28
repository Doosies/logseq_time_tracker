---
name: code-implementation
description: 코드 구현 체크리스트 및 가이드
---

# 코드 구현 가이드

이 Skill은 구현 에이전트가 코드를 작성할 때 사용하는 체크리스트와 가이드입니다.

## 구현 전 체크리스트

작업 시작 전 반드시 확인:

- [ ] **설계 문서 읽음**: 기획 에이전트가 작성한 설계 문서 숙지
- [ ] **관련 기존 코드 파악**: 수정할 파일 및 관련 파일 식별
- [ ] **필요한 의존성 확인**: 새로운 패키지 필요 여부 확인
- [ ] **테스트 전략 이해**: QA 에이전트에게 어떤 테스트가 필요한지 파악

## 구현 중 체크리스트

코드 작성 시 지속적으로 확인:

### 네이밍 컨벤션
- [ ] 변수명: `snake_case` 사용
  ```typescript
  const user_count = 10;  // ✅
  const userCount = 10;   // ❌
  ```
- [ ] 함수명: `camelCase` 사용
  ```typescript
  function calculateTotal() {}  // ✅
  function calculate_total() {} // ❌
  ```
- [ ] 클래스명: `PascalCase` 사용
- [ ] 상수: `UPPER_SNAKE_CASE` 사용

### 에러 처리
- [ ] 모든 에러 케이스 처리
- [ ] 의미 있는 에러 메시지
- [ ] 에러 로깅 포함

```typescript
// ❌ 나쁜 예
try {
  await fetchData();
} catch (e) {
  // 무시
}

// ✅ 좋은 예
try {
  await fetchData();
} catch (e) {
  logger.error('Failed to fetch data', { error: e });
  throw new DataFetchError('Unable to retrieve data', { cause: e });
}
```

### 테스트 가능한 코드
- [ ] 의존성 분리 (Dependency Injection)
- [ ] 순수 함수 우선
- [ ] 부작용 최소화

```typescript
// ❌ 나쁜 예: 테스트 어려움
function processUser() {
  const data = fetch('/api/user');  // 외부 의존성 하드코딩
  return data.name.toUpperCase();
}

// ✅ 좋은 예: 테스트 가능
function processUser(fetcher: Fetcher) {
  const data = fetcher.fetch('/api/user');
  return formatUserName(data.name);
}

function formatUserName(name: string): string {
  return name.toUpperCase();  // 순수 함수
}
```

### 코드 품질
- [ ] 함수 길이: 50줄 이내 권장
- [ ] 복잡도 낮추기: 중첩 if 최소화
- [ ] 의미 있는 변수명 사용
- [ ] 매직 넘버 상수화

```typescript
// ❌ 나쁜 예
if (x > 100 && y < 50) {
  // 100과 50이 무엇을 의미?
}

// ✅ 좋은 예
const MAX_RETRY_COUNT = 100;
const MIN_TIMEOUT_MS = 50;

if (retry_count > MAX_RETRY_COUNT && timeout_ms < MIN_TIMEOUT_MS) {
  // 의미 명확
}
```

## 구현 후 체크리스트

코드 작성 완료 후:

### Linter 실행
- [ ] **Linter 오류 0개** (필수)
- [ ] 경고도 가능한 해결
- [ ] `eslint-disable` 주석 최소화

```bash
# Linter 실행
npm run lint

# 자동 수정 가능한 것들
npm run lint:fix
```

### 코드 정리
- [ ] 불필요한 코드 제거
  - 사용하지 않는 import
  - 주석 처리된 코드
  - console.log 제거
- [ ] 주석 정리
  - 복잡한 로직만 주석
  - 당연한 내용 주석 제거
- [ ] 포매팅 확인

### 설계 일치 확인
- [ ] 설계 문서와 구현이 일치하는지 확인
- [ ] API 시그니처 일치
- [ ] 데이터 구조 일치
- [ ] 에러 처리 방식 일치

## 코드 예시

### ✅ 좋은 예: 완전한 함수

```typescript
/**
 * 주어진 아이템들의 총 가격을 계산합니다.
 * 
 * @param items - 가격을 계산할 아이템 배열
 * @returns 모든 아이템의 가격 합계
 * @throws {Error} items가 빈 배열이거나 null인 경우
 */
function calculateTotal(items: Item[]): number {
  // 입력 검증
  if (!items || items.length === 0) {
    throw new Error('Items cannot be empty');
  }
  
  // 계산
  const total = items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error(`Invalid price for item: ${item.name}`);
    }
    return sum + item.price;
  }, 0);
  
  return total;
}
```

### ❌ 나쁜 예

```typescript
// 문제점:
// 1. 함수명이 snake_case (camelCase여야 함)
// 2. 타입 없음
// 3. 에러 처리 없음
// 4. 변수명 불명확 (x, arr)
function calc_total(arr) {
  return arr.reduce((a, b) => a + b.p, 0);
}
```

## 파일 읽기 전략

코드 작성 전 관련 파일을 효율적으로 읽기:

### 1. 필요한 부분만 먼저 읽기
```markdown
큰 파일(500줄+)의 경우:
1. 파일 구조 파악 (import, export)
2. 관련 함수만 읽기
3. 전체 컨텍스트 필요 시 전체 읽기
```

### 2. 의존성 파악
```markdown
수정할 파일의 의존성:
1. import 문 확인
2. 사용하는 함수/클래스 식별
3. 필요 시 의존 파일 읽기
```

## 리팩토링 시 주의사항

기존 코드 개선 시:

- [ ] 기능 변경 없음 확인
- [ ] 모든 테스트 통과 확인
- [ ] 성능 저하 확인 (10% 이내)
- [ ] 변경 범위 최소화

## 완료 기준

다음 모든 항목 만족 시 구현 완료:

- [ ] 설계 문서와 일치
- [ ] Linter 오류 0개
- [ ] 변수명/함수명 컨벤션 준수
- [ ] 에러 처리 포함
- [ ] 테스트 가능한 구조
- [ ] 불필요한 코드 제거
- [ ] 주석 정리 완료
