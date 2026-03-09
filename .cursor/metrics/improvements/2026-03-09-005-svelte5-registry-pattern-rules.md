# 섹션 관리 구조화 리팩토링 패턴 분석

**일시**: 2026-03-09
**사이클**: 2026-03-09-005 (섹션 관리 구조화 - Calculator 제거 + 레지스트리 패턴)
**태스크 유형**: Refactor
**분석 대상**: 워크플로우 효율성, 품질 게이트 효과성, 서브에이전트 협업, 에이전트 규칙 개선 필요성

---

## 1. 분석 결과 요약

| 항목 | 결과 | 근거 |
|------|------|------|
| **워크플로우 효율성** | 적절 | 모든 에이전트 0회 재시도, 순차 실행이 의존성에 부합 |
| **품질 게이트 효과성** | 적절 | ReadLints/format/test/lint/type-check/build 순서 합리적 |
| **서브에이전트 협업** | 양호 | developer 발견 이슈를 in-session 해결, 품질 게이트 통과 |
| **에이전트 규칙 개선** | **Yes** | Svelte 5 Runes/레지스트리 패턴 미문서화 |

---

## 2. 워크플로우 효율성 분석

### 2.1 실행 패턴

| 단계 | 에이전트 | 결과 | 재시도 | 비고 |
|------|----------|------|--------|------|
| 0 | (메인) | ✅ | - | 사이클 메트릭 초기화 |
| 1 | planner | success | 0 | 설계/영향 분석 |
| 2 | developer | success | 0 | 구현 (Calculator 제거, 레지스트리 도입) |
| 3 | qa | success | 0 | 테스트 검증 |
| 4 | security | success | 0 | 보안 검증 |
| 5 | docs | success | 0 | CHANGELOG/README |
| 6 | git-workflow | success | 0 | 커밋 생성 |

### 2.2 병목 및 순차 실행 적절성

- **순차 실행 적절**: Refactor 워크플로우는 planner → developer → qa → security → docs → git-workflow 순서가 각 단계 의존성에 부합함.
- **병렬화 지점**: docs와 security는 developer 결과에 의존하므로 병렬 실행 불가. 현재 순서 유지 권장.
- **결론**: 순차 실행이 적절하며, 0회 재시도로 효율적 수행됨.

---

## 3. 품질 게이트 효과성

### 3.1 검증 순서

workflow-checklist 기준: **ReadLints → format → test → lint → type-check → build**

| 검증 | 결과 | 적절성 |
|------|------|--------|
| ReadLints | pass | 즉시 Linter 오류 조기 감지 |
| format | (포함) | Prettier로 포매팅 통일 |
| test | pass | 단위/통합 테스트 |
| lint | pass | 전체 lint 재검증 |
| type-check | pass | TypeScript/Svelte 타입 검증 |
| build | pass | 최종 빌드 성공 |

### 3.2 결론

- 순서 적절: ReadLints로 개발 단계 오류 조기 탐지, type-check로 Stories 포함 전체 타입 검증.
- 불필요한 단계 없음. 추가 권장 사항 없음.

---

## 4. 서브에이전트 협업

### 4.1 developer 발견 이슈 및 해결

| 이슈 | 해결 | severitty |
|------|------|-----------|
| `{@const}` 유효 부모 제한 | snippet/#each 직접 자식으로 이동 | none |
| 기존 storage에 'calculator' 존재 | mergeWithDefault로 알 수 없는 ID 필터링 | minor |

### 4.2 흐름 평가

- developer가 Svelte 5 규칙 관련 이슈를 구현 중 발견 후 in-session 해결.
- qa/security/docs는 추가 수정 요청 없이 통과.
- **결론**: 협업 흐름 양호. 다만 `{@const}` 및 `svelte:component` 규칙이 사전에 문서화되어 있으면 developer의 시행착오를 줄일 수 있음.

---

## 5. 에이전트 규칙 개선 필요성

### 5.1 발견된 패턴 (규칙 미문서화)

