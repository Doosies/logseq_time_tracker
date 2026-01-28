---
name: change-analysis
description: 스테이징 영역 분석 및 변경 사항 분석 가이드 (PowerShell 지원)
---

# 변경 사항 분석 가이드

이 Skill은 Git 워크플로우 에이전트가 **스테이징 영역(staging area)**의 변경 사항을 분석하여 커밋 메시지와 PR 설명을 생성하는 방법을 제공합니다.

## 목적

- **스테이징 영역 검증** (필수 전제조건)
- **변경 정보 파일 생성** (`.cursor/git-workflow/*.txt`)
- git diff 분석 및 통계 수집
- 영향 범위 분석 (파일, 모듈, 컴포넌트)
- Breaking Changes 자동 감지
- 위험도 평가 (High/Medium/Low)
- 변경 카테고리 분류

## 사용 시점

- 커밋 메시지 생성 전 (필수)
- PR 설명 생성 전
- 변경 사항 요약이 필요할 때
- 영향 범위 파악이 필요할 때

---

## 전제 조건: 스테이징 영역 검증

### PowerShell 명령어

```powershell
# 1. 스테이징 영역 상태 확인
git status

# 2. 스테이징된 파일이 있는지 확인
$staged_files = git diff --cached --name-only
if ($staged_files.Count -eq 0) {
  Write-Host "Error: 스테이징된 파일이 없습니다. 먼저 'git add'로 파일을 스테이징하세요."
  exit 1
}

# 3. .cursor/git-workflow 디렉토리 생성
New-Item -ItemType Directory -Force -Path .cursor/git-workflow

# 4. 변경 정보 수집 및 저장
git diff --cached --name-status | Out-File -FilePath .cursor/git-workflow/staged-files.txt -Encoding utf8
git diff --cached | Out-File -FilePath .cursor/git-workflow/staged-diff.txt -Encoding utf8
git diff --cached --numstat | Out-File -FilePath .cursor/git-workflow/staged-stats.txt -Encoding utf8

Write-Host "변경 정보 수집 완료: .cursor/git-workflow/"
```

### 검증 항목

- [ ] 스테이징된 파일이 1개 이상 있음
- [ ] `.cursor/git-workflow/` 디렉토리 생성됨
- [ ] `staged-files.txt` 파일 생성됨
- [ ] `staged-diff.txt` 파일 생성됨
- [ ] `staged-stats.txt` 파일 생성됨
- [ ] 파일 내용이 비어있지 않음

---

## 변경 정보 파일 구조

### staged-files.txt

```
M       packages/plugin/src/App.tsx
A       packages/plugin/src/components/ThemeToggle.tsx
M       packages/plugin/package.json
```

**형식**: `<status> <tab> <file_path>`
- `M`: Modified (수정됨)
- `A`: Added (추가됨)
- `D`: Deleted (삭제됨)
- `R`: Renamed (이름 변경됨)

### staged-stats.txt

```
42      10      packages/plugin/src/App.tsx
85      0       packages/plugin/src/components/ThemeToggle.tsx
3       1       packages/plugin/package.json
```

**형식**: `<추가 라인 수> <삭제 라인 수> <file_path>`

### staged-diff.txt

전체 diff 내용 (git diff --cached 결과)

---

## git diff 분석 방법 (스테이징 영역 기반)

### 기본 diff 분석

