---
description: 절대 금지사항 및 올바른 접근법
---

# 절대 금지사항

이 문서는 코드, 테스트, 문서 작성 시 절대 금지되는 패턴과 올바른 대안을 정의합니다.

---

## 코드 관련 금지사항

### Object.prototype / Array.prototype 수정 금지

Built-in 객체의 prototype을 수정하면 전역 오염이 발생하며 예측 불가능한 버그를 유발합니다.

**❌ 잘못된 예시**:

```typescript
// Object.prototype 수정
Object.defineProperty(Object.prototype, 'isEmpty', {
    value: function () {
        return Object.keys(this).length === 0;
    },
});

// Array.prototype 확장
Array.prototype.unique = function () {
    return [...new Set(this)];
};
```

**✅ 올바른 접근법**:

```typescript
// 유틸 함수로 분리
function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}
```

### 에러 억제 금지

에러를 숨기거나 무시하면 근본 원인 파악이 불가능해집니다.

**❌ 잘못된 예시**:

```typescript
// process.on('uncaughtException')로 에러 억제
process.on('uncaughtException', () => {
    // 에러 무시
});

// try-catch에서 에러 삼킴
try {
    await riskyOperation();
} catch (e) {
    // 무시
}

// onUnhandledError 등으로 에러 숨기기
window.onerror = () => true;
```

**✅ 올바른 접근법**:

```typescript
// 에러 로깅 후 재throw
try {
    await riskyOperation();
} catch (e) {
    logger.error('riskyOperation 실패', { error: e });
    throw new OperationError('작업 실패', { cause: e });
}

// uncaughtException은 로깅 후 프로세스 종료
process.on('uncaughtException', (err) => {
    logger.fatal('Uncaught exception', { error: err });
    process.exit(1);
});
```

---

## 테스트 관련 금지사항

### Prototype 오염 금지

테스트 setup에서 `Object.prototype`, `Array.prototype` 등 built-in을 수정하면 다른 테스트에 영향을 줍니다.

**❌ 잘못된 예시**:

```typescript
// 테스트 setup에서 prototype 수정
beforeEach(() => {
    Object.prototype.mockId = 'test-id';
});

afterEach(() => {
    delete Object.prototype.mockId; // 다른 테스트가 이미 실행된 후일 수 있음
});
```

**✅ 올바른 접근법**:

```typescript
// mock/stub 객체를 별도로 생성
const mock_user = { id: 'test-id', name: '테스트' };

// 또는 vi.stubEnv, vi.mock 등 테스트 프레임워크 기능 사용
vi.mock('./user_service', () => ({
    getUser: vi.fn().mockResolvedValue({ id: 'test-id' }),
}));
```

### 에러 무시 금지

테스트에서 예상된 에러를 검증하지 않으면 회귀를 놓칩니다.

**❌ 잘못된 예시**:

```typescript
// 에러가 발생해도 테스트 통과
it('잘못된 입력 시 에러', async () => {
    await validateInput(null); // 에러 발생 예상인데 검증 없음
});

// catch 블록에서 아무것도 하지 않음
try {
    await shouldThrow();
} catch {
    // expect 없음
}
```

**✅ 올바른 접근법**:

```typescript
it('잘못된 입력 시 ValidationError 발생', async () => {
    await expect(validateInput(null)).rejects.toThrow(ValidationError);
});

it('에러 메시지 검증', async () => {
    await expect(validateInput(null)).rejects.toThrow('입력값이 필요합니다');
});
```

---

## 문서 관련 금지사항

### 추정 기반 작성 금지

실제 코드/설정을 확인하지 않고 추측으로 문서를 작성하면 오류가 전파됩니다.

**❌ 잘못된 예시**:

```markdown
- `getUserById`는 User 객체를 반환한다 (인터페이스 이름으로 추정)
- API는 POST /api/users를 사용한다 (다른 API 패턴으로 추정)
- 이 컴포넌트는 onClick prop을 받는다 (컴포넌트 이름으로 추정)
```

**✅ 올바른 접근법**:

```markdown
- `src/services/user_service.ts:45-52`에서 `getUserById(id: string): Promise<User>` 확인
- `src/api/routes.ts:12`에서 `router.post('/users', createUser)` 확인
- `Button.svelte:8`에서 `export let onClick: () => void` 확인
```

### 근거 없는 "확인했음" 금지

"확인했음", "검증 완료" 등 근거 없이 작성하면 신뢰할 수 없습니다.

**❌ 잘못된 예시**:

```markdown
- 타입 정의 확인했음
- API 엔드포인트 검증 완료
- 테스트 커버리지 충족 확인
```

**✅ 올바른 접근법**:

```markdown
- `src/types/user.ts:3-15` User 인터페이스 정의 확인
- `pnpm type-check` 실행 결과 0 errors
- `pnpm test -- --coverage` 실행 결과 Line 85%, Branch 82%
```

---

## 올바른 접근법 요약

### 확인 후 복사

- 모든 정보는 실제 파일을 열어 확인 후 정확히 복사
- 추정이나 가정 없이 실제 코드만으로 작성
- 불확실한 경우 "추가 조사 필요"로 명시

### 증거 기록

- "확인했음" 대신 `파일명:줄번호` 명시
- 검증 명령어와 결과를 함께 기록

### 불확실성 표시

- 확실: ✅ 코드로 확인
- 추정: ⚠️ 패턴 기반 추론 (가능한 한 피할 것)
- 불분명: ❓ 추가 조사 필요
