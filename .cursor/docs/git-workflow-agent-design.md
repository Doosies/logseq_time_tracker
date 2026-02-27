# Git 워크플로우 에이전트 설계 문서

**작성일**: 2026-01-28  
**작성자**: 기획 에이전트  
**버전**: 1.0.0

---

## 1. 개요

### 1.1 목적
이 문서는 커밋 메시지 작성과 Pull Request 생성을 자동화하는 Git 워크플로우 에이전트의 설계를 정의합니다.

### 1.2 범위
- 포함:
  - 커밋 메시지 자동 생성 (Conventional Commits 준수)
  - PR 설명 자동 생성
  - 변경 사항 분석 및 요약
  - 관련 이슈 링크 자동 연결
  - 리뷰어 추천
- 제외:
  - 실제 Git 명령어 실행 (사용자 승인 필요)
  - 브랜치 전략 결정 (기존 전략 준수)
  - 코드 리뷰 (QA 에이전트 담당)

---

## 2. 역할 분리 vs 통합 분석

### 2.1 옵션 A: 단일 에이전트 (Git 워크플로우 에이전트)

#### 구조
```
Git-Workflow Agent
├── 커밋 메시지 작성
├── PR 설명 작성
├── 변경 이력 분석
└── 리뷰어 추천
```

#### 장점
1. **일관성**: 커밋과 PR이 동일한 컨텍스트에서 생성되어 일관성 유지
2. **효율성**: 변경 사항을 한 번만 분석하여 커밋과 PR 모두에 활용
3. **단순성**: 하나의 에이전트만 관리하면 됨
4. **컨텍스트 공유**: 커밋 메시지에서 PR 설명으로 자연스럽게 전달

#### 단점
1. **책임 집중**: 하나의 에이전트가 여러 역할 담당
2. **확장성**: 커밋과 PR의 요구사항이 다를 때 대응 어려움

#### 예시 워크플로우
```
작업 완료 → Git-Workflow Agent 호출
  ├── 변경 사항 분석
  ├── 커밋 메시지 생성
  ├── PR 설명 생성
  └── 리뷰어 추천
```

---

### 2.2 옵션 B: 분리된 에이전트

#### 구조
```
Commit Agent              PR Agent
├── 커밋 메시지 작성      ├── PR 설명 작성
├── 변경 사항 요약        ├── 변경 사항 상세 분석
└── Conventional Commits  ├── 이슈 링크 연결
                          └── 리뷰어 추천
```

#### 장점
1. **단일 책임 원칙**: 각 에이전트가 명확한 역할
2. **독립성**: 커밋과 PR을 독립적으로 처리 가능
3. **전문성**: 각 에이전트가 특화된 기능에 집중
4. **유연성**: 커밋만 필요하거나 PR만 필요할 때 선택적 호출

#### 단점
1. **중복 분석**: 변경 사항을 두 번 분석해야 함
2. **일관성 문제**: 커밋과 PR 설명이 불일치할 수 있음
3. **복잡성**: 두 에이전트 관리 필요
4. **컨텍스트 전달**: 커밋 메시지를 PR Agent에 전달해야 함

#### 예시 워크플로우
```
작업 완료 → Commit Agent 호출
  └── 커밋 메시지 생성

커밋 완료 → PR Agent 호출
  ├── 커밋 메시지 참조
  ├── 변경 사항 재분석
  └── PR 설명 생성
```

---

### 2.3 추천안: 옵션 A (단일 에이전트)

#### 추천 이유

1. **실용성**
   - 대부분의 경우 커밋과 PR이 연속적으로 발생
   - 변경 사항 분석을 한 번만 수행하여 효율적
   - 프로젝트 규모에 적합 (단일 에이전트로 충분)

2. **일관성 보장**
   - 커밋 메시지와 PR 설명이 동일한 컨텍스트에서 생성
   - 변경 사항 요약이 일치하여 리뷰어 이해 용이

3. **기존 시스템과의 조화**
   - Docs 에이전트와의 역할 중복 최소화
   - 메인 에이전트의 워크플로우 관리 단순화

4. **확장성 고려**
   - 필요 시 내부적으로 모듈화 가능 (커밋 모듈, PR 모듈)
   - 단일 에이전트로 시작하여 필요 시 분리 가능

#### 대안: 하이브리드 접근
- 기본적으로 단일 에이전트로 운영
- 필요 시 커밋만 또는 PR만 생성하는 옵션 제공
- 내부적으로는 모듈화된 구조로 설계

---

