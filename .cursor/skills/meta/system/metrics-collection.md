---
name: metrics-collection
description: 자동 메트릭 수집 및 저장 시스템
---

# 메트릭 수집 시스템

## 개요

에이전트 시스템의 성능을 측정하고 개선하기 위해 각 작업 사이클의 메트릭을 자동으로 수집하는 시스템입니다.

## 핵심 원칙

1. **비침투적**: 에이전트의 정상 작업 흐름을 방해하지 않음
2. **자동화**: 수동 개입 없이 자동으로 수집
3. **저장소 독립**: 파일 시스템 기반, 별도 DB 불필요
4. **확장 가능**: 새로운 메트릭 추가 용이
5. **실용적**: 구현 복잡도 최소화

---

## 메트릭 수집 방법

### 사이클 시작 시

```typescript
// 사이클 ID 생성
function generateCycleId(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cyclesDir = '.cursor/metrics/cycles/';
  const existingFiles = listFiles(`${cyclesDir}${today}-*.json`);
  const sequence = existingFiles.length + 1;
  return `${today}-${String(sequence).padStart(3, '0')}`;
}

// 초기 메트릭 객체 생성
const cycleId = generateCycleId();
const metrics = {
  cycle_id: cycleId,
  timestamp: new Date().toISOString(),
  started_at: new Date().toISOString(),
  task_type: classifyTask(userRequest), // "feature" | "bugfix" | "refactor" | "docs" | "hotfix"
  task_description: userRequest,
  workflow: [],
  agents: {},
  totals: {
    success: false,
    duration_ms: 0,
    total_tokens: 0,
    total_retries: 0
  },
  errors: [],
  user_feedback: null
};
```

### 에이전트 호출 전

```typescript
// 에이전트 시작 기록
function recordAgentStart(agentName: string, metrics: CycleMetrics): void {
  metrics.workflow.push(agentName);
  metrics.agents[agentName] = {
    started_at: new Date().toISOString(),
    retries: 0,
    duration_ms: 0,
    tokens_used: 0,
    quality_score: 0.0
  };
}
```

### 에이전트 완료 후

```typescript
// 에이전트 완료 기록
function recordAgentComplete(
  agentName: string,
  metrics: CycleMetrics,
  agentMetrics: AgentMetrics
): void {
  const agentData = metrics.agents[agentName];
  if (!agentData) return;

  const startedAt = new Date(agentData.started_at);
  const completedAt = new Date();
  const duration_ms = completedAt.getTime() - startedAt.getTime();

  metrics.agents[agentName] = {
    ...agentData,
    ...agentMetrics,
    completed_at: completedAt.toISOString(),
    duration_ms: duration_ms
  };
}

// 에이전트 메트릭 예시
interface AgentMetrics {
  retries?: number;
  tokens_used?: number;
  files_read?: number;
  files_modified?: number;
  files_created?: number;
  linter_errors_introduced?: number;
  linter_errors_fixed?: number;
  tests_written?: number;
  tests_passed?: number;
  tests_failed?: number;
  coverage_before?: number;
  coverage_after?: number;
  quality_score?: number;
  code_changes?: {
    lines_added?: number;
    lines_deleted?: number;
    lines_modified?: number;
  };
}
```

### 사이클 완료 시

```typescript
// 사이클 완료 및 저장
function completeCycle(metrics: CycleMetrics, success: boolean): void {
  const startedAt = new Date(metrics.started_at);
  const completedAt = new Date();
  const totalDuration_ms = completedAt.getTime() - startedAt.getTime();

  // 전체 집계
  metrics.completed_at = completedAt.toISOString();
  metrics.totals = {
    duration_ms: totalDuration_ms,
    total_tokens: Object.values(metrics.agents).reduce(
      (sum, agent) => sum + (agent.tokens_used || 0),
      0
    ),
    total_retries: Object.values(metrics.agents).reduce(
      (sum, agent) => sum + (agent.retries || 0),
      0
    ),
    success: success
  };

  // 효율성 지표 계산
  const duration_minutes = totalDuration_ms / 60000;
  metrics.totals.efficiency = {
    tokens_per_minute: metrics.totals.total_tokens / duration_minutes || 0,
    files_per_hour: calculateFilesPerHour(metrics),
    tests_per_hour: calculateTestsPerHour(metrics)
  };

  // 파일 저장
  saveMetricsFile(metrics);
}

function calculateFilesPerHour(metrics: CycleMetrics): number {
  const totalFiles = Object.values(metrics.agents).reduce((sum, agent) => {
    return sum + (agent.files_modified || 0) + (agent.files_created || 0);
  }, 0);
  const duration_hours = metrics.totals.duration_ms / 3600000;
  return totalFiles / duration_hours || 0;
}

function calculateTestsPerHour(metrics: CycleMetrics): number {
  const totalTests = Object.values(metrics.agents).reduce(
    (sum, agent) => sum + (agent.tests_written || 0),
    0
  );
  const duration_hours = metrics.totals.duration_ms / 3600000;
  return totalTests / duration_hours || 0;
}
```

---

## Phase 2: 상세 메트릭 수집

Phase 2에서는 git 명령어를 활용하여 더 상세한 메트릭을 수집합니다.

### 파일 변경 통계 수집

#### git diff --stat 활용

```typescript
// 파일 변경 통계 수집
interface FileChangeStats {
  files_created: number;
  files_modified: number;
  files_deleted: number;
  files_renamed: number;
  file_details: FileChangeDetail[];
}

interface FileChangeDetail {
  path: string;
  status: 'created' | 'modified' | 'deleted' | 'renamed';
  insertions: number;
  deletions: number;
  changes: number; // insertions + deletions
  file_type: string; // '.ts', '.md', '.json' 등
}

// git diff --stat 실행 및 파싱
async function collectFileChangeStats(
  baseRef: string = 'HEAD'
): Promise<FileChangeStats> {
  // git diff --stat 실행
  const diffStatOutput = await execCommand(`git diff --stat ${baseRef}`);
  
  const stats: FileChangeStats = {
    files_created: 0,
    files_modified: 0,
    files_deleted: 0,
    files_renamed: 0,
    file_details: []
  };
  
  // 파싱 예시:
  // "packages/plugin/src/App.tsx     | 15 +++++++++++++++"
  // "packages/plugin/src/utils.ts   |  8 +++++---"
  // "packages/docs/guide/api.md     | 12 ++++++++++++"
  // "packages/plugin/tests/old.test.ts | 45 ----------------------------"
  
  const lines = diffStatOutput.split('\n');
  for (const line of lines) {
    if (!line.trim() || line.includes('|') === false) continue;
    
    const match = line.match(/^(.+?)\s+\|\s+(\d+)\s+([+\-]+)$/);
    if (!match) continue;
    
    const file_path = match[1].trim();
    const changes = parseInt(match[2], 10);
    const change_markers = match[3];
    
    // 상태 판단
    let status: FileChangeDetail['status'] = 'modified';
    if (change_markers.includes('+') && !change_markers.includes('-')) {
      status = 'created';
      stats.files_created++;
    } else if (!change_markers.includes('+') && change_markers.includes('-')) {
      status = 'deleted';
      stats.files_deleted++;
    } else {
      stats.files_modified++;
    }
    
    // 삽입/삭제 수 추정 (정확하지 않을 수 있음)
    const insertions = (change_markers.match(/\+/g) || []).length;
    const deletions = (change_markers.match(/-/g) || []).length;
    
    // 파일 유형 추출
    const file_type = extractFileType(file_path);
    
    stats.file_details.push({
      path: file_path,
      status,
      insertions,
      deletions,
      changes,
      file_type
    });
  }
  
  return stats;
}

function extractFileType(file_path: string): string {
  const match = file_path.match(/\.([^.]+)$/);
  return match ? match[1] : 'unknown';
}
```

