# Tooltip 컴포넌트 구현 사이클 분석 및 개선 제안

**일시**: 2026-03-12
**사이클 ID**: 2026-03-12-006
**태스크 유형**: Feature (Tooltip 컴포넌트 구현 및 ScriptList 적용)
**분석 목표**: 패턴 분석, 에이전트 규칙 개선 여부 판단

---

## 1. 분석 결과 요약

| 항목 | 결과 | 근거 |
|------|------|------|
| **사이클 성공** | **부분** | 모든 에이전트 success, 품질 게이트 pass, completed_at null (미종료) |
| **규칙 개선 필요** | **Yes** | Portal 컴포넌트 Storybook play 패턴 미문서화 |
| **에이전트 수정** | **storybook-strategy.md** | QA Skill 레퍼런스에 Portal 패턴 추가 |

---

## 2. 사이클 메트릭 현황

### 2.1 에이전트 실행 결과

| 에이전트 | 결과 | 재시도 | 비고 |
|----------|------|--------|------|
| planner | success | 0 | 설계 문서, Wrapper/Portal/surface 결정 |
| developer | success | 0 | primitives + components + tooltip.css.ts |
| qa | success | 0 | 테스트, Storybook play |
| security | success | 0 | textContent, id 형식 검증 |
| docs | success | 0 | README, CHANGELOG |
| git-workflow | (workflow 포함) | - | - |
| system-improvement | pending | 0 | 미실행 |

### 2.2 품질 게이트

| 검증 | 결과 |
|------|------|
| readlints | pass |
| type_check | pass |
| lint | pass |
| test | pass |
| build | pass |
| security | pass |

### 2.3 의사결정 패턴 (18건)

- **design**: Wrapper 방식, document.body Portal, surface 배경, font.size.xs, delay 0ms, 호버 전용
- **implementation**: createElement/appendChild Portal, role="group", coords/resolved_position 제거
- **testing**: waitFor(position), **screen 사용**(Portal), @testing-library/svelte
- **security**: textContent 유지, id 자동 생성, PrimitiveTooltip id 미노출
- **documentation**: Simple 컴포넌트 분류, primitives/Tooltip 구조, TooltipPosition export

### 2.4 발견된 이슈 (7건)

| phase | 이슈 | 해결 | 영향 |
|-------|------|------|------|
| design | Svelte 5 built-in portal 없음 | $effect + createElement/appendChild | minor |
| design | 툴팁↔트리거 깜빡임 | 50ms hide_timeout | minor |
| design | transform 조상 fixed 동작 | Portal로 회피 | none |
| implementation | a11y_no_static_element_interactions | role="group" | none |
| implementation | @typescript-eslint/no-unused-vars | coords, resolved_position 제거 | none |
| testing | @vitest/coverage-v8 미설치 | pnpm add (선택) | minor |
| testing | build-storybook 실행 위치 | 루트에서 실행 | none |

---

## 3. 패턴 분석

### 3.1 긍정적 패턴 (재사용 가능)

| 패턴 | 내용 | 적용 대상 |
|------|------|-----------|
| **uikit 3계층 구조** | primitives → components → design/styles | Tooltip, Dialog, Popover |
| **Svelte 5 Portal** | $effect + createElement/appendChild, 의존성 없음 | Portal 필요 컴포넌트 |
| **보안 설계** | textContent(XSS 방어), id 자동 생성(DOM Clobbering 회피) | 사용자 입력 표시 컴포넌트 |
| **의사결정 문서화** | 18건 decisions 상세 기록, rationale/alternatives | 모든 Feature |

### 3.2 개선 필요 패턴

| 패턴 | 내용 | 현재 규칙 | 개선 제안 |
|------|------|-----------|-----------|
| **Portal + Storybook play** | document.body에 렌더되는 툴팁은 `within(canvasElement)`로 검색 불가 | storybook-strategy.md에 미문서화 | **screen 사용** 패턴 추가 |
| **screen import** | @testing-library/dom 미설치 시 @testing-library/svelte에서 screen import | svelte-testing.md에만 언급 | storybook-strategy에 Portal 섹션에서 명시 |

### 3.3 사이클 내 반복 이슈

- **없음**: 모든 에이전트 0회 재시도, 이슈 7건 모두 1회 발생 후 해결