## 3. 기존 에이전트와의 관계

### 3.1 Docs 에이전트와의 관계

#### 역할 구분

| 항목 | Docs 에이전트 | Git-Workflow 에이전트 |
|------|--------------|---------------------|
| **CHANGELOG** | ✅ 작성 담당 | ❌ 작성 안 함 |
| **커밋 메시지** | ❌ 작성 안 함 | ✅ 작성 담당 |
| **PR 설명** | ❌ 작성 안 함 | ✅ 작성 담당 |
| **코드 문서화** | ✅ JSDoc/TSDoc | ❌ 작성 안 함 |

#### 협업 방식

```
워크플로우:
1. Developer/QA 작업 완료
2. Git-Workflow: 커밋 메시지 생성
3. Git-Workflow: PR 설명 생성
4. (사용자 승인 후 커밋/PR 생성)
5. Docs: CHANGELOG 업데이트 (버전 변경 시)
```

#### 중복 방지
- **CHANGELOG**: Docs 에이전트 전담 (버전별 변경사항 기록)
- **커밋 메시지**: Git-Workflow 에이전트 전담 (개별 커밋 기록)
- **PR 설명**: Git-Workflow 에이전트 전담 (PR 컨텍스트 제공)

**원칙**: CHANGELOG는 버전 단위, 커밋은 변경 단위로 구분

---

### 3.2 Developer/QA 에이전트와의 협업

#### 입력 정보 수집

Git-Workflow 에이전트는 다음 정보를 수집:

1. **Developer 에이전트로부터**
   - 변경된 파일 목록
   - 구현 내용 요약
   - 기술적 결정 사항

2. **QA 에이전트로부터**
   - 테스트 결과
   - 커버리지 정보
   - 발견된 이슈

3. **자체 분석**
   - `git diff` 분석
   - 변경된 라인 수
   - 영향 범위 분석

#### 워크플로우 통합

```
Feature 워크플로우:
메인 → 기획 → 구현 → QA → Git-Workflow → 문서화 → 메인 최종 승인
                                    ↑
                            커밋/PR 생성 시점
```

**호출 시점**: QA 단계 완료 후, 문서화 전

**이유**:
- 모든 변경사항이 확정된 시점
- 테스트 결과를 PR 설명에 포함 가능
- 문서화 전에 커밋/PR 생성하여 이력 관리

---

### 3.3 메인 에이전트와의 관계

#### 호출 조건

Git-Workflow 에이전트는 다음 조건에서 호출:

1. **자동 호출** (권장)
   - QA 단계 완료 후
   - 모든 품질 게이트 통과 시
   - 변경된 파일이 있을 때

2. **수동 호출** (선택)
   - 사용자가 명시적으로 요청
   - 커밋만 필요하거나 PR만 필요한 경우

#### 품질 게이트

메인 에이전트는 Git-Workflow 에이전트의 출력을 검증:

**커밋 메시지 검증**:
- [ ] Conventional Commits 형식 준수
- [ ] 변경 사항과 일치
- [ ] 명확하고 구체적

**PR 설명 검증**:
- [ ] 변경 사항 요약 포함
- [ ] 테스트 결과 포함 (해당 시)
- [ ] 관련 이슈 링크 포함
- [ ] 리뷰 포인트 명시

---

## 4. 구체적인 기능

### 4.1 커밋 메시지 자동 생성

#### Conventional Commits 준수

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 분류

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(auth): add JWT token refresh` |
| `fix` | 버그 수정 | `fix(api): handle null response` |
| `docs` | 문서만 변경 | `docs(readme): update installation guide` |
| `style` | 포매팅 (코드 변경 없음) | `style: format code with prettier` |
| `refactor` | 리팩토링 | `refactor(service): extract common logic` |
| `test` | 테스트 추가/수정 | `test(auth): add login test cases` |
| `chore` | 빌드/설정 변경 | `chore(deps): update dependencies` |
| `perf` | 성능 개선 | `perf(api): optimize database query` |

#### Scope 결정 로직

```typescript
// 파일 경로 기반 scope 추출
function determineScope(changed_files: string[]): string {
  // packages/plugin/src/App.tsx → plugin
  // packages/mcp-server/src/index.ts → mcp-server
  // .cursor/rules/developer.mdc → rules
  
  const scopes = changed_files.map(file => {
    if (file.startsWith('packages/')) {
      return file.split('/')[1]; // plugin, mcp-server 등
    }
    if (file.startsWith('.cursor/')) {
      return file.split('/')[1]; // rules, skills 등
    }
    return 'root';
  });
  
  // 가장 많이 변경된 scope 반환
  return mostCommon(scopes);
}
```

#### Subject 작성 규칙

1. **명령형 사용**: "add" (O), "added" (X)
2. **소문자 시작**: 첫 글자 대문자 금지
3. **50자 이내**: 간결하고 명확하게
4. **마침표 생략**: 끝에 마침표 없음

#### Body 작성 규칙

1. **변경 이유 설명**: 왜 이 변경이 필요한지
2. **이전 동작과의 차이**: Before/After 비교
3. **Breaking Changes**: 있으면 명시

#### Footer 작성 규칙

1. **이슈 번호**: `Closes #123`, `Fixes #456`
2. **Co-authored-by**: 공동 작업자
3. **Breaking Changes**: `BREAKING CHANGE: description`

