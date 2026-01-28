---
name: test-strategy
description: 테스트 전략 - 단위/통합/E2E 테스트 선택 및 작성 가이드
---

# 테스트 전략

이 Skill은 QA 에이전트가 적절한 테스트 유형을 선택하고 작성하는 전략을 제공합니다.

## 테스트 피라미드

```
        /\
       /  \
      / E2E \      ← 적게 (느림, 비용 높음)
     /______\
    /        \
   / 통합 테스트 \   ← 중간 (보통 속도)
  /____________\
 /              \
/   단위 테스트   \  ← 많이 (빠름, 비용 낮음)
/__________________\
```

**원칙:**
- 단위 테스트: 90%
- 통합 테스트: 9%
- E2E 테스트: 1%

---

## 테스트 유형 선택

### 1. 단위 테스트 (Unit Test)

**대상:**
- 순수 함수
- 유틸리티 함수
- 단일 클래스/컴포넌트
- 비즈니스 로직

**도구:** Vitest

**커버리지 목표:** 90%+

**예시:**
```typescript
// 테스트 대상: 순수 함수
function calculateDiscount(price: number, rate: number): number {
  if (price < 0 || rate < 0 || rate > 1) {
    throw new Error('Invalid input');
  }
  return price * rate;
}

// 단위 테스트
describe('calculateDiscount', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscount(100, 0.1)).toBe(10);
  });
  
  it('should throw error for negative price', () => {
    expect(() => calculateDiscount(-100, 0.1)).toThrow('Invalid input');
  });
  
  it('should throw error for invalid rate', () => {
    expect(() => calculateDiscount(100, 1.5)).toThrow('Invalid input');
  });
});
```

**작성 체크리스트:**
- [ ] 함수의 모든 경로 테스트
- [ ] 경계값 테스트 (0, 최대값, 최소값)
- [ ] 에러 케이스 테스트
- [ ] Mocking 최소화 (순수 함수 우선)

---

### 2. 통합 테스트 (Integration Test)

**대상:**
- API 엔드포인트
- 데이터베이스 연동
- 여러 모듈 협업
- 외부 서비스 연동

**도구:** Vitest + Mock Server

**커버리지 목표:** 80%+

**예시:**
```typescript
// 테스트 대상: API + DB
class UserRepository {
  constructor(private db: Database) {}
  
  async createUser(email: string, name: string) {
    const existing = await this.db.findOne({ email });
    if (existing) {
      throw new Error('User already exists');
    }
    return await this.db.insert({ email, name });
  }
}

// 통합 테스트
describe('UserRepository', () => {
  let db: Database;
  let repository: UserRepository;
  
  beforeEach(async () => {
    db = await createTestDatabase();
    repository = new UserRepository(db);
  });
  
  afterEach(async () => {
    await db.close();
  });
  
  it('should create user successfully', async () => {
    const user = await repository.createUser('test@example.com', 'Test');
    expect(user.email).toBe('test@example.com');
  });
  
  it('should throw error for duplicate email', async () => {
    await repository.createUser('test@example.com', 'Test');
    await expect(
      repository.createUser('test@example.com', 'Test2')
    ).rejects.toThrow('User already exists');
  });
});
```

**작성 체크리스트:**
- [ ] 성공 시나리오
- [ ] 실패 시나리오
- [ ] 에러 핸들링
- [ ] 타임아웃 처리
- [ ] 트랜잭션 롤백 (DB)

---

### 3. E2E 테스트 (End-to-End Test)

**대상:**
- 주요 사용자 플로우
- 크리티컬 비즈니스 로직
- UI 인터랙션

**도구:** Playwright / Cypress

**커버리지 목표:** 핵심 플로우만

**예시:**
```typescript
// E2E 테스트: 사용자 등록 플로우
test('user registration flow', async ({ page }) => {
  // 1. 홈페이지 접속
  await page.goto('https://example.com');
  
  // 2. 회원가입 버튼 클릭
  await page.click('text=Sign Up');
  
  // 3. 폼 작성
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="name"]', 'Test User');
  
  // 4. 제출
  await page.click('button[type="submit"]');
  
  // 5. 성공 메시지 확인
  await expect(page.locator('text=Welcome')).toBeVisible();
  
  // 6. 대시보드로 리다이렉트 확인
  await expect(page).toHaveURL('/dashboard');
});
```

**작성 체크리스트:**
- [ ] 사용자 관점 시나리오
- [ ] 여러 페이지 흐름
- [ ] 실제 브라우저 동작
- [ ] 스크린샷 비교 (필요 시)
- [ ] 느린 네트워크 시뮬레이션

---

## 테스트 작성 순서

### 1. 단위 테스트 우선

새로운 함수/모듈 작성 시:

```markdown
1. 함수 시그니처 작성
2. 단위 테스트 작성 (TDD 권장)
3. 구현
4. 테스트 통과 확인
```

### 2. 통합 테스트

단위 테스트 통과 후:

