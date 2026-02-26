---
name: test-quality
description: 테스트 코드 품질 검증 - 가독성, 유지보수성, 독립성, Mocking 품질, Assertion 명확성
---

# 테스트 코드 품질 검증 가이드

이 Skill은 QA 에이전트가 작성한 테스트 코드의 품질을 검증하는 체크리스트입니다.

## 품질 기준

### 1. 가독성 (Readability)

**체크리스트:**
- [ ] **테스트 설명이 한글로 작성되었는가?** (필수!)
- [ ] **테스트명이 명확한가?** (기대 동작 + 조건)
- [ ] **AAA 패턴을 따르는가?** (Arrange-Act-Assert)
- [ ] **불필요한 코드가 없는가?**
- [ ] **적절한 주석이 있는가?** (복잡한 로직만)

**✅ 좋은 예 (한글):**
```typescript
describe('App Component', () => {
  it('제목을 렌더링해야 함', () => {
    // Arrange (준비)
    render(<App />);
    
    // Act (실행) - 렌더링은 이미 완료됨
    
    // Assert (검증)
    expect(screen.getByText('Logseq Personal Plugin')).toBeInTheDocument();
  });
  
  it('+ 버튼 클릭 시 카운트가 증가해야 함', () => {
    // Arrange
    render(<App />);
    const increment_button = screen.getByText('+');
    
    // Act
    fireEvent.click(increment_button);
    
    // Assert
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

**❌ 나쁜 예:**
```typescript
describe('App Component', () => {
  it('test1', () => {  // ❌ 의미 없음
    render(<App />);
    expect(screen.getByText('Logseq Personal Plugin')).toBeInTheDocument();
  });
  
  it('should render the title', () => {  // ❌ 영어 사용
    render(<App />);
    expect(screen.getByText('Logseq Personal Plugin')).toBeInTheDocument();
  });
  
  it('버튼 테스트', () => {  // ❌ 모호함
    render(<App />);
    const btn = screen.getByText('+');
    fireEvent.click(btn);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

---

### 2. 유지보수성 (Maintainability)

**체크리스트:**
- [ ] **중복 코드가 없는가?** (Helper 함수 사용)
- [ ] **테스트 데이터가 재사용 가능한가?** (Fixture/Factory)
- [ ] **설정이 중앙화되어 있는가?** (beforeEach 활용)
- [ ] **테스트가 리팩토링에 강한가?** (구현 세부사항이 아닌 동작 테스트)

**✅ 좋은 예:**
```typescript
// Fixture 사용
const createTestUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

describe('UserService', () => {
  let user_service: UserService;
  
  beforeEach(() => {
    user_service = new UserService();
  });
  
  it('사용자를 생성해야 함', () => {
    const user_data = createTestUser({ email: 'new@example.com' });
    const user = user_service.create(user_data);
    expect(user.email).toBe('new@example.com');
  });
});
```

**❌ 나쁜 예:**
```typescript
describe('UserService', () => {
  it('사용자를 생성해야 함', () => {
    // ❌ 중복: 매번 같은 데이터 생성
    const user_service = new UserService();
    const user_data = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    const user = user_service.create(user_data);
    expect(user.email).toBe('test@example.com');
  });
  
  it('사용자를 업데이트해야 함', () => {
    // ❌ 중복: 같은 코드 반복
    const user_service = new UserService();
    const user_data = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    // ...
  });
});
```

---

### 3. 독립성 (Independence)

**체크리스트:**
- [ ] **각 테스트가 독립적으로 실행 가능한가?**
- [ ] **테스트 간 의존성이 없는가?**
- [ ] **전역 상태를 사용하지 않는가?**
- [ ] **실행 순서에 의존하지 않는가?**

**✅ 좋은 예:**
```typescript
describe('Counter', () => {
  beforeEach(() => {
    // 각 테스트 전에 초기화
    vi.clearAllMocks();
  });
  
  it('초기값이 0이어야 함', () => {
    const { getByText } = render(<Counter />);
    expect(getByText('Count: 0')).toBeInTheDocument();
  });
  
  it('증가 버튼 클릭 시 1이 되어야 함', () => {
    const { getByText } = render(<Counter />);
    fireEvent.click(getByText('+'));
    expect(getByText('Count: 1')).toBeInTheDocument();
  });
  
  // 이전 테스트와 독립적
  it('감소 버튼 클릭 시 -1이 되어야 함', () => {
    const { getByText } = render(<Counter />);
    fireEvent.click(getByText('-'));
    expect(getByText('Count: -1')).toBeInTheDocument();
  });
});
```

**❌ 나쁜 예:**
```typescript
let counter = 0;  // ❌ 전역 상태

describe('Counter', () => {
  it('증가해야 함', () => {
    counter++;  // ❌ 전역 상태 사용
    expect(counter).toBe(1);
  });
  
  it('다시 증가해야 함', () => {
    counter++;  // ❌ 이전 테스트에 의존
    expect(counter).toBe(2);  // ❌ 실행 순서 의존
  });
});
```

---

### 4. Mocking 품질

**체크리스트:**
- [ ] **Mock이 필요한 경우에만 사용하는가?**
- [ ] **Mock이 실제 동작을 충실히 모방하는가?**
- [ ] **Mock이 적절히 초기화/정리되는가?**
- [ ] **Mock 호출이 명확하게 검증되는가?**

**✅ 좋은 예:**
```typescript
describe('UserService', () => {
  let mock_db: MockDatabase;
  let user_service: UserService;
  
  beforeEach(() => {
    mock_db = {
      findOne: vi.fn(),
      insert: vi.fn(),
    };
    user_service = new UserService(mock_db);
  });
  
  afterEach(() => {
    vi.clearAllMocks();  // ✅ 정리
  });
  
  it('사용자가 존재하지 않을 때 생성해야 함', async () => {
    // Arrange
    mock_db.findOne.mockResolvedValue(null);  // ✅ 명확한 Mock
    mock_db.insert.mockResolvedValue({ id: '1', email: 'test@example.com' });
    
    // Act
    const user = await user_service.createUser('test@example.com');
    
    // Assert
    expect(mock_db.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mock_db.insert).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(user.email).toBe('test@example.com');
  });
});
```

**❌ 나쁜 예:**
```typescript
describe('UserService', () => {
  it('사용자를 생성해야 함', async () => {
    // ❌ Mock 초기화 없음
    const user_service = new UserService(mock_db);
    
    // ❌ Mock 설정이 불명확
    mock_db.findOne.mockReturnValue(null);
    
    const user = await user_service.createUser('test@example.com');
    
    // ❌ Mock 검증 없음
    expect(user).toBeTruthy();
  });
  
  // ❌ Mock 정리 없음
});
```

---

### 5. Assertion 명확성

**체크리스트:**
- [ ] **Assertion이 하나의 개념만 검증하는가?**
- [ ] **실패 메시지가 명확한가?**
- [ ] **적절한 Matcher를 사용하는가?**
- [ ] **불필요한 Assertion이 없는가?**

**✅ 좋은 예:**
```typescript
describe('Calculator', () => {
  it('두 수를 더해야 함', () => {
    const result = add(2, 3);
    expect(result).toBe(5);  // ✅ 명확한 검증
  });
  
  it('0으로 나누면 에러를 던져야 함', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');  // ✅ 명확한 에러 메시지
  });
  
  it('배열에 요소가 포함되어야 함', () => {
    const items = ['apple', 'banana', 'cherry'];
    expect(items).toContain('banana');  // ✅ 적절한 Matcher
  });
});
```

**❌ 나쁜 예:**
```typescript
describe('Calculator', () => {
  it('계산 테스트', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
    expect(result).toBeGreaterThan(0);  // ❌ 불필요한 Assertion
    expect(result).toBeLessThan(10);    // ❌ 불필요한 Assertion
  });
  
  it('에러 테스트', () => {
    expect(() => divide(10, 0)).toThrow();  // ❌ 에러 메시지 검증 없음
  });
});
```

### Testing Library 쿼리 선택 가이드

> 상세 가이드: `qa/svelte-testing.md`의 "Testing Library 쿼리 사용 시 주의사항" 섹션 참고

- 동일 텍스트/역할의 요소가 여러 개일 수 있으면 `getAllBy*` 사용 (`getBy*`는 2개 이상이면 에러)
- 조건부 렌더링 검증에는 `queryBy*` 사용 (요소 없으면 `null` 반환)
- 네이티브 HTML 요소 키보드 테스트 시 올바른 키 사용:
  - `<input type="checkbox">`: **Space** (Enter 아님)
  - `<button>`: **Enter** 또는 **Space**

---

### 6. 엣지 케이스 커버리지

**체크리스트:**
- [ ] **null/undefined 처리 테스트가 있는가?**
- [ ] **빈 배열/객체 처리 테스트가 있는가?**
- [ ] **경계값 테스트가 있는가?** (0, 최대값, 최소값)
- [ ] **에러 케이스 테스트가 있는가?**

**✅ 좋은 예:**
```typescript
describe('calculateTotal', () => {
  it('정상적인 경우 합계를 반환해야 함', () => {
    expect(calculateTotal([{ price: 100 }, { price: 200 }])).toBe(300);
  });
  
  it('빈 배열일 때 0을 반환해야 함', () => {  // ✅ 엣지 케이스
    expect(calculateTotal([])).toBe(0);
  });
  
  it('null이 포함된 경우 에러를 던져야 함', () => {  // ✅ 엣지 케이스
    expect(() => calculateTotal([null])).toThrow();
  });
  
  it('음수 가격을 올바르게 처리해야 함', () => {  // ✅ 엣지 케이스
    expect(calculateTotal([{ price: -50 }])).toBe(-50);
  });
  
  it('매우 큰 숫자를 처리해야 함', () => {  // ✅ 경계값
    expect(calculateTotal([{ price: Number.MAX_SAFE_INTEGER }])).toBe(Number.MAX_SAFE_INTEGER);
  });
});
```

---

## 테스트 코드 리뷰 체크리스트

테스트 코드 작성 후 **반드시** 확인:

### 기본 요구사항
- [ ] **테스트 설명이 한글로 작성되었는가?** (필수!)
- [ ] **모든 테스트가 통과하는가?**
- [ ] **커버리지 80% 이상인가?**
- [ ] **Linter 오류가 없는가?** (테스트 코드도!)

### 가독성
- [ ] 테스트명이 명확한가? (기대 동작 + 조건)
- [ ] AAA 패턴을 따르는가?
- [ ] 불필요한 코드가 없는가?

### 유지보수성
- [ ] 중복 코드가 없는가?
- [ ] Fixture/Factory를 사용하는가?
- [ ] beforeEach/afterEach를 적절히 사용하는가?

### 독립성
- [ ] 각 테스트가 독립적으로 실행 가능한가?
- [ ] 테스트 간 의존성이 없는가?
- [ ] 전역 상태를 사용하지 않는가?

### Mocking 품질
- [ ] Mock이 필요한 경우에만 사용하는가?
- [ ] Mock이 적절히 초기화/정리되는가?
- [ ] Mock 호출이 명확하게 검증되는가?

### Assertion 명확성
- [ ] Assertion이 하나의 개념만 검증하는가?
- [ ] 적절한 Matcher를 사용하는가?
- [ ] 불필요한 Assertion이 없는가?

### 엣지 케이스
- [ ] null/undefined 처리 테스트가 있는가?
- [ ] 빈 배열/객체 처리 테스트가 있는가?
- [ ] 경계값 테스트가 있는가?
- [ ] 에러 케이스 테스트가 있는가?

---

## 자동화 가능한 체크 포인트

### 1. Linter 규칙 추가

**ESLint 설정 예시:**
```javascript
// eslint.config.js
export default [
  {
    rules: {
      // 테스트 파일에서만 적용
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
    },
  },
];
```

### 2. 테스트 코드 품질 메트릭

**측정 지표:**
- 테스트 설명 한글화 비율: 100% 목표
- AAA 패턴 준수율: 90%+ 목표
- 중복 코드 비율: 10% 이하
- Mock 사용 비율: 적절한 수준 (과도하지 않음)

### 3. 중복 테스트 감지

**수동 체크:**
```bash
# 유사한 테스트명 찾기
grep -r "it('" tests/ | sort | uniq -d
```

**자동화 (향후):**
- 테스트 코드 AST 분석
- 유사도 측정 도구 활용

---

## 테스트 코드 리팩토링 가이드

### 리팩토링 시나리오

#### 1. 중복 코드 제거

**Before:**
```typescript
it('사용자 생성 테스트 1', () => {
  const user_service = new UserService();
  const user = user_service.create({ email: 'test1@example.com' });
  expect(user.email).toBe('test1@example.com');
});

it('사용자 생성 테스트 2', () => {
  const user_service = new UserService();
  const user = user_service.create({ email: 'test2@example.com' });
  expect(user.email).toBe('test2@example.com');
});
```

**After:**
```typescript
let user_service: UserService;

beforeEach(() => {
  user_service = new UserService();
});

it('이메일 test1@example.com으로 사용자를 생성해야 함', () => {
  const user = user_service.create({ email: 'test1@example.com' });
  expect(user.email).toBe('test1@example.com');
});

it('이메일 test2@example.com으로 사용자를 생성해야 함', () => {
  const user = user_service.create({ email: 'test2@example.com' });
  expect(user.email).toBe('test2@example.com');
});
```

#### 2. 테스트명 개선

**Before:**
```typescript
it('test1', () => {});
it('should work', () => {});
it('error case', () => {});
```

**After:**
```typescript
it('제목을 렌더링해야 함', () => {});
it('+ 버튼 클릭 시 카운트가 증가해야 함', () => {});
it('빈 배열일 때 ValidationError를 던져야 함', () => {});
```

#### 3. Mock 정리

**Before:**
```typescript
it('테스트 1', () => {
  const mock_fn = vi.fn();
  // Mock 사용
});

it('테스트 2', () => {
  const mock_fn = vi.fn();  // ❌ 중복
  // Mock 사용
});
```

**After:**
```typescript
let mock_fn: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mock_fn = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

it('테스트 1', () => {
  // Mock 사용
});

it('테스트 2', () => {
  // Mock 사용
});
```

---

## 완료 기준

테스트 코드 품질 검증 완료 후:

- [ ] 모든 체크리스트 항목 통과
- [ ] 테스트 설명 100% 한글화
- [ ] AAA 패턴 90%+ 준수
- [ ] 중복 코드 10% 이하
- [ ] 모든 엣지 케이스 커버
- [ ] Linter 오류 0개
- [ ] 테스트 코드 리뷰 리포트 작성

---

## 리포트 형식

```markdown
# 테스트 코드 품질 리포트

**날짜**: 2026-01-28
**테스트 파일**: App.test.tsx, main.test.tsx

## 품질 지표

| 항목 | 목표 | 실제 | 상태 |
|-----|------|------|------|
| 테스트 설명 한글화 | 100% | 100% | ✅ |
| AAA 패턴 준수 | 90%+ | 95% | ✅ |
| 중복 코드 비율 | 10% 이하 | 5% | ✅ |
| 엣지 케이스 커버 | 100% | 100% | ✅ |
| Linter 오류 | 0개 | 0개 | ✅ |

## 발견된 이슈

### Critical
없음 ✅

### Major
없음 ✅

### Minor
- [ ] 일부 테스트에서 beforeEach 활용 개선 가능

## 개선 제안

1. **중복 코드 제거**: Helper 함수 생성
2. **Mock 정리**: beforeEach/afterEach 활용
3. **테스트명 개선**: 더 구체적인 설명 추가

## 결론

✅ 모든 품질 기준 통과 - 테스트 코드 품질 우수
```
