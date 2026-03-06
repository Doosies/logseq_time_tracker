# 커밋 히스토리 및 시스템 구조 분석 리포트

## 개요

- **분석 범위**: 106개 커밋 (627c4bc ~ 9c11930, 2026-01-28 ~ 2026-02-27)
- **분석 대상**: 에이전트/스킬/룰 시스템, 프로젝트 구조, 커밋 패턴

---

## 커밋 패턴 분석

### 패턴 1: 기능 추가 후 즉시 삭제 (Write-then-Delete)

| 항목 | 내용 |
|------|------|
| 섹션 접기 기능 | a10f12b에서 추가 → a8b7548에서 전체 삭제 |
| ecount-dev-tool 초기화 | 81f0c65에서 추가 → a2fe11a에서 전체 삭제 후 88db36d에서 재작성 |
| **원인** | 구현 전 설계 부재 |
| **권장** | planner 에이전트에 UI/UX 동작 명세 필수화 |

### 패턴 2: 동일 파일 반복 수정 (Flip-Flopping)

| 사례 | 커밋 흐름 |
|------|-----------|
| DnD hover 스타일 | 4개 연속 커밋 (d5534a8 → 9a4ecd7 → 567b0af → 3bbf52c) 왕복 |
| remove 버튼 히트 영역 | 3개 커밋 (1b9daab → 3323989 → 0601d6d) |

| 항목 | 내용 |
|------|------|
| **원인** | 동작 명세 없이 결과 보면서 조정 |
| **권장** | 동일 파일 3회 이상 수정 시 squash 제안 규칙 |

### 패턴 3: 포매팅 별도 커밋 (4건)

- 25d3512, 782f920, e47c591, afdb79e

| 항목 | 내용 |
|------|------|
| **원인** | 코드 변경 시 자동 포매팅 미실행 |
| **권장** | developer 에이전트에 커밋 전 format 검증 필수 |

### 패턴 4: 스킬 디렉토리 마이그레이션 왕복

| 커밋 | 변경 내용 |
|------|-----------|
| d2620f9 | `.cursor/skills/` → `.agents/skills/` (92 파일) |
| dafda1f | `.agents/skills/` → `.cursor/skills/` (88 파일) |

- **총 영향**: 180개 파일 변경 상쇄
- **권장**: 디렉토리 구조 변경 전 영향도 분석 필수

### 패턴 5: plan-execution.md 7연속 수정

- **범위**: dcd1e97 ~ 9e7f392 (7개 커밋)
- **특징**: 동일 파일 수정, 각 커밋당 1~4줄 변경
- **권장**: 문서 수정은 충분히 검토 후 단일 커밋

### 패턴 6: 대규모 단일 커밋

| 커밋 | 규모 | 비고 |
|------|------|------|
| e12732b (init) | 128 파일, +52,744줄 | VitePress cache 포함 |
| 460708f | 37 파일, +17,018줄 | metrics Phase 1–4 + git-workflow |

---

## 시스템 구조 이슈

### P0: 즉시 수정

| 번호 | 이슈 |
|------|------|
| 1 | mcp-server ESLint import 경로 오류 (.js → .ts) |
| 2 | Git tracked 빌드 아티팩트 10개 (.turbo 로그 1개 + VitePress cache 9개) |

### P1: 시스템 구조 개선

| 번호 | 이슈 |
|------|------|
| 3 | main-orchestrator.mdc 비대화 (~350줄 메트릭 의사코드, 사이클 파일 0개) |
| 4 | 고아 orchestrator 스킬 (SKILL.md + 10개 reference, 어디서도 미참조) |
| 5 | AGENTS.md와 main-orchestrator.mdc 중복 (워크플로우, 품질 게이트, 태스크 분류) |

### P2: 설정/문서 정합성

| 번호 | 이슈 |
|------|------|
| 6 | plan-execution.md 내 explore 에이전트 참조 (에이전트 정의 없음) |
| 7 | .gitignore 누락 (.cursor/temp/, .vitepress/cache/) |
| 8 | 불필요 design doc 2개 (EC-SERVER-MANAGER-ACTIONBAR-UI-REDESIGN.md, SECTION-VISIBILITY-FEATURE.md) |
| 9 | Docs 패키지 Storybook 참조 불일치 (@storybook/svelte vs @storybook/svelte-vite) |
| 10 | 커밋 패턴 기반 에이전트 규칙 개선 필요 |

---

## 개선 파일 네이밍 규칙 변경

| 구분 | 형식 |
|------|------|
| **이전** | `YYYY-MM-DD-description.md` |
| **이후** | `YYYY-MM-DD-NNN-description.md` (NNN: 날짜별 3자리 시퀀스) |
| **이유** | 동일 날짜에 여러 리포트 생성 시 순서 보장 |

---

## 조치 계획

| 우선순위 | 조치 |
|----------|------|
| **P0** | 즉시 수정: ESLint import 경로 수정, tracked 아티팩트 제거 |
| **P1** | main-orchestrator.mdc 슬림화, orchestrator 스킬 정리, AGENTS.md 중복 제거 |
| **P2** | .gitignore 보완, plan-execution 수정, docs 참조 정리, 에이전트 규칙 개선 |

---

## 참고

- 비표준 커밋 메시지 5건은 히스토리 보존 (재작성 없음)
- `packages/ecount-dev-tool/src/old/`: 의도적 보존 (ESLint ignores)
- `time-tracker`: React 프로젝트, Svelte 공유 설정 대상 아님