#### git diff --numstat 활용 (더 정확한 라인 수)

```typescript
// git diff --numstat은 더 정확한 라인 수를 제공
async function collectDetailedLineStats(
  baseRef: string = 'HEAD'
): Promise<FileChangeDetail[]> {
  // git diff --numstat 실행
  // 형식: "15\t0\tpackages/plugin/src/App.tsx"
  //       "8\t3\tpackages/plugin/src/utils.ts"
  //       "0\t45\tpackages/plugin/tests/old.test.ts"
  //       (insertions, deletions, path)
  
  const numstatOutput = await execCommand(`git diff --numstat ${baseRef}`);
  const file_details: FileChangeDetail[] = [];
  
  const lines = numstatOutput.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    
    const insertions = parseInt(parts[0], 10) || 0;
    const deletions = parseInt(parts[1], 10) || 0;
    const file_path = parts.slice(2).join('\t'); // 경로에 탭이 있을 수 있음
    
    // 상태 판단
    let status: FileChangeDetail['status'] = 'modified';
    if (insertions > 0 && deletions === 0) {
      status = 'created';
    } else if (insertions === 0 && deletions > 0) {
      status = 'deleted';
    }
    
    file_details.push({
      path: file_path,
      status,
      insertions,
      deletions,
      changes: insertions + deletions,
      file_type: extractFileType(file_path)
    });
  }
  
  return file_details;
}
```

### 코드 변경 라인 수 수집

#### 파일 유형별 분류

```typescript
interface CodeChangeStats {
  total_lines_added: number;
  total_lines_deleted: number;
  net_change: number;
  by_file_type: {
    [file_type: string]: {
      files_count: number;
      lines_added: number;
      lines_deleted: number;
      net_change: number;
    };
  };
}

function aggregateCodeChanges(
  file_details: FileChangeDetail[]
): CodeChangeStats {
  const stats: CodeChangeStats = {
    total_lines_added: 0,
    total_lines_deleted: 0,
    net_change: 0,
    by_file_type: {}
  };
  
  for (const file of file_details) {
    // 전체 집계
    stats.total_lines_added += file.insertions;
    stats.total_lines_deleted += file.deletions;
    stats.net_change += file.insertions - file.deletions;
    
    // 파일 유형별 집계
    const type = file.file_type;
    if (!stats.by_file_type[type]) {
      stats.by_file_type[type] = {
        files_count: 0,
        lines_added: 0,
        lines_deleted: 0,
        net_change: 0
      };
    }
    
    const type_stats = stats.by_file_type[type];
    type_stats.files_count++;
    type_stats.lines_added += file.insertions;
    type_stats.lines_deleted += file.deletions;
    type_stats.net_change += file.insertions - file.deletions;
  }
  
  return stats;
}
```

### Linter 오류 상세 수집

```typescript
interface LinterErrorDetail {
  type: string; // 'unused_variable', 'type_error', 'syntax_error' 등
  file: string;
  line: number;
  column?: number;
  message: string;
  rule?: string; // ESLint 규칙 이름 등
}

interface LinterErrorStats {
  errors_introduced: LinterErrorDetail[];
  errors_fixed: LinterErrorDetail[];
  errors_remaining: LinterErrorDetail[];
  by_type: {
    [error_type: string]: {
      introduced: number;
      fixed: number;
      remaining: number;
    };
  };
}

// Linter 오류 수집 (ReadLints 도구 활용)
async function collectLinterErrors(
  beforeAgent: LinterErrorDetail[],
  afterAgent: LinterErrorDetail[]
): Promise<LinterErrorStats> {
  const stats: LinterErrorStats = {
    errors_introduced: [],
    errors_fixed: [],
    errors_remaining: [],
    by_type: {}
  };
  
  // 도입된 오류: 이전에는 없었지만 지금 있는 오류
  for (const error of afterAgent) {
    const existed_before = beforeAgent.some(
      e => e.file === error.file && e.line === error.line && e.type === error.type
    );
    if (!existed_before) {
      stats.errors_introduced.push(error);
    } else {
      stats.errors_remaining.push(error);
    }
  }
  
  // 수정된 오류: 이전에는 있었지만 지금 없는 오류
  for (const error of beforeAgent) {
    const still_exists = afterAgent.some(
      e => e.file === error.file && e.line === error.line && e.type === error.type
    );
    if (!still_exists) {
      stats.errors_fixed.push(error);
    }
  }
  
  // 오류 유형별 집계
  const all_types = new Set([
    ...stats.errors_introduced.map(e => e.type),
    ...stats.errors_fixed.map(e => e.type),
    ...stats.errors_remaining.map(e => e.type)
  ]);
  
  for (const type of all_types) {
    stats.by_type[type] = {
      introduced: stats.errors_introduced.filter(e => e.type === type).length,
      fixed: stats.errors_fixed.filter(e => e.type === type).length,
      remaining: stats.errors_remaining.filter(e => e.type === type).length
    };
  }
  
  return stats;
}

// ReadLints 결과를 LinterErrorDetail로 변환
function parseLinterOutput(lints: any[]): LinterErrorDetail[] {
  return lints.map(lint => ({
    type: lint.code || lint.ruleId || 'unknown',
    file: lint.file || lint.source || 'unknown',
    line: lint.line || 0,
    column: lint.column,
    message: lint.message || '',
    rule: lint.code || lint.ruleId
  }));
}
```

### 에러 추적 상세

```typescript
interface ErrorTracking {
  errors: ErrorDetail[];
  summary: {
    total_errors: number;
    resolved_errors: number;
    unresolved_errors: number;
    avg_resolution_time_ms: number;
    by_type: {
      [error_type: string]: {
        count: number;
        resolved: number;
        unresolved: number;
        avg_resolution_time_ms: number;
      };
    };
  };
}

interface ErrorDetail {
  id: string;
  agent: string;
  type: string; // 'linter_error', 'test_failure', 'validation_error', 'runtime_error' 등
  message: string;
  file?: string;
  line?: number;
  occurred_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolution_time_ms?: number;
  resolution_steps?: string[]; // 해결 과정 기록
}

function trackError(
  metrics: CycleMetrics,
  error: Omit<ErrorDetail, 'id' | 'occurred_at' | 'resolved'>
): string {
  const error_id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const error_detail: ErrorDetail = {
    id: error_id,
    ...error,
    occurred_at: new Date().toISOString(),
    resolved: false
  };
  
  metrics.errors.push(error_detail);
  return error_id;
}

function resolveError(
  metrics: CycleMetrics,
  error_id: string,
  resolution_steps?: string[]
): void {
  const error = metrics.errors.find(e => e.id === error_id);
  if (!error) return;
  
  const occurred_at = new Date(error.occurred_at);
  const resolved_at = new Date();
  const resolution_time_ms = resolved_at.getTime() - occurred_at.getTime();
  
  error.resolved = true;
  error.resolved_at = resolved_at.toISOString();
  error.resolution_time_ms = resolution_time_ms;
  if (resolution_steps) {
    error.resolution_steps = resolution_steps;
  }
}

function calculateErrorSummary(metrics: CycleMetrics): ErrorTracking['summary'] {
  const errors = metrics.errors || [];
  const resolved = errors.filter(e => e.resolved);
  const unresolved = errors.filter(e => !e.resolved);
  
  const resolution_times = resolved
    .map(e => e.resolution_time_ms || 0)
    .filter(t => t > 0);
  
  const avg_resolution_time_ms = resolution_times.length > 0
    ? resolution_times.reduce((sum, t) => sum + t, 0) / resolution_times.length
    : 0;
  
  // 오류 유형별 집계
  const by_type: ErrorTracking['summary']['by_type'] = {};
  
  for (const error of errors) {
    if (!by_type[error.type]) {
      by_type[error.type] = {
        count: 0,
        resolved: 0,
        unresolved: 0,
        avg_resolution_time_ms: 0
      };
    }
    
    const type_stats = by_type[error.type];
    type_stats.count++;
    
    if (error.resolved) {
      type_stats.resolved++;
      if (error.resolution_time_ms) {
        const existing_times = type_stats.avg_resolution_time_ms * (type_stats.resolved - 1);
        type_stats.avg_resolution_time_ms = (existing_times + error.resolution_time_ms) / type_stats.resolved;
      }
    } else {
      type_stats.unresolved++;
    }
  }
  
  return {
    total_errors: errors.length,
    resolved_errors: resolved.length,
    unresolved_errors: unresolved.length,
    avg_resolution_time_ms,
    by_type
  };
}
```

