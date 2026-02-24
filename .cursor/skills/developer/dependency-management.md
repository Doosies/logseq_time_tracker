---
name: dependency-management
description: 의존성 감사, 카탈로그 관리, 버전 업데이트 프로세스
---

# 의존성 관리 가이드

이 Skill은 구현 에이전트가 모노레포의 의존성을 관리할 때 사용하는 체크리스트와 프로세스입니다.

## pnpm Catalog 관리

### Catalog이란?
`pnpm-workspace.yaml`의 `catalog` 섹션에 공통 의존성 버전을 중앙 관리합니다.
패키지별 `package.json`에서는 `catalog:`로 참조합니다.

### Catalog에 올려야 하는 의존성
- **2개 이상 패키지에서 사용되는 의존성** (필수)
- **버전 통일이 중요한 의존성** (TypeScript, ESLint 등)
- **프레임워크 코어 의존성** (Svelte, React 등은 패키지별로 다를 수 있으므로 주의)

### Catalog에 올리지 않는 의존성
- **1개 패키지에서만 사용되는 의존성**
- **패키지별로 다른 버전이 필요한 의존성**

### Catalog 적용 프로세스
```markdown
1. 모든 패키지의 package.json 분석
2. 공통 의존성 식별 (2개+ 패키지에서 사용)
3. pnpm-workspace.yaml의 catalog에 최신 안정 버전 추가
4. 각 package.json에서 버전을 `catalog:`로 교체
5. `pnpm install --no-offline` 실행
6. `pnpm type-check` + `pnpm test`로 검증
```

### 예시

```yaml
# pnpm-workspace.yaml
catalog:
  typescript: ^5.8.3
  eslint: ^9.22.0
  prettier: ^3.5.3
  vitest: ^3.0.9
```

```json
// packages/*/package.json
{
  "devDependencies": {
    "typescript": "catalog:",
    "eslint": "catalog:"
  }
}
```

---

## 의존성 감사 (Audit)

### 미사용 의존성 탐지

```markdown
1. package.json의 모든 dependencies 확인
2. 소스 코드에서 실제 import/require 검색
3. 사용되지 않는 의존성 목록 작성
4. 제거 전 빌드 도구/런타임 의존성인지 확인
   - vite, typescript: 빌드 도구 (import 없어도 사용)
   - @types/*: 타입 정의 (import 없어도 사용)
5. 확인된 미사용 의존성만 제거
```

### 주의할 미사용 오탐 케이스
- **빌드 도구**: vite, typescript, turbo (직접 import 안 함)
- **타입 정의**: @types/node, @types/chrome (직접 import 안 함)
- **ESLint/Prettier 플러그인**: eslint-plugin-*, prettier-plugin-*
- **PostCSS/CSS 플러그인**: autoprefixer 등
- **Vite 플러그인**: @sveltejs/vite-plugin-svelte 등

---

## 버전 업데이트

### 업데이트 프로세스

```markdown
1. 현재 버전 확인
2. 최신 안정 버전 확인 (npm info <package> version)
3. Breaking changes 확인 (CHANGELOG 참조)
4. 버전 업데이트 적용
5. pnpm install --no-offline 실행
6. 검증: pnpm type-check → pnpm test → pnpm build
```

### 주요 버전(Major) 업데이트 시 주의사항
- CHANGELOG/Migration Guide 반드시 확인
- Breaking changes 목록 작성
- 영향받는 코드 수정
- 전체 테스트 실행

### 마이너/패치 업데이트
- 일반적으로 안전
- type-check + test만으로 검증 가능

---

## @types/* 패키지 관리

### 필요한 경우
- 런타임 의존성에 타입 정의가 없는 경우
- 환경별 전역 타입 필요 시 (예: `@types/chrome`)

### 버전 매칭
```markdown
- 런타임 패키지 버전과 @types 버전 일치시킬 것
- 예: react@18.x → @types/react@18.x
```

---

## 체크리스트

### 의존성 추가 시
- [ ] 이미 다른 패키지에서 사용 중인지 확인
- [ ] 2개+ 패키지에서 사용되면 catalog에 추가
- [ ] 최신 안정 버전 사용
- [ ] type-check + test 통과

### 의존성 제거 시
- [ ] 실제로 미사용인지 소스 코드 검색
- [ ] 빌드 도구/플러그인/타입 정의가 아닌지 확인
- [ ] pnpm install --no-offline 후 type-check + test

### 버전 업데이트 시
- [ ] Breaking changes 확인
- [ ] catalog 사용 중인 경우 catalog에서 업데이트
- [ ] pnpm install --no-offline → type-check → test → build

---

## 완료 기준

- [ ] 미사용 의존성 0개
- [ ] 공통 의존성은 catalog으로 관리
- [ ] 모든 의존성 최신 안정 버전
- [ ] type-check + test 통과
