---
name: code-review
description: 코드 리뷰 체크리스트 - 기능성, 가독성, 성능, 보안
---

# 코드 리뷰 가이드

이 Skill은 QA 에이전트가 코드 리뷰를 수행할 때 사용하는 체크리스트입니다.

## 리뷰 목적

- 버그 조기 발견
- 코드 품질 향상
- 일관성 유지
- 지식 공유

---

## 리뷰 영역

### 1. 기능성 (Functionality)

**체크리스트:**

- [ ] **요구사항 충족**: 설계 문서와 일치하는가?
- [ ] **예외 케이스 처리**: 모든 엣지 케이스를 고려했는가?
- [ ] **에러 핸들링**: 적절한 에러 처리가 있는가?
- [ ] **입력 검증**: 사용자 입력을 검증하는가?

**예시:**

```typescript
// ❌ 나쁜 예: 입력 검증 없음
function divide(a: number, b: number) {
  return a / b;  // b가 0이면?
}

// ✅ 좋은 예: 입력 검증
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
```

---

### 2. 가독성 (Readability)

**체크리스트:**

- [ ] **네이밍 명확**: 변수/함수명이 명확한가?
  - 변수: `snake_case`
  - 함수: `camelCase`
- [ ] **함수 길이**: 50줄 이내인가?
- [ ] **복잡도**: 중첩 if 3단계 이하인가?
- [ ] **주석**: 필요한 곳에만 주석이 있는가?

**예시:**

```typescript
// ❌ 나쁜 예: 이름 불명확, 너무 김
function proc(d) {
  if (d) {
    if (d.t === 'a') {
      if (d.v > 10) {
        // ... 50줄 ...
      }
    }
  }
}

// ✅ 좋은 예: 명확, 간결
function processApprovedData(data: Data) {
  if (!data) return;
  if (data.type !== 'approved') return;
  if (data.value <= 10) return;
  
  handleApprovedData(data);
}

function handleApprovedData(data: Data) {
  // 분리된 로직
}
```

---

### 3. 성능 (Performance)

**체크리스트:**

- [ ] **불필요한 연산 없음**: 중복 계산이 없는가?
- [ ] **메모리 누수 없음**: 리소스가 제대로 해제되는가?
- [ ] **비효율적 알고리즘 없음**: O(n²) → O(n) 가능한가?
- [ ] **불필요한 렌더링 없음** (React): useMemo/useCallback 필요한가?

**예시:**

```typescript
// ❌ 나쁜 예: O(n²)
function findDuplicates(arr: number[]): number[] {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

// ✅ 좋은 예: O(n)
function findDuplicates(arr: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  
  for (const num of arr) {
    if (seen.has(num)) {
      duplicates.add(num);
    }
    seen.add(num);
  }
  
  return Array.from(duplicates);
}
```

**메모리 누수 예시:**

```typescript
// ❌ 나쁜 예: 메모리 누수
class DataProcessor {
  private cache = new Map();
  
  process(data: Data) {
    this.cache.set(data.id, data);  // 계속 쌓임
    // ...
  }
}

// ✅ 좋은 예: 크기 제한
class DataProcessor {
  private cache = new Map();
  private MAX_CACHE_SIZE = 1000;
  
  process(data: Data) {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const first_key = this.cache.keys().next().value;
      this.cache.delete(first_key);
    }
    this.cache.set(data.id, data);
  }
}
```

---

### 4. 보안 (Security)

**체크리스트:**

- [ ] **입력 검증**: SQL Injection, XSS 방지
- [ ] **인증/인가**: 권한 체크가 있는가?
- [ ] **민감 정보**: 비밀번호, API 키가 노출되지 않는가?
- [ ] **안전한 의존성**: 알려진 취약점이 없는 패키지인가?

**SQL Injection 방지:**

```typescript
// ❌ 나쁜 예: SQL Injection 취약
async function getUser(email: string) {
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  return await db.query(query);
}

// ✅ 좋은 예: Prepared Statement
async function getUser(email: string) {
  const query = 'SELECT * FROM users WHERE email = ?';
  return await db.query(query, [email]);
}
```

**XSS 방지:**

```typescript
// ❌ 나쁜 예: XSS 취약
function renderHTML(user_input: string) {
  return `<div>${user_input}</div>`;  // <script> 태그 실행 가능
}

// ✅ 좋은 예: 이스케이프
function renderHTML(user_input: string) {
  const escaped = escapeHtml(user_input);
  return `<div>${escaped}</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

**민감 정보 보호:**

