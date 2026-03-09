# ScriptList 수정/삭제 버튼 아이콘 SVG 교체 작업 사이클 분석

**분석 일시**: 2026-03-09  
**분석 대상**: ScriptList.svelte 수정/삭제 버튼 이모지 → SVG 교체 (Chore, UI 개선)  
**설계 문서**: `.cursor/docs/script-list-edit-icon-improvement.md`  
**참조 패턴**: 2026-03-06-002 (ToggleInput 유니코드→SVG), 2026-03-09-005 (UI/UX 개선)

---

## 분석 결과

| 항목 | 평가 | 개선 제안 |
|------|:----:|-----------|
| **워크플로우 효율성** | 양호 | Chore 규모에 planner 단계는 과한 경우 있음. 단순 SVG 교체는 planner 없이 developer만으로 가능. |
| **설계 문서 품질** | 우수 | FR/NFR, 구현 가이드, TODO, 결정사항·이슈 표 구조화. 유사 Chore에 재사용 가능. |
| **에이전트 전달** | 양호 | 설계 문서의 개발자 체크리스트가 developer 작업 범위를 명확히 정의. |
| **품질 게이트** | 양호 | Linter 0, type-check, test, Storybook 모두 통과. |
| **병렬 실행 기회** | 제한적 | impl-edit → impl-delete → qa 직렬 구조. edit/delete가 동일 파일이라 병렬화 어려움. |
| **사이클 메트릭** | 부족 | 전용 cycle JSON 미확인. 메트릭 수집 시 cycle_id, duration, agents 기록 권장. |

---

## 발견된 패턴

| 패턴 | 빈도 | 영향 |
|------|:----:|------|
| **이모지/유니코드 → SVG 교체** | 2회+ | 2026-03-06-002(Toggle ⇄), ScriptList ✏/🗑. 플랫폼별 렌더링 차이·폰트 의존성 해결. |
| **인라인 SVG + fill/stroke="currentColor"** | 반복 | SectionSettings, Toggle, ScriptList 공통. 프로젝트 관례로 문서화됨. |
| **planner 설계 문서 선행** | 선택 | 단순 UI 변경은 설계서 생략 가능. SVG 선택·일관성 검토가 필요할 때 planner 유용. |
| **Chore에 Security 생략** | 적절 | UI 아이콘 교체는 보안 리스크 낮음. main-orchestrator Chore 워크플로우와 일치. |
| **삭제 버튼까지 동일 작업 범위** | 권장 | 설계에서 삭제 SVG를 "권장"으로 두고 범위 최소화 대안도 제시. 실구현에서 둘 다 적용. |

---

## 개선 권고사항

| 대상 | 현재 문제 | 개선 방안 |
|------|----------|-----------|
| **Chore 워크플로우** | planner → dev → qa → docs → git 모두 사용 시 소규모 Chore에 오버헤드 | 단순 SVG 교체: developer → qa(검증) → git-workflow. 복잡도 높을 때만 planner 도입. |
| **developer Skill** | 이모지→SVG 패턴이 skill에 명시되지 않음 | `developer/references/svelte-conventions.md` 또는 `icon-patterns.md`에 "버튼 아이콘: 인라인 SVG, fill/stroke=currentColor, 14~16px" 체크리스트 추가. |
| **사이클 메트릭** | ScriptList 아이콘 교체 전용 cycle 미기록 | Chore도 최소 cycle_id, task_type, started_at, completed_at, success, files_changed 기록. |
| **설계 문서 재사용** | script-list-edit-icon 문서가 한 작업에 국한 | 유사 "이모지→SVG" Chore 시 템플릿으로 활용. 아이콘 스펙(크기, fill/stroke) 표준화. |
| **에이전트 규칙** | planner 호출 기준이 Chore에模糊 | "Chore 중 설계 결정(옵션 비교, 프로젝트 일관성) 필요 시에만 planner 호출" 규칙 명시. |

---

## 워크플로우 세부 분석