```typescript
interface DiffStats {
  files_changed: number;
  insertions: number;
  deletions: number;
  net_change: number;
  file_details: FileChange[];
}

interface FileChange {
  path: string;
  insertions: number;
  deletions: number;
  changes: number;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
}

function analyzeDiff(diff_output: string): DiffStats {
  const lines = diff_output.split('\n');
  const file_details: FileChange[] = [];
  let total_insertions = 0;
  let total_deletions = 0;
  
  let current_file: FileChange | null = null;
  
  for (const line of lines) {
    // 파일 변경 시작: "diff --git a/path b/path"
    if (line.startsWith('diff --git')) {
      if (current_file) {
        file_details.push(current_file);
      }
      const match = line.match(/diff --git a\/(.+?) b\/(.+)/);
      if (match) {
        current_file = {
          path: match[2],
          insertions: 0,
          deletions: 0,
          changes: 0,
          status: 'modified'
        };
      }
    }
    
    // 파일 상태: "new file mode", "deleted file mode"
    if (line.startsWith('new file mode')) {
      if (current_file) current_file.status = 'added';
    }
    if (line.startsWith('deleted file mode')) {
      if (current_file) current_file.status = 'deleted';
    }
    
    // 변경 통계: "@@ -1,5 +1,10 @@"
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/);
      // 실제 변경 라인은 + 또는 -로 시작
    }
    
    // 추가된 라인: "+line content"
    if (line.startsWith('+') && !line.startsWith('+++')) {
      total_insertions++;
      if (current_file) {
        current_file.insertions++;
        current_file.changes++;
      }
    }
    
    // 삭제된 라인: "-line content"
    if (line.startsWith('-') && !line.startsWith('---')) {
      total_deletions++;
      if (current_file) {
        current_file.deletions++;
        current_file.changes++;
      }
    }
  }
  
  if (current_file) {
    file_details.push(current_file);
  }
  
  return {
    files_changed: file_details.length,
    insertions: total_insertions,
    deletions: total_deletions,
    net_change: total_insertions - total_deletions,
    file_details
  };
}
```

### 고급 diff 분석

```typescript
interface AdvancedDiffAnalysis {
  stats: DiffStats;
  impact_scope: ImpactScope;
  breaking_changes: BreakingChange[];
  risk_level: 'High' | 'Medium' | 'Low';
  change_categories: ChangeCategory[];
}

interface ImpactScope {
  modules: string[];
  components: string[];
  public_apis: string[];
  config_files: string[];
}

interface ChangeCategory {
  type: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'config';
  files: string[];
  description: string;
}
```

---

## 파일 변경 통계 수집 (스테이징 영역 기반)

### PowerShell에서 파일 읽기

```typescript
interface StagedFileInfo {
  path: string;
  status: 'M' | 'A' | 'D' | 'R';
  insertions: number;
  deletions: number;
  changes: number;
}

async function readStagedFiles(): Promise<StagedFileInfo[]> {
  const files: StagedFileInfo[] = [];
  
  // 1. staged-files.txt 읽기 (파일 목록 및 상태)
  const files_content = await readFile('.cursor/git-workflow/staged-files.txt', 'utf8');
  const files_lines = files_content.split('\n').filter(line => line.trim());
  
  // 2. staged-stats.txt 읽기 (통계)
  const stats_content = await readFile('.cursor/git-workflow/staged-stats.txt', 'utf8');
  const stats_lines = stats_content.split('\n').filter(line => line.trim());
  
  // 3. 파일 정보 파싱
  for (const file_line of files_lines) {
    const parts = file_line.split('\t');
    if (parts.length < 2) continue;
    
    const status = parts[0].trim() as StagedFileInfo['status'];
    const path = parts[1].trim();
    
    // 해당 파일의 통계 찾기
    const stat_line = stats_lines.find(line => line.includes(path));
    let insertions = 0;
    let deletions = 0;
    
    if (stat_line) {
      const stat_parts = stat_line.split('\t');
      if (stat_parts.length >= 3) {
        insertions = parseInt(stat_parts[0].trim()) || 0;
        deletions = parseInt(stat_parts[1].trim()) || 0;
      }
    }
    
    files.push({
      path,
      status,
      insertions,
      deletions,
      changes: insertions + deletions
    });
  }
  
  return files;
}

async function analyzeStagedChanges(): Promise<DiffStats> {
  const staged_files = await readStagedFiles();
  
  const total_insertions = staged_files.reduce((sum, f) => sum + f.insertions, 0);
  const total_deletions = staged_files.reduce((sum, f) => sum + f.deletions, 0);
  
  return {
    files_changed: staged_files.length,
    insertions: total_insertions,
    deletions: total_deletions,
    net_change: total_insertions - total_deletions,
    file_details: staged_files.map(f => ({
      path: f.path,
      insertions: f.insertions,
      deletions: f.deletions,
      changes: f.changes,
      status: mapStatus(f.status)
    }))
  };
}

function mapStatus(status: 'M' | 'A' | 'D' | 'R'): 'added' | 'modified' | 'deleted' | 'renamed' {
  switch (status) {
    case 'A': return 'added';
    case 'M': return 'modified';
    case 'D': return 'deleted';
    case 'R': return 'renamed';
    default: return 'modified';
  }
}
```

