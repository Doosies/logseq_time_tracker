# CSS layout width와 clickOutside 히트 영역 불일치 패턴

**분석 일시**: 2026-02-27  
**분석 대상**: SectionSettings Popover `clickOutside` 미동작 버그  
**우선순위**: P2 (문서화, 규칙 수정 불필요)

---

## 1. 버그 요약

| 항목 | 내용 |
|------|------|
| **증상** | Popover가 열린 후 App 영역을 클릭해도 닫히지 않음 |
| **수정** | `.settings-root`에 `margin-left: auto; width: fit-content;` 추가 |
| **원인** | 부모의 `width: 100%`로 `.settings-root`가 전체 너비를 차지 → DOM 히트 영역이 시각적 콘텐츠보다 넓음 → `clickOutside`가 빈 공간을 Popover 내부로 인식 |

---

## 2. 패턴: layout width에 의한 히트 영역 확장

### 기존 패턴과의 차이

| 구분 | `2026-02-27-css-z-index-hit-area-pattern.md` | 이번 패턴 |
|------|----------------------------------------------|------------|
| **원인** | z-index + pseudo-element로 hit area 확장 | 부모 `width: 100%` 상속으로 컨테이너가 전체 너비 확보 |
| **영향** | 확장된 영역이 형제에 가려져 클릭 불가 | 확장된 영역이 clickOutside 기준으로 "내부"로 인식 |
| **핵심** | stacking context (누가 위에 있는가) | containment (DOM 경계가 어디까지인가) |

### 도출된 교훈

**상황**:
- Popover/Dropdown 등 "바깥 클릭 시 닫기" 동작을 쓰는 컴포넌트
- `clickOutside` 액션은 보통 `node.contains(clickTarget)`으로 "내부/외부" 판정
- 시각적으로는 좁은 콘텐츠만 보이지만, 부모의 `width: 100%` 등으로 컨테이너가 전체 너비를 차지
- 결과: 사용자가 "바깥"이라고 인지하는 빈 영역 클릭이 DOM 기준으로는 "내부" → dismiss 안 됨

**교훈**:
- `clickOutside` / `dismiss` 로직을 가진 컴포넌트에서, **해당 노드의 layout width**가 시각적 콘텐츠 범위를 넘지 않도록 해야 함
- `width: 100%` 상속 등으로 컨테이너가 부모 전체 너비를 차지할 때 → `width: fit-content` 등으로 시각적 경계와 DOM 경계를 맞추는 것이 안전
- "내부/외부" 판정에 쓰이는 최상위 노드의 실제 클릭 가능 영역과 시각적 경계를 일치시키는 것이 중요

**체크리스트 (수동 적용)**:
1. Popover/Dropdown/Modal 등 `clickOutside` 사용 시, 트리거/콘텐츠를 감싸는 루트 노드 확인
2. 해당 노드의 `width`가 부모로부터 상속되어 시각적 콘텐츠보다 넓게 퍼지지 않는지 확인
3. 필요 시 `width: fit-content`, `align-self: flex-start` 등으로 경계 제한

---

## 3. 에이전트 규칙 개선 여부

### 판단: **즉시 에이전트 규칙 수정 불필요**

| 근거 | 설명 |
|------|------|
| **단일 발생** | 이번 한 건의 버그에서 도출된 패턴으로, 반복 발생 데이터 없음 |
| **도메인 특화** | Popover/Dropdown + layout width 조합 등 특수 상황 |
| **과도한 규칙 부담** | 모든 Popover 추가 시 width 검토를 의무화하면 오버헤드 큼 |
| **실용적 판단** | 패턴 문서화로 충분. 유사 버그 2~3회 재발 시 developer.md/Skill 추가 검토 |

---

## 4. 향후 조치

- **즉시**: 무조치 (규칙/ Skill 변경 없음)
- **재발 시**: 2~3회 이상 동일 유형(width + clickOutside) 발생하면
  - `developer.md` 또는 `developer/css-patterns.md` Skill에 "clickOutside 사용 시 layout width 검토" 체크리스트 추가 검토
- **AGENTS.md 교훈 테이블**: 단일 사례이므로 추가하지 않음

---

## 5. system-improvement 에이전트 매핑

| 발견 패턴 | 기존 교훈 기반 매핑 | 비고 |
|-----------|---------------------|------|
| layout width + clickOutside containment | (신규, 도메인 특화) | 2026-02-27-css-z-index-hit-area-pattern과 "히트 영역 불일치" 패턴군으로 분류 가능 |

---

## 6. 참고

- **버그 수정 대상**: `.settings-root` (SectionSettings Popover 관련)
- **관련 개념**: `clickOutside` (Svelte use:action 등), `node.contains()`, layout width 상속
- **유사 리포트**: `2026-02-27-css-z-index-hit-area-pattern.md` — 동일 "문서화만, 규칙 수정 보류" 처리, 단 원인(z-index vs width) 상이
