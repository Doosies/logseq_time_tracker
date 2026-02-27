# 버그 수정 패턴 분석 및 에이전트 규칙 개선

**분석 일시**: 2026-02-27  
**분석 대상**: 버그 수정 작업에서 발견된 패턴/이슈  
**우선순위**: P0 (즉시 적용) / P1 (문서화)

---

## 1. 발견된 패턴 요약

| # | 패턴/이슈 | 에이전트 규칙 개선 필요 | 판단 근거 |
|---|-----------|--------------------------|-----------|
| 1 | @dnd-kit/svelte createSortable 패턴 오류 | **YES (P0)** | 교훈 기반 패턴, developer.md 확장 필요 |
| 2 | QA 중 pre-existing Storybook type 에러 | **YES (P0)** | type-check 범위/시점 명확화 필요 |
| 3 | chrome.storage 영구 상태 라이프사이클 | **문서화 (P1)** | 도메인 특화, Skill/체크리스트 고려 |

---

## 2. 상세 분석 및 개선안

### 패턴 1: @dnd-kit/svelte createSortable 사용 패턴 오류

**문제**:
- `createSortable`을 `$derived.by(() => createSortable({id, index}))`로 감싸서 인스턴스가 매 렌더마다 재생성됨
- 공식 문서의 권장 패턴(getter 함수)을 따르지 않음

**원인**:
- `.d.ts` 타입 정의만 확인했을 가능성
- **사용 패턴(usage pattern)** 은 공식 문서/README에 있으며, `.d.ts`에는 반영되지 않음
- Svelte/Runes 환경에서 `$derived.by` vs getter 객체 패턴 차이를 문서에서 확인해야 함

**수정 예시**:
```typescript
// ❌ 잘못된 패턴 - 매번 재생성
const sortable = $derived.by(() => createSortable({ id, index }));

// ✅ 권장 패턴 - getter 함수
createSortable({
  get id() { return id; },
  get index() { return index; }
});
```

**교훈**:
- 외부 라이브러리 API 사용 시 **타입 정의(.d.ts)** 뿐만 아니라 **공식 문서의 권장 사용 패턴**을 반드시 확인해야 함
- Svelte/Runes, React Hooks 등 반응형 프레임워크에서 라이브러리 사용 패턴은 문서에 의존

**에이전트 규칙 개선**:
- **대상**: `.cursor/agents/developer.md` - "외부 라이브러리 API 사용 시" 섹션
- **변경**: `.d.ts` 확인에 더해 "공식 문서(README, 공식 가이드)의 권장 사용 패턴 확인" 항목 추가
- **AGENTS.md**: 교훈 테이블에 "공식 문서의 권장 패턴 확인" 보강

---

### 패턴 2: QA 중 발견된 pre-existing Storybook type 에러

**문제**:
- Storybook stories 파일(`*.stories.ts`)에서 `scenario` argTypes가 컴포넌트에 존재하지 않는 prop으로 선언됨
- type-check 실패 → 3개 파일 (Popover.stories.ts, Toast.stories.ts, ActionBar.stories.ts)

**원인 추정**:
1. 새 기능 구현 시 `pnpm type-check`가 **특정 패키지만** 실행되었거나
2. stories 파일이 type-check 대상에서 제외되었거나
3. 기존 코드에 type 에러가 있었으나 검증 누락

**교훈**:
- 구현 완료 후 **전체 워크스페이스** type-check 실행 필수
- Storybook stories 변경 시에도 type-check 검증 대상에 포함되어야 함
- "변경된 파일만" 검증하는 습관은 관련 파일(stories 포함)의 pre-existing 에러를 놓칠 수 있음

**에이전트 규칙 개선**:
- **대상**: `.cursor/agents/developer.md`, `.cursor/rules/main-orchestrator.mdc`
- **변경**: 
  - "구현 완료 후 `pnpm type-check`는 **워크스페이스 루트**에서 실행하여 모든 패키지(Stories 포함) 검증"
  - 품질 게이트: "Storybook `.stories.ts` 파일 수정/추가 시 type-check 필수"
- **main-orchestrator**: 서브에이전트 검증 시 "전체 프로젝트 type-check" 명시

---

### 패턴 3: chrome.storage 영구 상태 관리

**문제**:
- `active_account.svelte.ts`에서 한 번 저장된 active 계정 키가 영구 보존됨
- UI 상태가 의도와 다르게 계속 활성화되는 현상

**교훈**:
- `chrome.storage`, `localStorage` 등 영구 저장소에 저장하는 상태의 **라이프사이클**을 명확히 설계해야 함
- 저장 시점, 삭제/초기화 시점, 만료 정책 등을 설계 문서에 명시

**에이전트 규칙 개선**:
- **판단**: **즉시 에이전트 파일 수정 불필요** (도메인 특화)
- **권장**: 
  - **Planner**: 브라우저 확장 프로그램 설계 시 "상태 저장소 라이프사이클" 체크리스트 항목 추가 (선택)
  - **Skill 생성**: `planner/browser-extension-patterns.md` 또는 `developer/storage-lifecycle.md` - ecount-dev-tool 등 Chrome 확장 관련 패턴이 반복될 경우
- **개선 리포트에 기록**: 향후 유사 패턴 발생 시 Skill/규칙 추가 검토

---

## 3. 적용된 개선 사항

### ✅ developer.md - 외부 라이브러리 규칙 강화
- "공식 문서(README, 공식 가이드)의 권장 사용 패턴 확인" 항목 추가
- Svelte/Runes, React Hooks 등 반응형 환경에서 패턴 문서 확인 명시

### ✅ developer.md - type-check 범위 명확화
- "워크스페이스 루트에서 `pnpm type-check` 실행" 명시
- Stories 파일 포함 검증 안내 추가

### ✅ main-orchestrator.mdc - type-check 범위 명확화
- 서브에이전트 검증 시 "워크스페이스 루트, Stories 포함" 명시

### ⏸️ planner.md - 브라우저 확장 상태 설계
- 즉시 수정 보류 (P1, 패턴 재발 시 적용)

---

## 4. 교훈 → system-improvement 에이전트 패턴 매핑

이번 분석 결과는 **system-improvement.md** "교훈 기반 에러 패턴 분석"에 다음과 같이 매핑됩니다:

| 발견 패턴 | 기존 매핑 | 보강 내용 |
|----------|-----------|-----------|
| createSortable 오패턴 | "외부 라이브러리 API 오사용" | **공식 문서 패턴 확인** 추가 |
| Stories type 에러 | (신규) | type-check 범위/시점 검증 누락 → developer, main-orchestrator |
| 영구 상태 라이프사이클 | (도메인 특화) | planner 브라우저 확장 설계 체크리스트 (P1) |

---

## 5. 검증 방법

### createSortable 규칙 검증
- 외부 라이브러리(Svelte용 DnD, 모달 등) 신규 도입 시:
  - 공식 README/가이드에서 "Usage", "Svelte", "Runes" 섹션 확인 여부

### type-check 범위 검증
- 구현 완료 후 `pnpm type-check` 실행 시:
  - 워크스페이스 루트에서 실행 (filter 없이)
  - Stories 파일 type 에러 0개 확인

---

## 6. 참고

- **AGENTS.md** 교훈 기반 원칙: "외부 라이브러리 API 추측 금지"
- **developer.md** 388-404행: 외부 라이브러리 API 사용 시 섹션
- **main-orchestrator.mdc**: 품질 게이트 type-check 검증