```markdown
1. 모듈 간 인터페이스 정의
2. 통합 테스트 작성
3. 통합 구현
4. 테스트 통과 확인
```

### 3. E2E 테스트 (선택적)

핵심 기능만:

```markdown
1. 주요 사용자 플로우 식별
2. E2E 시나리오 작성
3. 전체 시스템 테스트
4. 실패 시 단위/통합 테스트로 디버깅
```

---

## MCP 도구 활용

### vitest-coverage-analyzer (있는 경우)

```typescript
// 커버리지 체크
const coverage_result = await mcp.get_coverage({ 
  project_path: "." 
});

if (coverage_result.total < 0.8) {
  console.log('커버리지 부족:', coverage_result);
  // 추가 테스트 작성
}

// 파일별 커버리지
const file_coverage = await mcp.get_coverage_by_file({
  file_path: "src/utils.ts"
});

// 임계값 체크
const threshold_result = await mcp.check_threshold({
  threshold: 0.8
});
if (!threshold_result.pass) {
  console.log('실패 파일:', threshold_result.failures);
}
```

---

## 테스트 네이밍 컨벤션

### 언어 규칙: 한글 사용 (필수!)

**중요**: 테스트 설명(`it`의 첫 번째 인자)은 **한글로 작성**합니다.

### 패턴: "[기대 동작]을 해야 함 [조건]"

**✅ 좋은 예 (한글):**
```typescript
describe('calculateTotal', () => {
  it('모든 아이템의 합계를 반환해야 함', () => {});
  it('아이템 배열이 비어있을 때 에러를 던져야 함', () => {});
  it('음수 가격을 올바르게 처리해야 함', () => {});
  it('올바른 스타일로 logseq.setMainUIInlineStyle을 호출해야 함', () => {});
});
```

**❌ 나쁜 예:**
```typescript
describe('calculateTotal', () => {
  it('test1', () => {}); // 의미 없음
  it('works', () => {}); // 모호함
  it('edge case', () => {}); // 영어 사용
  it('should return sum of all items', () => {}); // 영어 사용 지양
});
```

### 네이밍 가이드

- **동사형 사용**: "해야 함", "되어야 함", "호출해야 함"
- **명확한 조건**: "배열이 비어있을 때", "null인 경우", "에러 발생 시"
- **구체적 동작**: "합계를 반환", "에러를 던짐", "UI를 표시"

---

## 테스트 데이터 관리

### Fixture 사용

```typescript
// fixtures/users.ts
export const VALID_USER = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123'
};

export const INVALID_USER = {
  email: 'invalid-email',
  name: '',
  password: '123'
};

// 테스트에서 사용
import { VALID_USER } from './fixtures/users';

it('should create user', () => {
  const user = createUser(VALID_USER);
  expect(user.email).toBe(VALID_USER.email);
});
```

### Factory 함수

```typescript
function createTestUser(overrides = {}) {
  return {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date(),
    ...overrides
  };
}

// 사용
const user = createTestUser({ email: 'custom@example.com' });
```

---

## 실패 시 대응

테스트 실패 시 절차:

### 1. 실패 원인 분석
```markdown
- 테스트 로그 확인
- 스택 트레이스 분석
- 실패 위치 식별
```

### 2. 버그 vs 테스트 오류 판단
```markdown
- 버그: 구현이 잘못됨
  → 구현 에이전트에게 피드백
  
- 테스트 오류: 테스트가 잘못됨
  → 테스트 수정
```

### 3. 재실행 및 검증
```markdown
- 수정 후 테스트 재실행
- 모든 테스트 통과 확인
- 회귀 테스트 실행
```

---

## 커버리지 목표

### 파일 유형별 목표

| 파일 유형 | 목표 커버리지 |
|----------|-------------|
| 비즈니스 로직 | 95%+ |
| 유틸리티 | 90%+ |
| API 핸들러 | 85%+ |
| UI 컴포넌트 | 70%+ |
| 설정 파일 | 50%+ |

### 전체 프로젝트 목표: 80%+

---

## 테스트 실행 명령어

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm test -- --watch

# 커버리지 포함
npm test -- --coverage

# 특정 파일만
npm test -- src/utils.test.ts

# UI 모드 (Vitest)
npm test -- --ui
```

---

## 체크리스트

테스트 작성 완료 후:

- [ ] 모든 테스트 통과
- [ ] 커버리지 80% 이상
- [ ] 에지 케이스 테스트 포함
- [ ] 에러 케이스 테스트 포함
- [ ] 테스트 네이밍 명확
- [ ] Fixture/Factory 활용
- [ ] 테스트 독립성 확보 (순서 무관)
- [ ] 빠른 실행 속도 (<5초)

## 완료 기준

- [ ] 단위 테스트: 90%+ 커버리지
- [ ] 통합 테스트: 주요 플로우 커버
- [ ] E2E 테스트: 핵심 기능 커버 (선택적)
- [ ] 모든 테스트 통과
- [ ] 전체 커버리지 80%+
