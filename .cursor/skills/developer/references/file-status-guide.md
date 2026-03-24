---
name: file-status-guide
description: 파일 상태 결정 가이드 - 템플릿과 실제 파일 비교 시 상태 판별
---

# 파일 상태 결정 가이드

이 Skill은 대규모 리팩토링, 컴포넌트 추가/수정, 보일러플레이트 생성 시 **템플릿과 실제 파일을 비교하여 각 파일의 상태를 결정**하는 방법을 제공합니다.

검증 프레임워크의 validation-rules 패턴을 참고하여, 양방향 비교를 통해 일관된 상태 판별을 수행합니다.

---

## 1. 파일 상태 정의

| 상태 | 기호 | 설명 |
|------|------|------|
| **NEW** | 🟢 | 새로 생성된 파일. 템플릿에는 있으나 실제 파일 시스템에 존재하지 않음 |
| **UPDATE** | ✏️ | 기존 파일 수정. 템플릿과 실제 파일 모두 존재하나 **내용 차이**가 있음 |
| **DELETE** | ❌ | 삭제 대상 파일. 템플릿에는 없으나 실제 파일 시스템에 존재함 |
| **UNCHANGED** | ⚪ | 변경 없음. 템플릿과 실제 파일의 내용이 **동일**함 |

---

## 2. 양방향 비교 패턴

### 패턴 A: 템플릿 → 실제 파일 비교

**목적**: 템플릿 기준으로 "어떤 파일을 생성/수정해야 하는가" 판단

```
템플릿 파일 목록: [A, B, C]
실제 파일 목록:   [A, B]

비교 결과:
- A: 템플릿 O, 실제 O → 내용 비교 → UPDATE 또는 UNCHANGED
- B: 템플릿 O, 실제 O → 내용 비교 → UPDATE 또는 UNCHANGED
- C: 템플릿 O, 실제 X → NEW (생성 필요)
```

### 패턴 B: 실제 파일 → 템플릿 비교

**목적**: 실제 기준으로 "어떤 파일을 삭제해야 하는가" 판단

```
템플릿 파일 목록: [A, B]
실제 파일 목록:   [A, B, D]

비교 결과:
- A: 템플릿 O, 실제 O → 내용 비교 → UPDATE 또는 UNCHANGED
- B: 템플릿 O, 실제 O → 내용 비교 → UPDATE 또는 UNCHANGED
- D: 템플릿 X, 실제 O → DELETE (삭제 후보)
```

### 양방향 통합 흐름

```
1. 템플릿 → 실제: NEW, UPDATE, UNCHANGED 판별
2. 실제 → 템플릿: DELETE 판별
3. 최종 상태 테이블 생성
```

---

## 3. 상태 결정 기준

### NEW (🟢)

**조건**: 파일이 **존재하지 않음**

```
템플릿: src/components/Button/Button.svelte (존재)
실제:   src/components/Button/Button.svelte (없음)

→ NEW: 생성 필요
```

**예시**:
- 새 컴포넌트 디렉터리 추가 시 `index.ts`, `*.svelte` 등
- 보일러플레이트에서 정의된 파일이 프로젝트에 아직 없는 경우

### UPDATE (✏️)

**조건**: 파일이 존재하고 **내용 차이**가 있음

```
템플릿: export { Button } from './Button.svelte';
실제:   export { Button } from './Button.svelte';
        export { IconButton } from './IconButton.svelte';

→ UPDATE: 템플릿에 맞게 수정하거나, 의도된 확장인지 확인
```

**비교 방법**:
- 정규화 후 비교 (공백, 줄바꿈 정규화)
- 의미적 동등성 고려 (import 순서만 다른 경우 등)

### DELETE (❌)

**조건**: 템플릿에는 없지만 **실제 존재**

```
템플릿: [Button.svelte, index.ts]
실제:   [Button.svelte, index.ts, Button.legacy.svelte]

→ Button.legacy.svelte: DELETE (템플릿에 없음, 마이그레이션 완료 시 삭제 후보)
```

**주의**: 삭제 전 사용처 검색 및 영향 범위 확인 필수

### UNCHANGED (⚪)

**조건**: 파일 존재하고 **내용 동일**

```
템플릿: export { Button } from './Button.svelte';
실제:   export { Button } from './Button.svelte';

→ UNCHANGED: 작업 불필요
```

---

## 4. 사용 시점

### 대규모 리팩토링

- 여러 패키지/디렉터리에 걸친 구조 변경
- 템플릿(목표 구조)과 현재 구조 비교
- NEW/UPDATE/DELETE 목록 생성 후 단계별 적용

**예시**: Compound Component 패턴 전환 시
- `Card.Root`, `Card.Header` 등 새 파일 → NEW
- 기존 `Card.svelte` 단일 파일 → UPDATE 또는 DELETE

### 컴포넌트 추가/수정

- 새 컴포넌트 추가 시 기존 컴포넌트 구조를 템플릿으로 참조
- `index.ts` export 목록 동기화 여부 확인

**예시**: `{component-name}` 컴포넌트 추가
- `Root.svelte`, `index.ts` → NEW
- 상위 `components/index.ts` → UPDATE (export 추가)

### 보일러플레이트 생성

- 스캐폴딩 도구가 생성할 파일 목록과 실제 프로젝트 비교
- 이미 존재하는 파일은 UPDATE, 없는 파일은 NEW

**예시**: 새 패키지 초기화
- `package.json`, `tsconfig.json`, `src/index.ts` → NEW 또는 UPDATE

---

## 5. 구체적 예시

### 예시 1: Svelte 컴포넌트 마이그레이션

**템플릿 (목표 구조)**:
```
UserScriptSection/
├── ScriptList.svelte
├── ScriptEditor.svelte
├── index.ts
└── __tests__/
    ├── ScriptList.stories.ts
    └── ScriptEditor.stories.ts
```

**실제**:
```
UserScriptSection/
├── ScriptList.svelte
├── ScriptEditor.svelte
├── index.ts
├── OldPanel.svelte        ← 템플릿에 없음
└── __tests__/
    └── ScriptList.stories.ts   ← ScriptEditor.stories.ts 없음
```

**상태 테이블**:

| 파일 | 상태 | 조치 |
|------|------|------|
| ScriptList.svelte | ⚪ UNCHANGED 또는 ✏️ UPDATE | 내용 비교 후 결정 |
| ScriptEditor.svelte | ⚪ UNCHANGED 또는 ✏️ UPDATE | 내용 비교 후 결정 |
| index.ts | ✏️ UPDATE | export 목록 확인 |
| __tests__/ScriptEditor.stories.ts | 🟢 NEW | 생성 |
| OldPanel.svelte | ❌ DELETE | 사용처 확인 후 삭제 |

### 예시 2: index.ts export 동기화

**템플릿** (디렉터리 내 실제 컴포넌트 기반):
```typescript
export { ScriptList } from './ScriptList.svelte';
export { ScriptEditor } from './ScriptEditor.svelte';
```

**실제**:
```typescript
export { ScriptList } from './ScriptList.svelte';
```

**상태**: ✏️ UPDATE — `ScriptEditor` export 추가 필요

---

## 6. 참조

- [리팩토링 패턴](refactoring-patterns.md): 안전한 리팩토링 절차
- [Headless 컴포넌트 패턴](headless-components.md): Compound Component 전환 시 파일 구조
