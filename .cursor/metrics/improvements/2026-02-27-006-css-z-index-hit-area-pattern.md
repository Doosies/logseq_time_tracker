# CSS z-index와 클릭 영역 확장 패턴 분석

**분석 일시**: 2026-02-27  
**분석 대상**: QuickLoginSection `.remove-btn` hover 히트 영역 불일치 버그  
**우선순위**: P2 (문서화, 규칙 수정 불필요)

---

## 1. 버그 요약

| 항목 | 내용 |
|------|------|
| **증상** | hover 시 예상 영역과 실제 클릭 가능 영역 불일치 |
| **수정** | `.remove-btn` z-index: `var(--z-index-base)` → `var(--z-index-above)` |
| **원인** | 이전 커밋(1b9daab)에서 `::after` 가상 요소로 클릭 영역 확장 시, 기존 `[data-drag-handle]`의 z-index 고려 누락 |

---

## 2. 도출된 패턴/교훈

### 패턴: 클릭 영역 확장 시 stacking context 고려

**상황**:
- `.remove-btn`에 `::after` (44×44px)로 hit area 확장
- `[data-drag-handle]`가 `position: absolute; inset: 0` + `z-index: var(--z-index-above)`로 셀 전체 오버레이
- `.remove-btn`이 `z-index: var(--z-index-base)` → 확장된 `::after` 영역이 drag handle에 가려져 클릭 불가

**교훈**:
- 가상 요소(`::before`, `::after`)로 클릭/호버 영역을 확장할 때, **같은 컨테이너 내 다른 interactive 요소의 z-index**를 확인해야 함
- `position: absolute` + `inset: 0` 등으로 영역을 덮는 형제 요소가 있으면 stacking order 충돌 가능

**체크리스트 (수동 적용)**:
1. 변경 대상 요소와 동일/겹치는 영역을 사용하는 형제 요소 검색
2. 해당 요소들의 `z-index`, `position` 확인
3. 클릭/호버 우선순위가 필요한 요소는 더 높은 z-index 부여

---

## 3. 에이전트 규칙 개선 여부

### 판단: **즉시 에이전트 규칙 수정 불필요**

| 근거 | 설명 |
|------|------|
| **단일 발생** | 이번 한 건의 버그에서 도출된 패턴으로, 반복 발생 데이터 없음 |
| **도메인 특화** | CSS stacking context, DnD + 버튼 배치 조합 등 특수 상황 |
| **과도한 규칙 부담** | 모든 CSS 수정 시 z-index 검토를 의무화하면 오버헤드 큼 |
| **실용적 판단** | 패턴 문서화로 충분. 유사 버그 2~3회 재발 시 developer.md/Skill 추가 검토 |

---

## 4. 향후 조치

- **즉시**: 무조치 (규칙/ Skill 변경 없음)
- **재발 시**: 2~3회 이상 동일 유형(z-index + hit area 확장) 발생하면
  - `developer.md` 또는 `developer/css-patterns.md` Skill에 "클릭 영역 확장 시 stacking context 검토" 체크리스트 추가 검토
- **AGENTS.md 교훈 테이블**: 단일 사례이므로 추가하지 않음

---

## 5. system-improvement 에이전트 매핑

| 발견 패턴 | 기존 교훈 기반 매핑 | 비고 |
|-----------|---------------------|------|
| z-index + pseudo-element hit area | (신규, 도메인 특화) | CSS 레이아웃 특수 케이스, P2 문서화 |

---

## 6. 참고

- **버그 수정 파일**: `packages/ecount-dev-tool/src/components/QuickLoginSection/QuickLoginSection.svelte`
- **관련 요소**: `.remove-btn`, `[data-drag-handle]`, `--z-index-base`, `--z-index-above`
- **유사 리포트**: `2026-02-27-bugfix-pattern-analysis-and-agent-rules.md` 패턴 3(chrome.storage)과 동일한 "문서화만, 규칙 수정 보류" 처리