### 에이전트 완료 시 상세 메트릭 수집

```typescript
// 에이전트 완료 후 상세 메트릭 수집
async function collectDetailedAgentMetrics(
  agentName: string,
  metrics: CycleMetrics,
  baseRef: string = 'HEAD'
): Promise<void> {
  const agentData = metrics.agents[agentName];
  if (!agentData) return;
  
  // 1. 파일 변경 통계 수집
  const file_stats = await collectFileChangeStats(baseRef);
  agentData.files_created = file_stats.files_created;
  agentData.files_modified = file_stats.files_modified;
  agentData.files_deleted = file_stats.files_deleted;
  
  // 2. 코드 변경 라인 수 수집
  const file_details = await collectDetailedLineStats(baseRef);
  const code_changes = aggregateCodeChanges(file_details);
  
  agentData.code_changes = {
    lines_added: code_changes.total_lines_added,
    lines_deleted: code_changes.total_lines_deleted,
    net_change: code_changes.net_change,
    by_file_type: code_changes.by_file_type
  };
  
  // 3. Linter 오류 상세 (Developer 에이전트인 경우)
  if (agentName === 'developer') {
    // 이전 Linter 오류 상태는 사이클 시작 시 저장
    const before_linter_errors = metrics.agents[agentName].linter_errors_before || [];
    const after_linter_errors = await collectCurrentLinterErrors();
    
    const linter_stats = await collectLinterErrors(
      before_linter_errors,
      after_linter_errors
    );
    
    agentData.linter_errors_introduced = linter_stats.errors_introduced.length;
    agentData.linter_errors_fixed = linter_stats.errors_fixed.length;
    agentData.linter_errors_remaining = linter_stats.errors_remaining.length;
    agentData.linter_errors_detail = {
      introduced: linter_stats.errors_introduced,
      fixed: linter_stats.errors_fixed,
      remaining: linter_stats.errors_remaining,
      by_type: linter_stats.by_type
    };
  }
}

async function collectCurrentLinterErrors(): Promise<LinterErrorDetail[]> {
  // ReadLints 도구 사용 (의사코드)
  // const lints = await readLints();
  // return parseLinterOutput(lints);
  return []; // 실제 구현 시 ReadLints 도구 활용
}
```

### 사이클 시작 시 기준점 저장

```typescript
// 사이클 시작 시 현재 상태 저장 (기준점)
async function saveBaseline(metrics: CycleMetrics): Promise<void> {
  // 현재 Git HEAD 저장
  metrics.git_baseline = {
    commit_hash: await execCommand('git rev-parse HEAD'),
    branch: await execCommand('git rev-parse --abbrev-ref HEAD'),
    timestamp: new Date().toISOString()
  };
  
  // 현재 Linter 오류 상태 저장 (Developer 에이전트용)
  const current_linter_errors = await collectCurrentLinterErrors();
  if (!metrics.agents.developer) {
    metrics.agents.developer = {};
  }
  metrics.agents.developer.linter_errors_before = current_linter_errors;
}
```

---

## 메트릭 저장 방법

### 파일 저장 위치

```
.cursor/metrics/
├── cycle-template.json          # 템플릿 (기존)
├── cycles/                      # 실제 사이클 데이터
│   ├── 2026-01-28-001.json
│   ├── 2026-01-28-002.json
│   └── ...
├── summaries/                   # 일별/주별 요약
│   ├── 2026-01-28.json
│   └── ...
└── improvements/                # 개선 이력 (기존)
    └── ...
```

### 저장 함수

```typescript
// JSON 파일로 저장
async function saveMetricsFile(metrics: CycleMetrics): Promise<void> {
  const cyclesDir = '.cursor/metrics/cycles/';
  const filePath = `${cyclesDir}${metrics.cycle_id}.json`;
  
  // 디렉토리 존재 확인 및 생성
  ensureDirectoryExists(cyclesDir);
  
  // JSON 형식으로 저장
  const jsonContent = JSON.stringify(metrics, null, 2);
  await writeFile(filePath, jsonContent, 'utf-8');
}

function ensureDirectoryExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}
```

### 실패한 작업도 기록

```typescript
// 실패 시에도 메트릭 저장
function recordFailure(
  metrics: CycleMetrics,
  failedAgent: string,
  failureReason: string
): void {
  metrics.totals.success = false;
  metrics.totals.failure_reason = failureReason;
  metrics.totals.failed_at_agent = failedAgent;
  
  // 에러 정보 추가
  metrics.errors.push({
    agent: failedAgent,
    type: 'failure',
    message: failureReason,
    resolved: false,
    occurred_at: new Date().toISOString()
  });

  // 완료 처리 및 저장
  completeCycle(metrics, false);
}
```

---

## 메트릭 형식

### 기본 구조

```json
{
  "cycle_id": "2026-01-28-001",
  "timestamp": "2026-01-28T10:00:00Z",
  "started_at": "2026-01-28T10:00:00Z",
  "completed_at": "2026-01-28T10:15:30Z",
  "task_type": "feature",
  "task_description": "사용자 인증 API 추가",
  "workflow": ["main", "planner", "developer", "qa", "docs", "main"],
  "agents": {
    "planner": {
      "started_at": "2026-01-28T10:00:05Z",
      "completed_at": "2026-01-28T10:00:50Z",
      "duration_ms": 45000,
      "retries": 0,
      "tokens_used": 3500,
      "files_read": 8,
      "files_created": 1,
      "quality_score": 0.95
    },
    "developer": {
      "started_at": "2026-01-28T10:00:55Z",
      "completed_at": "2026-01-28T10:03:55Z",
      "duration_ms": 180000,
      "retries": 1,
      "tokens_used": 12000,
      "files_modified": 5,
      "files_read": 15,
      "files_created": 2,
      "linter_errors_introduced": 2,
      "linter_errors_fixed": 2,
      "quality_score": 0.80,
      "code_changes": {
        "lines_added": 234,
        "lines_deleted": 45,
        "lines_modified": 12
      }
    }
  },
  "totals": {
    "duration_ms": 340000,
    "total_tokens": 26000,
    "total_retries": 3,
    "success": true,
    "efficiency": {
      "tokens_per_minute": 4588,
      "files_per_hour": 12.7,
      "tests_per_hour": 21.2
    }
  },
  "errors": [],
  "user_feedback": null
}
```

### 에이전트별 메트릭

