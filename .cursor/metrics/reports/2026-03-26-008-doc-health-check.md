# 문서 건강도 체크 보고서

**작업 일자**: 2026-03-26
**작업 유형**: Docs (분석 전용 — 코드 수정 없음)
**요청 내용**: 프로젝트 전반 문서 건강도 체크 및 누락·불일치 파악

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 분석 범위 | 루트 문서 3개 + 7개 패키지 + docs/ 폴더 (44+ 문서) |
| 서브에이전트 | explore x9 (루트 1 + 패키지 7 + docs 1) |
| 발견 이슈 | P0: 11건, P1: 17건, P2: 21건 |
| 핵심 원인 | React→Svelte 마이그레이션 + 패키지 리네이밍 후 문서 미갱신 |

---

## 2. 패키지별 문서 현황 표

| 패키지 | README | CHANGELOG | description | JSDoc | version 정합 | 등급 |
|--------|:------:|:---------:|:-----------:|:-----:|:----------:|:----:|
| **루트** | ⚠️ 구식 | ⚠️ 링크 깨짐 | — | — | — | D |
| cr-rag-mcp | ❌ 없음 | ✅ | ✅ | ~20% | ❌ 0.0.1 vs 0.0.2 | D |
| docs (VitePress) | ✅ 중 | ✅ | ⚠️ 불일치 | N/A | ❌ 0.1.0 vs 0.2.0 | D |
| ecount-dev-tool | ✅ 상 | ✅ | ✅ | ~69% | ❌ 삼중 불일치 | B |
| logseq-time-tracker | ❌ 없음 | ✅ | ✅ | ~0% | ✅ | D |
| mcp-server | ⚠️ 구식 | ✅ | ✅ | 0% | ❌ 0.1.0 vs 0.2.0 | C |
| time-tracker-core | ❌ 없음 | ✅ | ✅ | ~28% | ❌ 0.1.0 vs 0.2.0 | D |
| uikit | ⚠️ 구식 | ✅ | ✅ | ~5% | ❌ 0.1.0 vs 0.2.1 | C |
| **docs/ 폴더** | — | — | — | — | — | C |

**등급 기준**: A(양호) B(대체로 양호) C(부분 문제) D(심각한 갭)

---

## 3. P0 이슈 (치명 — 즉시 수정 필요)

### 3.1 루트 README 패키지 경로/스택 불일치

| # | 이슈 | 위치 |
|---|------|------|
| 1 | `packages/time-tracker` 경로 참조 → 실제 `logseq-time-tracker` | `README.md` |
| 2 | 패키지 목록 5개만 나열 → 실제 7개 (`cr-rag-mcp`, `time-tracker-core` 누락) | `README.md` |
| 3 | "React 19 + TypeScript" 스택 서술 → 실제 Svelte 5 | `README.md` |

### 3.2 루트 CHANGELOG 깨진 링크

| # | 이슈 | 위치 |
|---|------|------|
| 4 | `./packages/time-tracker/CHANGELOG.md` 링크 → 해당 경로 없음 | `CHANGELOG.md` |

### 3.3 VitePress 사이트 랜딩 페이지

| # | 이슈 | 위치 |
|---|------|------|
| 5 | `index.md` 히어로가 "React 기반 Logseq 플러그인" → 실제 Svelte 5 + 모노레포 | `packages/docs/index.md` |

### 3.4 패키지 코드-문서 불일치

| # | 이슈 | 위치 |
|---|------|------|
| 6 | ecount-dev-tool 버전 삼중 불일치 (pkg 1.0.0 / manifest 2.2.1 / README v2.4.0 / CL 2.3.0) | `packages/ecount-dev-tool` |
| 7 | uikit README의 DnD API (`Zone/Row/Handle`) → 실제 `Provider/Sortable`만 | `packages/uikit/README.md` |
| 8 | uikit README의 CheckboxList 예제 → 현재 API(`onreorder` + snippet)와 불일치 | `packages/uikit/README.md` |
| 9 | uikit README "Export 구조" 스니펫 → `src/index.ts`와 불일치 | `packages/uikit/README.md` |

### 3.5 docs/ 폴더

