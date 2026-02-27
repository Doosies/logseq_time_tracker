---
name: coverage-check
description: 테스트 커버리지 측정 및 80% 달성 가이드
---

# 커버리지 체크 가이드

이 Skill은 QA 에이전트가 테스트 커버리지를 측정하고 목표(80%)를 달성하는 방법을 제공합니다.

## 커버리지 유형

### 1. Line Coverage (라인 커버리지)
- 실행된 코드 라인 비율
- 가장 기본적인 지표

### 2. Branch Coverage (분기 커버리지)
- 모든 조건문의 true/false 경로 실행 비율
- Line보다 엄격한 기준

### 3. Function Coverage (함수 커버리지)
- 호출된 함수 비율

### 4. Statement Coverage (구문 커버리지)
- 실행된 구문 비율

**목표: 전체 80% 이상 (Line Coverage 기준)**

---

## 커버리지 측정

### Vitest 사용

```bash
# 커버리지 포함 테스트 실행
npm test -- --coverage

# HTML 리포트 생성
npm test -- --coverage --reporter=html
```

**출력 예시:**
```
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                       |   82.5  |   78.3   |   85.2  |   82.5  |
 src/utils                      |   95.2  |   92.1   |   100   |   95.2  |
  calculator.ts                 |   100   |   100    |   100   |   100   |
  formatter.ts                  |   90.5  |   84.2   |   100   |   90.5  |
 src/api                        |   75.3  |   68.9   |   78.5  |   75.3  |
  user-service.ts               |   68.2  |   60.0   |   75.0  |   68.2  |
  auth-service.ts               |   82.4  |   77.8   |   82.0  |   82.4  |
--------------------------------|---------|----------|---------|---------|
```

---

## MCP 도구 활용

### vitest-coverage-analyzer (사용 가능 시)

```typescript
// 전체 프로젝트 커버리지
const coverage = await mcp.get_coverage({ 
  project_path: "." 
});

console.log(`Total Coverage: ${coverage.total * 100}%`);

// 80% 미만이면
if (coverage.total < 0.8) {
  console.log('⚠️ 커버리지 부족');
  console.log('미커버 파일:', coverage.uncovered_files);
}

// 파일별 커버리지
for (const file of coverage.files) {
  if (file.coverage < 0.8) {
    console.log(`${file.path}: ${file.coverage * 100}% (부족)`);
  }
}

// 임계값 체크
const result = await mcp.check_threshold({ threshold: 0.8 });
if (!result.pass) {
  console.log('실패 파일:');
  result.failures.forEach(f => {
    console.log(`- ${f.file}: ${f.coverage * 100}%`);
  });
}
```

---

## 커버리지 부족 파일 개선

### 1. 미커버 라인 식별

**HTML 리포트 확인:**
```bash
# HTML 리포트 생성
npm test -- --coverage --reporter=html

# coverage/index.html 브라우저에서 열기
```

빨간색으로 표시된 라인 = 미커버

### 2. 테스트 추가 전략

#### 전략 A: 기존 테스트 확장

```typescript
// 기존 테스트
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
});

// 미커버 라인: 에러 처리
function divide(a: number, b: number): number {
  if (b === 0) {  // ← 이 라인 미커버
    throw new Error('Division by zero');
  }
  return a / b;
}

// 테스트 추가
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  
  it('should throw error when dividing by zero', () => {  // ← 추가
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});
```

#### 전략 B: 엣지 케이스 테스트 추가

```typescript
// 함수
function calculateDiscount(price: number, rate: number): number {
  if (price < 0) return 0;        // ← 라인 1
  if (rate < 0 || rate > 1) return price;  // ← 라인 2
  return price * (1 - rate);      // ← 라인 3
}

// 기존 테스트 (라인 3만 커버)
it('should calculate discount', () => {
  expect(calculateDiscount(100, 0.1)).toBe(90);
});

// 엣지 케이스 추가 (라인 1, 2 커버)
it('should return 0 for negative price', () => {
  expect(calculateDiscount(-100, 0.1)).toBe(0);
});

it('should return original price for invalid rate', () => {
  expect(calculateDiscount(100, -0.1)).toBe(100);
  expect(calculateDiscount(100, 1.5)).toBe(100);
});
```

#### 전략 C: 분기 커버리지 개선

```typescript
// 함수
function getUserStatus(user: User): string {
  if (user.is_active) {
    if (user.is_verified) {
      return 'active-verified';     // ← 분기 1
    }
    return 'active-unverified';     // ← 분기 2
  }
  return 'inactive';                // ← 분기 3
}

// 모든 분기 커버
describe('getUserStatus', () => {
  it('should return active-verified', () => {
    expect(getUserStatus({ is_active: true, is_verified: true }))
      .toBe('active-verified');
  });
  
  it('should return active-unverified', () => {
    expect(getUserStatus({ is_active: true, is_verified: false }))
      .toBe('active-unverified');
  });
  
  it('should return inactive', () => {
    expect(getUserStatus({ is_active: false, is_verified: false }))
      .toBe('inactive');
  });
});
```