#### Planner
- `duration_ms`: 실행 시간 (밀리초)
- `retries`: 재시도 횟수
- `tokens_used`: 사용한 토큰 수
- `files_read`: 읽은 파일 수
- `files_created`: 생성한 파일 수
- `quality_score`: 품질 점수 (0.0 ~ 1.0)

#### Developer
- `duration_ms`: 실행 시간
- `retries`: 재시도 횟수
- `tokens_used`: 사용한 토큰 수
- `files_modified`: 수정한 파일 수
- `files_read`: 읽은 파일 수
- `files_created`: 생성한 파일 수
- `linter_errors_introduced`: 도입한 Linter 오류 수
- `linter_errors_fixed`: 수정한 Linter 오류 수
- `quality_score`: 품질 점수
- `code_changes`: 코드 변경 통계
  - `lines_added`: 추가된 라인 수
  - `lines_deleted`: 삭제된 라인 수
  - `lines_modified`: 수정된 라인 수

#### QA
- `duration_ms`: 실행 시간
- `retries`: 재시도 횟수
- `tokens_used`: 사용한 토큰 수
- `tests_written`: 작성한 테스트 수
- `tests_passed`: 통과한 테스트 수
- `tests_failed`: 실패한 테스트 수
- `coverage_before`: 이전 커버리지
- `coverage_after`: 이후 커버리지
- `quality_score`: 품질 점수

#### Docs
- `duration_ms`: 실행 시간
- `retries`: 재시도 횟수
- `tokens_used`: 사용한 토큰 수
- `files_modified`: 수정한 파일 수
- `quality_score`: 품질 점수

---

## 예시 코드

### 메인 에이전트에서 사용

```markdown
## 메트릭 수집

### 사이클 시작
```typescript
// 사용자 요청 받은 직후
const cycleId = generateCycleId();
const metrics = initializeMetrics(cycleId, userRequest, taskType);
```

### 에이전트 호출 전
```typescript
// 서브에이전트 호출 직전
recordAgentStart(agentName, metrics);
const agentStartTime = Date.now();
```

### 에이전트 완료 후
```typescript
// 서브에이전트 작업 완료 후
const agentMetrics = {
  retries: retryCount,
  tokens_used: estimatedTokens,
  files_read: filesReadCount,
  files_modified: filesModifiedCount,
  quality_score: calculateQualityScore(results)
};
recordAgentComplete(agentName, metrics, agentMetrics);
```

### 사이클 완료 시
```typescript
// 최종 승인 완료 시
completeCycle(metrics, true);
```

### 실패 시
```typescript
// 작업 실패 시
recordFailure(metrics, failedAgent, failureReason);
```
```

---

## 태스크 유형 분류

```typescript
function classifyTask(userRequest: string): string {
  const request = userRequest.toLowerCase();
  
  if (request.includes('버그') || request.includes('오류') || 
      request.includes('안됨') || request.includes('깨짐')) {
    return 'bugfix';
  }
  if (request.includes('긴급') || request.includes('당장') || 
      request.includes('핫픽스')) {
    return 'hotfix';
  }
  if (request.includes('문서') || request.includes('readme') || 
      request.includes('주석')) {
    return 'docs';
  }
  if (request.includes('개선') || request.includes('정리') || 
      request.includes('리팩토링') || request.includes('최적화')) {
    return 'refactor';
  }
  // 기본값: feature
  return 'feature';
}
```

---

## 주의사항

### 성능 고려사항
- 메트릭 수집이 메인 작업 흐름을 방해하지 않도록 비동기 처리
- 파일 I/O는 최소화 (배치 저장 고려)
- 메모리 사용량 모니터링

### 데이터 정확성
- 토큰 사용량은 추정치일 수 있음 (정확한 값은 API 응답에 따라)
- 시간 측정은 시스템 시간 기반 (정확도 제한)
- 일부 메트릭은 에이전트가 명시적으로 보고해야 함

### 확장성
- 메트릭 파일이 많아질 경우 성능 이슈 가능
- 주기적 아카이빙 필요
- 대용량 분석 시 인덱싱 고려

---

## Phase 3: 일별/주별 요약 생성

Phase 3에서는 수집된 사이클 메트릭을 기반으로 일별/주별 요약 리포트를 자동 생성합니다.

### 일별 요약 생성

