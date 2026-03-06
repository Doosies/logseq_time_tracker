# Bugfix 작업 분석 - ecount-dev-tool 스토리지 batch mode

**분석 일시**: 2026-02-27  
**태스크 유형**: Bugfix  
**대상 패키지**: ecount-dev-tool

---

## 1. 작업 요약

| 항목 | 내용 |
|------|------|
| 수정 대상 | Chrome 확장 편집 모드에서 팝업 닫힘 시 미저장 변경사항이 스토리지에 남는 버그 |
| 구현 방식 | `accounts.svelte.ts`에 batch mode 도입, `QuickLoginSection.svelte`에서 batch 함수 연동 |
| 추가 변경 | 계정 편집 폼 버튼 순서 "수정 → 취소" → "취소 → 수정" |
| 문서화 | CHANGELOG 업데이트 |

---

## 2. 패턴/이슈 분석

### 2.1 chrome.storage 라이프사이클 패턴 재발 (2회째)

**발견**: 이번 작업은 [2026-02-27-bugfix-pattern-analysis-and-agent-rules.md](./2026-02-27-bugfix-pattern-analysis-and-agent-rules.md)의 **패턴 3 (chrome.storage 영구 상태 관리)** 와 동일한 도메인입니다.

| 회차 | 파일 | 문제 | 해결 |
|------|------|------|------|
| 1회 | `active_account.svelte.ts` | UI 상태가 의도와 다르게 영구 보존 | (당시 분석) |
| 2회 | `accounts.svelte.ts` | 편집 중 팝업 닫힘 시 미저장 변경이 스토리지 유지 | batch mode 도입 |

**공통 점**: `chrome.storage.sync` 등 영구 저장소에 쓰는 **시점**과 **취소/폐기 시점**을 설계 단계에서 명확히 하지 않으면 버그 발생.

**이번 수정 패턴 (batch mode)**:
- 편집 모드 진입 시 `batch_mode = true` → `saveToStorage` 호출 시 스토리지에 쓰지 않음
- "저장" 버튼 클릭 시에만 `batch_mode` 해제 후 저장
- "취소" 또는 팝업 닫힘 시 batch_mode만 해제, 미저장 데이터 폐기

### 2.2 기타 이슈

- **버튼 순서 변경**: UX 관례(취소 → 수정)에 따른 변경. 에이전트 규칙으로 삼기엔 범위가 좁음.
- **워크플로우**: Bugfix 표준 흐름(Developer → QA → Docs → Git-Workflow)대로 진행. 특이사항 없음.

---

## 3. 에이전트 규칙 개선 필요성

### 3.1 판단: **개선 불필요** (즉시 에이전트 파일 수정 없음)

**사유**:
1. **단순 Bugfix**: 수정 범위가 ecount-dev-tool 내부로 한정되어 있으며, 기존 에이전트 규칙으로 처리 가능.
2. **도메인 특화**: chrome.storage 라이프사이클은 Chrome 확장 특화 패턴. 2회 재발이지만, 에이전트 전역 규칙으로 올리기에 아직 근거가 약함.
3. **기존 P1 제안 유지**: 기존 리포트의 "Planner: 브라우저 확장 설계 시 상태 저장소 라이프사이클 체크리스트 (선택)" 제안을 그대로 유지.
4. **재발 임계값 미도달**: 3회째 동일 패턴이 발생하면 Skill/규칙 추가를 강하게 권장하는 수준으로 판단.

### 3.2 향후 권장 사항

- **3회째 chrome.storage 관련 버그** 발생 시:
  - `planner/browser-extension-patterns.md` 또는 `developer/storage-lifecycle.md` Skill 추가 검토
  - Planner 설계 체크리스트에 "상태 저장소 라이프사이클 (저장/취소 시점)" 항목 추가 검토

---

## 4. 워크플로우 개선

**판단**: **개선 불필요**

- plan-execution 워크플로우가 Bugfix 태스크에 적절히 적용됨
- 품질 게이트·검증 절차·에이전트 호출 순서에서 이슈 없음

---

## 5. 결론

| 항목 | 판단 |
|------|------|
| 에이전트 규칙 개선 | **불필요** (즉시 수정 없음) |
| 워크플로우 개선 | **불필요** |
| 문서화 | chrome.storage 패턴 2회 재발 사례 기록 (이 리포트) |
| 추후 조치 | 3회 재발 시 Skill/규칙 추가 검토 |

---

## 6. 참고

- 기존 분석: [2026-02-27-bugfix-pattern-analysis-and-agent-rules.md](./2026-02-27-bugfix-pattern-analysis-and-agent-rules.md) 패턴 3
- 관련 코드: `packages/ecount-dev-tool/src/stores/accounts.svelte.ts` (batch_mode)