### 통계 수집 함수

```typescript
function collectFileStats(
  file_changes: FileChange[]
): Map<string, FileStatistics> {
  const stats_map = new Map<string, FileStatistics>();
  
  for (const file of file_changes) {
    const file_type = categorizeFileType(file.path);
    const existing_stats = stats_map.get(file_type) || {
      type: file_type,
      files_count: 0,
      total_insertions: 0,
      total_deletions: 0,
      files: []
    };
    
    existing_stats.files_count++;
    existing_stats.total_insertions += file.insertions;
    existing_stats.total_deletions += file.deletions;
    existing_stats.files.push(file.path);
    
    stats_map.set(file_type, existing_stats);
  }
  
  return stats_map;
}

function categorizeFileType(file_path: string): string {
  if (file_path.endsWith('.test.ts') || file_path.endsWith('.spec.ts')) {
    return 'test';
  }
  if (file_path.endsWith('.md') || file_path.includes('/docs/')) {
    return 'docs';
  }
  if (file_path.includes('package.json') || file_path.includes('tsconfig.json')) {
    return 'config';
  }
  if (file_path.includes('/components/') || file_path.endsWith('.tsx')) {
    return 'component';
  }
  if (file_path.includes('/services/') || file_path.includes('/utils/')) {
    return 'service';
  }
  if (file_path.includes('/controllers/') || file_path.includes('/routes/')) {
    return 'api';
  }
  return 'other';
}
```

### 통계 리포트 생성