### 단계별 소요 시간 (추정)

| 단계 | 예상 | 근거 |
|------|------|------|
| planner | ~15분 | 설계 문서 작성. 요구사항·옵션 비교·구현 가이드. |
| developer | ~20분 | ScriptList.svelte 수정 2处 (edit, delete SVG). 체크리스트 기반 작업. |
| qa | ~10분 | format → test → lint → type-check → build. 회귀 없음. |
| docs | ~5분 | CHANGELOG 또는 변경 이력 최소 반영. |
| git-workflow | ~5분 | Conventional Commits 커밋 1개. |
| **총합** | **~55분** | 2026-03-06-002 (~25분)보다 길게 예상. planner·docs 단계 추가분. |

### 병렬 실행 기회

- edit/delete SVG는 **동일 파일**이므로 병렬 구현 불가.
- qa와 docs는 구현 완료 후 각각 독립 실행 가능 → **qa || docs** 병렬화 가능.
- planner → developer는 설계 의존이므로 직렬 유지.

### 불필요하거나 생략 가능한 단계

- **planner**: 단순 SVG 교체만이라면 developer가 SectionSettings/Toggle 패턴을 참고해 직접 적용 가능. 설계 문서가 "옵션 A/B 비교, 프로젝트 일관성" 등을 다룰 때 planner 가치 있음.
- **Security**: Chore, UI 변경만으로 보안 리스크 거의 없음. 생략 적절.

---

## 품질 메트릭 (최종 상태 기준)

| 지표 | 결과 | 비고 |
|------|------|------|
| Linter 오류 | 0개 | ReadLints 기준 |
| type-check | 통과 | 워크스페이스 전체 |
| 테스트 | 통과 | ScriptList.stories 등 포함 |
| Storybook | 정상 | Default, WithMultipleScripts, Empty 스토리 |
| 접근성 | 준수 | aria-label, aria-hidden="true" 유지 |
| 디자인 토큰 | 준수 | fill="currentColor", 14×14 |

---

## 에이전트 협업 평가

### planner → developer 전달 품질

- **우수**: 설계 문서에 구현 가이드, SVG path 예시, 개발자 체크리스트 포함.
- **결정 이전력**: fill vs stroke, 크기 14 vs 16, 삭제 버튼 포함 여부가 문서에 명시됨.
- **선행 조건**: impl-delete는 impl-edit 선행. 문서의 TODO 순서가 이를 반영.

### developer → qa 품질 게이트

- **우수**: 변경 범위가 ScriptList.svelte 한 파일로 제한되어 검증 부담 적음.
- **재작업**: 설계 준수 시 재작업 거의 없음. 2026-03-06-002는 QA에서 calculator 테스트 미갱신 수정 있었으나, 이번 작업은 해당 없음.

### docs, git-workflow

- CHANGELOG 및 커밋 메시지가 Conventional Commits 형식을 따르면 충분.
- 커밋 subject 한글 작성 여부 확인.

---

## 결론 및 권고

| 구분 | 판단 |
|------|------|
| **워크플로우 적합성** | planner 포함 풀 워크플로우는 설계 복잡도가 있을 때 적합. 단순 교체만이라면 planner 생략 가능. |
| **설계 문서** | 재사용 가능한 품질. 유사 Chore의 템플릿으로 활용 권장. |
| **규칙/Skill 개선** | developer Skill에 "아이콘 버튼: 인라인 SVG, currentColor" 패턴 추가 권장 (P2). |
| **메트릭 수집** | Chore도 최소 cycle JSON 기록으로 추후 분석·패턴 발견에 활용 권장. |

---

## 참고

- 설계 문서: `.cursor/docs/script-list-edit-icon-improvement.md`
- 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
- 유사 패턴: `.cursor/metrics/improvements/2026-03-06-002-toggleinput-flex-unicode-button-pattern.md`
- 현재 구현: `packages/ecount-dev-tool/src/components/UserScriptSection/ScriptList.svelte` (81–104줄)
