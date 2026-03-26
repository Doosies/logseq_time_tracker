# 작업 완료 보고서: Toolbar 드롭다운 모드 개선

- **사이클**: 2026-03-25-009
- **태스크 유형**: Refactor
- **커밋**: `9244452` — `refactor(time-tracker): 드롭다운·풀뷰 분리 및 iframe 인라인 스타일 전환`

---

## 변경 사항

| 파일 | 변경 내용 |
|------|-----------|
| `Toolbar.svelte` | `inline` prop 추가, `{#snippet}` 으로 콘텐츠 중복 제거, inline 시 트리거/이벤트 리스너 스킵 |
| `App.svelte` | Toolbar 모드: `dropdown-shell`로 배경 없이 직접 렌더, FullView 모드: shell+backdrop+panel 유지, `setMainUIInlineStyle` 호출 |
| `main.ts` | `togglePluginUI()`에서 드롭다운 스타일 적용 후 `toggleMainUI()` |
| `e2e/test-app.ts` | logseq stub에 `setMainUIInlineStyle` 추가 |

## UX 개선

- **이전**: 툴바 아이콘 → iframe 열기 → 드롭다운 토글 → 풀뷰 (3클릭)
- **이후**: 툴바 아이콘 → 드롭다운(iframe) 바로 열기 → 풀뷰 (2클릭)

## 품질 지표

| 항목 | 결과 |
|------|------|
| ReadLints | 0개 (기존 TimerDisplay 1건 제외) |
| format | 통과 |
| test | 통과 |
| lint | 통과 |
| type-check | 통과 |
| build | 통과 |
| 보안 | 통과 (Critical/High 0) |

## 알려진 제한사항

1. `main.ts`의 Escape 키 핸들러는 `hideMainUI()`만 호출 — Svelte `show_full_view` 상태와 미동기화 (minor)
2. 슬래시 커맨드 경로에 `setMainUIInlineStyle` 미적용 (minor)
