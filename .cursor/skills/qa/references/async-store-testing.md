---
name: async-store-testing
description: 동기→비동기 스토어 전환 시 필수 테스트 패턴. 마이그레이션 상태 일치, 모듈 상태 격리, 타이밍 테스트, 첫 사용 시나리오.
---

# Async 스토어 테스트 패턴

스토어가 동기 → async로 전환될 때 아래 4가지 테스트 패턴을 **반드시 포함**합니다.

## 1. 마이그레이션 분기 상태 일치 검증

마이그레이션 분기 코드가 **persist + 메모리 스토어 + 파생 UI 상태**를 모두 갱신하는지 검증합니다.

```typescript
it('마이그레이션 후 메모리 스토어가 새 저장소 값과 일치한다', async () => {
    // 기존 저장소에만 값이 있는 상황 재현
    oldStorage.set('key', 'value');
    await initializeStore();

    // 메모리 상태와 새 저장소 호출 모두 확인
    expect(getStoreValue()).toBe('value');
    expect(newStorage.set).toHaveBeenCalledWith({ key: 'value' });
});
```

## 2. 모듈 전역 상태 격리

모듈 스코프에 `$state` 변수가 있는 스토어는 테스트 간 상태가 남을 수 있습니다.
**전용 리셋 함수**를 스토어에 추가하고 `beforeEach`에서 호출합니다.

```typescript
// 스토어 파일 (테스트 전용 export)
export function resetForTests(): void {
    state_var = DEFAULT_VALUE;
}

// 테스트 파일
beforeEach(() => {
    resetForTests();
});
```

## 3. async 타이밍: 준비 전/후 UI 차이

```typescript
it('스토어 준비 완료 전에는 기본값이 표시된다', () => {
    render(App);
    expect(screen.queryByText('로딩')).toBeInTheDocument();
});

it('스토어 준비 완료 후 실제 값이 반영된다', async () => {
    render(App);
    await waitFor(() => expect(screen.getByText('실제 값')).toBeInTheDocument());
});
```

## 4. 첫 사용 시나리오

플래그 기반 첫 실행 흐름은 **`undefined` 상태를 명시적으로 재현**합니다.

```typescript
beforeEach(() => {
    // 초기화 플래그를 undefined로 두어 첫 사용 상태 재현
    storage_data['setup_flag'] = undefined;
    resetStore();
});
```

## 테스트 환경 패치 금지 (필수)

테스트 환경(jsdom, Vitest setup 등)에서 다음을 **절대 금지**합니다:

1. **전역 prototype 오염 금지**
   - `Object.prototype`, `Array.prototype` 등 built-in prototype에 속성 추가 절대 금지
   - 대안: 문제가 되는 라이브러리를 모킹하거나, jsdom 호환 layer를 해당 모듈에만 적용

2. **에러 억제 금지**
   - `process.on('uncaughtException')`, `onUnhandledError` 등으로 에러를 숨기는 행위 금지
   - 에러가 발생하면 근본 원인을 분석하고 수정

3. **workaround/패치 적용 후 전체 테스트 필수**
   - 테스트 setup에 패치를 적용한 경우 반드시 전체 테스트 스위트 실행
   - 회귀 여부 확인

## 프로젝트별 구체 구현

이 패턴의 프로젝트별 구체 구현(리셋 함수명, 저장소 키 등)은 `project-knowledge` 스킬을 참조하세요.
