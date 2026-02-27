---
name: pr-description-generation
description: Pull Request 설명 자동 생성 가이드
---

# PR 설명 생성 가이드

이 Skill은 Git 워크플로우 에이전트가 커밋 메시지를 기반으로 PR 설명을 생성하는 방법을 제공합니다.

## 목적

- 커밋 메시지를 PR 설명으로 확장
- 변경 사항을 상세히 설명
- QA 결과 통합
- 리뷰어를 위한 컨텍스트 제공
- 이슈 추적 및 체크리스트 관리

## 사용 시점

- PR을 생성할 때
- 커밋 메시지 생성 후
- QA 단계 완료 후
- 여러 커밋을 하나의 PR로 묶을 때

---

## PR 설명 템플릿 구조

### 기본 템플릿

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

---

## 커밋 메시지 → PR 설명 확장

### 확장 전략

```typescript
interface CommitMessage {
  type: string;
  scope: string | null;
  subject: string;
  body: string | null;
  footer: string | null;
}

interface PRDescription {
  summary: string;
  change_type: string[];
  detailed_description: string;
  test_results: TestResults | null;
  related_issues: number[];
  review_points: string[];
}

function expandCommitToPR(
  commit: CommitMessage,
  change_info: ChangeInfo,
  qa_results?: QAResults
): PRDescription {
  // 1. 요약 생성 (Subject 기반)
  const summary = generateSummary(commit.subject, commit.body);
  
  // 2. 변경 유형 결정
  const change_type = determineChangeType(commit.type);
  
  // 3. 상세 설명 생성
  const detailed_description = generateDetailedDescription(
    commit.body,
    change_info
  );
  
  // 4. 테스트 결과 통합
  const test_results = qa_results ? formatQAResults(qa_results) : null;
  
  // 5. 이슈 번호 추출
  const related_issues = extractIssues(commit.footer);
  
  // 6. 리뷰 포인트 추출
  const review_points = extractReviewPoints(change_info);
  
  return {
    summary,
    change_type,
    detailed_description,
    test_results,
    related_issues,
    review_points
  };
}
```

### 요약 생성

```typescript
function generateSummary(
  subject: string,
  body: string | null
): string {
  // Body의 첫 문장이 있으면 활용
  if (body) {
    const first_sentence = body.split('\n')[0];
    if (first_sentence.length <= 100) {
      return first_sentence;
    }
  }
  
  // Subject를 문장으로 확장
  return expandSubjectToSentence(subject);
}

function expandSubjectToSentence(subject: string): string {
  // "feat(auth): add JWT token refresh"
  // → "JWT 토큰 갱신 기능을 추가했습니다."
  
  const patterns = [
    { pattern: /^feat.*add (.+)/i, template: '$1 기능을 추가했습니다.' },
    { pattern: /^fix.*fix (.+)/i, template: '$1 문제를 수정했습니다.' },
    { pattern: /^refactor.*refactor (.+)/i, template: '$1를 리팩토링했습니다.' },
    { pattern: /^perf.*optimize (.+)/i, template: '$1 성능을 개선했습니다.' },
  ];
  
  for (const { pattern, template } of patterns) {
    const match = subject.match(pattern);
    if (match) {
      return template.replace('$1', match[1]);
    }
  }
  
  return subject; // 기본값
}
```

---

## QA 결과 통합

### QA 결과 형식

```typescript
interface QAResults {
  tests_passed: number;
  tests_total: number;
  coverage: number;
  linter_errors: number;
  test_details?: {
    unit_tests: { passed: number; total: number };
    integration_tests: { passed: number; total: number };
    e2e_tests?: { passed: number; total: number };
  };
  issues_found?: string[];
}
```

### 테스트 결과 섹션 생성

```typescript
function formatQAResults(qa_results: QAResults): string {
  const sections: string[] = [];
  
  sections.push('### 테스트 결과');
  sections.push('');
  
  // 단위 테스트
  if (qa_results.test_details?.unit_tests) {
    const { passed, total } = qa_results.test_details.unit_tests;
    const status = passed === total ? '✅' : '❌';
    sections.push(`- [${status}] 단위 테스트 통과 (${passed}/${total})`);
  }
  
  // 통합 테스트
  if (qa_results.test_details?.integration_tests) {
    const { passed, total } = qa_results.test_details.integration_tests;
    const status = passed === total ? '✅' : '❌';
    sections.push(`- [${status}] 통합 테스트 통과 (${passed}/${total})`);
  }
  
  // E2E 테스트
  if (qa_results.test_details?.e2e_tests) {
    const { passed, total } = qa_results.test_details.e2e_tests;
    const status = passed === total ? '✅' : '❌';
    sections.push(`- [${status}] E2E 테스트 통과 (${passed}/${total})`);
  }
  
  // 커버리지
  sections.push(`- 커버리지: ${qa_results.coverage}%`);
  
  // Linter 오류
  const linter_status = qa_results.linter_errors === 0 ? '✅' : '❌';
  sections.push(`- [${linter_status}] Linter 오류: ${qa_results.linter_errors}개`);
  
  // 발견된 이슈
  if (qa_results.issues_found && qa_results.issues_found.length > 0) {
    sections.push('');
    sections.push('### 발견된 이슈');
    qa_results.issues_found.forEach(issue => {
      sections.push(`- ${issue}`);
    });
  }
  
  return sections.join('\n');
}
```

