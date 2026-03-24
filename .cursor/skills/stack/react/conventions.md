# React 스택 컨벤션

React 패키지(워크스페이스 내 React 앱·라이브러리) 작업 시 적용합니다.

> **상세 tsconfig/ESLint** 예시: [config-optimization.md](../../developer/references/config-optimization.md) (React 패키지 절)

## TypeScript / JSX 설정

- `verbatimModuleSyntax: true` 사용 가능
- `jsx: "react-jsx"` 설정
- 컴포넌트 파일: `PascalCase.tsx`
- Hook 파일: `camelCase.ts` (`use` 접두사)

### 파일명 예시

```
UserProfile.tsx
LoginForm.tsx
useAuth.ts
useTheme.ts
```

### 네이밍 정리

- **컴포넌트**: 파일명·export 모두 `PascalCase` (`UserProfile.tsx`)
- **Hook**: 파일명 `camelCase.ts`, 함수명 `useXxx`
- **일반 모듈**(유틸·서비스): 프로젝트 공통 규칙(AGENTS.md) — 변수 `snake_case`, 함수 `camelCase`

## 외부 라이브러리와 React Hooks

React Hooks와 함께 쓰는 라이브러리는 공식 문서의 권장 패턴(의존성 배열, ref 패턴 등)을 따릅니다. **라이브러리 API는 `.d.ts`·문서로 확인** (추측 금지).

타입 검증·lint·format 스크립트는 [워크스페이스·모노레포 컨벤션(해당 시)](../pnpm-monorepo/conventions.md) 및 프로젝트 `.cursor-agent-config.yaml`을 참조합니다.

## 테스트

진입 요약: [testing.md](./testing.md)
