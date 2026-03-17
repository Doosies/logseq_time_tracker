# CodeMirror 6 에디터 통합 사이클 분석

**일시**: 2026-03-17
**사이클 ID**: 2026-03-17-001
**태스크**: Feature - ecount dev tool에 CodeMirror 6 기반 JS 코드 에디터 통합
**결과**: 성공 (모든 검증 통과)

---

## 1. 사이클 요약

| 항목 | 내용 |
|------|------|
| 워크플로우 | planner → developer → qa → security → docs → git-workflow |
| Developer | 성공 (1회, 재시도 0) |
| QA | format/test 349개/lint/type-check/build 통과 |
| Security | XSS/의존성/민감정보/Prototype 오염 pass |
| Docs | CHANGELOG + JSDoc |
| Git | 단일 커밋 |

---

## 2. 이슈 분석

### 이슈 1: ReadLints @codemirror/language 타입 미인식

| 항목 | 내용 |
|------|------|
| **현상** | ReadLints에서 `@codemirror/language` 모듈 타입 선언 미인식 |
| **원인** | IDE 캐시/타입 해석 이슈 (외부 패키지) |
| **검증** | CLI `pnpm type-check` 통과 |
| **판단** | 에이전트 행동 수정 불필요 |

**권장**: 품질 게이트에서 CLI type-check 통과 시 ReadLints의 IDE 전용 타입 오류는 무시 가능. 별도 에이전트 규칙 추가는 불필요 (환경 이슈).

### 이슈 2: git-workflow 준비 vs 실행 역할 혼선

| 항목 | 내용 |
|------|------|
| **현상** | git-workflow 에이전트가 커밋 명령만 준비, 메인 에이전트가 직접 `git commit` 실행 |
| **설계** | git-workflow: "실제 Git 명령어 실행 금지" (agents/git-workflow.md L379) |
| **규칙** | main-orchestrator: "직접 커밋 금지" (Git 커밋/PR 생성 금지) |
| **갭** | git-workflow가 실행하지 않으므로, 준비된 명령을 누가 실행할지 불명확 |

---

## 3. 개선 제안

### 제안 1: Git-Workflow 핸드오프 명확화 (채택 권장)

**문제**: "직접 커밋 금지"와 "git-workflow가 실행하지 않음"이 공존하여, 메인 에이전트가 준비된 명령을 실행하는 것이 위반인지 모호함.

**해결**: 다음을 구분하여 문서화

- **직접 커밋 (금지)**: git-workflow 호출 없이 커밋 메시지를 직접 작성하고 커밋하는 행위
- **준비 명령 실행 (허용)**: git-workflow가 생성한 `GIT_COMMANDS.md`의 `git commit -F .cursor/temp/COMMIT_MESSAGE.md` 실행

**수정 대상**:

1. **main-orchestrator.mdc** – Git-Workflow 단계 후 체크리스트에 추가:
   ```
   - [ ] git-workflow가 준비한 GIT_COMMANDS.md의 명령 실행 (메인 에이전트 또는 사용자)
   - 참고: "직접 커밋" = git-workflow bypass. 준비된 명령 실행은 허용.
   ```

2. **workflow-checklist.md** – 6단계 커밋에 추가:
   ```
   - git-workflow 호출 후, GIT_COMMANDS.md의 명령을 메인 에이전트가 실행 가능 (사용자 승인 시)
   ```

3. **git-workflow.md** – 협업 방식에 추가:
   ```
   ### 메인 에이전트
   - 생성된 커밋/PR 검증 (Conventional Commits 형식 확인)
   - 사용자 승인 후 실제 Git 명령어 안내 (PowerShell)
   - **또는**: 사용자 승인 시 GIT_COMMANDS.md의 명령을 메인 에이전트가 실행 가능
   ```

**효과**: 메인 에이전트가 git-workflow 출력을 실행하는 것이 의도된 워크플로우임을 명시하여 혼선 제거.

### 제안 2: ReadLints vs CLI type-check (문서화만)

**권장**: 에이전트 규칙 변경 없이, 품질 게이트 레퍼런스에 다음 패턴을 문서화:

- ReadLints가 외부 패키지(`@codemirror/*` 등) 타입 오류만 표시하고, `pnpm type-check`는 통과하는 경우 → IDE 캐시 이슈로 간주, 진행 가능.

---

## 4. 에이전트 정의 파일 수정 여부

| 파일 | 수정 필요 | 사유 |
|------|:--------:|------|
| main-orchestrator.mdc | ✓ | Git-Workflow 핸드오프 명확화 |
| workflow-checklist.md | ✓ | 6단계 실행 주체 명시 |
| git-workflow.md | ✓ | 협업 방식 보완 |
| developer.md | ✗ | - |
| qa.md | ✗ | - |

---

## 5. A/B 테스트 필요 여부

**불필요**. 문서/규칙 명확화이며, 행동 변경이 아님. 기존 설계 의도를 드러내는 수준의 수정.

---

## 6. 적용 Skill 경로

- `.cursor/skills/system-improvement/references/bottleneck-analysis.md` – 이슈 우선순위
- `.cursor/skills/system-improvement/references/rule-optimization.md` – 규칙 수정 전략

---

## 7. 결론

- **이슈 1**: 개선 불필요 (환경 이슈).
- **이슈 2**: main-orchestrator, workflow-checklist, git-workflow에 핸드오프 명확화 추가 권장.
- **전체**: 사이클 성공, 병목 없음. 규칙 명확화로 향후 혼선을 줄이는 것이 목표.
