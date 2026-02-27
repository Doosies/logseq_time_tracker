# 작업 완료 보고서

**작업 일자**: YYYY-MM-DD  
**작업 ID**: (플랜 파일명 또는 cycle_id)  
**요청 내용**: (사용자가 요청한 할 일 요약)

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 작업 유형 | Feature / Bugfix / Refactor / Chore / Docs |
| 소요 시간 | (예상 또는 실제) |
| 주요 변경 패키지 | packages/xxx, packages/yyy |
| 커밋 수 | N개 |

---

## 2. 수행한 작업

### Phase 0 (예시)

- **담당**: developer 서브에이전트 x1
- **내용**: (구체적 작업 설명)
- **결과**: 완료

### Phase 1 (예시)

- **담당**: developer 서브에이전트 x2 (병렬)
- **내용**: (구체적 작업 설명)
- **결과**: 완료

### 검증

- **담당**: qa 서브에이전트 x1
- **내용**: pnpm format + test + lint + type-check → build
- **결과**: PASS / FAIL (이슈 N건 제외)

### 문서화/CHANGELOG:

- **담당**: docs → git-workflow 서브에이전트 (직렬)
- **내용**: git changes 포함 전체 변경사항 반영
- **결과**: 완료

---

## 3. 품질 지표

| 지표 | 결과 |
|------|------|
| Linter 오류 | 0개 |
| 테스트 통과 | 100% (N/N) |
| 커버리지 | N% |
| type-check | PASS |
| build | PASS |

---

## 4. 커밋 내역

| # | 커밋 해시 | 메시지 |
|---|-----------|--------|
| 1 | abc1234 | feat(uikit): add design tokens for transition |
| 2 | def5678 | refactor(ecount-dev-tool): apply new tokens |
| 3 | ghi9012 | docs: update CHANGELOG and design-tokens.md |

---

## 5. 시스템 개선 (선택)

- **분석**: system-improvement 에이전트 실행 여부
- **개선 사항**: (있으면) 에이전트 규칙 추가/수정 내용
- **리포트 경로**: `.cursor/metrics/improvements/YYYY-MM-DD-xxx.md`
- **추가 커밋**: (있으면) chore(agents): improve subagent rules

---

## 6. 변경된 파일 목록

```
packages/uikit/src/xxx
packages/ecount-dev-tool/src/yyy
packages/docs/api/design-tokens.md
packages/*/CHANGELOG.md
...
```

---

## 7. 후속 작업 (선택)

- (사용자에게 제안할 추가 작업이 있으면 기재)

---

## 8. 참고

- 플랜 파일: `.cursor/plans/xxx.plan.md`
- 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