| # | 이슈 | 위치 |
|---|------|------|
| 10 | `docs/phase-plans/time-tracker/00-overview.md`가 `docs/design/` 참조 → 해당 경로 없음 | `docs/phase-plans/` |
| 11 | `docs/time-tracker/` project-structure가 `main.tsx/App.tsx`(React) 기준 → 실제 Svelte | `packages/docs/guide/` |

---

## 4. P1 이슈 (중요 — 빠른 시일 내 수정 권장)

| # | 이슈 | 위치 |
|---|------|------|
| 1 | 루트 README 구조 다이어그램 구식 | `README.md` |
| 2 | 루트 CHANGELOG에 `time-tracker-core`, `cr-rag-mcp` CHANGELOG 링크 누락 | `CHANGELOG.md` |
| 3 | cr-rag-mcp README 부재 (환경변수, MCP 등록 방법 무문서) | `packages/cr-rag-mcp` |
| 4 | cr-rag-mcp `package.json` version(0.0.1) vs CHANGELOG(0.0.2) | `packages/cr-rag-mcp` |
| 5 | cr-rag-mcp MCP 인터페이스 설계문서 vs 실제 도구 3개만 | `docs/cr-rag-mcp/05-mcp-interface.md` |
| 6 | docs 패키지 version(0.1.0) vs CHANGELOG(0.2.0) | `packages/docs` |
| 7 | docs 패키지 DnD 설명이 `svelte-dnd-action` → 실제 `@dnd-kit/*` | `packages/docs/api/components.md` |
| 8 | docs 패키지 Introduction 패키지명 `@personal/time-tracker` → 존재하지 않음 | `packages/docs/guide/index.md` |
| 9 | docs 패키지 UIKit API 문서 범위 불완전 (6+ 컴포넌트 미기재) | `packages/docs/api/components.md` |
| 10 | ecount-dev-tool README 테스트 개수 구식 (31→70 등) | `packages/ecount-dev-tool/README.md` |
| 11 | ecount-dev-tool `backup_service` Public API JSDoc 없음 | `packages/ecount-dev-tool/src` |
| 12 | logseq-time-tracker README 부재 | `packages/logseq-time-tracker` |
| 13 | mcp-server README 도구 목록 미반영 (사이클 6개 도구 누락) | `packages/mcp-server/README.md` |
| 14 | mcp-server README 디렉터리 구조 구식 | `packages/mcp-server/README.md` |
| 15 | mcp-server version(0.1.0) vs CHANGELOG(0.2.0) | `packages/mcp-server` |
| 16 | time-tracker-core README 부재 | `packages/time-tracker-core` |
| 17 | time-tracker-core version(0.1.0) vs CHANGELOG(0.2.0) | `packages/time-tracker-core` |

---

## 5. P2 이슈 (개선 권고)

| # | 이슈 | 위치 |
|---|------|------|
| 1 | 루트 README MCP SDK 버전 불일치 (1.25 vs ^1.27.1) | `README.md` |
| 2 | 루트 README `pnpm install --no-offline` 미안내 | `README.md` |
| 3 | cr-rag-mcp `exports` 미설정 | `packages/cr-rag-mcp/package.json` |
| 4 | cr-rag-mcp 런타임 버전 하드코딩 (`version: '0.0.1'`) | `packages/cr-rag-mcp/src` |
| 5 | cr-rag-mcp 환경변수 문서 위치 분산 | `packages/cr-rag-mcp` |
| 6 | docs 패키지 README "문서 구조" 트리에 storybook.md 누락 | `packages/docs/README.md` |
| 7 | docs 패키지 README "최종 업데이트 2026-02-06" 구식 | `packages/docs/README.md` |
| 8 | docs 패키지 description vs README 브랜딩 불일치 | `packages/docs` |
| 9 | ecount-dev-tool 타입 스니펫 차이 (`zeus_number?` vs 필수) | `packages/ecount-dev-tool/README.md` |
| 10 | ecount-dev-tool CHANGELOG Unreleased 섹션 중복 | `packages/ecount-dev-tool/CHANGELOG.md` |
| 11 | mcp-server workspace 경로 동작 미문서화 | `packages/mcp-server` |
| 12 | mcp-server "도구 추가" 안내와 실제 패턴 불일치 | `packages/mcp-server/README.md` |
| 13 | mcp-server Public API TSDoc 0% | `packages/mcp-server/src` |
| 14 | time-tracker-core 상위 설계문서와 의존성 불일치 | `docs/time-tracker/00-overview.md` |
| 15 | time-tracker-core Svelte 컴포넌트 `@component` 거의 없음 | `packages/time-tracker-core/src` |
| 16 | uikit version(0.1.0) vs CHANGELOG(0.2.1) | `packages/uikit` |
| 17 | uikit CHANGELOG Unreleased 섹션 중복 | `packages/uikit/CHANGELOG.md` |
| 18 | uikit 엔트리/배럴 TSDoc 없음 | `packages/uikit/src/index.ts` |
| 19 | uikit Storybook 미커버 4개 (DatePicker, TimeRangePicker, PromptDialog, ElapsedTimer) | `packages/uikit/src` |
| 20 | docs/ phase-plans 완료 상태 단일 소스 없음 | `docs/phase-plans/` |
| 21 | docs/ 아카이브 패턴 없음 (구식 문서 격리 없이 혼재) | `docs/` |