---

## 테스트 불가능한 코드 처리

### 1. 레거시 코드

**옵션 A: 리팩토링 후 테스트**
```typescript
// Before: 테스트 어려움
function processLegacy() {
  const db = new Database();
  const api = new ApiClient();
  // 복잡한 로직...
}

// After: 테스트 가능하게 리팩토링
function processLegacy(db: Database, api: ApiClient) {
  // 같은 로직
}
```

**옵션 B: 커버리지 제외 (최소화)**
```typescript
/* c8 ignore start */
function legacyCode() {
  // 테스트 불가능한 레거시 코드
}
/* c8 ignore end */
```

### 2. 타입 정의 파일

`.ts` 파일이지만 타입만 정의:
```typescript
// types.ts
export interface User {
  id: string;
  name: string;
}
```

**해결: 커버리지에서 제외**
```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/types.ts',
        '**/*.d.ts'
      ]
    }
  }
});
```

---

## 파일 유형별 목표

### 비즈니스 로직: 95%+
```typescript
// src/services/payment-processor.ts
// 핵심 로직은 철저히 테스트
```

### 유틸리티: 90%+
```typescript
// src/utils/calculator.ts
// 모든 엣지 케이스 커버
```

### API 핸들러: 85%+
```typescript
// src/api/user-controller.ts
// 주요 플로우 커버
```

### UI 컴포넌트: 70%+
```typescript
// src/components/Button.tsx
// 주요 인터랙션 커버
```

### 설정 파일: 50%+
```typescript
// src/config/database.ts
// 기본 동작만 확인
```

---

## 커버리지 리포트 읽기

### 좋은 신호 ✅

```
File                  | % Lines |
----------------------|---------|
calculator.ts         |   100   |  ← 완벽
formatter.ts          |   95.2  |  ← 매우 좋음
validator.ts          |   87.5  |  ← 좋음
```

### 주의 신호 ⚠️

```
File                  | % Lines |
----------------------|---------|
user-service.ts       |   68.2  |  ← 부족 (80% 미만)
auth-service.ts       |   45.0  |  ← 매우 부족
```

### 분석 방법

1. **80% 미만 파일 식별**
2. **HTML 리포트에서 미커버 라인 확인**
3. **중요도 평가** (비즈니스 로직 우선)
4. **테스트 추가**

---

## 커버리지 개선 절차

### Step 1: 현재 상태 파악
```bash
npm test -- --coverage
```

### Step 2: 목표 설정
```markdown
- 전체: 82.5% → 85% (목표)
- user-service.ts: 68.2% → 80%
- auth-service.ts: 45.0% → 80%
```

### Step 3: 우선순위 결정
```markdown
1. 비즈니스 로직 (높음)
2. API 핸들러 (중간)
3. 유틸리티 (중간)
4. UI 컴포넌트 (낮음)
```

### Step 4: 테스트 작성
```typescript
// user-service.ts의 미커버 라인 테스트
```

### Step 5: 재측정
```bash
npm test -- --coverage
```

### Step 6: 목표 달성 확인
```markdown
✅ user-service.ts: 82.5%
✅ auth-service.ts: 81.3%
✅ 전체: 84.7%
```

---

## 체크리스트

커버리지 체크 완료 후:

- [ ] 전체 커버리지 80% 이상
- [ ] 비즈니스 로직 95% 이상
- [ ] Critical 파일 90% 이상
- [ ] 미커버 라인 분석 완료
- [ ] 테스트 불가능한 코드 최소화
- [ ] HTML 리포트 생성
- [ ] 커버리지 리포트 저장

---

## 리포트 형식

```markdown
# 커버리지 리포트

**날짜**: 2026-01-28
**전체 커버리지**: 84.7%

## 파일별 현황

| 파일 | 커버리지 | 상태 |
|-----|---------|------|
| calculator.ts | 100% | ✅ |
| user-service.ts | 82.5% | ✅ |
| auth-service.ts | 81.3% | ✅ |
| formatter.ts | 95.2% | ✅ |

## 개선 사항

- user-service.ts: 68.2% → 82.5% (+14.3%)
  - 에러 케이스 테스트 추가
  - 엣지 케이스 커버

- auth-service.ts: 45.0% → 81.3% (+36.3%)
  - 인증 실패 케이스 추가
  - 토큰 만료 테스트 추가

## 남은 작업

- [ ] UI 컴포넌트 커버리지 70% 달성
```

---

## 완료 기준

- [ ] 전체 커버리지 80% 이상 달성
- [ ] 모든 비즈니스 로직 95% 이상
- [ ] 커버리지 리포트 작성
- [ ] 미커버 파일 목록 문서화
- [ ] 개선 계획 수립 (80% 미만 파일)
