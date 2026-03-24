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
| 주요 변경 영역 | (변경된 모듈/패키지) |
| 커밋 수 | N개 |

---

## 2. 배경 및 맥락

| 항목 | 내용 |
|------|------|
| 사용자 요청 배경 | (왜 이 작업을 시작했는지) |
| 현재 문제/이슈 | (작업 전 상태) |
| 제약사항 | (기술/일정/운영 제약) |

---

## 3. 수행한 작업

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
- **내용**: ReadLints + 프로젝트 format → test → lint → type-check → build 스크립트 순 실행 (스크립트 명은 `.cursor-agent-config.yaml` 또는 루트 `package.json` 참조)
- **결과**: PASS / FAIL (이슈 N건 제외)

### 문서화/CHANGELOG

- **담당**: docs → git-workflow 서브에이전트 (직렬)
- **내용**: git changes 포함 전체 변경사항 반영
- **결과**: 완료

---

## 4. 주요 결정사항

| 단계 | 결정 | 근거 | 검토한 대안 |
|------|------|------|-------------|
| planning | (결정 내용) | (결정 근거) | (대안) |
| implementation | (결정 내용) | (결정 근거) | (대안) |

---

## 5. 발견된 이슈 및 해결

| 단계 | 이슈 | 해결 방법 | 영향도 |
|------|------|-----------|--------|
| implementation | (이슈) | (해결) | none/minor/major/critical |

---

## 6. 품질 지표

| 지표 | 결과 |
|------|------|
| Linter 오류 (ReadLints) | 0개 |
| 테스트 통과 | 100% (N/N) |
| 테스트 커버리지 | N% |
| type-check | PASS |
| build | PASS |

---

## 7. 커밋 내역

| # | 커밋 해시 | 메시지 |
|---|-----------|--------|
| 1 | abc1234 | feat(module): add feature description |
| 2 | def5678 | refactor(module): refactor description |

---

## 8. 시스템 개선 (선택)

- **분석**: system-improvement 스킬 적용 여부 (메인 에이전트 직접 수행)
- **개선 사항**: (있으면) 에이전트 규칙 추가/수정 내용
- **리포트 경로**: `.cursor/metrics/improvements/YYYY-MM-DD-NNN-description.md`
- **추가 커밋**: (있으면) chore(agents): improve subagent rules

---

## 9. 변경된 파일 목록

```
(git diff --name-status 결과)
```

---

## 10. 후속 작업 (선택)

- (사용자에게 제안할 추가 작업이 있으면 기재)

---

## 11. 참고

- 플랜 파일: `.cursor/plans/xxx.plan.md`
- 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
- 사이클 메트릭: `.cursor/metrics/cycles/YYYY-MM-DD-NNN.json`
- 보고서 저장: `.cursor/metrics/reports/YYYY-MM-DD-NNN-description.md`
