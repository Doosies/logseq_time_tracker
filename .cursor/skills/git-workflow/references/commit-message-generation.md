---
name: commit-message-generation
description: Conventional Commits 표준에 따른 커밋 메시지 자동 생성 가이드
---

# 커밋 메시지 생성 가이드

이 Skill은 Git 워크플로우 에이전트가 Conventional Commits 표준에 따라 커밋 메시지를 생성하는 방법을 제공합니다.

## 목적

- Conventional Commits 표준 준수
- 일관된 커밋 메시지 형식 유지
- 자동화된 커밋 메시지 생성
- 이슈 추적 및 CHANGELOG 생성 지원

## 사용 시점

- 커밋 메시지를 작성할 때
- 변경 사항을 분석한 후
- Developer/QA 에이전트의 완료 리포트를 받은 후

---

## Conventional Commits 형식

### 기본 구조

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 필수 요소

- **Type**: 변경 유형 (필수)
- **Scope**: 변경 범위 (선택)
- **Subject**: 변경 내용 요약 (필수, 50자 이내)
- **Body**: 상세 설명 (선택)
- **Footer**: 이슈 번호, Breaking Changes 등 (선택)

---

## Type 분류 및 결정 로직

### Type 목록

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 추가 | `feat(auth): add JWT token refresh` |
| `fix` | 버그 수정 | `fix(api): handle null response` |
| `docs` | 문서만 변경 | `docs(readme): update installation guide` |
| `style` | 포매팅 (코드 변경 없음) | `style: format code with prettier` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor(service): extract common logic` |
| `test` | 테스트 추가/수정 | `test(auth): add login test cases` |
| `chore` | 빌드/설정 변경 | `chore(deps): update dependencies` |
| `perf` | 성능 개선 | `perf(api): optimize database query` |
| `ci` | CI/CD 설정 변경 | `ci: add GitHub Actions workflow` |
| `build` | 빌드 시스템 변경 | `build: update webpack config` |
| `revert` | 이전 커밋 되돌리기 | `revert: revert "feat: add feature"` |

### Type 자동 결정 로직

```typescript
function determineType(changed_files: string[], diff: string): string {
  // 1. 파일 경로 기반 분석
  const has_test_files = changed_files.some(f => 
    f.includes('.test.') || f.includes('.spec.') || f.includes('/tests/')
  );
  const has_docs_files = changed_files.some(f => 
    f.endsWith('.md') || f.includes('/docs/')
  );
  const has_config_files = changed_files.some(f => 
    f.includes('package.json') || f.includes('tsconfig.json') || 
    f.includes('.github/') || f.includes('Dockerfile')
  );

  // 2. diff 내용 분석
  const diff_lower = diff.toLowerCase();
  const has_new_feature = /\+.*function|class|export.*function|export.*class/.test(diff);
  const has_bug_fix = /fix|bug|error|exception|crash/.test(diff_lower);
  const has_refactor = /refactor|extract|rename|move/.test(diff_lower);
  const has_perf = /performance|optimize|cache|memoize/.test(diff_lower);

  // 3. 우선순위 결정
  if (has_test_files && !has_new_feature && !has_bug_fix) {
    return 'test';
  }
  if (has_docs_files && changed_files.every(f => f.endsWith('.md') || f.includes('/docs/'))) {
    return 'docs';
  }
  if (has_config_files && changed_files.every(f => 
    f.includes('package.json') || f.includes('tsconfig.json') || 
    f.includes('.github/') || f.includes('Dockerfile')
  )) {
    return 'chore';
  }
  if (has_bug_fix) {
    return 'fix';
  }
  if (has_new_feature) {
    return 'feat';
  }
  if (has_perf) {
    return 'perf';
  }
  if (has_refactor) {
    return 'refactor';
  }
  
  // 기본값
  return 'chore';
}
```

---

## Scope 결정 로직

### 파일 경로 기반 Scope 추출

```typescript
function determineScope(changed_files: string[]): string | null {
  const scope_map = new Map<string, number>();
  
  for (const file of changed_files) {
    let scope: string | null = null;
    
    // packages/plugin/src/App.tsx → plugin
    if (file.startsWith('packages/')) {
      const parts = file.split('/');
      if (parts.length >= 2) {
        scope = parts[1]; // plugin, mcp-server 등
      }
    }
    // .cursor/rules/main-orchestrator.mdc → rules
    else if (file.startsWith('.cursor/')) {
      const parts = file.split('/');
      if (parts.length >= 2) {
        scope = parts[1]; // rules, skills 등
      }
    }
    // src/services/auth-service.ts → services
    else if (file.startsWith('src/')) {
      const parts = file.split('/');
      if (parts.length >= 2) {
        scope = parts[1]; // services, controllers, components 등
      }
    }
    // 루트 파일은 scope 없음
    else {
      continue;
    }
    
    if (scope) {
      scope_map.set(scope, (scope_map.get(scope) || 0) + 1);
    }
  }
  
  // 가장 많이 변경된 scope 반환
  if (scope_map.size === 0) {
    return null; // scope 없음
  }
  
  const sorted_scopes = Array.from(scope_map.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // 단일 scope가 명확하면 반환, 여러 scope면 null
  if (sorted_scopes.length === 1 || sorted_scopes[0][1] > sorted_scopes[1][1] * 2) {
    return sorted_scopes[0][0];
  }
  
  return null; // 여러 scope에 걸쳐 변경
}
```

### Scope 예시

```typescript
// 예시 1: 단일 패키지 변경
changed_files = ['packages/plugin/src/App.tsx', 'packages/plugin/src/utils.ts'];
// → scope: 'plugin'

// 예시 2: 여러 패키지 변경
changed_files = ['packages/plugin/src/App.tsx', 'packages/mcp-server/src/index.ts'];
// → scope: null (여러 scope)

// 예시 3: .cursor 디렉토리 변경
changed_files = ['.cursor/rules/main-orchestrator.mdc', '.cursor/skills/qa/references/test-strategy.md'];
// → scope: null (여러 scope)

// 예시 4: 단일 모듈 변경
changed_files = ['src/services/auth-service.ts', 'src/services/user-service.ts'];
// → scope: 'services'
```

---

## Subject 작성 규칙

### 규칙

1. **명령형 사용**: "add", "fix", "update" (과거형 금지)
2. **소문자 시작**: 첫 글자 대문자 금지
3. **50자 이내**: 간결하고 명확하게
4. **마침표 생략**: 끝에 마침표 없음
5. **구체적**: 무엇을 변경했는지 명확히

### ✅ 좋은 예

```markdown
feat(auth): add JWT token refresh
fix(api): handle null response gracefully
docs(readme): update installation guide
refactor(service): extract common validation logic
perf(api): optimize database query with index
```

### ❌ 나쁜 예

```markdown
feat(auth): Added JWT token refresh.  # 과거형, 마침표
fix: bug fix  # 너무 모호함
docs: update  # 무엇을 업데이트했는지 불명확
feat: add feature  # scope 없음, subject 모호
feat(auth): add JWT token refresh functionality for better user experience  # 50자 초과
```

---

## Body 작성 규칙

### 언제 Body를 작성하는가?

- 변경 이유가 복잡할 때
- Breaking Changes가 있을 때
- Before/After 비교가 필요할 때
- 여러 변경사항을 설명할 때

### Body 구조

```markdown
<type>(<scope>): <subject>

변경 이유를 한 문장으로 설명합니다.

변경 사항:
- 구체적인 변경 1
- 구체적인 변경 2
- 구체적인 변경 3

Before/After (필요 시):
Before: 기존 동작
After: 새로운 동작
```

### ✅ 좋은 예

```markdown
feat(auth): add JWT token refresh

사용자 세션을 유지하기 위해 JWT 토큰 자동 갱신 기능을 추가했습니다.

변경 사항:
- RefreshTokenService 클래스 추가
- 토큰 만료 5분 전 자동 갱신 로직 구현
- 로컬 스토리지에 refresh token 저장

Closes #42
```

```markdown
fix(api): handle null response gracefully

API 응답이 null일 때 크래시를 방지하기 위해 null 체크를 추가했습니다.

Before: null 응답 시 JSON.parse()에서 에러 발생
After: null 체크 후 적절한 에러 메시지 반환

Fixes #123
```

### ❌ 나쁜 예

```markdown
feat(auth): add JWT token refresh

변경했습니다.  # 너무 모호함, 변경 이유 불명확
```

```markdown
fix(api): handle null response

수정했습니다.  # 무엇을 수정했는지 불명확
```

---

## Footer 작성 규칙

### 이슈 번호 자동 연결

#### 이슈 번호 추출 방법

```typescript
function extractIssueNumbers(
  commit_message: string,
  changed_files: string[],
  diff: string
): number[] {
  const issues = new Set<number>();
  
  // 1. 커밋 메시지에서 추출
  const commit_patterns = [
    /(?:Closes|Fixes|Resolves|Refs)\s+#(\d+)/gi,
    /#(\d+)/g  // 단순 #123 형식
  ];
  
  for (const pattern of commit_patterns) {
    const matches = commit_message.matchAll(pattern);
    for (const match of matches) {
      issues.add(parseInt(match[1], 10));
    }
  }
  
  // 2. 파일 내용에서 추출 (주석, 코드)
  for (const file of changed_files) {
    const content = readFile(file);
    const file_matches = content.matchAll(/#(\d+)/g);
    for (const match of file_matches) {
      issues.add(parseInt(match[1], 10));
    }
  }
  
  // 3. diff에서 추출
  const diff_matches = diff.matchAll(/#(\d+)/g);
  for (const match of diff_matches) {
    issues.add(parseInt(match[1], 10));
  }
  
  return Array.from(issues).sort((a, b) => a - b);
}
```

#### Footer 형식

```markdown
Closes #123
Fixes #456
Refs #789

Co-authored-by: Name <email@example.com>

BREAKING CHANGE: description of breaking change
```

### Breaking Changes 명시

```markdown
feat(api): change response format

API 응답 형식을 변경했습니다.

BREAKING CHANGE: API 응답이 `{ data: {...} }` 형식에서 `{ id, name, email }` 형식으로 변경되었습니다.
기존 코드는 마이그레이션이 필요합니다.

Closes #42
```

---

## 완전한 커밋 메시지 예시

### 예시 1: 새 기능 (Feature)

```markdown
feat(plugin): add dark mode toggle

사용자가 다크 모드를 켜고 끌 수 있는 토글 버튼을 추가했습니다.

변경 사항:
- ThemeToggle 컴포넌트 추가
- 로컬 스토리지에 테마 설정 저장
- 시스템 테마 감지 기능 추가

테스트:
- 단위 테스트 5개 통과
- 커버리지 90%

Closes #42
```

### 예시 2: 버그 수정 (Bugfix)

```markdown
fix(auth): handle null user in login

로그인 시 존재하지 않는 사용자 조회 시 null 체크를 추가하여
크래시를 방지했습니다.

Before: getUserByEmail()가 null 반환 시 크래시
After: null 체크 후 적절한 에러 메시지 반환

Fixes #123
```

### 예시 3: 리팩토링

```markdown
refactor(service): extract common validation logic

중복된 검증 로직을 공통 함수로 추출하여 코드 중복을 제거했습니다.

변경 사항:
- validateEmail(), validatePassword() 함수 추출
- AuthService와 UserService에서 공통 사용
- 테스트 커버리지 유지 (85%)

Refs #456
```

### 예시 4: 문서화

```markdown
docs(readme): update installation guide

Node.js 버전 요구사항과 설치 단계를 업데이트했습니다.

변경 사항:
- Node.js 18+ 요구사항 명시
- Docker 설치 방법 추가
- 문제 해결 섹션 추가
```

### 예시 5: 성능 개선

```markdown
perf(api): optimize database query with index

사용자 조회 쿼리 성능을 개선하기 위해 인덱스를 추가했습니다.

변경 사항:
- users 테이블에 email 컬럼 인덱스 추가
- 쿼리 응답 시간 500ms → 50ms로 개선

Closes #789
```

### 예시 6: Breaking Changes

```markdown
feat(api): change user creation API signature

사용자 생성 API 시그니처를 변경하여 더 유연한 데이터 입력을 지원합니다.

BREAKING CHANGE: `createUser(email: string)` → `createUser(data: UserData)`
기존 코드는 마이그레이션이 필요합니다:

```typescript
// Before
createUser('user@example.com');

// After
createUser({ email: 'user@example.com', name: 'User' });
```

Closes #42
```

### 예시 7: 테스트 추가

```markdown
test(auth): add login test cases

로그인 기능에 대한 테스트 케이스를 추가했습니다.

변경 사항:
- 성공 케이스 테스트 추가
- 실패 케이스 테스트 추가 (잘못된 비밀번호, 존재하지 않는 사용자)
- 커버리지 70% → 90%로 증가
```

### 예시 8: 설정 변경

```markdown
chore(deps): update dependencies

보안 취약점을 해결하기 위해 의존성을 업데이트했습니다.

변경 사항:
- react: 18.0.0 → 18.2.0
- typescript: 5.0.0 → 5.3.0
- eslint: 8.50.0 → 8.55.0

보안:
- CVE-2024-1234 해결
```

### 예시 9: 여러 Scope 변경

```markdown
feat: add user authentication system

사용자 인증 시스템을 추가했습니다. 여러 모듈에 걸쳐 변경이 있습니다.

변경 사항:
- plugin: AuthService 추가
- mcp-server: 인증 미들웨어 추가
- docs: 인증 가이드 추가

Closes #42
```

### 예시 10: 되돌리기

```markdown
revert: revert "feat(auth): add JWT token refresh"

이 커밋은 JWT 토큰 갱신 기능에 버그가 발견되어 되돌립니다.

Reverts commit abc123def456
```

---

## 자동 생성 프로세스

### 1단계: 변경 사항 수집

```typescript
interface ChangeInfo {
  changed_files: string[];
  diff: string;
  developer_summary?: string;
  qa_results?: {
    tests_passed: number;
    coverage: number;
  };
}
```

### 2단계: Type/Scope 결정

```typescript
const type = determineType(change_info.changed_files, change_info.diff);
const scope = determineScope(change_info.changed_files);
```

### 3단계: Subject 생성

```typescript
function generateSubject(
  type: string,
  scope: string | null,
  changed_files: string[],
  developer_summary?: string
): string {
  // Developer 요약이 있으면 활용
  if (developer_summary) {
    return formatSubject(developer_summary, type, scope);
  }
  
  // 파일명 기반 추론
  const main_file = changed_files[0];
  const action = getActionFromType(type); // feat → add, fix → fix
  const feature = extractFeatureFromFile(main_file);
  
  return `${action} ${feature}`;
}
```

### 4단계: Body 생성

```typescript
function generateBody(
  change_info: ChangeInfo,
  subject: string
): string {
  const body_parts: string[] = [];
  
  // Developer 요약 활용
  if (change_info.developer_summary) {
    body_parts.push(change_info.developer_summary);
  }
  
  // 변경 사항 목록
  const changes = extractChanges(change_info.diff);
  if (changes.length > 0) {
    body_parts.push('\n변경 사항:');
    changes.forEach(change => {
      body_parts.push(`- ${change}`);
    });
  }
  
  // QA 결과 (해당 시)
  if (change_info.qa_results) {
    body_parts.push('\n테스트:');
    body_parts.push(`- 단위 테스트 ${change_info.qa_results.tests_passed}개 통과`);
    body_parts.push(`- 커버리지 ${change_info.qa_results.coverage}%`);
  }
  
  return body_parts.join('\n');
}
```

### 5단계: Footer 생성

```typescript
function generateFooter(
  commit_message: string,
  changed_files: string[],
  diff: string
): string {
  const footer_parts: string[] = [];
  
  // 이슈 번호 추출 및 추가
  const issues = extractIssueNumbers(commit_message, changed_files, diff);
  issues.forEach(issue => {
    footer_parts.push(`Closes #${issue}`);
  });
  
  // Breaking Changes 확인
  if (hasBreakingChanges(diff)) {
    footer_parts.push('\nBREAKING CHANGE: [설명]');
  }
  
  return footer_parts.join('\n');
}
```

---

## 주의사항

### 1. Type 선택 주의

- **feat vs fix**: 새 기능이면 `feat`, 버그 수정이면 `fix`
- **refactor vs fix**: 기능 변경 없이 코드만 개선하면 `refactor`
- **docs vs chore**: 문서만 변경하면 `docs`, 설정 변경이면 `chore`

### 2. Scope 사용 주의

- 여러 패키지/모듈에 걸쳐 변경 시 scope 생략
- 루트 파일 변경 시 scope 생략
- 너무 세분화된 scope 지양 (예: `feat(utils/helpers/string)`)

### 3. Subject 작성 주의

- 50자 초과 시 Body로 이동
- 과거형 사용 금지
- 마침표 사용 금지
- 이모지 사용 금지 (일부 프로젝트 제외)

### 4. Body 작성 주의

- 불필요한 Body 작성 지양 (간단한 변경은 Subject만으로 충분)
- 코드 블록은 필요한 경우만
- 너무 길지 않게 (3-5줄 권장)

---

## 체크리스트

커밋 메시지 생성 완료 후:

### 형식
- [ ] Conventional Commits 형식 준수
- [ ] Type이 올바르게 선택됨
- [ ] Scope가 적절함 (또는 생략됨)
- [ ] Subject가 50자 이내
- [ ] Subject가 소문자로 시작
- [ ] Subject에 마침표 없음

### 내용
- [ ] 변경 사항을 명확히 설명
- [ ] Body가 필요한 경우 적절히 작성됨
- [ ] 이슈 번호가 올바르게 연결됨
- [ ] Breaking Changes가 있으면 명시됨

### 검증
- [ ] git log에서 읽기 쉬움
- [ ] CHANGELOG 생성에 적합함
- [ ] 이슈 추적에 적합함

---

## 파일 생성 프로세스

### 1. 디렉토리 확인 및 생성

파일 생성 전 `.cursor/temp/` 디렉토리가 존재하는지 확인합니다. Write tool을 사용하면 중간 디렉토리가 자동 생성되지만, 명시적으로 확인하는 것이 좋습니다.

```typescript
// 의사코드
const temp_dir = '.cursor/temp/';
// Write tool 사용 시 자동 생성되므로 별도 확인 불필요
```

### 2. 커밋 메시지 파일 생성

생성된 커밋 메시지를 `.cursor/temp/COMMIT_MESSAGE.md` 파일로 저장합니다.

**파일 경로**: `.cursor/temp/COMMIT_MESSAGE.md`

**Write tool 사용 예시**:
```markdown
Write tool 사용:
- path: "d:/personal/.cursor/temp/COMMIT_MESSAGE.md"
- contents: [생성된 커밋 메시지 내용]
```

**주의사항**:
- 절대 경로 사용 권장 (Windows: `d:/personal/.cursor/temp/COMMIT_MESSAGE.md`)
- Write tool은 중간 디렉토리를 자동 생성하므로 별도 mkdir 불필요
- 파일 생성 후 사용자에게 경로 안내

### 3. 사용자 안내 메시지

파일 생성 완료 후 사용자에게 다음 형식으로 안내:

```markdown
커밋 메시지가 .cursor/temp/COMMIT_MESSAGE.md에 저장되었습니다.

다음 명령어로 커밋을 실행할 수 있습니다:
```powershell
git commit -F .cursor/temp/COMMIT_MESSAGE.md
```
```

## 완료 기준

다음 모든 항목 만족 시 커밋 메시지 생성 완료:

- [ ] Conventional Commits 형식 준수
- [ ] Type/Scope 올바르게 결정
- [ ] Subject 명확하고 간결
- [ ] Body 필요 시 적절히 작성
- [ ] Footer에 이슈 번호 포함 (해당 시)
- [ ] Breaking Changes 명시 (해당 시)
- [ ] `.cursor/temp/COMMIT_MESSAGE.md` 파일 생성 완료
- [ ] 사용자에게 파일 경로 및 사용법 안내 완료