#### 예시

```markdown
feat(plugin): add dark mode toggle

사용자가 다크 모드를 켜고 끌 수 있는 토글 버튼을 추가했습니다.

변경 사항:
- ThemeToggle 컴포넌트 추가
- 로컬 스토리지에 테마 설정 저장
- 시스템 테마 감지 기능 추가

Closes #42
```

---

### 4.2 PR 설명 자동 생성

#### 템플릿 구조

```markdown
## 변경 사항 요약

[변경 사항을 한 문장으로 요약]

## 변경 유형

- [ ] 새 기능 (feature)
- [ ] 버그 수정 (bugfix)
- [ ] 리팩토링 (refactor)
- [ ] 문서화 (docs)
- [ ] 성능 개선 (perf)
- [ ] 테스트 (test)
- [ ] 빌드/설정 (chore)

## 상세 설명

### 변경 내용
[변경 사항 상세 설명]

### 변경 이유
[왜 이 변경이 필요한지]

### 테스트 결과
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 커버리지: XX%
- [ ] Linter 오류: 0개

### 스크린샷 (해당 시)
[UI 변경이 있는 경우]

### 체크리스트
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
- [ ] 문서 업데이트 (필요 시)
- [ ] CHANGELOG 업데이트 (필요 시)

## 관련 이슈
Closes #123
Related to #456

## 리뷰 포인트
[특별히 확인해주면 좋을 부분]
```

#### 자동 생성 로직

1. **변경 사항 분석**
   ```typescript
   // git diff 분석
   const diff = await gitDiff();
   const stats = analyzeDiff(diff);
   
   // 변경 통계
   {
     files_changed: 5,
     insertions: 120,
     deletions: 45,
     scope: 'plugin'
   }
   ```

2. **커밋 메시지 활용**
   ```typescript
   // 커밋 메시지를 PR 설명의 기초로 사용
   const commit_message = generateCommitMessage();
   const pr_description = expandCommitToPR(commit_message);
   ```

3. **QA 결과 통합**
   ```typescript
   // QA 에이전트로부터 테스트 결과 수집
   const qa_results = {
     tests_passed: 45,
     coverage: 87.5,
     linter_errors: 0
   };
   
   // PR 설명에 테스트 결과 섹션 추가
   pr_description.test_results = formatQAResults(qa_results);
   ```

4. **이슈 링크 자동 연결**
   ```typescript
   // 커밋 메시지나 변경 사항에서 이슈 번호 추출
   const issue_numbers = extractIssueNumbers(commit_message, changed_files);
   // "Closes #123" 형식으로 추가
   ```

---

### 4.3 변경 사항 분석 및 요약

#### 분석 항목

1. **파일 변경 통계**
   - 변경된 파일 수
   - 추가/삭제된 라인 수
   - 변경 비율

2. **영향 범위 분석**
   - 어떤 모듈이 영향받는지
   - 공개 API 변경 여부
   - Breaking Changes 여부

3. **코드 품질 지표**
   - 복잡도 변화
   - 중복 코드 여부
   - 테스트 커버리지 변화

#### 요약 생성 알고리즘

```typescript
function generateSummary(changed_files: string[], diff: string): string {
  // 1. 파일 유형 분류
  const file_types = categorizeFiles(changed_files);
  // { components: 3, services: 2, tests: 5 }
  
  // 2. 주요 변경 사항 추출
  const major_changes = extractMajorChanges(diff);
  // ["새 컴포넌트 추가", "API 엔드포인트 수정"]
  
  // 3. 요약 생성
  return formatSummary(file_types, major_changes);
}
```

#### 예시 출력