```typescript
interface DailySummary {
  date: string; // YYYY-MM-DD
  total_cycles: number;
  successful_cycles: number;
  failed_cycles: number;
  success_rate: number;
  
  duration: {
    total_ms: number;
    avg_ms: number;
    avg_minutes: number;
    min_ms: number;
    max_ms: number;
  };
  
  tokens: {
    total: number;
    avg_per_cycle: number;
    avg_per_minute: number;
  };
  
  agent_performance: {
    [agent: string]: {
      avg_duration_ms: number;
      total_calls: number;
      retry_rate: number;
      avg_quality_score: number;
      avg_linter_errors?: number; // Developer만
      avg_coverage_improvement?: number; // QA만
    };
  };
  
  top_bottlenecks: Bottleneck[];
  task_type_distribution: {
    [task_type: string]: number;
  };
}

interface Bottleneck {
  agent: string;
  issue: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
}

// 일별 요약 생성
async function generateDailySummary(date: string): Promise<DailySummary> {
  // 해당 날짜의 모든 사이클 파일 읽기
  const cyclesDir = '.cursor/metrics/cycles/';
  const datePrefix = date; // YYYY-MM-DD
  const cycleFiles = listFiles(`${cyclesDir}${datePrefix}-*.json`);
  
  const cycles: CycleMetrics[] = [];
  for (const file of cycleFiles) {
    const content = await readFile(file, 'utf-8');
    cycles.push(JSON.parse(content));
  }
  
  if (cycles.length === 0) {
    throw new Error(`No cycles found for date ${date}`);
  }
  
  // 기본 통계 계산
  const successful_cycles = cycles.filter(c => c.totals?.success === true).length;
  const failed_cycles = cycles.length - successful_cycles;
  const success_rate = successful_cycles / cycles.length;
  
  // 시간 통계
  const durations = cycles.map(c => c.totals?.duration_ms || 0).filter(d => d > 0);
  const duration = {
    total_ms: durations.reduce((sum, d) => sum + d, 0),
    avg_ms: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
    avg_minutes: durations.length > 0 ? (durations.reduce((sum, d) => sum + d, 0) / durations.length) / 60000 : 0,
    min_ms: durations.length > 0 ? Math.min(...durations) : 0,
    max_ms: durations.length > 0 ? Math.max(...durations) : 0
  };
  
  // 토큰 통계
  const total_tokens = cycles.reduce((sum, c) => sum + (c.totals?.total_tokens || 0), 0);
  const tokens = {
    total: total_tokens,
    avg_per_cycle: cycles.length > 0 ? total_tokens / cycles.length : 0,
    avg_per_minute: duration.avg_ms > 0 ? (total_tokens / duration.avg_ms) * 60000 : 0
  };
  
  // 에이전트별 성능 통계
  const agent_performance: DailySummary['agent_performance'] = {};
  const agent_names = ['planner', 'developer', 'qa', 'docs'];
  
  for (const agent of agent_names) {
    const agent_cycles = cycles.filter(c => c.agents?.[agent]);
    if (agent_cycles.length === 0) continue;
    
    const durations = agent_cycles.map(c => c.agents[agent].duration_ms || 0).filter(d => d > 0);
    const retries = agent_cycles.map(c => c.agents[agent].retries || 0);
    const quality_scores = agent_cycles.map(c => c.agents[agent].quality_score || 0).filter(s => s > 0);
    
    const performance: any = {
      avg_duration_ms: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      total_calls: agent_cycles.length,
      retry_rate: retries.length > 0 ? retries.filter(r => r > 0).length / retries.length : 0,
      avg_quality_score: quality_scores.length > 0 ? quality_scores.reduce((sum, s) => sum + s, 0) / quality_scores.length : 0
    };
    
    // Developer 특수 메트릭
    if (agent === 'developer') {
      const linter_errors = agent_cycles.map(c => c.agents[agent].linter_errors_introduced || 0);
      performance.avg_linter_errors = linter_errors.length > 0 
        ? linter_errors.reduce((sum, e) => sum + e, 0) / linter_errors.length 
        : 0;
    }
    
    // QA 특수 메트릭
    if (agent === 'qa') {
      const coverage_improvements = agent_cycles
        .map(c => {
          const qa = c.agents[agent];
          if (qa.coverage_before && qa.coverage_after) {
            return qa.coverage_after - qa.coverage_before;
          }
          return 0;
        })
        .filter(ci => ci > 0);
      performance.avg_coverage_improvement = coverage_improvements.length > 0
        ? coverage_improvements.reduce((sum, ci) => sum + ci, 0) / coverage_improvements.length
        : 0;
    }
    
    agent_performance[agent] = performance;
  }
  
  // 병목 지점 식별
  const bottlenecks = identifyBottlenecks(cycles);
  
  // 태스크 유형 분포
  const task_type_distribution: { [key: string]: number } = {};
  for (const cycle of cycles) {
    const task_type = cycle.task_type || 'unknown';
    task_type_distribution[task_type] = (task_type_distribution[task_type] || 0) + 1;
  }
  
  const summary: DailySummary = {
    date,
    total_cycles: cycles.length,
    successful_cycles,
    failed_cycles,
    success_rate,
    duration,
    tokens,
    agent_performance,
    top_bottlenecks: bottlenecks,
    task_type_distribution
  };
  
  // 파일 저장
  const summariesDir = '.cursor/metrics/summaries/';
  const filePath = `${summariesDir}daily-${date}.json`;
  ensureDirectoryExists(summariesDir);
  await writeFile(filePath, JSON.stringify(summary, null, 2), 'utf-8');
  
  return summary;
}

// 병목 지점 식별
function identifyBottlenecks(cycles: CycleMetrics[]): Bottleneck[] {
  const bottlenecks: Map<string, { agent: string; issue: string; frequency: number }> = new Map();
  
  for (const cycle of cycles) {
    // 재시도가 많은 에이전트 찾기
    for (const [agent, agentData] of Object.entries(cycle.agents || {})) {
      if (agentData.retries > 0) {
        const key = `${agent}_retries`;
        const existing = bottlenecks.get(key);
        if (existing) {
          existing.frequency++;
        } else {
          bottlenecks.set(key, {
            agent,
            issue: 'high_retry_rate',
            frequency: 1
          });
        }
      }
    }
    
    // Developer: Linter 오류
    if (cycle.agents?.developer?.linter_errors_introduced > 0) {
      const key = 'developer_linter_errors';
      const existing = bottlenecks.get(key);
      if (existing) {
        existing.frequency++;
      } else {
        bottlenecks.set(key, {
          agent: 'developer',
          issue: 'linter_errors',
          frequency: 1
        });
      }
    }
    
    // QA: 커버리지 미달
    if (cycle.agents?.qa) {
      const qa = cycle.agents.qa;
      if (qa.retries > 0 && qa.coverage_after && qa.coverage_before) {
        const key = 'qa_coverage_threshold';
        const existing = bottlenecks.get(key);
        if (existing) {
          existing.frequency++;
        } else {
          bottlenecks.set(key, {
            agent: 'qa',
            issue: 'coverage_threshold_not_met',
            frequency: 1
          });
        }
      }
    }
    
    // 실패한 사이클
    if (!cycle.totals?.success) {
      const failed_agent = cycle.totals?.failed_at_agent || 'unknown';
      const key = `${failed_agent}_failure`;
      const existing = bottlenecks.get(key);
      if (existing) {
        existing.frequency++;
      } else {
        bottlenecks.set(key, {
          agent: failed_agent,
          issue: cycle.totals?.failure_reason || 'unknown_failure',
          frequency: 1
        });
      }
    }
  }
  
  // 빈도순 정렬 및 영향도 계산
  const bottleneck_list: Bottleneck[] = Array.from(bottlenecks.values())
    .map(b => ({
      ...b,
      impact: b.frequency >= cycles.length * 0.3 ? 'high' as const
        : b.frequency >= cycles.length * 0.15 ? 'medium' as const
        : 'low' as const
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10); // 상위 10개만 반환
  
  return bottleneck_list;
}
```

### 주별 요약 생성