```typescript
function generateStatsReport(stats: DiffStats): string {
  const report: string[] = [];
  
  report.push('## 변경 통계');
  report.push('');
  report.push(`- 변경된 파일: ${stats.files_changed}개`);
  report.push(`- 추가된 라인: +${stats.insertions}줄`);
  report.push(`- 삭제된 라인: -${stats.deletions}줄`);
  report.push(`- 순 변경: ${stats.net_change > 0 ? '+' : ''}${stats.net_change}줄`);
  report.push('');
  
  // 파일 유형별 통계
  const type_stats = collectFileStats(stats.file_details);
  if (type_stats.size > 0) {
    report.push('### 파일 유형별 통계');
    report.push('');
    for (const [type, type_stat] of type_stats) {
      report.push(`- **${type}**: ${type_stat.files_count}개 파일`);
      report.push(`  - 추가: +${type_stat.total_insertions}줄`);
      report.push(`  - 삭제: -${type_stat.total_deletions}줄`);
    }
    report.push('');
  }
  
  // 주요 변경 파일
  const major_changes = stats.file_details
    .filter(f => f.changes > 50)
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 5);
  
  if (major_changes.length > 0) {
    report.push('### 주요 변경 파일');
    report.push('');
    major_changes.forEach(file => {
      report.push(`- \`${file.path}\`: ${file.changes}줄 변경 (+${file.insertions}/-${file.deletions})`);
    });
  }
  
  return report.join('\n');
}
```

---

## 영향 범위 분석

### 파일 기반 영향 범위

```typescript
function analyzeImpactScope(
  file_changes: FileChange[]
): ImpactScope {
  const modules = new Set<string>();
  const components = new Set<string>();
  const public_apis = new Set<string>();
  const config_files: string[] = [];
  
  for (const file of file_changes) {
    const path = file.path;
    
    // 모듈 추출 (packages/plugin → plugin)
    if (path.startsWith('packages/')) {
      const module = path.split('/')[1];
      modules.add(module);
    }
    
    // 컴포넌트 추출
    if (path.includes('/components/') || path.endsWith('.tsx')) {
      const component_match = path.match(/\/([^/]+)\.tsx$/);
      if (component_match) {
        components.add(component_match[1]);
      }
    }
    
    // 공개 API 추출
    if (path.includes('/api/') || path.includes('/routes/')) {
      const api_match = path.match(/\/([^/]+)\.ts$/);
      if (api_match) {
        public_apis.add(api_match[1]);
      }
    }
    
    // 설정 파일
    if (path.includes('package.json') || 
        path.includes('tsconfig.json') || 
        path.includes('.env') ||
        path.includes('Dockerfile')) {
      config_files.push(path);
    }
  }
  
  return {
    modules: Array.from(modules),
    components: Array.from(components),
    public_apis: Array.from(public_apis),
    config_files
  };
}
```

### 모듈 간 의존성 분석

```typescript
function analyzeModuleDependencies(
  file_changes: FileChange[],
  project_structure: ProjectStructure
): DependencyImpact[] {
  const impacts: DependencyImpact[] = [];
  
  for (const file of file_changes) {
    const module = extractModule(file.path);
    if (!module) continue;
    
    // 변경된 모듈의 의존성 확인
    const dependencies = project_structure.getDependencies(module);
    const dependents = project_structure.getDependents(module);
    
    impacts.push({
      module,
      changed_files: [file.path],
      affected_dependencies: dependencies.filter(dep => 
        file_changes.some(f => f.path.includes(dep))
      ),
      affected_dependents: dependents.filter(dep => 
        file_changes.some(f => f.path.includes(dep))
      )
    });
  }
  
  return impacts;
}
```

---

## Breaking Changes 자동 감지

### 감지 로직

```typescript
interface BreakingChange {
  type: 'api_signature' | 'behavior' | 'removal' | 'deprecation' | 'config';
  file: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  migration_guide?: string;
}

function detectBreakingChanges(
  diff: string,
  file_changes: FileChange[]
): BreakingChange[] {
  const breaking_changes: BreakingChange[] = [];
  
  // 1. API 시그니처 변경 감지
  const api_changes = detectAPISignatureChanges(diff);
  breaking_changes.push(...api_changes);
  
  // 2. 함수/클래스 제거 감지
  const removals = detectRemovals(diff);
  breaking_changes.push(...removals);
  
  // 3. 동작 변경 감지
  const behavior_changes = detectBehaviorChanges(diff);
  breaking_changes.push(...behavior_changes);
  
  // 4. 설정 파일 변경 감지
  const config_changes = detectConfigChanges(file_changes, diff);
  breaking_changes.push(...config_changes);
  
  // 5. Deprecation 추가 감지
  const deprecations = detectDeprecations(diff);
  breaking_changes.push(...deprecations);
  
  return breaking_changes;
}

function detectAPISignatureChanges(diff: string): BreakingChange[] {
  const changes: BreakingChange[] = [];
  
  // 함수 시그니처 변경 패턴
  const function_pattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
  const class_method_pattern = /(?:public|private|protected)?\s*(\w+)\s*\([^)]*\)/g;
  
  // 제거된 함수 찾기
  const removed_functions = extractRemovedFunctions(diff);
  removed_functions.forEach(func => {
    changes.push({
      type: 'removal',
      file: func.file,
      description: `함수 \`${func.name}()\`가 제거되었습니다.`,
      severity: 'High',
      migration_guide: generateMigrationGuide(func)
    });
  });
  
  // 시그니처 변경된 함수 찾기
  const signature_changes = extractSignatureChanges(diff);
  signature_changes.forEach(change => {
    changes.push({
      type: 'api_signature',
      file: change.file,
      description: `함수 \`${change.name}()\`의 시그니처가 변경되었습니다.`,
      severity: 'High',
      migration_guide: generateMigrationGuide(change)
    });
  });
  
  return changes;
}