### 예시 출력

```markdown
### 테스트 결과

- [✅] 단위 테스트 통과 (45/45)
- [✅] 통합 테스트 통과 (12/12)
- [✅] E2E 테스트 통과 (5/5)
- 커버리지: 87.5%
- [✅] Linter 오류: 0개
```

---

## 리뷰 포인트 자동 추출

### 추출 로직

```typescript
function extractReviewPoints(change_info: ChangeInfo): string[] {
  const points: string[] = [];
  const { changed_files, diff } = change_info;
  
  // 1. Breaking Changes 감지
  if (hasBreakingChanges(diff)) {
    points.push('⚠️ Breaking Changes가 포함되어 있습니다. 마이그레이션 가이드를 확인해주세요.');
  }
  
  // 2. 보안 관련 변경
  if (isSecurityRelated(changed_files, diff)) {
    points.push('🔒 보안 관련 변경사항입니다. 특히 주의 깊게 리뷰해주세요.');
  }
  
  // 3. 성능 관련 변경
  if (isPerformanceRelated(diff)) {
    points.push('⚡ 성능 관련 변경사항입니다. 벤치마크 결과를 확인해주세요.');
  }
  
  // 4. 복잡한 로직
  const complex_functions = findComplexFunctions(diff);
  if (complex_functions.length > 0) {
    points.push(`🧩 복잡한 로직이 포함되어 있습니다: ${complex_functions.join(', ')}`);
  }
  
  // 5. 테스트 커버리지 부족
  if (change_info.qa_results && change_info.qa_results.coverage < 80) {
    points.push(`📊 테스트 커버리지가 낮습니다 (${change_info.qa_results.coverage}%). 추가 테스트를 고려해주세요.`);
  }
  
  // 6. 외부 API 변경
  if (hasAPIChanges(diff)) {
    points.push('🌐 API 변경사항이 포함되어 있습니다. API 문서 업데이트를 확인해주세요.');
  }
  
  return points;
}

function hasBreakingChanges(diff: string): boolean {
  const breaking_patterns = [
    /BREAKING CHANGE/i,
    /breaking/i,
    /deprecated/i,
    /remove|removed/i,
    /delete|deleted/i
  ];
  
  return breaking_patterns.some(pattern => pattern.test(diff));
}

function isSecurityRelated(files: string[], diff: string): boolean {
  const security_keywords = [
    /auth|authentication|authorization/i,
    /password|token|jwt|session/i,
    /encrypt|decrypt|hash/i,
    /csrf|xss|sql injection/i,
    /sanitize|validate|verify/i
  ];
  
  const security_files = files.some(f => 
    f.includes('auth') || f.includes('security') || f.includes('middleware')
  );
  
  return security_files || security_keywords.some(pattern => pattern.test(diff));
}
```

---

## Breaking Changes 감지 및 명시

### 감지 로직

