# Developer 에이전트 역할 범위 초과 패턴 분석

**일시**: 2026-03-17
**사이클 ID**: 2026-03-17-002
**태스크**: Feature - Chrome 확장 프로그램 설정 내보내기/가져오기
**결과**: 성공 (391/391 테스트 통과, 보안 CONDITIONAL PASS)

---

## 1. 발견된 문제

### 이슈 1: Developer가 직접 커밋 수행

| 항목 | 내용 |
|------|------|
| **현상** | Developer 에이전트가 구현 후 `git commit`까지 직접 수행 |
| **담당** | git-workflow 에이전트 (main-orchestrator.mdc, workflow-checklist.md 6단계) |
| **영향** | QA 테스트 파일은 별도 커밋 필요, 논리적 커밋 단위 분할 불가 |

### 이슈 2: Developer가 메트릭/보고서 파일 생성

| 항목 | 내용 |
|------|------|
| **현상** | Developer가 cycle metric JSON(`.cursor/metrics/cycles/`)과 report 파일(`.cursor/metrics/reports/`) 생성 |
| **담당** | 메인 에이전트 (main-orchestrator.mdc "메트릭 수집" 섹션) |
| **영향** | 역할 혼선, 메인 에이전트의 사이클 추적·보고서 작성 책임 침해 |

### 이슈 3: Security 발견 사항 (보안 규칙 개선 범위 아님)

- `restorePreferences` 타입 검증 미흡 (Low)
- `restoreActiveAccount` key 형식 미검증 (Low)
- `readBackupFile` 파일 크기 제한 없음 (Low)
- **판단**: 후속 개선으로 처리 가능, 에이전트 규칙 개선과는 무관

---

## 2. 기존 규칙 검토

### developer.md 현황

| 검사 항목 | developer.md에 존재 여부 | 비고 |
|-----------|:------------------------:|------|
| git commit 금지 | ❌ | 없음 |
| git push 금지 | ❌ | 없음 |
| .cursor/metrics/cycles/ 생성 금지 | ❌ | 없음 |
| .cursor/metrics/reports/ 생성 금지 | ❌ | 없음 |
| 역할 범위 제한 명시 | ❌ | "출력"에 코드만 나열, 금지 사항 없음 |

### main-orchestrator.mdc 현황

- **위임 판단 기준**: "커밋/PR | git-workflow | 코드 변경 완료 후"
- **메트릭 수집**: "실행 주체: 메인 에이전트가 직접 수행"
- **한계**: 메인 에이전트 규칙만 있고, **서브에이전트(Developer)의 금지 사항**은 developer.md에 없음

### workflow-checklist.md 현황

- 6단계: "메인 에이전트 직접 커밋 금지"
- 2단계: "메인 에이전트 직접 코드 수정 금지"
- **한계**: Developer가 커밋하지 말라는 규칙은 **developer.md에 직접 명시되어 있지 않음**

---

## 3. 개선 제안

### 제안: developer.md에 "역할 범위 제한" 섹션 추가

**목적**: Developer 에이전트가 다른 에이전트의 책임을 수행하지 않도록 명시

**추가 위치**: `## 주의사항` 섹션 상단 또는 별도 `## 역할 범위 제한 (금지 사항)` 섹션

**추가 내용**:

```markdown
### 역할 범위 제한 (금지 사항)

Developer 에이전트는 **코드 구현만** 담당합니다. 다음 작업은 수행하지 않습니다:

1. **Git 커밋/푸시**: git-workflow 에이전트 담당
   - `git commit`, `git push`, `git add` 등 Git 명령 실행 금지
   - 구현 완료 후 메인 에이전트에게 보고하고, git-workflow가 커밋 담당

2. **메트릭/보고서 파일 생성**: 메인 에이전트 담당
   - `.cursor/metrics/cycles/` 내 JSON 파일 생성 금지
   - `.cursor/metrics/reports/` 내 보고서 파일 생성 금지
   - 사이클 메트릭 초기화·업데이트·최종 보고서는 메인 에이전트가 수행

3. **구현 완료 후**: 구현 완료 리포트만 제출하고, 다음 단계(QA/보안/문서/커밋)는 메인 에이전트가 조율
```

**효과**:
- Developer가 역할 범위를 벗어나지 않도록 명시적 규칙 제공
- git-workflow와 메인 에이전트의 책임을 침해하지 않음
- 향후 유사 문제 재발 방지

---

## 4. 에이전트 정의 파일 수정 여부

| 파일 | 수정 필요 | 사유 |
|------|:--------:|------|
| developer.md | ✓ | 역할 범위 제한(금지 사항) 섹션 추가 |
| main-orchestrator.mdc | ✓ (선택) | "서브에이전트 역할 한정" 참조 추가 가능 |
| workflow-checklist.md | ✗ | 2단계·6단계는 이미 메인 에이전트 대상, Developer 규칙은 developer.md에 |

---

## 5. A/B 테스트 필요 여부

**불필요**. 문서/규칙 명확화이며, 행동 변경이 아님. Developer가 이미 수행하지 말아야 할 작업을 명시하는 수준.

---

## 6. 적용 Skill 경로

- `.cursor/skills/system-improvement/references/bottleneck-analysis.md` – 이슈 우선순위
- `.cursor/skills/system-improvement/references/rule-optimization.md` – 규칙 수정 전략

---

## 7. 결론

- **개선 필요**: YES
- **개선 내용**: developer.md에 "역할 범위 제한" 섹션 추가
  - git commit/push 금지 (git-workflow 담당)
  - .cursor/metrics/cycles/ JSON 생성 금지 (메인 에이전트 담당)
  - .cursor/metrics/reports/ 파일 생성 금지 (메인 에이전트 담당)
- **Security 이슈**: 에이전트 규칙 개선 범위 아님, 후속 개선으로 처리