function detectRemovals(diff: string): BreakingChange[] {
  const changes: BreakingChange[] = [];
  
  // 제거된 export 감지
  const removed_exports = diff.match(/^-\s*export\s+(?:const|function|class|interface|type)\s+(\w+)/gm);
  if (removed_exports) {
    removed_exports.forEach(match => {
      const name = match.match(/(\w+)/)?.[1];
      if (name) {
        changes.push({
          type: 'removal',
          file: 'unknown',
          description: `\`${name}\`가 제거되었습니다.`,
          severity: 'High'
        });
      }
    });
  }
  
  return changes;
}

function detectBehaviorChanges(diff: string): BreakingChange[] {
  const changes: BreakingChange[] = [];
  
  // 동작 변경 키워드 감지
  const behavior_keywords = [
    /BREAKING CHANGE/i,
    /breaking change/i,
    /behavior change/i,
    /changed behavior/i
  ];
  
  for (const keyword of behavior_keywords) {
    const matches = diff.match(new RegExp(keyword.source + '[^\\n]*', 'gi'));
    if (matches) {
      matches.forEach(match => {
        changes.push({
          type: 'behavior',
          file: 'unknown',
          description: match.trim(),
          severity: 'High'
        });
      });
    }
  }
  
  return changes;
}

function detectConfigChanges(
  file_changes: FileChange[],
  diff: string
): BreakingChange[] {
  const changes: BreakingChange[] = [];
  
  const config_files = file_changes.filter(f => 
    f.path.includes('package.json') ||
    f.path.includes('tsconfig.json') ||
    f.path.includes('.env')
  );
  
  for (const file of config_files) {
    // package.json의 의존성 변경 감지
    if (file.path.includes('package.json')) {
      const dependency_changes = extractDependencyChanges(diff);
      dependency_changes.forEach(change => {
        changes.push({
          type: 'config',
          file: file.path,
          description: `의존성 변경: ${change.name} ${change.old_version} → ${change.new_version}`,
          severity: change.is_major ? 'High' : 'Medium',
          migration_guide: generateDependencyMigrationGuide(change)
        });
      });
    }
  }
  
  return changes;
}
```

---

## 위험도 평가

### 평가 기준

```typescript
type RiskLevel = 'High' | 'Medium' | 'Low';

interface RiskAssessment {
  level: RiskLevel;
  factors: RiskFactor[];
  score: number;
}

interface RiskFactor {
  type: string;
  description: string;
  impact: number; // 1-10
}

function assessRisk(
  diff_stats: DiffStats,
  breaking_changes: BreakingChange[],
  impact_scope: ImpactScope
): RiskAssessment {
  const factors: RiskFactor[] = [];
  let total_score = 0;
  
  // 1. 변경 규모
  const change_volume = diff_stats.insertions + diff_stats.deletions;
  if (change_volume > 1000) {
    factors.push({
      type: 'change_volume',
      description: `대규모 변경 (${change_volume}줄)`,
      impact: 7
    });
    total_score += 7;
  } else if (change_volume > 500) {
    factors.push({
      type: 'change_volume',
      description: `중규모 변경 (${change_volume}줄)`,
      impact: 4
    });
    total_score += 4;
  }
  
  // 2. Breaking Changes
  if (breaking_changes.length > 0) {
    const high_severity_count = breaking_changes.filter(c => c.severity === 'High').length;
    factors.push({
      type: 'breaking_changes',
      description: `${breaking_changes.length}개의 Breaking Changes (High: ${high_severity_count}개)`,
      impact: high_severity_count > 0 ? 10 : 7
    });
    total_score += high_severity_count > 0 ? 10 : 7;
  }
  
  // 3. 공개 API 변경
  if (impact_scope.public_apis.length > 0) {
    factors.push({
      type: 'public_api',
      description: `${impact_scope.public_apis.length}개의 공개 API 변경`,
      impact: 8
    });
    total_score += 8;
  }
  
  // 4. 여러 모듈에 걸친 변경
  if (impact_scope.modules.length > 2) {
    factors.push({
      type: 'cross_module',
      description: `${impact_scope.modules.length}개 모듈에 걸친 변경`,
      impact: 6
    });
    total_score += 6;
  }
  
  // 5. 설정 파일 변경
  if (impact_scope.config_files.length > 0) {
    factors.push({
      type: 'config',
      description: `${impact_scope.config_files.length}개 설정 파일 변경`,
      impact: 5
    });
    total_score += 5;
  }
  
  // 6. 테스트 파일 부족
  const test_files = diff_stats.file_details.filter(f => 
    f.path.includes('.test.') || f.path.includes('.spec.')
  );
  if (test_files.length === 0 && diff_stats.files_changed > 3) {
    factors.push({
      type: 'test_coverage',
      description: '테스트 파일 변경 없음',
      impact: 4
    });
    total_score += 4;
  }
  
  // 위험도 결정
  let level: RiskLevel;
  if (total_score >= 15) {
    level = 'High';
  } else if (total_score >= 8) {
    level = 'Medium';
  } else {
    level = 'Low';
  }
  
  return {
    level,
    factors,
    score: total_score
  };
}
```

---

## 변경 카테고리 분류

### 분류 로직

```typescript
interface ChangeCategory {
  type: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'config' | 'perf';
  confidence: number; // 0-1
  files: string[];
  description: string;
}