```typescript
interface WeeklySummary {
  week: string; // YYYY-WW (예: 2026-04)
  start_date: string; // 주 시작일 (YYYY-MM-DD)
  end_date: string; // 주 종료일 (YYYY-MM-DD)
  total_cycles: number;
  successful_cycles: number;
  failed_cycles: number;
  success_rate: number;
  
  daily_summaries: DailySummary[];
  
  trends: {
    avg_duration_trend: 'increasing' | 'decreasing' | 'stable';
    success_rate_trend: 'increasing' | 'decreasing' | 'stable';
    token_efficiency_trend: 'increasing' | 'decreasing' | 'stable';
  };
  
  agent_performance_trends: {
    [agent: string]: {
      avg_duration_change_percent: number;
      retry_rate_change_percent: number;
      quality_score_change_percent: number;
    };
  };
  
  top_improvements: Improvement[];
  recommendations: string[];
}

interface Improvement {
  area: string;
  before: number;
  after: number;
  improvement_percent: number;
}

// 주별 요약 생성
async function generateWeeklySummary(year: number, week: number): Promise<WeeklySummary> {
  // 주의 시작일과 종료일 계산
  const start_date = getWeekStartDate(year, week);
  const end_date = getWeekEndDate(year, week);
  
  // 해당 주의 일별 요약 읽기
  const summariesDir = '.cursor/metrics/summaries/';
  const daily_summaries: DailySummary[] = [];
  
  const current_date = new Date(start_date);
  while (current_date <= new Date(end_date)) {
    const date_str = current_date.toISOString().split('T')[0];
    const filePath = `${summariesDir}daily-${date_str}.json`;
    
    if (fileExists(filePath)) {
      const content = await readFile(filePath, 'utf-8');
      daily_summaries.push(JSON.parse(content));
    }
    
    current_date.setDate(current_date.getDate() + 1);
  }
  
  if (daily_summaries.length === 0) {
    throw new Error(`No daily summaries found for week ${year}-W${week}`);
  }
  
  // 전체 통계 집계
  const total_cycles = daily_summaries.reduce((sum, d) => sum + d.total_cycles, 0);
  const successful_cycles = daily_summaries.reduce((sum, d) => sum + d.successful_cycles, 0);
  const failed_cycles = total_cycles - successful_cycles;
  const success_rate = total_cycles > 0 ? successful_cycles / total_cycles : 0;
  
  // 트렌드 분석
  const trends = analyzeTrends(daily_summaries);
  
  // 에이전트별 성능 트렌드
  const agent_performance_trends = analyzeAgentTrends(daily_summaries);
  
  // 개선 사항 식별
  const top_improvements = identifyImprovements(daily_summaries);
  
  // 개선 제안 생성
  const recommendations = generateRecommendations(daily_summaries, trends, top_improvements);
  
  const summary: WeeklySummary = {
    week: `${year}-W${String(week).padStart(2, '0')}`,
    start_date,
    end_date,
    total_cycles,
    successful_cycles,
    failed_cycles,
    success_rate,
    daily_summaries,
    trends,
    agent_performance_trends,
    top_improvements,
    recommendations
  };
  
  // 파일 저장
  const filePath = `${summariesDir}weekly-${year}-W${String(week).padStart(2, '0')}.json`;
  ensureDirectoryExists(summariesDir);
  await writeFile(filePath, JSON.stringify(summary, null, 2), 'utf-8');
  
  return summary;
}

// 주 시작일 계산 (ISO 8601 주 기준)
function getWeekStartDate(year: number, week: number): string {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7; // 월요일 = 1
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - jan4Day + 1 + (week - 1) * 7);
  return weekStart.toISOString().split('T')[0];
}

// 주 종료일 계산
function getWeekEndDate(year: number, week: number): string {
  const start_date = getWeekStartDate(year, week);
  const end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + 6);
  return end_date.toISOString().split('T')[0];
}

// 트렌드 분석
function analyzeTrends(daily_summaries: DailySummary[]): WeeklySummary['trends'] {
  if (daily_summaries.length < 2) {
    return {
      avg_duration_trend: 'stable',
      success_rate_trend: 'stable',
      token_efficiency_trend: 'stable'
    };
  }
  
  const first_half = daily_summaries.slice(0, Math.floor(daily_summaries.length / 2));
  const second_half = daily_summaries.slice(Math.floor(daily_summaries.length / 2));
  
  const first_avg_duration = first_half.reduce((sum, d) => sum + d.duration.avg_ms, 0) / first_half.length;
  const second_avg_duration = second_half.reduce((sum, d) => sum + d.duration.avg_ms, 0) / second_half.length;
  const duration_change = (second_avg_duration - first_avg_duration) / first_avg_duration;
  
  const first_success_rate = first_half.reduce((sum, d) => sum + d.success_rate, 0) / first_half.length;
  const second_success_rate = second_half.reduce((sum, d) => sum + d.success_rate, 0) / second_half.length;
  const success_rate_change = second_success_rate - first_success_rate;
  
  const first_token_efficiency = first_half.reduce((sum, d) => sum + d.tokens.avg_per_minute, 0) / first_half.length;
  const second_token_efficiency = second_half.reduce((sum, d) => sum + d.tokens.avg_per_minute, 0) / second_half.length;
  const token_efficiency_change = (second_token_efficiency - first_token_efficiency) / first_token_efficiency;
  
  return {
    avg_duration_trend: Math.abs(duration_change) < 0.05 ? 'stable' : duration_change > 0 ? 'increasing' : 'decreasing',
    success_rate_trend: Math.abs(success_rate_change) < 0.02 ? 'stable' : success_rate_change > 0 ? 'increasing' : 'decreasing',
    token_efficiency_trend: Math.abs(token_efficiency_change) < 0.05 ? 'stable' : token_efficiency_change > 0 ? 'increasing' : 'decreasing'
  };
}

// 에이전트별 트렌드 분석
function analyzeAgentTrends(daily_summaries: DailySummary[]): WeeklySummary['agent_performance_trends'] {
  const trends: WeeklySummary['agent_performance_trends'] = {};
  
  if (daily_summaries.length < 2) return trends;
  
  const first_half = daily_summaries.slice(0, Math.floor(daily_summaries.length / 2));
  const second_half = daily_summaries.slice(Math.floor(daily_summaries.length / 2));
  
  const agent_names = ['planner', 'developer', 'qa', 'docs'];
  
  for (const agent of agent_names) {
    const first_performance = first_half
      .map(d => d.agent_performance[agent])
      .filter(p => p !== undefined);
    const second_performance = second_half
      .map(d => d.agent_performance[agent])
      .filter(p => p !== undefined);
    
    if (first_performance.length === 0 || second_performance.length === 0) continue;
    
    const first_avg_duration = first_performance.reduce((sum, p) => sum + p.avg_duration_ms, 0) / first_performance.length;
    const second_avg_duration = second_performance.reduce((sum, p) => sum + p.avg_duration_ms, 0) / second_performance.length;
    
    const first_retry_rate = first_performance.reduce((sum, p) => sum + p.retry_rate, 0) / first_performance.length;
    const second_retry_rate = second_performance.reduce((sum, p) => sum + p.retry_rate, 0) / second_performance.length;
    
    const first_quality = first_performance.reduce((sum, p) => sum + p.avg_quality_score, 0) / first_performance.length;
    const second_quality = second_performance.reduce((sum, p) => sum + p.avg_quality_score, 0) / second_performance.length;
    
    trends[agent] = {
      avg_duration_change_percent: first_avg_duration > 0 
        ? ((second_avg_duration - first_avg_duration) / first_avg_duration) * 100 
        : 0,
      retry_rate_change_percent: first_retry_rate > 0
        ? ((second_retry_rate - first_retry_rate) / first_retry_rate) * 100
        : 0,
      quality_score_change_percent: first_quality > 0
        ? ((second_quality - first_quality) / first_quality) * 100
        : 0
    };
  }
  
  return trends;
}

// 개선 사항 식별
function identifyImprovements(daily_summaries: DailySummary[]): Improvement[] {
  const improvements: Improvement[] = [];
  
  if (daily_summaries.length < 2) return improvements;
  
  const first_half = daily_summaries.slice(0, Math.floor(daily_summaries.length / 2));
  const second_half = daily_summaries.slice(Math.floor(daily_summaries.length / 2));
  
  // 성공률 개선
  const first_success_rate = first_half.reduce((sum, d) => sum + d.success_rate, 0) / first_half.length;
  const second_success_rate = second_half.reduce((sum, d) => sum + d.success_rate, 0) / second_half.length;
  if (second_success_rate > first_success_rate) {
    improvements.push({
      area: 'success_rate',
      before: first_success_rate,
      after: second_success_rate,
      improvement_percent: ((second_success_rate - first_success_rate) / first_success_rate) * 100
    });
  }
  
  // 평균 완료 시간 개선
  const first_avg_duration = first_half.reduce((sum, d) => sum + d.duration.avg_ms, 0) / first_half.length;
  const second_avg_duration = second_half.reduce((sum, d) => sum + d.duration.avg_ms, 0) / second_half.length;
  if (second_avg_duration < first_avg_duration) {
    improvements.push({
      area: 'avg_duration',
      before: first_avg_duration,
      after: second_avg_duration,
      improvement_percent: ((first_avg_duration - second_avg_duration) / first_avg_duration) * 100
    });
  }
  
  // 에이전트별 재시도율 개선
  const agent_names = ['planner', 'developer', 'qa', 'docs'];
  for (const agent of agent_names) {
    const first_retry_rate = first_half
      .map(d => d.agent_performance[agent]?.retry_rate || 0)
      .filter(r => r > 0);
    const second_retry_rate = second_half
      .map(d => d.agent_performance[agent]?.retry_rate || 0)
      .filter(r => r > 0);
    
    if (first_retry_rate.length > 0 && second_retry_rate.length > 0) {
      const first_avg = first_retry_rate.reduce((sum, r) => sum + r, 0) / first_retry_rate.length;
      const second_avg = second_retry_rate.reduce((sum, r) => sum + r, 0) / second_retry_rate.length;
      
      if (second_avg < first_avg) {
        improvements.push({
          area: `${agent}_retry_rate`,
          before: first_avg,
          after: second_avg,
          improvement_percent: ((first_avg - second_avg) / first_avg) * 100
        });
      }
    }
  }
  
  return improvements.sort((a, b) => b.improvement_percent - a.improvement_percent).slice(0, 5);
}

// 개선 제안 생성
function generateRecommendations(
  daily_summaries: DailySummary[],
  trends: WeeklySummary['trends'],
  improvements: Improvement[]
): string[] {
  const recommendations: string[] = [];
  
  // 성공률 저하 시
  if (trends.success_rate_trend === 'decreasing') {
    recommendations.push('성공률이 하락 추세입니다. 실패 원인을 분석하고 개선 조치를 취하세요.');
  }
  
  // 평균 완료 시간 증가 시
  if (trends.avg_duration_trend === 'increasing') {
    recommendations.push('평균 완료 시간이 증가하고 있습니다. 병목 지점을 확인하고 최적화하세요.');
  }
  
  // 토큰 효율 저하 시
  if (trends.token_efficiency_trend === 'decreasing') {
    recommendations.push('토큰 효율이 저하되고 있습니다. 불필요한 토큰 사용을 줄이는 방법을 검토하세요.');
  }
  
  // 병목 지점 기반 제안
  const all_bottlenecks = daily_summaries.flatMap(d => d.top_bottlenecks);
  const bottleneck_frequency: Map<string, number> = new Map();
  
  for (const bottleneck of all_bottlenecks) {
    const key = `${bottleneck.agent}_${bottleneck.issue}`;
    bottleneck_frequency.set(key, (bottleneck_frequency.get(key) || 0) + bottleneck.frequency);
  }
  
  const top_bottleneck = Array.from(bottleneck_frequency.entries())
    .sort((a, b) => b[1] - a[1])[0];
  
  if (top_bottleneck) {
    const [key, frequency] = top_bottleneck;
    const [agent, issue] = key.split('_');
    
    if (issue === 'high_retry_rate') {
      recommendations.push(`${agent} 에이전트의 재시도율이 높습니다. 작업 품질을 개선하거나 요구사항을 명확히 하세요.`);
    } else if (issue === 'linter_errors') {
      recommendations.push('Developer 에이전트에서 Linter 오류가 자주 발생합니다. 코드 품질 검증을 강화하세요.');
    } else if (issue === 'coverage_threshold_not_met') {
      recommendations.push('QA 에이전트에서 커버리지 기준 미달이 자주 발생합니다. 테스트 전략을 재검토하세요.');
    }
  }
  
  // 개선 사항 축하
  if (improvements.length > 0) {
    const top_improvement = improvements[0];
    recommendations.push(`${top_improvement.area}에서 ${top_improvement.improvement_percent.toFixed(1)}% 개선되었습니다.`);
  }
  
  return recommendations;
}

// 요약 생성 트리거
async function updateDailySummaryOnCycleComplete(cycle: CycleMetrics): Promise<void> {
  const date = cycle.cycle_id.split('-').slice(0, 3).join('-'); // YYYY-MM-DD 추출
  
  try {
    // 기존 일별 요약이 있으면 업데이트, 없으면 생성
    const summariesDir = '.cursor/metrics/summaries/';
    const filePath = `${summariesDir}daily-${date}.json`;
    
    if (fileExists(filePath)) {
      // 기존 요약 읽기
      const existing = JSON.parse(await readFile(filePath, 'utf-8'));
      // 새 사이클 추가하여 재계산
      const cyclesDir = '.cursor/metrics/cycles/';
      const cycleFiles = listFiles(`${cyclesDir}${date}-*.json`);
      const cycles = await Promise.all(
        cycleFiles.map(f => readFile(f, 'utf-8').then(c => JSON.parse(c)))
      );
      // 재생성
      await generateDailySummary(date);
    } else {
      // 새로 생성
      await generateDailySummary(date);
    }
  } catch (error) {
    // 에러 발생 시 로그만 남기고 계속 진행 (메인 작업 흐름 방해하지 않음)
    console.error(`Failed to update daily summary for ${date}:`, error);
  }
}
```

