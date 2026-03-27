# 작업 완료 보고서

**작업 일자**: 2026-03-27
**작업 ID**: 2026-03-27-017
**요청 내용**: 모달 열 때 오른쪽 스크롤바 제거 + 스크린샷 테스트 포함

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 작업 유형 | Bugfix |
| 소요 시간 | ~14분 |
| 주요 변경 영역 | `@personal/logseq-time-tracker` |
| 커밋 수 | 1개 |

---

## 2. 배경 및 맥락

| 항목 | 내용 |
|------|------|
| 사용자 요청 배경 | 이전 사이클(015)에서 `light_theme`을 `#app`에 적용했으나, `@personal/uikit/design` import 시 `global.css.ts`가 사이드이펙트로 `html { overflowY: auto, scrollbarGutter: stable }`을 설정하여 스크롤바 발생 |
| 현재 문제/이슈 | vanilla-extract CSS가 index.html의 `overflow: hidden`을 덮어씀 → iframe에 스크롤바 표시 |
| 제약사항 | Logseq 플러그인 iframe은 스크롤 불필요; E2E 환경(`e2e/test-app.ts`)도 동기화 필요 |

---

## 3. 수행한 작업

### 스크롤바 수정

- **담당**: 메인 에이전트 (1줄 추가)
- **내용**: `main.ts`에 `document.documentElement.style.overflow = 'hidden'` 추가 (인라인 스타일 > vanilla-extract CSS specificity)
- **결과**: 완료

### E2E 환경 동기화

- **담당**: developer 서브에이전트
- **내용**: `e2e/test-app.ts`에 `light_theme` import + `app_root.classList.add(light_theme)` + `document.documentElement.style.overflow = 'hidden'` 추가
- **결과**: 완료, E2E/VRT 17/17 통과

### 단위 테스트

- **담당**: developer 서브에이전트
- **내용**: UC-PLUGIN-008 (html overflow hidden 검증) 추가 + 스펙 문서 갱신
- **결과**: 완료, 6/6 단위 테스트 통과

### VRT 베이스라인 갱신

- **담당**: qa 서브에이전트
- **내용**: `playwright test --update-snapshots` 실행, 3개 PNG 갱신/생성
- **결과**: 17/17 E2E 테스트 통과, 베이스라인 갱신 완료

### QA 검증

- **담당**: qa 서브에이전트
- **내용**: format → test → lint → type-check → build
- **결과**: 전 단계 PASS

---

## 4. 주요 결정사항

| 단계 | 결정 | 근거 | 검토한 대안 |
|------|------|------|-------------|
| 구현 | 인라인 스타일로 overflow 덮어쓰기 | specificity가 가장 높아 확실히 동작 | `:global(html)` Svelte 스타일 (cascade 순서 의존) |
| E2E | test-app.ts에 테마+overflow 동기화 | main.ts와 동일한 환경 재현 필요 | E2E에서 모킹 (실제 동작과 차이) |

---

## 5. 발견된 이슈 및 해결

| 단계 | 이슈 | 해결 방법 | 영향도 |
|------|------|-----------|--------|
| VRT 1차 | E2E 6건 실패 (test-app.ts에 테마 미적용) | test-app.ts에 light_theme + overflow 추가 | major |
| 분석 | E2E 엔트리(test-app.ts)가 main.ts와 별도 → 설정 불일치 | 수동 동기화 | minor (향후 추상화 검토) |

---

## 6. 품질 지표

| 지표 | 결과 |
|------|------|
| Linter 오류 (ReadLints) | 0개 |
| 단위 테스트 | 100% (6/6) |
| E2E/VRT 테스트 | 100% (17/17) |
| type-check | PASS |
| build | PASS |
| 보안 | PASS |

---

## 7. 커밋 내역

| # | 커밋 해시 | 메시지 |
|---|-----------|--------|
| 1 | 3e66ec0 | fix(logseq-time-tracker): uikit 전역 CSS로 인한 스크롤바 이중 표시 수정 |

---

## 8. 시스템 개선

- **패턴**: E2E 엔트리와 프로덕션 엔트리의 설정 불일치 (3개 사이클에 걸쳐 반복)
- **패턴**: global.css 사이드이펙트 연쇄 문제 (body 배경 → overflow → 스크롤바)
- **교훈**: main.ts 변경 시 test-app.ts 동기화 확인 필수
- **규칙 변경**: 없음

---

## 9. 변경된 파일 목록

```
M  packages/logseq-time-tracker/CHANGELOG.md
M  packages/logseq-time-tracker/__test_specs__/unit/plugin.md
M  packages/logseq-time-tracker/e2e/test-app.ts
M  packages/logseq-time-tracker/e2e/tests/toolbar-visual.spec.ts-snapshots/toolbar-complete-modal-win32.png
M  packages/logseq-time-tracker/e2e/tests/toolbar-visual.spec.ts-snapshots/toolbar-pause-modal-win32.png
A  packages/logseq-time-tracker/e2e/tests/toolbar-visual.spec.ts-snapshots/toolbar-switch-modal-win32.png
M  packages/logseq-time-tracker/src/__tests__/main.test.ts
M  packages/logseq-time-tracker/src/main.ts
```

---

## 10. 후속 작업

- uikit의 `global.css.ts` 사이드이펙트를 opt-in으로 변경 검토 (소비 패키지별 충돌 방지)
- `main.ts`와 `e2e/test-app.ts`의 설정 코드를 공유 함수로 추출 검토

---

## 11. 참고

- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-27-017.json`
- 보고서 저장: `.cursor/metrics/reports/2026-03-27-017-scrollbar-fix.md`
- 관련 사이클: 007 (z-index 토큰), 015 (테마 body→#app), 017 (overflow + E2E 동기화)
