# Storybook play function 누락 및 모듈 레벨 상태 격리 부재 - 패턴 분석 및 규칙 개선 제안

**분석 일시**: 2026-02-27  
**태스크 유형**: bugfix / system-improvement  
**분석 대상**: ServerManager 컴포넌트 이슈에서 도출된 테스트 누락 패턴  
**관련 이슈**: play function 누락, 스토리 간 모듈 레벨 상태 공유

---

## 1. 발견된 이슈 요약

### 이슈 1: Storybook 스토리 play function 누락

| 항목 | 내용 |
|------|------|
| **현상** | ServerManager 3개 스토리 중 2개(TestEnvironment, UnsupportedEnvironment)에 play function이 없었음 |
| **영향** | UI 변경 시 회귀 테스트 미작동. 해당 환경은 시각적 확인만 가능 |
| **근본 원인** | play function 작성이 선택적으로 취급됨. storybook-strategy.md에서 "권장" 수준 |

### 이슈 2: 모듈 레벨 상태의 스토리 간 격리 부재

| 항목 | 내용 |
|------|------|
| **현상** | `server_ui.svelte.ts`의 `_is_initialized` 플래그가 모듈 레벨로 존재. 스토리 순차 실행 시 첫 스토리 값이 이후 스토리에 유지됨 |
| **영향** | Storybook test runner로 순차 실행 시 두 번째 이후 스토리가 첫 스토리 상태 사용 |
| **근본 원인** | Svelte 5 모듈 레벨 `$state` + 초기화 플래그 패턴이 Storybook 격리와 비호환. reset 함수 호출 규칙 부재 |

---

## 2. 프로젝트 전체 패턴 분석

### 2.1 play function 누락 스토리 목록

| 컴포넌트 | play 없는 스토리 | 비고 |
|----------|------------------|------|
| Button | Secondary, Accent, Small, Medium | 4개 |
| Select | ManyOptions | 1개 |
| Section | LongContent | 1개 (LongContentRendered는 play 있음) |
| QuickLoginSection | EmptyAccounts | 1개 (빈 객체 `{}`) |
| ServerManager | - | 수정 완료, 3개 모두 play 있음 |

**총계**: 7개 스토리에 play function 없음.

### 2.2 모듈 레벨 상태 사용 패턴

| 파일 | 패턴 | Storybook 격리 |
|------|------|----------------|
| `packages/ecount-dev-tool/src/stores/server_ui.svelte.ts` | `let _* = $state()`, `_is_initialized` | `resetServerUi()` 제공. ServerManagerStoryWrapper onMount에서 호출 |
| `packages/uikit/src/actions/click_outside.ts` | `let _callback` | action 내부 캡처, 스토리 격리와 무관 |

**결론**: `server_ui.svelte.ts`가 현재 프로젝트에서 유일한 Storybook 격리 이슈가 있는 모듈 레벨 상태. `resetServerUi()`는 존재하며 `ServerManagerStoryWrapper`에서 호출됨. 향후 유사 스토어 추가 시 reset 규칙이 없으면 동일 이슈 재발 가능.

---

## 3. 규칙 개선 필요성 판단

### 3.1 수정이 필요한 파일 및 제안 내용

| 파일 | 수정 유형 | 제안 내용 |
|------|-----------|-----------|
| `.cursor/skills/qa/storybook-strategy.md` | 규칙 강화 | play function을 "권장" → **필수**로 변경. 모든 Story에 play 작성 강제 |
| `.cursor/agents/qa.md` | 규칙 추가 | Story 작성 시 play function 체크리스트 항목 추가 |
| `.cursor/rules/main-orchestrator.mdc` | 품질 게이트 추가 | QA 품질 게이트에 "모든 스토리에 play function 존재" 검증 (선택적) |
| `.cursor/agents/developer.md` | 규칙 추가 | 모듈 레벨 상태 스토어 설계 시 reset 함수 제공 + Storybook 호환 규칙 |
| `.cursor/agents/system-improvement.md` | 교훈 패턴 추가 | "play function 누락", "모듈 레벨 상태 Storybook 격리 부재" 패턴 등록 |
| `AGENTS.md` | 교훈 표 추가 | 위 두 패턴을 교훈 기반 원칙 표에 추가 |

### 3.2 storybook-strategy.md 상세 수정 제안

**현재** (222-224행 부근):
```markdown
## Play Function (인터랙션 테스트)
UI 컴포넌트의 렌더링/인터랙션 테스트는 Storybook play function으로 수행합니다.
별도 `.test.ts` 파일 대신 Story의 `play`에서 처리합니다.
```

**수정 제안**:
```markdown
## Play Function (인터랙션 테스트) - **필수**

**모든 Story에는 play function이 있어야 합니다.** 회귀 테스트가 없으면 UI 변경 시 검증이 불가합니다.

- **필수**: 각 `export const Xxx: Story`에 `play: async ({ canvasElement, ... }) => { ... }` 포함
- **최소 검증**: `expect(canvas.getByRole(...)).toBeInTheDocument()` 또는 해당 스토리 특성에 맞는 assertion
- **예외**: 정적 시각 확인만 필요한 경우에도 최소한 `toBeInTheDocument()` 수준 검증 포함

UI 컴포넌트의 렌더링/인터랙션 테스트는 Storybook play function으로 수행합니다.
별도 `.test.ts` 파일 대신 Story의 `play`에서 처리합니다.
```