### 성능 리포트 생성 (Markdown)

```typescript
// 성능 리포트 생성 (Markdown 형식)
async function generatePerformanceReport(date: string): Promise<void> {
  // 일별 요약 읽기
  const summariesDir = '.cursor/metrics/summaries/';
  const dailySummaryPath = `${summariesDir}daily-${date}.json`;
  
  if (!fileExists(dailySummaryPath)) {
    throw new Error(`Daily summary not found for ${date}`);
  }
  
  const dailySummary: DailySummary = JSON.parse(
    await readFile(dailySummaryPath, 'utf-8')
  );
  
  // 사이클 데이터 읽기 (상세 분석용)
  const cyclesDir = '.cursor/metrics/cycles/';
  const cycleFiles = listFiles(`${cyclesDir}${date}-*.json`);
  const cycles: CycleMetrics[] = await Promise.all(
    cycleFiles.map(f => readFile(f, 'utf-8').then(c => JSON.parse(c)))
  );
  
  // Markdown 리포트 생성
  const report = generateMarkdownReport(dailySummary, cycles);
  
  // 파일 저장
  const reportPath = `${summariesDir}performance-report-${date}.md`;
  await writeFile(reportPath, report, 'utf-8');
}

function generateMarkdownReport(
  summary: DailySummary,
  cycles: CycleMetrics[]
): string {
  const lines: string[] = [];
  
  // 헤더
  lines.push(`# 성능 리포트 - ${summary.date}`);
  lines.push('');
  lines.push(`**생성 일시**: ${new Date().toISOString()}`);
  lines.push('');
  
  // 요약 통계
  lines.push('## 📊 요약 통계');
  lines.push('');
  lines.push('| 지표 | 값 |');
  lines.push('|------|-----|');
  lines.push(`| 총 사이클 수 | ${summary.total_cycles} |`);
  lines.push(`| 성공한 사이클 | ${summary.successful_cycles} |`);
  lines.push(`| 실패한 사이클 | ${summary.failed_cycles} |`);
  lines.push(`| 성공률 | ${(summary.success_rate * 100).toFixed(1)}% |`);
  lines.push(`| 평균 완료 시간 | ${(summary.duration.avg_minutes).toFixed(2)}분 |');
  lines.push(`| 총 토큰 사용량 | ${summary.tokens.total.toLocaleString()} |`);
  lines.push(`| 평균 토큰/분 | ${summary.tokens.avg_per_minute.toFixed(0)} |`);
  lines.push('');
  
  // 에이전트별 성능 비교
  lines.push('## 🤖 에이전트별 성능 비교');
  lines.push('');
  lines.push('| 에이전트 | 평균 시간 | 호출 횟수 | 재시도율 | 품질 점수 |');
  lines.push('|---------|----------|----------|---------|----------|');
  
  for (const [agent, perf] of Object.entries(summary.agent_performance)) {
    const duration_sec = (perf.avg_duration_ms / 1000).toFixed(1);
    const retry_rate_pct = (perf.retry_rate * 100).toFixed(1);
    const quality_pct = (perf.avg_quality_score * 100).toFixed(1);
    
    lines.push(`| ${agent} | ${duration_sec}초 | ${perf.total_calls} | ${retry_rate_pct}% | ${quality_pct}% |`);
  }
  lines.push('');
  
  // 시간대별 성능 분석
  lines.push('## ⏱️ 시간대별 성능 분석');
  lines.push('');
  
  const hourly_performance = analyzeHourlyPerformance(cycles);
  lines.push('| 시간대 | 사이클 수 | 평균 시간 | 성공률 |');
  lines.push('|--------|----------|----------|--------|');
  
  for (const [hour, stats] of Object.entries(hourly_performance)) {
    const avg_min = (stats.avg_duration_ms / 60000).toFixed(1);
    const success_pct = (stats.success_rate * 100).toFixed(1);
    lines.push(`| ${hour}:00 | ${stats.count} | ${avg_min}분 | ${success_pct}% |`);
  }
  lines.push('');
  
  // 병목 지점 하이라이트
  lines.push('## 🔴 병목 지점');
  lines.push('');
  
  if (summary.top_bottlenecks.length === 0) {
    lines.push('✅ 특별한 병목 지점이 발견되지 않았습니다.');
  } else {
    lines.push('| 에이전트 | 이슈 | 빈도 | 영향도 |');
    lines.push('|---------|------|------|--------|');
    
    for (const bottleneck of summary.top_bottlenecks.slice(0, 5)) {
      const impact_emoji = bottleneck.impact === 'high' ? '🔴' 
        : bottleneck.impact === 'medium' ? '🟡' 
        : '🟢';
      lines.push(`| ${bottleneck.agent} | ${bottleneck.issue} | ${bottleneck.frequency}회 | ${impact_emoji} ${bottleneck.impact} |`);
    }
  }
  lines.push('');
  
  // 태스크 유형 분포
  lines.push('## 📋 태스크 유형 분포');
  lines.push('');
  
  const total_tasks = Object.values(summary.task_type_distribution).reduce((sum, v) => sum + v, 0);
  for (const [task_type, count] of Object.entries(summary.task_type_distribution)) {
    const percentage = (count / total_tasks * 100).toFixed(1);
    const bar_length = Math.round(count / total_tasks * 20);
    const bar = '█'.repeat(bar_length) + '░'.repeat(20 - bar_length);
    lines.push(`- **${task_type}**: ${count}개 (${percentage}%) ${bar}`);
  }
  lines.push('');
  
  // 성능 차트 (ASCII)
  lines.push('## 📈 성능 트렌드');
  lines.push('');
  
  // 평균 완료 시간 차트
  lines.push('### 평균 완료 시간 추이');
  lines.push('');
  lines.push(generateAsciiChart(summary.duration, 'avg_ms'));
  lines.push('');
  
  // 성공률 차트
  lines.push('### 성공률 추이');
  lines.push('');
  lines.push(generateAsciiChart({ value: summary.success_rate * 100 }, 'value'));
  lines.push('');
  
  // 개선 제안
  lines.push('## 💡 개선 제안');
  lines.push('');
  
  const recommendations = generateRecommendationsFromSummary(summary);
  if (recommendations.length === 0) {
    lines.push('✅ 현재 성능이 양호합니다. 유지하세요!');
  } else {
    for (let i = 0; i < recommendations.length; i++) {
      lines.push(`${i + 1}. ${recommendations[i]}`);
    }
  }
  lines.push('');
  
  // 상세 통계
  lines.push('## 📊 상세 통계');
  lines.push('');
  lines.push('### 완료 시간 분포');
  lines.push('');
  lines.push(`- 최소: ${(summary.duration.min_ms / 60000).toFixed(2)}분`);
  lines.push(`- 최대: ${(summary.duration.max_ms / 60000).toFixed(2)}분`);
  lines.push(`- 평균: ${summary.duration.avg_minutes.toFixed(2)}분`);
  lines.push(`- 총 시간: ${(summary.duration.total_ms / 3600000).toFixed(2)}시간`);
  lines.push('');
  
  // Developer 특수 메트릭
  if (summary.agent_performance.developer?.avg_linter_errors !== undefined) {
    lines.push('### Developer 에이전트');
    lines.push('');
    lines.push(`- 평균 Linter 오류: ${summary.agent_performance.developer.avg_linter_errors.toFixed(1)}개`);
    lines.push('');
  }
  
  // QA 특수 메트릭
  if (summary.agent_performance.qa?.avg_coverage_improvement !== undefined) {
    lines.push('### QA 에이전트');
    lines.push('');
    lines.push(`- 평균 커버리지 개선: ${(summary.agent_performance.qa.avg_coverage_improvement * 100).toFixed(1)}%`);
    lines.push('');
  }
  
  return lines.join('\n');
}

function analyzeHourlyPerformance(cycles: CycleMetrics[]): {
  [hour: string]: { count: number; avg_duration_ms: number; success_rate: number }
} {
  const hourly: { [hour: string]: { count: number; total_duration: number; successful: number } } = {};
  
  for (const cycle of cycles) {
    const started_at = new Date(cycle.started_at || cycle.timestamp);
    const hour = String(started_at.getHours()).padStart(2, '0');
    
    if (!hourly[hour]) {
      hourly[hour] = { count: 0, total_duration: 0, successful: 0 };
    }
    
    hourly[hour].count++;
    hourly[hour].total_duration += cycle.totals?.duration_ms || 0;
    if (cycle.totals?.success) {
      hourly[hour].successful++;
    }
  }
  
  const result: { [hour: string]: { count: number; avg_duration_ms: number; success_rate: number } } = {};
  
  for (const [hour, stats] of Object.entries(hourly)) {
    result[hour] = {
      count: stats.count,
      avg_duration_ms: stats.count > 0 ? stats.total_duration / stats.count : 0,
      success_rate: stats.count > 0 ? stats.successful / stats.count : 0
    };
  }
  
  return result;
}

function generateAsciiChart(data: any, key: string): string {
  const value = data[key] || 0;
  const max_value = value * 1.2; // 여유 공간
  const bar_length = Math.round((value / max_value) * 50);
  const bar = '█'.repeat(bar_length);
  return `${bar} ${value.toFixed(1)}`;
}

function generateRecommendationsFromSummary(summary: DailySummary): string[] {
  const recommendations: string[] = [];
  
  // 성공률이 낮으면
  if (summary.success_rate < 0.9) {
    recommendations.push(`성공률이 ${(summary.success_rate * 100).toFixed(1)}%로 낮습니다. 실패 원인을 분석하세요.`);
  }
  
  // 재시도율이 높은 에이전트
  for (const [agent, perf] of Object.entries(summary.agent_performance)) {
    if (perf.retry_rate > 0.2) {
      recommendations.push(`${agent} 에이전트의 재시도율이 ${(perf.retry_rate * 100).toFixed(1)}%입니다. 작업 품질을 개선하세요.`);
    }
  }
  
  // 평균 완료 시간이 길면
  if (summary.duration.avg_minutes > 30) {
    recommendations.push(`평균 완료 시간이 ${summary.duration.avg_minutes.toFixed(1)}분으로 깁니다. 병목 지점을 확인하세요.`);
  }
  
  // 병목 지점 기반 제안
  for (const bottleneck of summary.top_bottlenecks.slice(0, 3)) {
    if (bottleneck.impact === 'high') {
      recommendations.push(`${bottleneck.agent} 에이전트의 "${bottleneck.issue}" 문제가 ${bottleneck.frequency}회 발생했습니다. 즉시 조치가 필요합니다.`);
    }
  }
  
  return recommendations;
}
```

---

## 완료 기준

- [ ] 모든 사이클이 자동으로 기록됨
- [ ] `.cursor/metrics/cycles/`에 파일 생성됨
- [ ] 기본 메트릭이 정확히 기록됨
- [ ] 실패한 작업도 기록됨
- [ ] 메인 작업 흐름을 방해하지 않음
- [ ] 일별 요약이 자동 생성됨
- [ ] 주별 요약이 자동 생성됨
- [ ] 병목 지점이 정확히 식별됨