function categorizeChanges(
  file_changes: FileChange[],
  diff: string
): ChangeCategory[] {
  const categories: ChangeCategory[] = [];
  const categorized_files = new Set<string>();
  
  // 1. 테스트 파일 분류
  const test_files = file_changes.filter(f => 
    f.path.includes('.test.') || f.path.includes('.spec.') || f.path.includes('/tests/')
  );
  if (test_files.length > 0) {
    categories.push({
      type: 'test',
      confidence: 0.9,
      files: test_files.map(f => f.path),
      description: `테스트 파일 ${test_files.length}개 변경`
    });
    test_files.forEach(f => categorized_files.add(f.path));
  }
  
  // 2. 문서 파일 분류
  const docs_files = file_changes.filter(f => 
    f.path.endsWith('.md') || f.path.includes('/docs/')
  );
  if (docs_files.length > 0 && docs_files.every(f => !categorized_files.has(f.path))) {
    categories.push({
      type: 'docs',
      confidence: 0.9,
      files: docs_files.map(f => f.path),
      description: `문서 파일 ${docs_files.length}개 변경`
    });
    docs_files.forEach(f => categorized_files.add(f.path));
  }
  
  // 3. 설정 파일 분류
  const config_files = file_changes.filter(f => 
    f.path.includes('package.json') ||
    f.path.includes('tsconfig.json') ||
    f.path.includes('.github/') ||
    f.path.includes('Dockerfile')
  );
  if (config_files.length > 0) {
    categories.push({
      type: 'config',
      confidence: 0.9,
      files: config_files.map(f => f.path),
      description: `설정 파일 ${config_files.length}개 변경`
    });
    config_files.forEach(f => categorized_files.add(f.path));
  }
  
  // 4. 코드 변경 분류 (diff 내용 기반)
  const code_files = file_changes.filter(f => !categorized_files.has(f.path));
  if (code_files.length > 0) {
    const code_diff = extractDiffForFiles(diff, code_files.map(f => f.path));
    const code_category = analyzeCodeChanges(code_diff);
    categories.push({
      type: code_category.type,
      confidence: code_category.confidence,
      files: code_files.map(f => f.path),
      description: code_category.description
    });
  }
  
  return categories;
}