| 패턴 | 내용 | 현재 규칙 상태 |
|------|------|----------------|
| **동적 컴포넌트 렌더링** | `<section.component />` dot notation 사용 | svelte-conventions.md에 없음 |
| **svelte:component deprecated** | Svelte 5 Runes 모드에서 deprecated | 문서화 없음 |
| **{@const} 배치 규칙** | snippet, #if, #each의 **직접 자식**만 허용 | 문서화 없음 |
| **레지스트리 패턴** | id/label/component 배열로 확장 가능 섹션 관리 | refactoring-patterns에 없음 |
| **경로 alias** | `#sections` 등 subpath imports | project-conventions에 일부만 기술 |

### 5.2 개선 권장 사항

**결론: YES** — 위 패턴을 규칙/스킬에 반영하는 것이 유리함.

**근거**:
1. developer가 `{@const}` 부모 제한으로 컴파일 오류를 겪음 → 사전 문서화 시 시행착오 감소
2. `svelte:component` deprecated는 Svelte 5 공식 변경 — 프로젝트 표준으로 dot notation 명시 필요
3. 레지스트리 패턴은 ecount-dev-tool뿐 아니라 확장 가능 UI에서 재사용 가능한 공통 패턴

---

## 6. 개선 제안

### 6.1 Svelte 5 Runes 관련 규칙 추가

**대상**: `.cursor/skills/developer/references/svelte-conventions.md`

**추가할 섹션**: "Svelte 5 동적 컴포넌트 및 {@const}"

#### 동적 컴포넌트 렌더링

Svelte 5 Runes 모드에서는 `<svelte:component>`가 deprecated입니다.
동적 컴포넌트 렌더링 시 **dot notation**을 사용합니다.

- 올바른 예: `{#each} {...} {@const section = getSectionById(id)} {#if section} <section.component /> {/if}`
- 잘못된 예: `<svelte:component this={component} />` (deprecated, 경고 발생)

#### {@const} 배치 규칙

`{@const}`는 **snippet, #if, #each, #await 등의 직접 자식**에만 배치할 수 있습니다.
`<div>` 등 중첩 요소 내부에 배치하면 컴파일 오류가 발생합니다.

- 올바른 예: `{#each} ... {@const section = ...} {#if section} ...`
- 올바른 예: `{#snippet} {@const section = ...} <div> ...` (snippet 직접 자식)
- 잘못된 예: `{#each} <div> {@const section = ...} ...` (div 내부 → 컴파일 오류)

### 6.2 레지스트리 패턴 추가

**대상**: `.cursor/skills/developer/references/refactoring-patterns.md` 또는 신규 `references/registry-pattern.md`

**추가 내용**:
- 확장 가능한 섹션/컴포넌트 관리를 위한 레지스트리 패턴
- `{ id, label, component }[]` 형태의 단일 소스 정의
- path alias (`#sections`)를 통한 모듈 집약

### 6.3 우선순위

| 제안 | 우선순위 | 이유 |
|------|----------|------|
| svelte-conventions에 {@const}, dot notation | **High** | 컴파일 오류 방지, 시행착오 감소 |
| refactoring-patterns에 레지스트리 패턴 | Medium | 재사용 가능 패턴, 확장성 가이드 |
| path alias (#sections) | Low | project-conventions에 이미 subpath 기술됨 |

---

## 7. 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| 에이전트 규칙 개선 필요 | developer 시행착오(@const, svelte:component) 발생 | 규칙 미추가(반복 시행착오), planner 전담(과도) |
| svelte-conventions에 먼저 반영 | Svelte 5 특화 규칙, 컴파일 오류 직접 연관 | developer.md 직접 삽입(파일 비대), 별도 svelte5-runes.md(파일 분산) |
| 레지스트리 패턴은 refactoring-patterns에 | 기존 패턴 카탈로그와 일관성 | registry-pattern.md 신규(참조 파일 증가) |

---

## 8. 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| {@const} 유효 부모 미문서화 | svelte-conventions에 배치 규칙 추가 | minor |
| svelte:component deprecated 미문서화 | dot notation 권장 규칙 추가 | minor |
| 레지스트리 패턴 미문서화 | refactoring-patterns에 패턴 추가 | low |
| cycle 005 completed_at/success null | 9단계 보고 시 메트릭 JSON 업데이트 | minor |

---

## 9. 참조

- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-09-005.json`
- 구현 패턴: `packages/ecount-dev-tool/src/sections/registry.ts`, `App.svelte`
- Skill: `.cursor/skills/system-improvement/SKILL.md`
- svelte-conventions: `.cursor/skills/developer/references/svelte-conventions.md`