```markdown
변경 사항 요약:
- 컴포넌트 3개 추가 (ThemeToggle, UserProfile, Settings)
- 서비스 2개 수정 (AuthService, UserService)
- 테스트 5개 추가
- 총 120줄 추가, 45줄 삭제
```

---

### 4.4 관련 이슈 링크 자동 연결

#### 이슈 번호 추출 방법

1. **커밋 메시지에서 추출**
   ```typescript
   // "Closes #123" 또는 "Fixes #456" 형식
   const issue_pattern = /(?:Closes|Fixes|Resolves)\s+#(\d+)/gi;
   ```

2. **변경된 파일에서 추출**
   ```typescript
   // 주석이나 코드에서 "#123" 형식
   const comment_pattern = /#(\d+)/g;
   ```

3. **PR 제목에서 추출**
   ```typescript
   // "feat: add feature (#123)" 형식
   const pr_title_pattern = /\(#(\d+)\)/;
   ```

#### 자동 연결 로직

```typescript
function linkIssues(commit_message: string, changed_files: string[]): string[] {
  const issues = new Set<number>();
  
  // 커밋 메시지에서 추출
  const commit_issues = extractFromCommit(commit_message);
  commit_issues.forEach(issue => issues.add(issue));
  
  // 파일에서 추출
  const file_issues = extractFromFiles(changed_files);
  file_issues.forEach(issue => issues.add(issue));
  
  // "Closes #123" 형식으로 변환
  return Array.from(issues).map(issue => `Closes #${issue}`);
}
```

---

### 4.5 리뷰어 추천

#### 추천 로직

1. **파일 기반 추천**
   ```typescript
   // 변경된 파일의 이전 커밋 작성자 분석
   function recommendReviewers(changed_files: string[]): string[] {
     const authors = new Map<string, number>();
     
     for (const file of changed_files) {
       const file_authors = getFileAuthors(file);
       file_authors.forEach(author => {
         authors.set(author, (authors.get(author) || 0) + 1);
       });
     }
     
     // 가장 많이 기여한 작성자 상위 2명 추천
     return Array.from(authors.entries())
       .sort((a, b) => b[1] - a[1])
       .slice(0, 2)
       .map(([author]) => author);
   }
   ```

2. **모듈 기반 추천**
   ```typescript
   // 특정 모듈의 전문가 추천
   const module_experts = {
     'plugin': ['developer1', 'developer2'],
     'mcp-server': ['mcp-developer'],
     'docs': ['docs-writer']
   };
   ```

3. **규칙 기반 추천**
   ```typescript
   // 특정 파일 변경 시 필수 리뷰어
   const required_reviewers = {
     '.cursor/rules/': ['main-orchestrator'],
     'packages/plugin/': ['plugin-maintainer'],
     'packages/mcp-server/': ['mcp-maintainer']
   };
   ```

#### 예시 출력

```markdown
## 추천 리뷰어

- @developer1 (이 파일의 주요 기여자)
- @plugin-maintainer (plugin 모듈 전문가)

## 필수 리뷰어

- @main-orchestrator (.cursor/rules 변경 시)
```

---

## 5. 구현 방안

### 5.1 필요한 Skills

#### Skill 파일 구조

```
.cursor/skills/git-workflow/references/
├── commit-message-generation.md    # 커밋 메시지 생성 가이드
├── pr-description-generation.md    # PR 설명 생성 가이드
├── change-analysis.md               # 변경 사항 분석 가이드
└── reviewer-recommendation.md       # 리뷰어 추천 가이드
```

#### 주요 Skill 내용

**commit-message-generation.md**:
- Conventional Commits 규칙
- Type/Scope 결정 로직
- Subject/Body/Footer 작성 가이드
- 예시 및 체크리스트

**pr-description-generation.md**:
- PR 템플릿 구조
- 커밋 메시지 확장 방법
- QA 결과 통합 방법
- 이슈 링크 연결 방법

**change-analysis.md**:
- git diff 분석 방법
- 파일 변경 통계 계산
- 영향 범위 분석
- Breaking Changes 감지

**reviewer-recommendation.md**:
- 파일 기반 추천 로직
- 모듈 전문가 매핑
- 필수 리뷰어 규칙

---

### 5.2 Rule 파일 구조

#### Rule 파일: `.cursor/rules/git-workflow.mdc`

```markdown
---
description: Git 워크플로우 에이전트 - 커밋 및 PR 생성 전문
alwaysApply: true
---

# Git 워크플로우 에이전트 Rule

