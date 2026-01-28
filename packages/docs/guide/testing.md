# Testing

## Vitest

이 프로젝트는 Vitest를 사용합니다. Vitest는 Vite 네이티브 테스트 러너로 빠르고 현대적입니다.

## 테스트 실행

### 기본 테스트

```bash
pnpm test
```

### Watch 모드

```bash
pnpm test --watch
```

### UI 모드

```bash
pnpm test:ui
```

브라우저에서 테스트 결과를 시각적으로 확인할 수 있습니다.

### 커버리지

```bash
pnpm test:coverage
```

## 테스트 작성

### 기본 테스트

```ts
import { describe, it, expect } from 'vitest';

describe('example test', () => {
    it('should pass', () => {
        expect(1 + 1).toBe(2);
    });
});
```

### 컴포넌트 테스트

```tsx
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
    it('should render title', () => {
        render(<App />);
        expect(screen.getByText('Logseq Personal Plugin')).toBeInTheDocument();
    });
});
```

## Testing Library

React Testing Library를 사용하여 컴포넌트를 테스트합니다:

- `render()`: 컴포넌트 렌더링
- `screen`: DOM 쿼리
- `fireEvent`: 이벤트 시뮬레이션
- `waitFor`: 비동기 작업 대기

## 모범 사례

1. **사용자 관점으로 테스트**: 구현 세부사항이 아닌 사용자 행동을 테스트
2. **격리된 테스트**: 각 테스트는 독립적으로 실행 가능해야 함
3. **의미 있는 테스트**: 실제 버그를 잡을 수 있는 테스트 작성
4. **빠른 테스트**: 피드백 루프를 짧게 유지

## 다음 단계

- [API 레퍼런스](/api/)에서 더 많은 예제 확인
