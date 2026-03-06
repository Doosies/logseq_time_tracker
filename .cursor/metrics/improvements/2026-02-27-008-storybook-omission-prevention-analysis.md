# Storybook 스토리 누락 방지 시스템 - 갭 분석

**분석 일시**: 2026-02-27  
**태스크 유형**: feature (Storybook 누락 방지 시스템 구축)  
**분석 대상**: SectionSettings 컴포넌트 Storybook 스토리 누락 사례

---

## 1. 이번 작업에서 이미 적용된 수정 (중복 제안 불필요)

| # | 수정 항목 | 파일 | 적용 내용 |
|---|-----------|------|-----------|
| 1 | 인프라 | `.storybook/preview.ts` | chrome.storage.sync in-memory mock + `__storybook_reset_storage` / `__storybook_set_storage` 헬퍼 |
| 2 | 스토리 | SectionSettings | StoryWrapper + stories.ts 생성 |
| 3 | QA 규칙 | `.cursor/agents/qa.md` | Feature 시 스토리 작성 트리거 규칙 추가 |
| 4 | Skill | `.cursor/skills/qa/storybook-strategy.md` | chrome.storage 패턴 가이드 (B. chrome.storage.sync 의존) |
| 5 | 품질 게이트 | `.cursor/rules/main-orchestrator.mdc` | QA 품질 게이트에 "새 컴포넌트의 Storybook 스토리 존재 확인" 체크 추가 |

---

## 2. 추가 갭 분석 결과

### 갭 A: Developer - Chrome API 의존 시 preview.ts mock 선제 검토 부재

**문제**:
- SectionSettings 사례의 **인프라 원인**: `chrome.storage.sync` mock이 preview.ts에 없었음
- Developer가 Chrome Extension API 의존 컴포넌트를 구현할 때, `.storybook/preview.ts` mock 존재 여부를 검토하거나 추가하는 규칙이 없음
- 현재 흐름: Developer 구현 → QA 스토리 시도 → mock 부재 발견 → 반복/보고 → 사후 수정

**영향**:
- QA가 스토리 작성 시 mock 부재로 인한 실패
- 인프라 개선이 태스크 후반에 밀리는 반응형 구조

**해결 방안 (에이전트 정의 수정 제안)**:

**대상**: `.cursor/agents/developer.md`

**제안 1 - 구현 후 체크리스트 추가**:
```markdown
### Chrome Extension 컴포넌트 구현 시 (해당 시)
- [ ] `.storybook/preview.ts`에 필요한 chrome API mock 존재 확인
- [ ] `chrome.storage.sync`, `chrome.tabs` 등 사용 API의 mock 없음 → storybook-strategy.md 참조하여 preview.ts에 추가
```

**제안 2 - Skill 참조 추가**:
- `qa/storybook-strategy.md` 또는 신규 `developer/chrome-extension-storybook-mock.md`를 Developer가 Chrome API 의존 UI 구현 시 참조

**우선순위**: P1 (다음 Feature에서 Chrome API 의존 컴포넌트 추가 시 적용)

---

### 갭 B: system-improvement - 교훈 기반 에러 패턴에 스토리 누락 미포함

**문제**:
- `.cursor/agents/system-improvement.md`의 "교훈 기반 에러 패턴 분석" 목록에 "Storybook 스토리 누락" 패턴이 없음
- 향후 유사 사례(새 컴포넌트 추가 시 스토리 누락) 발생 시, System-Improvement 에이전트가 자동으로 qa.md/developer.md 규칙 검토를 트리거하지 못함

**현재 교훈 패턴 (system-improvement.md 245-252행)**:
- 외부 라이브러리 API 오사용
- type-check 검증 누락
- 라이브러리 마이그레이션 시 UI/UX 회귀
- prototype 오염, 에러 억제
- 위험 패턴 검증 없이 적용

**해결 방안 (에이전트 정의 수정 제안)**:

**대상**: `.cursor/agents/system-improvement.md` - "2단계: 병목 지점 식별" 내 교훈 기반 에러 패턴 분석

**추가할 패턴**:
```markdown
- **Storybook 스토리 누락** (Feature, 새 `.svelte` 생성): qa.md 스토리 작성 트리거, main-orchestrator QA 품질 게이트 확인. Chrome API 의존 시 developer.md에 preview.ts mock 선제 추가 규칙 검토
```

**우선순위**: P2 (메타 학습 강화, 자동 개선 트리거 개선)

---

## 3. 이미 충분히 커버된 영역 (추가 제안 불필요)

| 영역 | 커버 상태 | 근거 |
|------|-----------|------|
| QA 스토리 작성 트리거 | ✅ | qa.md 378-389행 - Feature 시 새 .svelte → 스토리 확인/작성 |
| 품질 게이트 검증 | ✅ | main-orchestrator.mdc 972행 - QA 품질 게이트에 스토리 존재 확인 |
| chrome.storage 패턴 | ✅ | storybook-strategy.md 217-271행 - B. chrome.storage.sync 의존 가이드 |
| Planner 설계 문서 | ✅ | QA 트리거 + main 검증으로 충분. 설계에 스토리 명시는 선택 사항 |
| QA 완료 보고 | 선택 | 품질 게이트에서 체크하므로 보고 템플릿에 "Storybook 스토리" 항목 추가는 선택적 |

---

## 4. 에이전트 정의 파일 수정 제안 요약

**직접 수정하지 말 것** - 제안만 기록

| 파일 | 수정 유형 | 내용 |
|------|-----------|------|
| `.cursor/agents/developer.md` | 규칙 추가 | Chrome Extension API 의존 UI 구현 시 preview.ts mock 검토/추가 체크리스트 |
| `.cursor/agents/system-improvement.md` | 교훈 패턴 추가 | "Storybook 스토리 누락" 에러 패턴 → qa.md, developer.md 규칙 검토 트리거 |

---

## 5. 결론

- **핵심 커버리지**: qa.md 트리거, main-orchestrator 품질 게이트, storybook-strategy.md 패턴으로 스토리 누락 방지의 주된 흐름은 확보됨.
- **추가 개선**: Developer의 **선제적 mock 검토**와 System-Improvement의 **교훈 패턴 등록**으로 SectionSettings 유형의 인프라·규칙 갭을 추가로 줄일 수 있음.