---

## 6. 공통 패턴 분석

### 6.1 `package.json` version vs CHANGELOG 불일치 (6/7 패키지)

| 패키지 | package.json | CHANGELOG 최신 |
|--------|:----------:|:------------:|
| cr-rag-mcp | 0.0.1 | 0.0.2 |
| docs | 0.1.0 | 0.2.0 |
| ecount-dev-tool | 1.0.0 | 2.3.0 |
| mcp-server | 0.1.0 | 0.2.0 |
| time-tracker-core | 0.1.0 | 0.2.0 |
| uikit | 0.1.0 | 0.2.1 |

**근본 원인**: 릴리스 시 `package.json` version bump 누락. 자동화(changeset 등) 미적용.

### 6.2 README 부재 패키지 (3/7)

- `cr-rag-mcp`, `logseq-time-tracker`, `time-tracker-core`
- 공통점: 비교적 최근 신규 또는 분리된 패키지

### 6.3 React→Svelte 마이그레이션 잔여

- 루트 README, VitePress 랜딩, docs/guide/project-structure 모두 여전히 React 언급
- `packages/time-tracker` → `logseq-time-tracker` 리네이밍이 문서에 미반영

### 6.4 JSDoc 커버리지 저조

| 패키지 | JSDoc 커버리지 |
|--------|:----------:|
| uikit | ~5% |
| mcp-server | 0% |
| cr-rag-mcp | ~20% |
| time-tracker-core | ~28% |
| ecount-dev-tool | ~69% |

---

## 7. 개선 우선순위 권장

### 즉시 (P0 — 1~2일)

1. **루트 README 전면 갱신**: 패키지 목록 7개, 경로 수정, Svelte 5 스택 반영, 구조 다이어그램 최신화
2. **루트 CHANGELOG 링크 수정**: `time-tracker` → `logseq-time-tracker`, 누락 패키지 추가
3. **VitePress 랜딩 페이지 갱신**: React→Svelte, 패키지명 정정
4. **uikit README DnD/CheckboxList/Export 섹션 재작성**: 현재 API에 맞춤
5. **ecount-dev-tool 버전 정합**: manifest / package.json / README / CHANGELOG 통일

### 단기 (P1 — 1주)

6. **README 없는 3개 패키지에 최소 README 추가**: cr-rag-mcp, logseq-time-tracker, time-tracker-core
7. **전 패키지 `package.json` version bump**: CHANGELOG과 일치시키기
8. **mcp-server README 도구 목록 갱신**: 사이클 도구 6개 반영
9. **docs 패키지 API 문서 보강**: 누락 컴포넌트, DnD 라이브러리 정정

### 중기 (P2 — 2~4주)

10. **JSDoc 커버리지 개선**: Public API 우선, 목표 60%+
11. **docs/ 아카이브 정책 도입**: `docs/archive/` 패턴 또는 상태 뱃지
12. **phase-plans 전체 로드맵 단일 소스 작성**: 완료/진행/보류 표
13. **Storybook 미커버 컴포넌트 stories 추가** (4개)

---

## 8. 참고

- 플랜 파일: `문서_건강도_체크_738152ac.plan.md`
- 분석 방법: explore 서브에이전트 9개 (루트 1 + 패키지 7 + docs/ 1) 병렬 실행
- 코드 변경: 없음 (분석 전용)