---

## 4. 규칙 개선 필요 여부 판단

### 4.1 개선 필요 (Yes) 근거

| 기준 | 충족 여부 |
|------|-----------|
| 동일한 실수가 2회 이상 반복됨 | N (단일 사이클) |
| **새로운 베스트 프랙티스 발견** | **Y** - Portal 컴포넌트 play에서 screen 사용 |
| 명확한 금지 사항 발견 | N |
| **효율성을 크게 향상시킬 수 있는 패턴 발견** | **Y** - Dialog, Popover 등 향후 Portal 컴포넌트에서 시행착오 방지 |

**결론**: Portal 컴포넌트 Storybook play 패턴은 **재사용 가능한 베스트 프랙티스**이며, storybook-strategy.md에 없어 향후 유사 컴포넌트(Dialog, Popover 등) 개발 시 `within(canvasElement)` 사용으로 실패할 위험이 있음. **개선 필요**.

### 4.2 개선 불필요로 판단된 항목

| 이슈 | 판단 | 이유 |
|------|------|------|
| waitFor for position | No | requestAnimationFrame 특수 케이스, 일회성 |
| a11y role="group" | No | a11y 규칙으로 커버, 반복 패턴 아님 |
| build-storybook 루트 | No | 프로젝트 컨벤션, add-svelte-component 등에 있을 수 있음 |
| Svelte 5 Portal 구현 | No | tooltip-component-design.md에 문서화됨 |

---

## 5. 개선 제안

### 5.1 storybook-strategy.md 수정

**대상**: `.cursor/skills/qa/references/storybook-strategy.md`

**추가 위치**: Play Function 섹션 내, "select 변경 검증" 다음

**추가 내용**: Portal 컴포넌트 (document.body 렌더링) 전용 하위 섹션

```markdown
### Portal 컴포넌트 (document.body 렌더링)

Tooltip, Dialog, Popover 등 **document.body에 Portal로 렌더되는 콘텐츠**는 `within(canvasElement)`로 검색할 수 없습니다.

- **트리거(버튼 등)**: canvas 내에 있으므로 `within(canvasElement)` 사용
- **Portal 콘텐츠(툴팁, 모달 등)**: `screen` 사용 (전역 document 검색)

**import**: `screen`은 `@testing-library/svelte`에서 import. (`@testing-library/dom` 미설치 시)

```typescript
import { expect, within, userEvent } from 'storybook/test';
import { screen } from '@testing-library/svelte';

play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: '호버 대상' });
    await userEvent.hover(trigger);
    const tooltip = screen.getByRole('tooltip');  // document.body에 있음
    await expect(tooltip).toBeInTheDocument();
},
```
```

### 5.2 적용 대상

| 파일 | 수정 유형 |
|------|-----------|
| `.cursor/skills/qa/references/storybook-strategy.md` | Portal 컴포넌트 섹션 추가 |

### 5.3 예상 효과

- **향후 Portal 컴포넌트** (Dialog, Popover 등) Story 작성 시 `within(canvasElement)`로 실패하는 시행착오 방지
- QA 에이전트가 storybook-strategy 참조 시 Portal 패턴을 즉시 적용 가능
- Tooltip 사이클에서 도출된 결정이 프로젝트 표준으로 고정

---

## 6. 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| storybook-strategy에 Portal 패턴 추가 | Tooltip 결정: "screen 사용, within(canvasElement) 툴팁 미검색" | 규칙 미추가(반복 시행착오), developer.md에 추가(범위 부적합) |
| 에이전트 정의 파일(planner, developer 등) 수정 생략 | 이번 사이클 이슈는 QA Story 작성 영역에 한정 | 모든 에이전트에 Portal 규칙 추가(과도) |
| 개선 리포트 작성 | 개선 필요 판단, 적용 이력 보존 | 수정만 수행(근거 미기록) |

---

## 7. 참조

- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-12-006.json`
- Tooltip 구현: `packages/uikit/src/components/Tooltip/`
- Story 예시: `packages/uikit/src/components/Tooltip/__tests__/Tooltip.stories.ts`
- 관련 개선: `.cursor/metrics/improvements/2026-02-27-009-storybook-play-and-state-isolation-pattern-analysis.md`
