# URL Hash 라우팅 패턴 개선 제안

**일시**: 2026-03-09
**사이클 ID**: 2026-03-09-013
**태스크 유형**: Feature (URL Hash 라우팅 구현 - Tampermonkey 스타일 스크립트 편집 페이지)
**분석 목표**: Chrome Extension URL hash 라우팅 구현 과정에서 발견된 패턴·이슈·개선 기회 정리

---

## 1. 분석 결과 요약

| 항목 | 결과 | 근거 |
|------|------|------|
| **규칙 개선 필요** | **Yes** | editor.html 분리·additionalInputs·chrome.tabs 패턴 미문서화 |
| **Chrome Extension 테스트 문서** | **확장 필요** | tabs.create, getCurrent, remove 가이드 부재 |
| **워크플로우 효율성** | **추가 분석 한계** | 사이클 미완료(workflow/agents 비어 있음) |

---

## 2. 사이클 메트릭 현황

### 2.1 데이터 상태

```json
{
  "cycle_id": "2026-03-09-013",
  "task_type": "Feature",
  "completed_at": null,
  "success": null,
  "workflow": [],
  "agents": {},
  "issues_encountered": [],
  "files_changed": []
}
```

**상태**: **미완료**
- 실행 단계(2~9) 데이터 미수집
- `workflow`, `agents`, `files_changed` 비어 있음
- `issues_encountered` 비어 있음

### 2.2 기획 단계 결정사항

| 결정 | 근거 | 대안 |
|------|------|------|
| 별도 페이지(editor.html) 분리 | Tampermonkey 스타일, 전체 화면 활용 | Dialog 오버레이, popup 내 전환 (rejected) |
| 2단 레이아웃 (메타데이터 \| 코드) | 코드 편집 공간 최대화 | 1단 수직, ScriptEditor 재사용 (rejected) |

---

## 3. 발견된 패턴 (코드 분석 기반)

### 3.1 editor.html 분리 방식

| 패턴 | 구현 | 적용 가능성 |
|------|------|-------------|
| **다중 HTML 진입점** | popup.html 외 editor.html 추가 | 다른 Chrome Extension 프로젝트에 적용 가능 |
| **vite-plugin-web-extension** | `additionalInputs: ['src/editor.html']` | Vite 7 + web-extension 플러그인 필수 |
| **URL hash 라우팅** | `#new`, `#script-id` 형식 | Tampermonkey/Greasemonkey 스타일 참고 |
| **탭 기반 편집** | `chrome.tabs.create({ url })` | 여러 편집 화면 동시 접근 가능 |

### 3.2 Svelte 5 + Chrome Extension 통합

| 항목 | 패턴 | 주의사항 |
|------|------|----------|
| **entry 스크립트** | `editor.html` → `editor.ts` → `mount(EditorPage)` | popup과 별도 초기화 (theme, stores) |
| **chrome.runtime.getURL** | `chrome.runtime.getURL(\`src/editor.html#${script_id}\`)` | hash는 수동 concat |
| **경로 alias** | `#utils/*`, `#components/*` | tsconfig paths + package.json exports |
| **chrome.tabs API** | `create`, `getCurrent`, `remove` | 팝업/백그라운드 컨텍스트 차이 주의 |

### 3.3 테스트 전략

| 패턴 | 구현 | 재사용 가능 |
|------|------|-------------|
| **setup.ts chrome mock** | tabs.create, getCurrent, remove 포함 | ✅ 동일 패턴 다른 프로젝트 적용 가능 |
| **asMock 헬퍼** | vi.mocked() 우회 (@types/chrome 콜백 오버로드) | ✅ chrome-extension-testing.md에 문서화 권장 |
| **Storybook play 검증** | `expect(chrome.tabs.create).toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining('editor.html#new') }))` | ✅ 탭 열기 동작 테스트 표준 패턴 |
| **stories.test.ts** | composeStories + render + play 자동 실행 | 기존 패턴 유지 |

---

## 4. 개선 제안

### 4.1 스킬 문서 추가

| 대상 | 내용 |
|------|------|
| **developer** | `.cursor/skills/developer/references/chrome-extension-routing.md` 신규 생성 — editor.html 분리, additionalInputs, hash 라우팅 체크리스트 |
| **config-optimization** | Vite 웹 확장 섹션에 `additionalInputs` 패턴 추가 |
| **chrome-extension-testing** | tabs.create, getCurrent, remove 테스트 패턴 및 Storybook play 검증 가이드 |

### 4.2 체크리스트 (Chrome Extension 다중 페이지)

- [ ] `vite.config.ts`에 `additionalInputs`로 추가 HTML 진입점 등록
- [ ] `chrome.runtime.getURL()`로 extension URL 생성 (절대 경로)
- [ ] hash 파싱은 관대하게, 비즈니스 검증은 페이지 컴포넌트에서 수행
- [ ] `chrome.tabs.create` 호출 코드는 DI 또는 추상화하여 테스트 가능하게

---

## 5. 적용 대상

| 에이전트/스킬 | 변경 |
|---------------|------|
| **developer** | chrome-extension-routing.md 참조 추가 |
| **qa** | chrome-extension-testing.md에 tabs.create/getCurrent/remove 섹션 추가 |
| **config-optimization** | additionalInputs 패턴 추가 |

---

## 6. 참조

- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-09-013.json`
- 구현 예시: `packages/ecount-dev-tool/src/utils/router.ts`
- 빌드 설정: `packages/ecount-dev-tool/vite.config.ts`
- 테스트 mock: `packages/ecount-dev-tool/src/test/setup.ts`
- Storybook 검증: `packages/ecount-dev-tool/src/components/UserScriptSection/__tests__/UserScriptSection.stories.ts`
- chrome-extension-testing: `.cursor/skills/qa/references/chrome-extension-testing.md`