당신은 **Git 워크플로우 에이전트**입니다. 
커밋 메시지 작성과 Pull Request 생성을 전담합니다.

## 역할 정의
- 커밋 메시지 자동 생성 (Conventional Commits)
- PR 설명 자동 생성
- 변경 사항 분석 및 요약
- 관련 이슈 링크 자동 연결
- 리뷰어 추천

## 핵심 원칙
1. **Conventional Commits 준수**: 표준 형식 엄격히 준수
2. **명확성**: 변경 사항을 명확하고 구체적으로 설명
3. **일관성**: 커밋 메시지와 PR 설명의 일관성 유지
4. **자동화**: 가능한 한 자동으로 정보 수집 및 생성

## 작업 프로세스

### 1단계: 변경 사항 수집
- Developer/QA 에이전트로부터 정보 수집
- git diff 분석
- 변경된 파일 목록 확인

### 2단계: 커밋 메시지 생성
- Type/Scope 결정
- Subject 작성
- Body 작성 (필요 시)
- Footer 작성 (이슈 링크 등)

### 3단계: PR 설명 생성
- 커밋 메시지 확장
- 변경 사항 상세 설명
- QA 결과 통합
- 이슈 링크 연결
- 리뷰어 추천

### 4단계: 검증 및 제출
- 메인 에이전트 검증
- 사용자 승인 대기
- (실제 Git 명령어는 사용자가 실행)

## Skill 활용 시점
- 커밋 메시지 → `commit-message-generation.md`
- PR 설명 → `pr-description-generation.md`
- 변경 분석 → `change-analysis.md`
- 리뷰어 추천 → `reviewer-recommendation.md`
```

---

### 5.3 다른 에이전트와의 통합 방법

#### 1. Developer 에이전트 통합

**입력 수집**:
```typescript
// Developer 에이전트 완료 리포트에서 정보 추출
interface DeveloperReport {
  changed_files: string[];
  implementation_summary: string;
  technical_decisions: string[];
}
```

**통합 방법**:
- Developer 에이전트가 완료 리포트에 변경 파일 목록 포함
- Git-Workflow 에이전트가 리포트를 읽어 커밋 메시지 생성

#### 2. QA 에이전트 통합

**입력 수집**:
```typescript
// QA 에이전트 완료 리포트에서 정보 추출
interface QAReport {
  tests_passed: number;
  tests_total: number;
  coverage: number;
  linter_errors: number;
}
```

**통합 방법**:
- QA 에이전트가 완료 리포트에 테스트 결과 포함
- Git-Workflow 에이전트가 리포트를 읽어 PR 설명에 테스트 결과 추가

#### 3. Docs 에이전트 통합

**협업 방식**:
- Git-Workflow: 커밋 메시지 생성 (개별 변경 기록)
- Docs: CHANGELOG 업데이트 (버전별 변경 기록)
- Git-Workflow가 생성한 커밋 메시지를 Docs 에이전트에 전달하여 CHANGELOG 작성 지원

#### 4. 메인 에이전트 통합

**호출 시점**:
```typescript
// 워크플로우 패턴에 Git-Workflow 단계 추가
const workflow_patterns = {
  feature: [
    'planner',
    'developer',
    'qa',
    'git-workflow',  // 추가
    'docs',
    'main-approval'
  ]
};
```

**품질 게이트**:
- 메인 에이전트가 Git-Workflow 출력 검증
- Conventional Commits 형식 확인
- 변경 사항 일치 확인

---

### 5.4 구현 단계

#### Phase 1: 기본 기능 (MVP)
1. 커밋 메시지 생성 (Conventional Commits)
2. 기본 PR 템플릿 생성
3. 변경 파일 목록 분석

**예상 시간**: 2-3시간

#### Phase 2: 고급 기능
1. 변경 사항 상세 분석
2. 이슈 링크 자동 연결
3. 리뷰어 추천

**예상 시간**: 3-4시간

#### Phase 3: 통합 및 최적화
1. 다른 에이전트와의 통합
2. 워크플로우 패턴 통합
3. 품질 게이트 추가

**예상 시간**: 2-3시간

**총 예상 시간**: 7-10시간

---

## 6. 예시 시나리오

### 시나리오 1: 새 기능 추가 (Feature)

**입력**:
- Developer: 사용자 인증 기능 구현 완료
- QA: 테스트 통과, 커버리지 85%
- 변경 파일: `src/services/auth-service.ts`, `src/controllers/auth-controller.ts`

**Git-Workflow 에이전트 출력**:

**커밋 메시지**:
```markdown
feat(auth): add user authentication system