function analyzeCodeChanges(diff: string): {
  type: ChangeCategory['type'];
  confidence: number;
  description: string;
} {
  const diff_lower = diff.toLowerCase();
  
  // 새 기능 감지
  const has_new_feature = /\+.*(?:function|class|export.*function|export.*class)/.test(diff);
  const has_feature_keywords = /feature|add|implement|create|new/.test(diff_lower);
  
  // 버그 수정 감지
  const has_bug_fix = /fix|bug|error|exception|crash|issue/.test(diff_lower);
  
  // 리팩토링 감지
  const has_refactor = /refactor|extract|rename|move|restructure/.test(diff_lower);
  
  // 성능 개선 감지
  const has_perf = /performance|optimize|cache|memoize|speed|fast/.test(diff_lower);
  
  if (has_bug_fix && !has_new_feature) {
    return {
      type: 'bugfix',
      confidence: 0.8,
      description: '버그 수정'
    };
  }
  
  if (has_new_feature || has_feature_keywords) {
    return {
      type: 'feature',
      confidence: 0.7,
      description: '새 기능 추가'
    };
  }
  
  if (has_perf) {
    return {
      type: 'perf',
      confidence: 0.7,
      description: '성능 개선'
    };
  }
  
  if (has_refactor) {
    return {
      type: 'refactor',
      confidence: 0.6,
      description: '리팩토링'
    };
  }
  
  return {
    type: 'refactor',
    confidence: 0.5,
    description: '코드 변경'
  };
}
```

---

## 분석 리포트 템플릿

### 리포트 생성

```typescript
function generateAnalysisReport(
  analysis: AdvancedDiffAnalysis
): string {
  const report: string[] = [];
  
  // 헤더
  report.push('# 변경 사항 분석 리포트');
  report.push('');
  
  // 통계
  report.push(generateStatsReport(analysis.stats));
  report.push('');
  
  // 영향 범위
  report.push('## 영향 범위');
  report.push('');
  if (analysis.impact_scope.modules.length > 0) {
    report.push(`### 모듈: ${analysis.impact_scope.modules.join(', ')}`);
  }
  if (analysis.impact_scope.components.length > 0) {
    report.push(`### 컴포넌트: ${analysis.impact_scope.components.join(', ')}`);
  }
  if (analysis.impact_scope.public_apis.length > 0) {
    report.push(`### 공개 API: ${analysis.impact_scope.public_apis.join(', ')}`);
  }
  report.push('');
  
  // 변경 카테고리
  report.push('## 변경 카테고리');
  report.push('');
  analysis.change_categories.forEach(category => {
    report.push(`### ${category.type} (신뢰도: ${(category.confidence * 100).toFixed(0)}%)`);
    report.push(`- ${category.description}`);
    report.push(`- 파일: ${category.files.length}개`);
    report.push('');
  });
  
  // Breaking Changes
  if (analysis.breaking_changes.length > 0) {
    report.push('## ⚠️ Breaking Changes');
    report.push('');
    analysis.breaking_changes.forEach((change, index) => {
      report.push(`### ${index + 1}. ${change.type} (${change.severity})`);
      report.push(`- 파일: \`${change.file}\``);
      report.push(`- 설명: ${change.description}`);
      if (change.migration_guide) {
        report.push(`- 마이그레이션: ${change.migration_guide}`);
      }
      report.push('');
    });
  }
  
  // 위험도 평가
  report.push('## 위험도 평가');
  report.push('');
  report.push(`**위험도: ${analysis.risk_level}** (점수: ${analysis.risk_level === 'High' ? '🔴' : analysis.risk_level === 'Medium' ? '🟡' : '🟢'} ${analysis.risk_level})`);
  report.push('');
  report.push('### 위험 요인');
  analysis.risk_level.factors.forEach(factor => {
    report.push(`- **${factor.type}**: ${factor.description} (영향도: ${factor.impact}/10)`);
  });
  
  return report.join('\n');
}
```

### 예시 리포트

```markdown
# 변경 사항 분석 리포트

## 변경 통계

- 변경된 파일: 8개
- 추가된 라인: +245줄
- 삭제된 라인: -89줄
- 순 변경: +156줄

### 파일 유형별 통계

- **component**: 3개 파일
  - 추가: +120줄
  - 삭제: -30줄
- **service**: 2개 파일
  - 추가: +80줄
  - 삭제: -40줄
- **test**: 3개 파일
  - 추가: +45줄
  - 삭제: -19줄

