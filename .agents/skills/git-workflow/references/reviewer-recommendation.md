---
name: reviewer-recommendation
description: Pull Request 리뷰어 자동 추천 가이드
---

# 리뷰어 추천 가이드

이 Skill은 Git 워크플로우 에이전트가 변경된 파일을 기반으로 적절한 리뷰어를 추천하는 방법을 제공합니다.

## 목적

- 변경된 파일 기반 리뷰어 추천
- git blame을 활용한 파일 기여자 분석
- 모듈 전문가 매핑
- CODEOWNERS 규칙 준수
- 리뷰어 추천 우선순위 결정

## 사용 시점

- PR 생성 시
- 리뷰어 지정이 필요할 때
- 변경 사항 분석 후

---

## 파일 기반 리뷰어 추천

### git blame 활용

```typescript
interface FileAuthor {
  file: string;
  authors: AuthorContribution[];
}

interface AuthorContribution {
  author: string;
  email: string;
  commits: number;
  lines: number;
  last_commit_date: Date;
}

function getFileAuthors(
  file_path: string,
  since_days: number = 90
): AuthorContribution[] {
  // git blame 실행
  const blame_output = execGitCommand(`git blame --line-porcelain ${file_path}`);
  
  // git log로 최근 기여자 확인
  const since_date = new Date();
  since_date.setDate(since_date.getDate() - since_days);
  const log_output = execGitCommand(
    `git log --since="${since_date.toISOString()}" --format="%an|%ae|%H" -- ${file_path}`
  );
  
  // 기여자 통계 수집
  const author_map = new Map<string, AuthorContribution>();
  
  const log_lines = log_output.split('\n');
  for (const line of log_lines) {
    if (!line.trim()) continue;
    
    const [name, email, hash] = line.split('|');
    const key = `${name}|${email}`;
    
    if (!author_map.has(key)) {
      author_map.set(key, {
        author: name,
        email: email,
        commits: 0,
        lines: 0,
        last_commit_date: new Date()
      });
    }
    
    const author = author_map.get(key)!;
    author.commits++;
  }
  
  // blame에서 라인 수 계산
  const blame_lines = blame_output.split('\n');
  for (const line of blame_lines) {
    if (line.startsWith('author ')) {
      const author_name = line.replace('author ', '').trim();
      // 이메일 찾기
      const author_line_index = blame_lines.indexOf(line);
      const email_line = blame_lines[author_line_index + 1];
      const author_email = email_line.replace('author-mail <', '').replace('>', '').trim();
      
      const key = `${author_name}|${author_email}`;
      if (author_map.has(key)) {
        author_map.get(key)!.lines++;
      }
    }
  }
  
  return Array.from(author_map.values())
    .sort((a, b) => {
      // 최근 기여도 우선
      const recency_score_a = getRecencyScore(a.last_commit_date);
      const recency_score_b = getRecencyScore(b.last_commit_date);
      
      // 기여도 점수 계산
      const score_a = a.commits * 2 + a.lines + recency_score_a;
      const score_b = b.commits * 2 + b.lines + recency_score_b;
      
      return score_b - score_a;
    });
}

function getRecencyScore(date: Date): number {
  const days_ago = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (days_ago < 7) return 10;
  if (days_ago < 30) return 5;
  if (days_ago < 90) return 2;
  return 0;
}
```

### 파일별 리뷰어 추천