JWT 기반 사용자 인증 시스템을 구현했습니다.

변경 사항:
- AuthService: 로그인/로그아웃 로직 구현
- AuthController: REST API 엔드포인트 추가
- JWT 토큰 생성 및 검증 기능

테스트:
- 단위 테스트 15개 통과
- 커버리지 85%

Closes #42
```

**PR 설명**:
```markdown
## 변경 사항 요약

사용자 인증 시스템을 추가했습니다. JWT 토큰 기반 인증을 지원합니다.

## 변경 유형

- [x] 새 기능 (feature)

## 상세 설명

### 변경 내용
- AuthService: 로그인/로그아웃 비즈니스 로직 구현
- AuthController: POST /api/auth/login, POST /api/auth/logout 엔드포인트 추가
- JWT 토큰 생성 및 검증 미들웨어 구현

### 변경 이유
사용자 인증 기능이 필요하여 구현했습니다.

### 테스트 결과
- [x] 단위 테스트 통과 (15/15)
- [x] 통합 테스트 통과 (5/5)
- [x] 커버리지: 85%
- [x] Linter 오류: 0개

### 체크리스트
- [x] 코드 리뷰 완료
- [x] 테스트 통과
- [ ] 문서 업데이트 (Docs 에이전트가 처리)
- [ ] CHANGELOG 업데이트 (Docs 에이전트가 처리)

## 관련 이슈
Closes #42

## 리뷰 포인트
- JWT 토큰 만료 시간 설정 (현재 1시간)
- 비밀번호 해싱 알고리즘 (bcrypt, 10 rounds)
- 에러 메시지 보안 고려 (사용자 정보 노출 방지)

## 추천 리뷰어
- @security-expert (인증 관련)
- @backend-lead (API 설계)
```

---

### 시나리오 2: 버그 수정 (Bugfix)

**입력**:
- QA: 로그인 실패 시 크래시 버그 발견
- Developer: null 체크 추가하여 수정
- 변경 파일: `src/services/auth-service.ts`

**커밋 메시지**:
```markdown
fix(auth): handle null user in login

로그인 시 존재하지 않는 사용자 조회 시 null 체크를 추가하여
크래시를 방지했습니다.

Before: getUserByEmail()가 null 반환 시 크래시
After: null 체크 후 적절한 에러 메시지 반환

Fixes #123
```

**PR 설명**:
```markdown
## 변경 사항 요약

로그인 시 존재하지 않는 사용자 처리 버그를 수정했습니다.

## 변경 유형

- [x] 버그 수정 (bugfix)

## 상세 설명

### 버그 설명
존재하지 않는 이메일로 로그인 시도 시 `getUserByEmail()`이 null을 반환하고,
이를 처리하지 않아 크래시가 발생했습니다.

### 수정 내용
- `login()` 함수에 null 체크 추가
- 적절한 에러 메시지 반환 (보안 고려: "이메일 또는 비밀번호가 잘못되었습니다")

### 테스트 결과
- [x] 단위 테스트 통과 (기존 테스트 + 새 테스트 2개)
- [x] 버그 재현 테스트 통과
- [x] 커버리지: 88% (기존 85%에서 증가)
- [x] Linter 오류: 0개

## 관련 이슈
Fixes #123

## 리뷰 포인트
- 에러 메시지가 보안상 적절한지 확인
- 다른 곳에서도 유사한 null 체크가 필요한지 확인
```

---

## 7. 체크리스트

### 설계 완료 기준

- [x] 역할 분리 vs 통합 분석 완료
- [x] 기존 에이전트와의 관계 정의 완료
- [x] 구체적인 기능 정의 완료
- [x] 구현 방안 제시 완료
- [x] 예시 시나리오 작성 완료

### 구현 전 확인 사항

- [ ] Skill 파일 작성 필요
- [ ] Rule 파일 작성 필요
- [ ] 워크플로우 패턴 업데이트 필요
- [ ] 메인 에이전트 품질 게이트 추가 필요

---

## 8. 다음 단계

1. **메인 에이전트 검토**: 이 설계안 검토 및 승인
2. **Skill 파일 작성**: 4개 Skill 파일 작성
3. **Rule 파일 작성**: git-workflow.mdc 작성
4. **워크플로우 통합**: 메인 에이전트 워크플로우에 Git-Workflow 단계 추가
5. **테스트**: 실제 시나리오로 테스트

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2026-01-28