### 주요 변경 파일

- `src/components/UserProfile.tsx`: 95줄 변경 (+65/-30)
- `src/services/auth-service.ts`: 78줄 변경 (+50/-28)

## 영향 범위

### 모듈: plugin, mcp-server
### 컴포넌트: UserProfile, ThemeToggle, Settings
### 공개 API: auth, user

## 변경 카테고리

### feature (신뢰도: 80%)
- 새 기능 추가
- 파일: 5개

### test (신뢰도: 90%)
- 테스트 파일 변경
- 파일: 3개

## ⚠️ Breaking Changes

### 1. api_signature (High)
- 파일: `src/services/auth-service.ts`
- 설명: 함수 `createUser()`의 시그니처가 변경되었습니다.
- 마이그레이션: [마이그레이션 가이드]

## 위험도 평가

**위험도: Medium** (점수: 🟡 Medium)

### 위험 요인

- **breaking_changes**: 1개의 Breaking Changes (High: 1개) (영향도: 10/10)
- **public_api**: 2개의 공개 API 변경 (영향도: 8/10)
- **change_volume**: 중규모 변경 (334줄) (영향도: 4/10)
```

---

## 주의사항

### 1. 스테이징 영역 확인 (필수)

- **반드시** 스테이징 영역에 변경 사항이 있는지 확인
- 스테이징되지 않은 변경 사항은 무시
- `git add`로 파일 스테이징 후 분석 시작

### 2. PowerShell 명령어 사용

- Windows 환경이므로 PowerShell 명령어 사용
- Bash 명령어 대신 PowerShell 스크립트 생성
- 파일 인코딩은 UTF-8 사용

### 3. 변경 정보 파일 활용

- `.cursor/git-workflow/staged-*.txt` 파일을 우선적으로 참고
- 파일이 없으면 생성 후 진행
- 파일 내용이 비어있으면 경고

### 4. diff 분석 정확도

- diff 파싱이 완벽하지 않을 수 있음
- 복잡한 변경은 수동 확인 필요
- 파일 이름 변경/이동은 정확히 감지하기 어려움

### 5. Breaking Changes 감지

- 자동 감지가 모든 Breaking Changes를 찾지 못할 수 있음
- 공개 API 변경은 수동 확인 필요
- 동작 변경은 코드 리뷰에서 확인 필요

### 6. 위험도 평가

- 위험도는 참고용으로만 사용
- 실제 위험도는 도메인 지식 필요
- 자동 평가 결과를 맹신하지 말 것

---

## 체크리스트

변경 사항 분석 완료 후:

### 전제 조건
- [ ] 스테이징 영역에 변경 파일 존재
- [ ] `.cursor/git-workflow/` 디렉토리 생성됨
- [ ] `staged-files.txt` 파일 생성됨
- [ ] `staged-diff.txt` 파일 생성됨
- [ ] `staged-stats.txt` 파일 생성됨
- [ ] 변경 정보 파일 내용이 비어있지 않음

### 분석
- [ ] 변경 정보 파일이 올바르게 파싱됨
- [ ] 통계가 정확함
- [ ] 영향 범위가 올바르게 식별됨
- [ ] Breaking Changes가 감지됨 (해당 시)

### 리포트
- [ ] 리포트가 생성됨
- [ ] 모든 중요한 정보가 포함됨
- [ ] 위험도가 평가됨
- [ ] 변경 카테고리가 분류됨

---

## 완료 기준

다음 모든 항목 만족 시 변경 사항 분석 완료:

- [ ] 스테이징 영역 검증 완료
- [ ] 변경 정보 파일 생성 완료 (`.cursor/git-workflow/*.txt`)
- [ ] 스테이징된 파일 분석 완료
- [ ] 파일 변경 통계 수집 완료
- [ ] 영향 범위 분석 완료
- [ ] Breaking Changes 감지 완료 (해당 시)
- [ ] 위험도 평가 완료
- [ ] 변경 카테고리 분류 완료
- [ ] 분석 리포트 생성 완료