**Story 작성 체크리스트** (377행 부근) 수정:
```markdown
- [ ] **모든 Story에 play function 포함** (필수!)
```

### 3.3 developer.md 모듈 레벨 상태 규칙 제안

**추가 위치**: Svelte 프로젝트 섹션 또는 "테스트 가능한 코드" 관련 섹션

```markdown
### 모듈 레벨 상태 스토어 (Svelte 5 $state)

Svelte 5의 모듈 레벨 `$state()` 또는 `let _is_initialized` 패턴을 사용하는 스토어는:

1. **reset 함수 필수 제공**: `export function resetXxx(): void` 형태로 초기화/리셋 함수 노출
2. **Storybook 호환**: 해당 스토어를 사용하는 컴포넌트의 StoryWrapper에서 **onMount 시점에 reset() 호출**하여 스토리 간 격리 보장
3. **이유**: Storybook test runner는 스토리를 순차 실행할 때 동일 모듈 인스턴스를 재사용. reset 없으면 이전 스토리 상태가 유지됨

참고: `server_ui.svelte.ts`의 `resetServerUi()` + ServerManagerStoryWrapper onMount 패턴
```

### 3.4 qa.md Story 작성 트리거 보강

**기존** (378-389행): Feature 시 스토리 존재 확인

**추가**:
```markdown
### Story 품질 검증 (스토리 존재 시)
- [ ] **모든 Story에 play function 존재** (storybook-strategy.md 참조)
- [ ] play function에서 최소 1개 이상 assertion (렌더링/역할/텍스트 검증)
- [ ] Chrome API 의존 StoryWrapper: onMount에서 reset 함수 호출 여부 확인
```

### 3.5 system-improvement.md 교훈 패턴 추가

**2단계: 병목 지점 식별** 내 "교훈 기반 에러 패턴 분석"에 추가:

```markdown
- **Storybook play function 누락**: qa.md 스토리 품질 검증, storybook-strategy.md play 필수 규칙 확인
- **모듈 레벨 상태 Storybook 격리 부재**: developer.md 모듈 레벨 상태 reset 규칙, StoryWrapper onMount reset 호출 검토
```

---

## 4. 우선순위 부여 (P0/P1/P2)

| # | 개선안 | 우선순위 | 근거 |
|---|--------|----------|------|
| 1 | storybook-strategy.md: play function **필수** 규칙 강화 | **P0** | 누락 시 회귀 테스트 불가. 직관적 원인-해결 매핑 |
| 2 | storybook-strategy.md: Story 작성 체크리스트에 play 필수 항목 추가 | **P0** | QA가 스토리 작성/검토 시 체크 가능 |
| 3 | qa.md: Story 품질 검증 체크리스트 추가 (play 필수, reset 호출 확인) | **P1** | QA 에이전트 실행 시점 검증 |
| 4 | developer.md: 모듈 레벨 상태 스토어 reset 필수 규칙 | **P1** | 향후 유사 스토어 추가 시 재발 방지 |
| 5 | system-improvement.md: 교훈 패턴 2종 추가 | **P2** | 자동 개선 트리거, 메타 학습 |
| 6 | AGENTS.md: 교훈 기반 원칙 표에 패턴 추가 | **P2** | 공통 참조용 |
| 7 | main-orchestrator.mdc: QA 품질 게이트에 play 존재 검증 | **P2** | 선택적. qa 체크리스트로 커버 가능 |

---

## 5. 기존 스토리 보완 (선택)

규칙 적용 후 기존 play 없는 7개 스토리 보완 권장:

| 컴포넌트 | 스토리 | 추가할 play 검증 예시 |
|----------|--------|------------------------|
| Button | Secondary, Accent, Small, Medium | `expect(canvas.getByRole('button')).toBeInTheDocument()` + 해당 텍스트/스타일 검증 |
| Select | ManyOptions | `expect(canvas.getByRole('combobox')).toBeInTheDocument()`, options 길이 검증 |
| Section | LongContent | `expect(canvas.getByText('긴 내용')).toBeInTheDocument()` (LongContentRendered와 유사) |
| QuickLoginSection | EmptyAccounts | `expect(canvas.queryAllByRole('button')).toHaveLength(0)` 또는 빈 상태 검증 |

---

## 6. 결론

- **이슈 1 (play 누락)**: storybook-strategy.md 규칙 강화(P0) + qa.md 체크리스트(P1)로 재발 방지
- **이슈 2 (모듈 레벨 상태 격리)**: developer.md reset 규칙(P1) + StoryWrapper onMount reset 호출 검토로 재발 방지
- **메타 학습**: system-improvement.md, AGENTS.md에 교훈 패턴 등록(P2)하여 유사 사례 시 자동 규칙 검토 트리거

**직접 수정하지 말 것** - 본 리포트는 제안 기록용. 적용은 별도 태스크로 수행.
