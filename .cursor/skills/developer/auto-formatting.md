---
name: auto-formatting
description: 자동 포매팅 및 Linter 검증 프로세스
---

# 자동 포매팅 및 Linter 검증

이 Skill은 구현 에이전트가 코드 작성 후 자동으로 포매팅과 Linter 검증을 수행하는 프로세스를 제공합니다.

## 핵심 원칙

1. **자동화 우선**: 수동 확인보다 자동 검증
2. **즉시 피드백**: 파일 수정 직후 검증
3. **오류 0개**: Linter 오류는 절대 남기지 않음

---

## 프로세스

### 1단계: 파일 수정 후 즉시 ReadLints 실행

파일을 작성하거나 수정한 직후:

```typescript
// 예시: src/main.tsx 수정 후
ReadLints(['src/main.tsx'])
```

**체크리스트**:
- [ ] 수정한 모든 파일 경로를 배열로 전달
- [ ] ReadLints 결과 확인
- [ ] 오류 개수 확인

---

### 2단계: Linter 오류 발견 시 자동 수정 시도

오류가 발견되면:

```bash
# 자동 수정 가능한 오류 수정
npm run lint:fix
```

**자동 수정 가능한 오류 예시**:
- 세미콜론 누락
- 따옴표 스타일 (single → double)
- 들여쓰기
- 불필요한 공백
- import 정렬

**자동 수정 불가능한 오류 예시**:
- 사용하지 않는 변수 (수동 제거 필요)
- 타입 오류 (코드 수정 필요)
- 네이밍 컨벤션 위반 (수동 수정 필요)

---

### 3단계: 자동 수정 후 재확인

```typescript
// lint:fix 실행 후
ReadLints(['src/main.tsx']) // 재확인
```

**체크리스트**:
- [ ] 자동 수정된 오류가 해결되었는지 확인
- [ ] 남은 오류가 있다면 수동 수정
- [ ] 오류 0개가 될 때까지 반복

---

### 4단계: Prettier 포매팅 적용

Linter 오류가 0개가 되면:

```bash
# Prettier 포매팅 적용
npm run format

# 또는 특정 파일만
npx prettier --write src/main.tsx
```

**Prettier 설정 확인**:
- `.prettierrc` 파일 확인
- 프로젝트별 설정 준수

---

### 5단계: 최종 확인

모든 수정 완료 후:

```typescript
// 최종 ReadLints 확인
ReadLints(['src/main.tsx'])

// 결과: 오류 0개 확인
```

---

## 자주 발생하는 Linter 오류 및 해결법

### 1. 사용하지 않는 변수

```typescript
// ❌ 오류
const unused_var = 10;
const result = calculate();

// ✅ 해결
const result = calculate();
// unused_var 제거
```

### 2. 네이밍 컨벤션 위반

```typescript
// ❌ 오류: 변수명이 camelCase
const userCount = 10;

// ✅ 해결: snake_case
const user_count = 10;
```

### 3. 타입 오류

```typescript
// ❌ 오류: 타입 불일치
function getValue(): number {
  return 'string'; // 오류
}

// ✅ 해결
function getValue(): string {
  return 'string';
}
```

### 4. Import 정렬

```typescript
// ❌ 오류: import 순서
import { helper } from './helper';
import React from 'react';

// ✅ 해결: 외부 라이브러리 먼저
import React from 'react';
import { helper } from './helper';
```

---

## 통합 워크플로우

### 완전한 예시

```markdown
1. 파일 수정: src/main.tsx
2. ReadLints(['src/main.tsx'])
   → 오류 3개 발견
3. npm run lint:fix 실행
4. ReadLints(['src/main.tsx'])
   → 오류 1개 남음 (수동 수정 필요)
5. 코드 수정 (사용하지 않는 변수 제거)
6. ReadLints(['src/main.tsx'])
   → 오류 0개 ✅
7. npm run format 실행
8. ReadLints(['src/main.tsx'])
   → 최종 확인: 오류 0개 ✅
```

---

## 주의사항

### 1. 여러 파일 수정 시

```typescript
// 여러 파일을 수정한 경우
ReadLints([
  'src/main.tsx',
  'src/utils.ts',
  'tests/main.test.tsx'
])
```

### 2. 테스트 파일도 검증

테스트 코드도 Linter 검증 대상입니다:

```typescript
ReadLints(['tests/main.test.tsx'])
```

### 3. 설정 파일 제외

일부 설정 파일은 Linter 검증에서 제외될 수 있습니다:
- `*.config.ts`
- `vite-env.d.ts`

하지만 가능하면 검증하는 것이 좋습니다.

---

## 완료 기준

다음 모든 조건을 만족해야 합니다:

- [ ] ReadLints 실행 완료
- [ ] Linter 오류 0개
- [ ] Prettier 포매팅 적용 완료
- [ ] 최종 ReadLints 재확인 완료

**중요**: Linter 오류가 0개가 아니면 다음 단계로 진행하지 않습니다!

---

## 도구 명령어 참고

### 프로젝트별 명령어 확인

```bash
# package.json에서 확인
cat package.json | grep -A 5 "scripts"

# 일반적인 명령어
npm run lint        # Linter 검증만
npm run lint:fix    # Linter 자동 수정
npm run format      # Prettier 포매팅
npm run type-check  # TypeScript 타입 검증
```

---

## 예외 상황

### 1. Linter 오류를 무시해야 하는 경우

매우 드물지만, 특정 오류를 무시해야 하는 경우:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug_var = process.env.DEBUG;
```

**주의**: 가능한 한 사용하지 말고, 대안을 찾으세요.

### 2. Prettier와 충돌하는 경우

Prettier 설정과 Linter 규칙이 충돌할 수 있습니다.
이 경우 `.prettierrc`와 `eslint.config.js`를 확인하여 일관성 있게 설정하세요.

---

## 체크리스트 요약

파일 수정 후:

- [ ] ReadLints 실행
- [ ] 오류 발견 시 `npm run lint:fix`
- [ ] ReadLints 재확인
- [ ] 남은 오류 수동 수정
- [ ] `npm run format` 실행
- [ ] 최종 ReadLints 확인
- [ ] 오류 0개 확인 ✅