```typescript
function recommendReviewersForFiles(
  changed_files: string[],
  max_reviewers: number = 3
): ReviewerRecommendation[] {
  const file_authors_map = new Map<string, AuthorContribution[]>();
  
  // 각 파일의 기여자 수집
  for (const file of changed_files) {
    const authors = getFileAuthors(file);
    file_authors_map.set(file, authors);
  }
  
  // 기여자 점수 집계
  const author_scores = new Map<string, number>();
  
  for (const [file, authors] of file_authors_map) {
    authors.forEach(author => {
      const key = author.email;
      const current_score = author_scores.get(key) || 0;
      
      // 파일 중요도에 따른 가중치
      const file_weight = getFileWeight(file);
      const author_score = (author.commits * 2 + author.lines) * file_weight;
      
      author_scores.set(key, current_score + author_score);
    });
  }
  
  // 상위 리뷰어 선택
  const sorted_authors = Array.from(author_scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max_reviewers);
  
  return sorted_authors.map(([email, score]) => {
    // 이메일에서 이름 찾기
    const author_info = findAuthorInfo(email);
    return {
      reviewer: author_info.name,
      email: email,
      score: score,
      reason: `이 파일들의 주요 기여자입니다.`,
      files: changed_files.filter(file => 
        file_authors_map.get(file)?.some(a => a.email === email)
      )
    };
  });
}

function getFileWeight(file_path: string): number {
  // 중요한 파일에 더 높은 가중치
  if (file_path.includes('/api/') || file_path.includes('/routes/')) {
    return 1.5; // 공개 API
  }
  if (file_path.includes('/services/') || file_path.includes('/utils/')) {
    return 1.2; // 핵심 로직
  }
  if (file_path.includes('.test.') || file_path.includes('.spec.')) {
    return 0.8; // 테스트 파일
  }
  return 1.0; // 기본
}
```

---

## 모듈 전문가 매핑

### 전문가 매핑 규칙

```typescript
interface ModuleExpert {
  module: string;
  experts: Expert[];
  required: boolean; // 필수 리뷰어 여부
}

interface Expert {
  name: string;
  email: string;
  role: 'maintainer' | 'expert' | 'contributor';
  expertise_level: number; // 1-10
}

// 모듈 전문가 매핑 (프로젝트별 설정)
const MODULE_EXPERTS: Record<string, ModuleExpert> = {
  'plugin': {
    module: 'plugin',
    experts: [
      {
        name: 'Plugin Maintainer',
        email: 'plugin-maintainer@example.com',
        role: 'maintainer',
        expertise_level: 10
      },
      {
        name: 'Plugin Expert',
        email: 'plugin-expert@example.com',
        role: 'expert',
        expertise_level: 8
      }
    ],
    required: true
  },
  'mcp-server': {
    module: 'mcp-server',
    experts: [
      {
        name: 'MCP Maintainer',
        email: 'mcp-maintainer@example.com',
        role: 'maintainer',
        expertise_level: 10
      }
    ],
    required: true
  },
  'docs': {
    module: 'docs',
    experts: [
      {
        name: 'Docs Writer',
        email: 'docs-writer@example.com',
        role: 'expert',
        expertise_level: 9
      }
    ],
    required: false
  },
  '.cursor/rules': {
    module: '.cursor/rules',
    experts: [
      {
        name: 'Main Orchestrator',
        email: 'main-orchestrator@example.com',
        role: 'maintainer',
        expertise_level: 10
      }
    ],
    required: true
  }
};

function getModuleExperts(
  changed_files: string[]
): ModuleExpert[] {
  const affected_modules = new Set<string>();
  
  // 변경된 파일에서 모듈 추출
  for (const file of changed_files) {
    if (file.startsWith('packages/')) {
      const module = file.split('/')[1];
      affected_modules.add(module);
    } else if (file.startsWith('.cursor/')) {
      const module = '.cursor/rules';
      affected_modules.add(module);
    } else if (file.includes('/docs/')) {
      affected_modules.add('docs');
    }
  }
  
  // 모듈별 전문가 반환
  return Array.from(affected_modules)
    .map(module => MODULE_EXPERTS[module])
    .filter(expert => expert !== undefined);
}
```

---

## CODEOWNERS 규칙

### CODEOWNERS 파일 파싱