```typescript
interface BreakingChange {
  type: 'api_signature' | 'behavior' | 'removal' | 'deprecation';
  description: string;
  migration_guide?: string;
}

function detectBreakingChanges(
  changed_files: string[],
  diff: string
): BreakingChange[] {
  const breaking_changes: BreakingChange[] = [];
  
  // 1. API 시그니처 변경 감지
  const api_changes = detectAPISignatureChanges(diff);
  breaking_changes.push(...api_changes);
  
  // 2. 동작 변경 감지
  const behavior_changes = detectBehaviorChanges(diff);
  breaking_changes.push(...behavior_changes);
  
  // 3. 제거 감지
  const removals = detectRemovals(diff);
  breaking_changes.push(...removals);
  
  // 4. Deprecation 감지
  const deprecations = detectDeprecations(diff);
  breaking_changes.push(...deprecations);
  
  return breaking_changes;
}

function detectAPISignatureChanges(diff: string): BreakingChange[] {
  const changes: BreakingChange[] = [];
  
  // 함수 시그니처 변경 패턴
  const signature_pattern = /function\s+(\w+)\s*\([^)]*\)\s*:\s*[^{]*\{/g;
  const old_signatures = extractOldSignatures(diff);
  const new_signatures = extractNewSignatures(diff);
  
  // 매칭하여 변경된 시그니처 찾기
  for (const [func_name, old_sig] of old_signatures) {
    const new_sig = new_signatures.get(func_name);
    if (new_sig && old_sig !== new_sig) {
      changes.push({
        type: 'api_signature',
        description: `\`${func_name}()\` 함수 시그니처가 변경되었습니다.`,
        migration_guide: generateMigrationGuide(func_name, old_sig, new_sig)
      });
    }
  }
  
  return changes;
}
```

### Breaking Changes 섹션 생성

```typescript
function formatBreakingChanges(
  breaking_changes: BreakingChange[]
): string {
  if (breaking_changes.length === 0) {
    return '';
  }
  
  const sections: string[] = [];
  sections.push('## ⚠️ Breaking Changes');
  sections.push('');
  sections.push('이 PR에는 Breaking Changes가 포함되어 있습니다. 마이그레이션이 필요합니다.');
  sections.push('');
  
  breaking_changes.forEach((change, index) => {
    sections.push(`### ${index + 1}. ${change.type}`);
    sections.push('');
    sections.push(change.description);
    
    if (change.migration_guide) {
      sections.push('');
      sections.push('**마이그레이션 가이드:**');
      sections.push('');
      sections.push('```typescript');
      sections.push(change.migration_guide);
      sections.push('```');
    }
    
    sections.push('');
  });
  
  return sections.join('\n');
}
```

---

## 테스트 계획 작성 가이드

### 테스트 계획 템플릿

```markdown
## 테스트 계획

### 단위 테스트
- [ ] [기능 1] 테스트 케이스 작성
- [ ] [기능 2] 테스트 케이스 작성

### 통합 테스트
- [ ] [시나리오 1] 테스트
- [ ] [시나리오 2] 테스트

### 수동 테스트
- [ ] [시나리오 1] 브라우저에서 확인
- [ ] [시나리오 2] 다양한 입력값으로 확인

### 성능 테스트
- [ ] [시나리오 1] 응답 시간 측정
- [ ] [시나리오 2] 메모리 사용량 확인
```

### 자동 생성 로직

```typescript
function generateTestPlan(change_info: ChangeInfo): string {
  const sections: string[] = [];
  sections.push('## 테스트 계획');
  sections.push('');
  
  // 변경된 기능 기반 테스트 계획 생성
  const features = extractFeatures(change_info.diff);
  
  features.forEach(feature => {
    sections.push(`### ${feature.name}`);
    sections.push('');
    
    // 단위 테스트
    sections.push('**단위 테스트:**');
    feature.test_cases.forEach(test_case => {
      sections.push(`- [ ] ${test_case}`);
    });
    
    sections.push('');
    
    // 통합 테스트
    if (feature.integration_scenarios.length > 0) {
      sections.push('**통합 테스트:**');
      feature.integration_scenarios.forEach(scenario => {
        sections.push(`- [ ] ${scenario}`);
      });
      sections.push('');
    }
  });
  
  return sections.join('\n');
}
```

---

## 완전한 PR 설명 예시

### 예시 1: 새 기능 (Feature)

```markdown
## 변경 사항 요약

사용자 인증 시스템을 추가했습니다. JWT 토큰 기반 인증을 지원합니다.

## 변경 유형

- [x] 새 기능 (feature)

## 상세 설명

### 변경 내용

- **AuthService**: 로그인/로그아웃 비즈니스 로직 구현
  - `login(email, password)`: 사용자 인증 및 JWT 토큰 생성
  - `logout(token)`: 토큰 무효화
  - `refreshToken(refreshToken)`: 토큰 갱신

- **AuthController**: REST API 엔드포인트 추가
  - `POST /api/auth/login`: 로그인
  - `POST /api/auth/logout`: 로그아웃
  - `POST /api/auth/refresh`: 토큰 갱신

- **JWT 미들웨어**: 토큰 검증 미들웨어 구현
  - 요청 헤더에서 토큰 추출
  - 토큰 검증 및 사용자 정보 주입

### 변경 이유

사용자 인증 기능이 필요하여 구현했습니다. JWT 토큰을 사용하여 stateless 인증을 구현했습니다.

### 테스트 결과