```typescript
// ❌ 나쁜 예: API 키 하드코딩
const API_KEY = 'sk-1234567890abcdef';

// ✅ 좋은 예: 환경 변수
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY not configured');
}
```

---

### 5. 테스트 가능성 (Testability)

**체크리스트:**

- [ ] **의존성 분리**: Mock 가능한가?
- [ ] **순수 함수**: 부작용이 분리되어 있는가?
- [ ] **작은 함수**: 단위 테스트 가능한가?
- [ ] **명확한 인터페이스**: 입출력이 명확한가?

**예시:**

```typescript
// ❌ 나쁜 예: 테스트 어려움
function processOrder() {
  const db = new Database();  // 하드코딩
  const order = db.getOrder();
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  db.updateOrder({ total });
}

// ✅ 좋은 예: 테스트 가능
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

async function processOrder(order_id: string, db: Database) {
  const order = await db.getOrder(order_id);
  const total = calculateTotal(order.items);
  await db.updateOrder(order_id, { total });
}
```

---

## 리뷰 프로세스

### 1. 사전 체크

리뷰 시작 전:

```markdown
- [ ] Linter 통과 확인
- [ ] 테스트 통과 확인
- [ ] 빌드 성공 확인
- [ ] 변경 범위 파악
```

### 2. 코드 읽기

```markdown
1. 전체 구조 파악
2. 주요 변경 사항 확인
3. 세부 로직 검토
4. 테스트 코드 검토
```

### 3. 피드백 작성

```markdown
**Critical (필수 수정):**
- 버그, 보안 이슈
- 기능 누락

**Major (권장 수정):**
- 성능 이슈
- 가독성 문제

**Minor (선택 수정):**
- 네이밍 개선
- 주석 추가
```

### 4. 재검토

```markdown
1. 수정 사항 확인
2. 새로운 이슈 없는지 확인
3. 승인 또는 재요청
```

---

## 리뷰 코멘트 작성 방법

### ✅ 좋은 코멘트

```markdown
# 구체적이고 건설적

"이 부분에서 `user_id`가 null일 수 있습니다. 
`if (!user_id)` 체크를 추가해주세요."

# 대안 제시

"이 반복문은 O(n²)입니다. 
Map을 사용하면 O(n)으로 개선할 수 있습니다:
```typescript
const map = new Map(items.map(item => [item.id, item]));
```"

# 긍정적 피드백도 포함

"에러 처리가 잘 되어 있습니다!"
```

### ❌ 나쁜 코멘트

```markdown
# 모호함
"이 부분 이상해요"

# 비건설적
"이렇게 하면 안 됩니다"

# 개인 취향
"저는 이 방식이 더 좋은데요"
```

---

## 자동화 도구 활용

### Linter
```bash
npm run lint
```
- 코딩 스타일
- 일반적인 버그 패턴
- 사용하지 않는 변수

### Type Checker
```bash
npm run type-check
```
- 타입 오류
- null/undefined 접근

### Security Scanner
```bash
npm audit
```
- 의존성 취약점

---

## 체크리스트 요약

코드 리뷰 완료 전:

### 기능성
- [ ] 요구사항 충족
- [ ] 예외 케이스 처리
- [ ] 에러 핸들링
- [ ] 입력 검증

### 가독성
- [ ] 네이밍 명확 (snake_case, camelCase)
- [ ] 함수 길이 적절 (50줄 이내)
- [ ] 복잡도 낮음 (중첩 3단계 이하)
- [ ] 주석 적절

### 성능
- [ ] 불필요한 연산 없음
- [ ] 메모리 누수 없음
- [ ] 효율적 알고리즘

### 보안
- [ ] 입력 검증 (SQL Injection, XSS)
- [ ] 인증/인가 체크
- [ ] 민감 정보 보호
- [ ] 안전한 의존성

### 테스트 가능성
- [ ] 의존성 분리
- [ ] 순수 함수 우선
- [ ] 단위 테스트 가능

---

## 승인 기준

다음 모든 조건 만족 시 승인:

- [ ] Critical 이슈 0개
- [ ] Major 이슈 해결 또는 설명
- [ ] Linter 오류 0개
- [ ] 모든 테스트 통과
- [ ] 보안 이슈 없음
- [ ] 성능 저하 10% 이내

---

## 완료 기준

- [ ] 전체 코드 리뷰 완료
- [ ] 모든 피드백 작성
- [ ] 승인 또는 수정 요청
- [ ] 리뷰 결과 문서화
