# React 스택 — 테스트 컨벤션

React 컴포넌트·Hook을 **Vitest**(또는 프로젝트가 쓰는 러너)와 **React Testing Library**로 검증할 때의 진입 요약입니다.  
이 저장소에는 Svelte 전용 `qa/references`만 분리되어 있으므로, React는 **공식 문서 + 아래 패턴**을 기본으로 합니다.

## 권장 스택

- `@testing-library/react` — `render`, `screen`, `within`
- `@testing-library/user-event` — 사용자 상호작용
- `@testing-library/jest-dom` — `toBeInTheDocument` 등 (설정 시)
- Vitest: `environment: 'jsdom'`, 필요 시 `setupFiles`에서 `@testing-library/jest-dom/vitest` 등 로드

## 패턴 요약

- **렌더**: `render(<Subject {...props} />)` 후 `screen.getByRole(...)` 위주로 단언 (접근성 쿼리 우선)
- **비동기**: `await userEvent.setup()`, `await user.click(...)`, `waitFor(() => …)`
- **콜백**: `vi.fn()`을 props로 넘겨 호출 여부·인자 검증
- **Hook만 테스트**: `@testing-library/react`의 `renderHook` (또는 프로젝트 래퍼)

## 쿼리 우선순위

Testing Library 권장 순서를 따릅니다: **role + name** → label → placeholder → text → testid(최후).

- 공식: [Queries | Testing Library](https://testing-library.com/docs/queries/about#priority)

## 프로젝트 설정

tsconfig·ESLint(React Hooks) 예시는 [config-optimization.md](../../developer/references/config-optimization.md)의 React 패키지 절을 참조합니다.

품질 게이트·금지 패턴은 [QA SKILL](../../qa/SKILL.md) 및 [code-review.md](../../qa/references/code-review.md)를 함께 따릅니다.