- [✅] 단위 테스트 통과 (15/15)
- [✅] 통합 테스트 통과 (5/5)
- 커버리지: 85%
- [✅] Linter 오류: 0개

### 체크리스트

- [x] 코드 리뷰 완료
- [x] 테스트 통과
- [ ] 문서 업데이트 (Docs 에이전트가 처리)
- [ ] CHANGELOG 업데이트 (Docs 에이전트가 처리)

## 관련 이슈

Closes #42

## 리뷰 포인트

- 🔒 보안 관련 변경사항입니다. 특히 주의 깊게 리뷰해주세요.
  - JWT 토큰 만료 시간 설정 (현재 1시간)
  - 비밀번호 해싱 알고리즘 (bcrypt, 10 rounds)
  - 에러 메시지 보안 고려 (사용자 정보 노출 방지)
- 📊 테스트 커버리지가 85%입니다. 엣지 케이스 테스트를 추가로 고려해주세요.
```

### 예시 2: 버그 수정 (Bugfix)

```markdown
## 변경 사항 요약

로그인 시 존재하지 않는 사용자 처리 버그를 수정했습니다.

## 변경 유형

- [x] 버그 수정 (bugfix)

## 상세 설명

### 버그 설명

존재하지 않는 이메일로 로그인 시도 시 `getUserByEmail()`이 null을 반환하고, 이를 처리하지 않아 크래시가 발생했습니다.

**재현 단계:**
1. 존재하지 않는 이메일로 로그인 시도
2. `getUserByEmail()`이 null 반환
3. `user.password` 접근 시 TypeError 발생

### 수정 내용

- `login()` 함수에 null 체크 추가
- 적절한 에러 메시지 반환 (보안 고려: "이메일 또는 비밀번호가 잘못되었습니다")
- 에러 로깅 추가

**수정 전:**
```typescript
const user = await getUserByEmail(email);
if (user.password !== hashedPassword) {
  throw new Error('Invalid password');
}
```

**수정 후:**
```typescript
const user = await getUserByEmail(email);
if (!user) {
  logger.warn('Login attempt with non-existent email', { email });
  throw new AuthenticationError('이메일 또는 비밀번호가 잘못되었습니다');
}
if (user.password !== hashedPassword) {
  throw new AuthenticationError('이메일 또는 비밀번호가 잘못되었습니다');
}
```

### 테스트 결과

- [✅] 단위 테스트 통과 (기존 테스트 + 새 테스트 2개)
- [✅] 버그 재현 테스트 통과
- 커버리지: 88% (기존 85%에서 증가)
- [✅] Linter 오류: 0개

### 체크리스트

- [x] 코드 리뷰 완료
- [x] 테스트 통과
- [x] 버그 재현 테스트 통과
- [ ] 문서 업데이트 (해당 없음)

## 관련 이슈

Fixes #123

## 리뷰 포인트

- 에러 메시지가 보안상 적절한지 확인 (사용자 정보 노출 방지)
- 다른 곳에서도 유사한 null 체크가 필요한지 확인
- 에러 로깅이 적절한지 확인 (민감 정보 제외)
```

### 예시 3: Breaking Changes 포함

```markdown
## 변경 사항 요약

사용자 생성 API 시그니처를 변경하여 더 유연한 데이터 입력을 지원합니다.

## 변경 유형

- [x] 새 기능 (feature)

## ⚠️ Breaking Changes

이 PR에는 Breaking Changes가 포함되어 있습니다. 마이그레이션이 필요합니다.

### 1. API 시그니처 변경

`createUser()` 함수 시그니처가 변경되었습니다.

**마이그레이션 가이드:**

```typescript
// Before
const user = await createUser('user@example.com');

// After
const user = await createUser({
  email: 'user@example.com',
  name: 'User Name'
});
```

### 2. 동작 변경

이메일 검증 로직이 더 엄격해졌습니다. RFC 5322 표준을 준수하지 않는 이메일은 거부됩니다.

**마이그레이션 가이드:**

기존에 허용되던 비표준 이메일 형식은 더 이상 사용할 수 없습니다. 이메일 형식을 확인해주세요.

## 상세 설명

### 변경 내용

- `createUser()` 함수 시그니처 변경
- 이메일 검증 로직 강화
- 이름 필드 필수화

### 변경 이유

더 유연한 사용자 데이터 입력을 지원하고, 데이터 일관성을 향상시키기 위해 변경했습니다.

### 테스트 결과

- [✅] 단위 테스트 통과 (20/20)
- [✅] 통합 테스트 통과 (8/8)
- 커버리지: 90%
- [✅] Linter 오류: 0개