```typescript
interface CodeOwnerRule {
  pattern: string;
  owners: string[];
  required: boolean;
}

function parseCodeOwners(
  codeowners_path: string = '.github/CODEOWNERS'
): CodeOwnerRule[] {
  const codeowners_content = readFile(codeowners_path);
  const rules: CodeOwnerRule[] = [];
  
  const lines = codeowners_content.split('\n');
  for (const line of lines) {
    // 주석 제거
    const clean_line = line.split('#')[0].trim();
    if (!clean_line) continue;
    
    // 패턴과 소유자 분리
    const parts = clean_line.split(/\s+/);
    if (parts.length < 2) continue;
    
    const pattern = parts[0];
    const owners = parts.slice(1).map(owner => {
      // @username 형식에서 username 추출
      return owner.replace('@', '');
    });
    
    rules.push({
      pattern: pattern,
      owners: owners,
      required: true // CODEOWNERS는 기본적으로 필수
    });
  }
  
  return rules;
}

function matchCodeOwners(
  file_path: string,
  rules: CodeOwnerRule[]
): CodeOwnerRule[] {
  return rules.filter(rule => {
    // glob 패턴 매칭
    return matchGlobPattern(file_path, rule.pattern);
  });
}

function matchGlobPattern(file_path: string, pattern: string): boolean {
  // 간단한 glob 패턴 매칭 (실제로는 minimatch 같은 라이브러리 사용 권장)
  const regex_pattern = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regex_pattern}$`);
  return regex.test(file_path);
}
```

### CODEOWNERS 기반 리뷰어 추천

```typescript
function recommendReviewersFromCodeOwners(
  changed_files: string[]
): ReviewerRecommendation[] {
  const codeowners_rules = parseCodeOwners();
  const required_reviewers = new Set<string>();
  
  for (const file of changed_files) {
    const matching_rules = matchCodeOwners(file, codeowners_rules);
    matching_rules.forEach(rule => {
      rule.owners.forEach(owner => {
        required_reviewers.add(owner);
      });
    });
  }
  
  return Array.from(required_reviewers).map(owner => ({
    reviewer: owner,
    email: `${owner}@example.com`, // 실제로는 사용자 정보에서 가져옴
    score: 1000, // 필수 리뷰어는 높은 점수
    reason: 'CODEOWNERS 규칙에 따라 필수 리뷰어입니다.',
    files: changed_files.filter(file => 
      matchCodeOwners(file, codeowners_rules).some(rule => 
        rule.owners.includes(owner)
      )
    ),
    required: true
  }));
}
```

---

## 리뷰어 추천 우선순위

### 우선순위 결정 로직

```typescript
interface ReviewerRecommendation {
  reviewer: string;
  email: string;
  score: number;
  reason: string;
  files: string[];
  required?: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

function recommendReviewers(
  changed_files: string[],
  max_reviewers: number = 3
): ReviewerRecommendation[] {
  const all_recommendations: ReviewerRecommendation[] = [];
  
  // 1. CODEOWNERS 기반 필수 리뷰어
  const codeowners_reviewers = recommendReviewersFromCodeOwners(changed_files);
  all_recommendations.push(...codeowners_reviewers);
  
  // 2. 모듈 전문가
  const module_experts = getModuleExperts(changed_files);
  module_experts.forEach(module_expert => {
    module_expert.experts.forEach(expert => {
      // 이미 추가된 리뷰어 제외
      if (all_recommendations.some(r => r.email === expert.email)) {
        return;
      }
      
      all_recommendations.push({
        reviewer: expert.name,
        email: expert.email,
        score: expert.expertise_level * 100,
        reason: `${module_expert.module} 모듈 전문가입니다.`,
        files: changed_files.filter(f => f.includes(module_expert.module)),
        required: module_expert.required,
        priority: module_expert.required ? 'High' : 'Medium'
      });
    });
  });
  
  // 3. 파일 기반 리뷰어 (git blame)
  const file_based_reviewers = recommendReviewersForFiles(changed_files, 5);
  file_based_reviewers.forEach(reviewer => {
    // 이미 추가된 리뷰어 제외
    if (all_recommendations.some(r => r.email === reviewer.email)) {
      return;
    }
    
    all_recommendations.push({
      ...reviewer,
      priority: 'Medium'
    });
  });
  
  // 4. 우선순위 정렬 및 필터링
  const sorted_recommendations = all_recommendations
    .sort((a, b) => {
      // 필수 리뷰어 우선
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      
      // 점수 순
      return b.score - a.score;
    })
    .slice(0, max_reviewers);
  
  // 우선순위 할당
  sorted_recommendations.forEach((rec, index) => {
    if (rec.required) {
      rec.priority = 'High';
    } else if (index < 2) {
      rec.priority = 'High';
    } else {
      rec.priority = 'Medium';
    }
  });
  
  return sorted_recommendations;
}
```

---

## 팀 구조 반영

### 팀 구조 정의

```typescript
interface TeamStructure {
  teams: Team[];
  cross_team_reviewers: string[]; // 크로스 팀 리뷰어
}

interface Team {
  name: string;
  members: TeamMember[];
  modules: string[]; // 담당 모듈
  required_reviewers: number; // 필수 리뷰어 수
}

interface TeamMember {
  name: string;
  email: string;
  role: 'lead' | 'senior' | 'junior';
  expertise: string[]; // 전문 분야
}

const TEAM_STRUCTURE: TeamStructure = {
  teams: [
    {
      name: 'Frontend Team',
      members: [
        {
          name: 'Frontend Lead',
          email: 'frontend-lead@example.com',
          role: 'lead',
          expertise: ['react', 'typescript', 'ui']
        },
        {
          name: 'Frontend Senior',
          email: 'frontend-senior@example.com',
          role: 'senior',
          expertise: ['react', 'typescript']
        }
      ],
      modules: ['plugin', 'ui-components'],
      required_reviewers: 1
    },
    {
      name: 'Backend Team',
      members: [
        {
          name: 'Backend Lead',
          email: 'backend-lead@example.com',
          role: 'lead',
          expertise: ['api', 'database', 'security']
        }
      ],
      modules: ['mcp-server', 'api'],
      required_reviewers: 1
    },
    {
      name: 'DevOps Team',
      members: [
        {
          name: 'DevOps Lead',
          email: 'devops-lead@example.com',
          role: 'lead',
          expertise: ['ci/cd', 'infrastructure']
        }
      ],
      modules: [],
      required_reviewers: 0
    }
  ],
  cross_team_reviewers: ['tech-lead@example.com']
};

function recommendReviewersByTeam(
  changed_files: string[]
): ReviewerRecommendation[] {
  const recommendations: ReviewerRecommendation[] = [];
  
  // 변경된 파일의 모듈 식별
  const affected_modules = extractModules(changed_files);
  
  // 각 팀별로 리뷰어 추천
  for (const team of TEAM_STRUCTURE.teams) {
    const team_modules = team.modules.filter(m => affected_modules.includes(m));
    
    if (team_modules.length > 0) {
      // 팀 리더 우선
      const lead = team.members.find(m => m.role === 'lead');
      if (lead) {
        recommendations.push({
          reviewer: lead.name,
          email: lead.email,
          score: 500,
          reason: `${team.name} 리더입니다.`,
          files: changed_files.filter(f => 
            team_modules.some(m => f.includes(m))
          ),
          required: true,
          priority: 'High'
        });
      }
      
      // 시니어 멤버
      const seniors = team.members.filter(m => m.role === 'senior');
      seniors.forEach(senior => {
        recommendations.push({
          reviewer: senior.name,
          email: senior.email,
          score: 300,
          reason: `${team.name} 시니어 멤버입니다.`,
          files: changed_files.filter(f => 
            team_modules.some(m => f.includes(m))
          ),
          priority: 'Medium'
        });
      });
    }
  }
  
  // 크로스 팀 리뷰어 (큰 변경사항 시)
  if (affected_modules.length > 1) {
    TEAM_STRUCTURE.cross_team_reviewers.forEach(email => {
      recommendations.push({
        reviewer: 'Tech Lead',
        email: email,
        score: 400,
        reason: '크로스 팀 변경사항이므로 기술 리더 리뷰가 필요합니다.',
        files: changed_files,
        priority: 'High'
      });
    });
  }
  
  return recommendations;
}
```

---

## 최종 리뷰어 추천

### 통합 추천 함수

```typescript
function generateReviewerRecommendations(
  changed_files: string[],
  options: {
    max_reviewers?: number;
    include_team_structure?: boolean;
    include_codeowners?: boolean;
    include_file_authors?: boolean;
  } = {}
): {
  required: ReviewerRecommendation[];
  recommended: ReviewerRecommendation[];
  summary: string;
} {
  const {
    max_reviewers = 3,
    include_team_structure = true,
    include_codeowners = true,
    include_file_authors = true
  } = options;
  
  const all_recommendations: ReviewerRecommendation[] = [];
  
  // 1. CODEOWNERS 기반 (최우선)
  if (include_codeowners) {
    const codeowners_reviewers = recommendReviewersFromCodeOwners(changed_files);
    all_recommendations.push(...codeowners_reviewers);
  }
  
  // 2. 팀 구조 기반
  if (include_team_structure) {
    const team_reviewers = recommendReviewersByTeam(changed_files);
    all_recommendations.push(...team_reviewers);
  }
  
  // 3. 모듈 전문가
  const module_experts = getModuleExperts(changed_files);
  module_experts.forEach(module_expert => {
    module_expert.experts.forEach(expert => {
      if (all_recommendations.some(r => r.email === expert.email)) {
        return;
      }
      
      all_recommendations.push({
        reviewer: expert.name,
        email: expert.email,
        score: expert.expertise_level * 100,
        reason: `${module_expert.module} 모듈 전문가입니다.`,
        files: changed_files.filter(f => f.includes(module_expert.module)),
        required: module_expert.required,
        priority: module_expert.required ? 'High' : 'Medium'
      });
    });
  });
  
  // 4. 파일 기반 (git blame)
  if (include_file_authors) {
    const file_reviewers = recommendReviewersForFiles(changed_files, 5);
    file_reviewers.forEach(reviewer => {
      if (all_recommendations.some(r => r.email === reviewer.email)) {
        return;
      }
      
      all_recommendations.push({
        ...reviewer,
        priority: 'Medium'
      });
    });
  }
  
  // 중복 제거 및 정렬
  const unique_recommendations = deduplicateReviewers(all_recommendations);
  const sorted = unique_recommendations.sort((a, b) => {
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;
    return b.score - a.score;
  });
  
  // 필수/추천 분리
  const required = sorted.filter(r => r.required).slice(0, max_reviewers);
  const recommended = sorted
    .filter(r => !r.required)
    .slice(0, max_reviewers - required.length);
  
  // 요약 생성
  const summary = generateSummary(required, recommended, changed_files);
  
  return {
    required,
    recommended,
    summary
  };
}

function deduplicateReviewers(
  recommendations: ReviewerRecommendation[]
): ReviewerRecommendation[] {
  const seen = new Set<string>();
  const unique: ReviewerRecommendation[] = [];
  
  for (const rec of recommendations) {
    if (!seen.has(rec.email)) {
      seen.add(rec.email);
      unique.push(rec);
    } else {
      // 중복된 경우 점수가 높은 것으로 업데이트
      const existing = unique.find(r => r.email === rec.email);
      if (existing && rec.score > existing.score) {
        Object.assign(existing, rec);
      }
    }
  }
  
  return unique;
}

function generateSummary(
  required: ReviewerRecommendation[],
  recommended: ReviewerRecommendation[],
  changed_files: string[]
): string {
  const parts: string[] = [];
  
  parts.push(`변경된 파일: ${changed_files.length}개`);
  parts.push(`필수 리뷰어: ${required.length}명`);
  parts.push(`추천 리뷰어: ${recommended.length}명`);
  
  if (required.length > 0) {
    parts.push(`\n필수 리뷰어: ${required.map(r => r.reviewer).join(', ')}`);
  }
  
  if (recommended.length > 0) {
    parts.push(`추천 리뷰어: ${recommended.map(r => r.reviewer).join(', ')}`);
  }
  
  return parts.join('\n');
}
```

---

## 리뷰어 추천 출력 형식

### 마크다운 형식

```typescript
function formatReviewerRecommendations(
  recommendations: {
    required: ReviewerRecommendation[];
    recommended: ReviewerRecommendation[];
    summary: string;
  }
): string {
  const sections: string[] = [];
  
  sections.push('## 추천 리뷰어');
  sections.push('');
  
  // 필수 리뷰어
  if (recommendations.required.length > 0) {
    sections.push('### 필수 리뷰어');
    sections.push('');
    recommendations.required.forEach(rec => {
      sections.push(`- **@${rec.reviewer}** (${rec.email})`);
      sections.push(`  - 이유: ${rec.reason}`);
      sections.push(`  - 관련 파일: ${rec.files.length}개`);
      sections.push('');
    });
  }
  
  // 추천 리뷰어
  if (recommendations.recommended.length > 0) {
    sections.push('### 추천 리뷰어');
    sections.push('');
    recommendations.recommended.forEach(rec => {
      sections.push(`- **@${rec.reviewer}** (${rec.email})`);
      sections.push(`  - 이유: ${rec.reason}`);
      sections.push(`  - 관련 파일: ${rec.files.length}개`);
      sections.push('');
    });
  }
  
  return sections.join('\n');
}
```

### 예시 출력

```markdown
## 추천 리뷰어

### 필수 리뷰어

- **@Plugin Maintainer** (plugin-maintainer@example.com)
  - 이유: CODEOWNERS 규칙에 따라 필수 리뷰어입니다.
  - 관련 파일: 3개

- **@Main Orchestrator** (main-orchestrator@example.com)
  - 이유: .cursor/rules 모듈 전문가입니다.
  - 관련 파일: 2개

### 추천 리뷰어

- **@Frontend Lead** (frontend-lead@example.com)
  - 이유: Frontend Team 리더입니다.
  - 관련 파일: 5개

- **@Plugin Expert** (plugin-expert@example.com)
  - 이유: 이 파일들의 주요 기여자입니다.
  - 관련 파일: 4개
```

---

## 주의사항

### 1. git blame 정확도

- 파일이 많이 변경되면 git blame 결과가 부정확할 수 있음
- 파일 이동/이름 변경 시 이력이 끊길 수 있음
- 최근 기여자만 고려하는 것이 좋음 (90일 이내)

### 2. CODEOWNERS 규칙

- CODEOWNERS 파일이 없을 수 있음
- 패턴 매칭이 정확하지 않을 수 있음
- 실제 사용자 이름과 일치하는지 확인 필요

### 3. 팀 구조

- 팀 구조는 프로젝트별로 다름
- 동적으로 로드하거나 설정 파일로 관리 필요
- 팀 멤버 정보는 최신 상태 유지 필요

### 4. 리뷰어 부하

- 같은 리뷰어에게 너무 많은 PR이 할당되지 않도록 주의
- 리뷰어 가용성 확인 필요 (선택사항)

---

## 체크리스트

리뷰어 추천 완료 후:

### 분석
- [ ] 변경된 파일이 올바르게 분석됨
- [ ] git blame 결과가 수집됨
- [ ] CODEOWNERS 규칙이 적용됨 (해당 시)
- [ ] 모듈 전문가가 식별됨

### 추천
- [ ] 필수 리뷰어가 추천됨
- [ ] 추천 리뷰어가 적절함
- [ ] 우선순위가 올바르게 설정됨
- [ ] 중복이 제거됨

---

## 완료 기준

다음 모든 항목 만족 시 리뷰어 추천 완료:

- [ ] 변경된 파일 기반 분석 완료
- [ ] git blame 결과 수집 완료 (해당 시)
- [ ] CODEOWNERS 규칙 적용 완료 (해당 시)
- [ ] 모듈 전문가 식별 완료
- [ ] 필수/추천 리뷰어 구분 완료
- [ ] 리뷰어 추천 목록 생성 완료
- [ ] 마크다운 형식으로 출력 완료