### 체크리스트

- [x] 코드 리뷰 완료
- [x] 테스트 통과
- [x] 마이그레이션 가이드 작성
- [ ] 문서 업데이트 (Docs 에이전트가 처리)
- [ ] CHANGELOG 업데이트 (Docs 에이전트가 처리)

## 관련 이슈

Closes #42

## 리뷰 포인트

- ⚠️ Breaking Changes가 포함되어 있습니다. 마이그레이션 가이드를 확인해주세요.
- 🌐 API 변경사항이 포함되어 있습니다. API 문서 업데이트를 확인해주세요.
- 🔒 이메일 검증 로직 변경으로 인한 보안 영향 확인
```

---

## 주의사항

### 1. 커밋 메시지와의 일관성

- PR 설명은 커밋 메시지를 확장한 것이어야 함
- 커밋 메시지와 내용이 일치해야 함
- 커밋 메시지의 정보를 반복하되, 더 상세히 설명

### 2. 체크리스트 관리

- 체크리스트는 실제로 확인 가능한 항목만 포함
- 자동화된 항목은 체크 표시 (예: 테스트 통과)
- 수동 확인 필요한 항목은 비워두기

### 3. 리뷰 포인트 작성

- 구체적이고 실행 가능한 포인트 제공
- 리뷰어가 집중해야 할 부분 명확히 표시
- 너무 많지 않게 (3-5개 권장)

### 4. Breaking Changes 명시

- Breaking Changes가 있으면 반드시 명시
- 마이그레이션 가이드 포함
- 영향 범위 명확히 설명

---

## 체크리스트

PR 설명 생성 완료 후:

### 내용
- [ ] 변경 사항 요약이 명확함
- [ ] 변경 유형이 올바르게 표시됨
- [ ] 상세 설명이 충분함
- [ ] 테스트 결과가 포함됨 (해당 시)
- [ ] Breaking Changes가 명시됨 (해당 시)

### 형식
- [ ] 템플릿 구조 준수
- [ ] 마크다운 형식 올바름
- [ ] 코드 블록이 적절히 사용됨
- [ ] 체크리스트 항목이 적절함

### 통합
- [ ] 커밋 메시지와 일관성 유지
- [ ] QA 결과가 통합됨
- [ ] 이슈 번호가 연결됨
- [ ] 리뷰 포인트가 추출됨

---

## 파일 생성 프로세스

### 1. 디렉토리 확인 및 생성

파일 생성 전 `.cursor/temp/` 디렉토리가 존재하는지 확인합니다. Write tool을 사용하면 중간 디렉토리가 자동 생성되지만, 명시적으로 확인하는 것이 좋습니다.

```typescript
// 의사코드
const temp_dir = '.cursor/temp/';
// Write tool 사용 시 자동 생성되므로 별도 확인 불필요
```

### 2. PR 설명 파일 생성

생성된 PR 설명을 `.cursor/temp/PR_DESCRIPTION.md` 파일로 저장합니다.

**파일 경로**: `.cursor/temp/PR_DESCRIPTION.md`

**Write tool 사용 예시**:
```markdown
Write tool 사용:
- path: "d:/personal/.cursor/temp/PR_DESCRIPTION.md"
- contents: [생성된 PR 설명 내용]
```

**주의사항**:
- 절대 경로 사용 권장 (Windows: `d:/personal/.cursor/temp/PR_DESCRIPTION.md`)
- Write tool은 중간 디렉토리를 자동 생성하므로 별도 mkdir 불필요
- 파일 생성 후 사용자에게 경로 안내

### 3. 사용자 안내 메시지

파일 생성 완료 후 사용자에게 다음 형식으로 안내:

```markdown
PR 설명이 .cursor/temp/PR_DESCRIPTION.md에 저장되었습니다.

GitHub/GitLab에서 PR을 생성할 때 이 파일의 내용을 복사하여 사용하세요.
```

## 완료 기준

다음 모든 항목 만족 시 PR 설명 생성 완료:

- [ ] 커밋 메시지를 기반으로 확장됨
- [ ] 변경 사항이 상세히 설명됨
- [ ] QA 결과가 통합됨 (해당 시)
- [ ] Breaking Changes가 명시됨 (해당 시)
- [ ] 리뷰 포인트가 추출됨
- [ ] 이슈 번호가 연결됨
- [ ] 체크리스트가 포함됨
- [ ] `.cursor/temp/PR_DESCRIPTION.md` 파일 생성 완료
- [ ] 사용자에게 파일 경로 및 사용법 안내 완료