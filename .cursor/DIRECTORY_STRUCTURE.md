# 에이전트 시스템 디렉토리 구조

이 문서는 자기 진화 멀티 에이전트 시스템을 구현할 때 생성될 전체 디렉토리 구조와 각 파일의 역할을 설명합니다.

## 전체 구조

```
.cursor/
├── AGENT_SYSTEM_DESIGN.md          # 전체 시스템 설계 문서
├── DIRECTORY_STRUCTURE.md          # 이 문서
├── IMPLEMENTATION_ROADMAP.md       # 구현 로드맵
│
├── agents/                         # 서브에이전트 정의 파일 (신규 추가)
│   ├── planner.md                  # 기획 에이전트 정의
│   ├── developer.md                # 구현 에이전트 정의
│   ├── qa.md                       # QA 에이전트 정의
│   └── docs.md                     # 문서화 에이전트 정의
│
├── rules/                          # Rule 파일 (모든 에이전트용으로 확장)
│   ├── main-orchestrator.mdc       # 메인 에이전트 조율 규칙
│   ├── planner.mdc                 # 기획 에이전트 Rule (신규 추가)
│   ├── developer.mdc               # 구현 에이전트 Rule (신규 추가)
│   ├── qa.mdc                      # QA 에이전트 Rule (신규 추가)
│   └── docs.mdc                    # 문서화 에이전트 Rule (신규 추가)
│
├── skills/                         # 공통 Skill (SKILL.md 형식)
│   ├── cli-usage/                  # CLI 사용 가이드
│   │   └── SKILL.md
│   ├── error-handling/             # 에러 처리 원칙
│   │   └── SKILL.md
│   └── project-conventions/       # 프로젝트 컨벤션
│       └── SKILL.md
│
│   # 참고: 에이전트별 Skill은 .cursor/skills/ 에 있습니다.
│   # 예: .cursor/skills/developer/references/, .cursor/skills/planner/references/ 등
│
├── metrics/                        # 성능 메트릭 데이터
│   ├── cycles/                     # 사이클별 기록
│   │   ├── 2026-01-28-001.json
│   │   ├── 2026-01-28-002.json
│   │   └── ...
│   │
│   ├── agents/                     # 에이전트별 통계
│   │   ├── main-stats.json
│   │   ├── planner-stats.json
│   │   ├── developer-stats.json
│   │   ├── qa-stats.json
│   │   └── docs-stats.json
│   │
│   ├── improvements/               # 개선 이력
│   │   ├── 2026-01-28-improvement-001.md
│   │   ├── 2026-01-28-improvement-002.md
│   │   └── ...
│   │
│   └── mcp-opportunities/          # MCP 개발 기회
│       ├── 2026-01-28-opp-001.json
│       ├── 2026-01-28-opp-002.json
│       └── ...
│
├── mcp-servers/                    # 자동 생성된 MCP 서버
│   ├── vitest-coverage/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   └── index.test.ts
│   │   ├── dist/
│   │   │   └── index.js
│   │   └── README.md
│   │
│   ├── github-helper/
│   │   └── (동일 구조)
│   │
│   └── react-analyzer/
│       └── (동일 구조)
│
└── mcp-servers.json                # MCP 서버 레지스트리
```

---

## 파일 상세 설명

### 1. 설계 문서 (루트)

#### AGENT_SYSTEM_DESIGN.md
- **목적**: 전체 시스템의 마스터 설계 문서
- **내용**: 아키텍처, 에이전트 정의, 워크플로우, 메타 시스템
- **사용자**: 시스템 구현 시 참조
- **업데이트**: 시스템 개선 에이전트가 수정 (드물게)

#### DIRECTORY_STRUCTURE.md (이 문서)
- **목적**: 디렉토리 구조 및 파일 역할 설명
- **내용**: 각 파일/디렉토리의 목적과 구조
- **사용자**: 개발자, 에이전트
- **업데이트**: 구조 변경 시

#### IMPLEMENTATION_ROADMAP.md
- **목적**: 단계별 구현 계획
- **내용**: Phase별 작업, 체크리스트, 검증 기준
- **사용자**: 구현 시 진행 가이드
- **업데이트**: Phase 완료 시 체크

---

### 2. Rules (메인 에이전트 전용)

#### rules/main-orchestrator.mdc

```yaml
---
description: 메인 에이전트 조율 규칙 - 워크플로우 선택 및 품질 게이트
alwaysApply: true
---
```

**내용:**
- 태스크 분류 기준 (feature/bugfix/refactor/docs/hotfix)
- 워크플로우 선택 로직
- 워크플로우 관리자 호출 조건
- 각 단계별 품질 게이트
- 최종 승인 기준

**특징:**
- 메인 에이전트에만 자동 적용
- 항상 로드됨 (alwaysApply: true)
- 시스템 개선 에이전트가 최적화

**파일 크기**: ~200줄 (50줄 이내 권장이지만 핵심이므로 예외)

---

### 3. Skills

#### 3.1 .cursor/skills/ - 공통 Skill (SKILL.md 형식)

**.cursor/skills/project-conventions/SKILL.md**
- 프로젝트 코딩 컨벤션
- 네이밍 규칙 (snake_case, camelCase)
- 파일 구조 규칙
- 모든 에이전트가 참조

**.cursor/skills/error-handling/SKILL.md**
- 에러 처리 패턴
- try-catch 사용법
- 에러 로깅 규칙
- 구현 및 QA 에이전트가 주로 사용

**.cursor/skills/cli-usage/SKILL.md**
- CLI/터미널 명령어 실행 가이드
- pnpm, git, turbo 등 사용 시 참조

**에이전트별 Skill**: `.cursor/skills/{agent}/references/` 에 위치합니다.
- developer, planner, qa, docs-agent, git-workflow, security, orchestrator, system-improvement 등

---

#### 3.2 main/ - 메인 에이전트 Skill (→ .cursor/skills/orchestrator/references/)

**main/task-classifier.md**
```markdown
---
name: task-classifier
description: 사용자 요청을 태스크 유형으로 분류
---

# 태스크 분류기

## 분류 기준

### Feature (새 기능)
- 키워드: "추가", "새로운", "구현", "만들어"
- 예시: "사용자 인증 추가해줘"
- 워크플로우: 기획 → 구현 → QA → 문서화

### Bugfix (버그 수정)
- 키워드: "버그", "오류", "안됨", "깨짐"
- 예시: "로그인이 안돼요"
- 워크플로우: QA (재현) → 구현 → QA (검증)

...
```

**main/workflow-selector.md**
- 태스크 유형에 따른 워크플로우 선택
- 5가지 워크플로우 패턴 정의
- 예외 상황 처리

**main/quality-gate.md**
- 각 단계별 품질 검증 체크리스트
- 통과 기준
- 실패 시 대응

**main/agent-orchestration.md**
- 단순 조율 vs 워크플로우 관리자 호출 판단
- 에이전트 호출 방법
- 컨텍스트 전달 규칙

---

#### 3.3 orchestrator/ - 워크플로우 관리자 Skill

**orchestrator/task-decomposition.md**
- 복잡한 태스크를 서브태스크로 분해
- 의존성 식별
- 병렬 가능 작업 식별

**orchestrator/agent-selection.md**
- 각 서브태스크에 적합한 에이전트 선택
- 에이전트 능력 매칭
- 백업 에이전트 지정

**orchestrator/workflow-orchestration.md**
- 에이전트 호출 순서 결정
- 병렬 vs 순차 실행 판단
- 동기화 포인트 설정

**orchestrator/dependency-management.md**
- 작업 간 의존성 관리
- 선행 조건 체크
- 데드락 방지

**orchestrator/parallel-execution.md**
- 병렬 실행 가능 작업 식별
- 리소스 분배
- 결과 통합

**orchestrator/progress-monitoring.md**
- 진행 상황 추적
- 병목 지점 식별
- 예상 시간 갱신

---

#### 3.4 planner/ - 기획 에이전트 Skill

**planner/requirement-analysis.md**
```markdown
---
name: requirement-analysis
description: 요구사항 추출 및 문서화
---

# 요구사항 분석

## 분석 단계

### 1. 요구사항 추출
- 사용자 스토리 작성
- 기능 요구사항 목록화
- 비기능 요구사항 식별

### 2. 우선순위 지정
- Must have (필수)
- Should have (권장)
- Could have (선택)
- Won't have (제외)

### 3. 제약사항 분석
- 기술적 제약
- 시간/리소스 제약
- 레거시 시스템 고려

## 출력 형식

```markdown
# 요구사항 문서

## 기능 요구사항
1. [Must] 사용자 로그인
   - 이메일/비밀번호 인증
   - JWT 토큰 발급
   ...

## 비기능 요구사항
- 성능: 응답 시간 < 200ms
- 보안: HTTPS 필수
...
```
```

**planner/architecture-design.md**
- 아키텍처 패턴 선택 (MVC, Clean, Hexagonal 등)
- 컴포넌트 분해
- 인터페이스 정의

**planner/api-design.md**
- RESTful / GraphQL 설계
- 엔드포인트 정의
- 요청/응답 스키마

**planner/tech-stack-selection.md**
- 기술 스택 평가
- 장단점 분석
- 선정 이유 문서화

**planner/data-modeling.md**
- 데이터 모델 설계
- ERD 작성
- 관계 정의

---

#### 3.5 developer/ - 구현 에이전트 Skill

**developer/code-implementation.md**
```markdown
---
name: code-implementation
description: 코드 구현 체크리스트
---

# 코드 구현 가이드

## 구현 전 체크

- [ ] 설계 문서 읽음
- [ ] 관련 코드 파악
- [ ] 의존성 확인

## 구현 중 체크

- [ ] 변수명: snake_case
- [ ] 함수명: camelCase
- [ ] 주석: 복잡한 로직만
- [ ] 에러 처리 포함
- [ ] 테스트 가능하게 작성

## 구현 후 체크

- [ ] Linter 오류 0개
- [ ] 불필요한 코드 제거
- [ ] 주석 정리
- [ ] 설계와 일치 확인

## 코드 예시

```typescript
// ✅ 좋은 예
function calculateTotal(items: Item[]): number {
  if (items.length === 0) {
    throw new Error('Items cannot be empty');
  }
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ 나쁜 예
function calc(x) {
  return x.reduce((a,b)=>a+b.p,0);
}
```
```

**developer/refactoring-patterns.md**
- 리팩토링 카탈로그
- Before/After 예시
- 안전한 리팩토링 절차

**developer/dependency-management.md**
- 패키지 추가 기준
- 버전 관리
- lock 파일 관리

**developer/testable-code.md**
- 테스트 가능한 코드 작성법
- 의존성 주입
- 순수 함수 우선

**developer/error-handling.md**
- 에러 처리 패턴
- 커스텀 에러 클래스
- 에러 로깅

---

#### 3.6 qa/ - QA 에이전트 Skill

**qa/code-review.md**
```markdown
---
name: code-review
description: 코드 리뷰 체크리스트
---

# 코드 리뷰 가이드

## 리뷰 영역

### 1. 기능성
- [ ] 요구사항 충족
- [ ] 예외 케이스 처리
- [ ] 에러 핸들링

### 2. 가독성
- [ ] 네이밍 명확
- [ ] 복잡도 적절 (함수 < 50줄)
- [ ] 주석 필요한 곳만

### 3. 성능
- [ ] 불필요한 연산 없음
- [ ] 메모리 누수 없음
- [ ] 최적화 가능 지점

### 4. 보안
- [ ] 입력 검증
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] 민감 정보 노출 없음

### 5. 테스트 가능성
- [ ] 의존성 분리
- [ ] Mock 가능
- [ ] 순수 함수 우선
```

**qa/test-strategy.md**
- 단위/통합/E2E 테스트 전략
- 테스트 유형 선택 기준
- 커버리지 목표

**qa/unit-testing.md**
- 단위 테스트 작성법
- Mocking 전략
- 테스트 케이스 설계

**qa/integration-testing.md**
- 통합 테스트 설계
- 테스트 환경 설정
- 데이터 준비

**qa/e2e-testing.md**
- E2E 시나리오 작성
- Playwright/Cypress 사용법
- 스크린샷 비교

**qa/coverage-check.md**
- 커버리지 측정
- 80% 목표 달성 방법
- 미커버 영역 식별

**qa/performance-validation.md**
- 성능 측정 방법
- 벤치마크 작성
- 성능 기준 (응답 시간, 메모리 등)

---

#### 3.7 docs/ - 문서화 에이전트 Skill

**docs/code-documentation.md**
```markdown
---
name: code-documentation
description: JSDoc/TSDoc 작성 가이드
---

# 코드 문서화

## JSDoc/TSDoc 형식

```typescript
/**
 * 주어진 아이템들의 총 가격을 계산합니다.
 * 
 * @param items - 가격을 계산할 아이템 배열
 * @returns 모든 아이템의 가격 합계
 * @throws {Error} items가 빈 배열일 경우
 * 
 * @example
 * ```typescript
 * const total = calculateTotal([
 *   { name: 'Apple', price: 1000 },
 *   { name: 'Banana', price: 500 }
 * ]);
 * console.log(total); // 1500
 * ```
 */
function calculateTotal(items: Item[]): number {
  // ...
}
```

## 문서화 대상

### 반드시 문서화
- Public API
- 복잡한 알고리즘
- 외부 라이브러리 래퍼

### 선택적 문서화
- Private 함수 (복잡한 경우만)
- 타입 정의 (명확한 경우 생략 가능)
```

**docs/api-documentation.md**
- OpenAPI/Swagger 스펙 작성
- 엔드포인트 문서화
- 예시 요청/응답

**docs/changelog-generation.md**
- CHANGELOG.md 형식
- Semantic Versioning
- 변경사항 분류 (Added/Changed/Fixed/Removed)

**docs/readme-maintenance.md**
- README.md 구조
- 설치 방법
- 사용 예시

**docs/user-guide.md**
- 사용자 가이드 작성
- 튜토리얼 형식
- 스크린샷 포함

**docs/architecture-docs.md**
- 아키텍처 문서 작성
- 다이어그램 생성 (Mermaid)
- 설계 의사결정 기록

---

#### 3.8 meta/system/ - 시스템 개선 에이전트 Skill

**meta/system/performance-monitoring.md**
- 메트릭 수집 방법
- JSON 형식 정의
- 저장 위치 (.cursor/metrics/)

**meta/system/bottleneck-analysis.md**
- 병목 지점 식별 알고리즘
- 통계 분석 기법
- 개선 우선순위 결정

**meta/system/rule-optimization.md**
- Rule 파일 수정 전략
- 불필요한 규칙 제거
- 규칙 단순화

**meta/system/skill-generation.md**
- 새로운 Skill 생성
- 기존 Skill 수정
- Skill 테스트 방법

**meta/system/workflow-optimization.md**
- 워크플로우 패턴 개선
- 불필요한 단계 제거
- 병렬화 기회 식별

**meta/system/ab-testing.md**
- A/B 테스트 설계
- 두 버전 비교 실험
- 통계적 유의성 판단

---

#### 3.9 meta/mcp/ - MCP 개발 에이전트 Skill

**meta/mcp/pattern-detection.md**
```markdown
---
name: pattern-detection
description: 반복 작업 패턴 감지 알고리즘
---

# 패턴 감지

## 감지 대상

### 1. 반복 작업
- 조건: 동일 작업 5회 이상
- 확인: action frequency 분석
- 예시: "커버리지 파싱" 12회

### 2. 느린 작업
- 조건: 평균 3분 이상
- 확인: duration_ms 통계
- 예시: QA 에이전트 평균 180초

### 3. 에러 발생
- 조건: 에러율 10% 이상
- 확인: error_rate 분석
- 예시: 파싱 실패 15%

## 자동화 가능성 평가

- **High**: 명확한 입출력, 결정론적
- **Medium**: 일부 판단 필요, 대부분 자동화
- **Low**: 복잡한 판단, 컨텍스트 의존

## 출력 형식

```json
{
  "opportunity_id": "2026-01-28-003",
  "type": "repetitive_task",
  "action": "커버리지 추출",
  "frequency": 12,
  "avg_duration_ms": 30000,
  "automation_potential": "high",
  "estimated_savings": "25s + 500 tokens per use"
}
```
```

**meta/mcp/tool-gap-analysis.md**
- 도구 부족 지점 식별
- 기존 도구 평가
- 새 도구 필요성 판단

**meta/mcp/mcp-design.md**
- MCP 서버 설계 원칙
- 도구 인터페이스 정의 (inputs/outputs)
- 에러 처리 전략

**meta/mcp/mcp-implementation.md**
- TypeScript 구현 가이드
- MCP SDK 사용법
- 테스트 작성

**meta/mcp/mcp-testing.md**
- MCP 서버 테스트 전략
- 단위 테스트 작성
- 통합 테스트

**meta/mcp/mcp-deployment.md**
- `.cursor/mcp-servers/` 배포
- `mcp-servers.json` 업데이트
- 관련 Skill 수정

---

### 4. Metrics (성능 메트릭)

#### 4.1 metrics/cycles/ - 사이클별 기록

**2026-01-28-001.json**
```json
{
  "cycle_id": "2026-01-28-001",
  "timestamp": "2026-01-28T10:30:00Z",
  "task_type": "feature",
  "task_description": "사용자 인증 추가",
  "workflow": ["main", "planner", "developer", "qa", "docs", "main"],
  "agents": {
    "planner": { "duration_ms": 45000, "retries": 0, ... },
    "developer": { "duration_ms": 180000, "retries": 1, ... },
    "qa": { "duration_ms": 90000, "retries": 2, ... },
    "docs": { "duration_ms": 25000, "retries": 0, ... }
  },
  "totals": {
    "duration_ms": 340000,
    "total_tokens": 26000,
    "total_retries": 3,
    "success": true
  },
  "user_feedback": { "rating": 5, "comment": "완벽합니다" }
}
```

**파일명 규칙**: `YYYY-MM-DD-NNN.json` (NNN은 일일 일련번호)

#### 4.2 metrics/agents/ - 에이전트별 통계

**planner-stats.json**
```json
{
  "agent": "planner",
  "period": "2026-01-01 ~ 2026-01-28",
  "total_invocations": 45,
  "avg_duration_ms": 42000,
  "median_duration_ms": 40000,
  "p95_duration_ms": 60000,
  "total_retries": 5,
  "avg_retries": 0.11,
  "error_rate": 0.02,
  "avg_tokens": 3200,
  "avg_files_read": 7.5,
  "quality_score_avg": 0.93,
  "improvements": [
    {
      "date": "2026-01-15",
      "type": "skill_update",
      "impact": "duration -15%"
    }
  ]
}
```

#### 4.3 metrics/improvements/ - 개선 이력

**2026-01-28-improvement-001.md**
```markdown
# 개선 이력: QA 에이전트 커버리지 체크 자동화

**날짜**: 2026-01-28
**개선 ID**: 2026-01-28-improvement-001
**담당**: MCP 개발 에이전트

## 문제 감지

- **에이전트**: QA
- **지표**: 평균 duration_ms 90,000 (다른 에이전트 대비 2배)
- **패턴**: 매번 vitest 결과를 수동으로 파싱
- **빈도**: 12회 (최근 20 사이클)

## 분석

- **근본 원인**: vitest 커버리지 수동 추출
- **영향**: 전체 워크플로우 시간 30% 증가
- **자동화 가능성**: High (입출력 명확, 결정론적)
- **예상 개발 시간**: 2시간
- **ROI**: 5 사이클

## 액션

1. MCP 개발 에이전트 호출
2. `vitest-coverage-analyzer` MCP 서버 개발
   - 도구: get_coverage, check_threshold
   - 입력: project_path, threshold
   - 출력: coverage_report (JSON)
3. `.cursor/mcp-servers/vitest-coverage/` 생성
4. `mcp-servers.json` 업데이트
5. `qa/coverage-check.md` Skill 업데이트
   - 추가: MCP 도구 사용 섹션
   - 제거: 수동 파싱 로직

## 결과

**Before:**
- 평균 duration_ms: 90,000
- 에러율: 15% (파싱 실패)
- 토큰 사용: 8,000

**After:**
- 평균 duration_ms: 15,000 (83% 감소)
- 에러율: 0%
- 토큰 사용: 500 (94% 감소)

**ROI 달성**: 사이클 25에서 달성 (예상보다 빠름)
```

#### 4.4 metrics/mcp-opportunities/ - MCP 개발 기회

**2026-01-28-opp-001.json**
```json
{
  "opportunity_id": "2026-01-28-opp-001",
  "detected_at": "2026-01-28T12:00:00Z",
  "pattern": {
    "type": "repetitive_task",
    "agent": "qa",
    "action": "커버리지 추출 및 파싱",
    "frequency": 12,
    "avg_duration_ms": 30000,
    "error_rate": 0.15,
    "tokens_per_execution": 500
  },
  "analysis": {
    "automation_potential": 0.95,
    "complexity": "medium",
    "estimated_dev_time_hours": 2,
    "estimated_savings_per_use_ms": 25000,
    "estimated_token_savings": 450,
    "roi_cycles": 5
  },
  "recommendation": {
    "action": "create_mcp_server",
    "name": "vitest-coverage-analyzer",
    "tools": [
      {
        "name": "get_coverage",
        "description": "프로젝트 전체 커버리지 조회",
        "inputs": ["project_path"],
        "outputs": ["coverage_report"]
      },
      {
        "name": "check_threshold",
        "description": "커버리지 임계값 체크",
        "inputs": ["threshold"],
        "outputs": ["pass", "failures"]
      }
    ],
    "priority": "high"
  },
  "status": "approved",
  "implemented_at": "2026-01-28T14:30:00Z",
  "implementation_cycle": "2026-01-28-022"
}
```

---

### 5. MCP Servers (자동 생성)

#### 5.1 mcp-servers/[server-name]/ - MCP 서버 구조

**예시: vitest-coverage/**

```
vitest-coverage/
├── package.json            # 의존성 정의
├── tsconfig.json           # TypeScript 설정
├── src/
│   └── index.ts            # MCP 서버 구현
├── tests/
│   └── index.test.ts       # 단위 테스트
├── dist/                   # 빌드 결과
│   └── index.js
└── README.md               # 사용 가이드
```

**package.json**
```json
{
  "name": "@cursor/vitest-coverage-analyzer",
  "version": "1.0.0",
  "description": "Vitest 커버리지 자동 분석 MCP 서버",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

**src/index.ts**
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "vitest-coverage-analyzer",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_coverage",
        description: "프로젝트 전체 커버리지 조회",
        inputSchema: {
          type: "object",
          properties: {
            project_path: { type: "string" }
          },
          required: ["project_path"]
        }
      },
      // ... 다른 도구들
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_coverage") {
    // 구현 로직
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

**README.md**
```markdown
# Vitest Coverage Analyzer

Vitest 테스트 커버리지를 자동으로 분석하는 MCP 서버입니다.

## 생성 정보

- **생성일**: 2026-01-28
- **생성자**: MCP 개발 에이전트
- **이유**: QA 에이전트 커버리지 체크 자동화
- **사이클**: 2026-01-28-022

## 도구 목록

### get_coverage
- **설명**: 프로젝트 전체 커버리지 조회
- **입력**: project_path (string)
- **출력**: coverage_report (object)

### check_threshold
- **설명**: 커버리지 임계값 체크
- **입력**: threshold (number, 0-1)
- **출력**: pass (boolean), failures (array)

## 사용 예시

```typescript
// QA 에이전트에서 사용
const coverage = await mcp.get_coverage({ project_path: "." });
console.log(coverage.total); // 0.85

const result = await mcp.check_threshold({ threshold: 0.8 });
console.log(result.pass); // true
```

## 성능

- **평균 실행 시간**: 120ms
- **성공률**: 100%
- **사용 횟수**: 45회 (2026-01-28 기준)
```

---

### 6. MCP Servers Registry

#### mcp-servers.json

```json
{
  "mcpServers": {
    "vitest-coverage": {
      "command": "node",
      "args": [".cursor/mcp-servers/vitest-coverage/dist/index.js"],
      "created_at": "2026-01-28T10:00:00Z",
      "created_by": "mcp-dev-agent",
      "reason": "QA 에이전트 커버리지 체크 자동화",
      "cycle_id": "2026-01-28-020",
      "usage_count": 45,
      "success_rate": 1.0,
      "avg_duration_ms": 120,
      "performance_improvement": "83%",
      "tools": ["get_coverage", "get_coverage_by_file", "check_threshold"],
      "status": "active"
    },
    "github-helper": {
      "command": "node",
      "args": [".cursor/mcp-servers/github-helper/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "created_at": "2026-01-28T15:30:00Z",
      "created_by": "mcp-dev-agent",
      "reason": "GitHub API 호출 최적화 (캐싱)",
      "cycle_id": "2026-01-28-035",
      "usage_count": 128,
      "success_rate": 0.98,
      "avg_duration_ms": 50,
      "performance_improvement": "80%",
      "tools": ["check_pr_status", "create_pr", "get_issues"],
      "status": "active"
    }
  }
}
```

---

## 프로젝트 루트의 AGENTS.md

프로젝트 루트에는 **AGENTS.md** 파일이 필요합니다:

```
D:\personal\
└── AGENTS.md                # 모든 에이전트가 읽는 공통 가이드
```

**AGENTS.md 내용 (요약)**:
- 공통 코딩 컨벤션 (변수명, 함수명)
- 품질 기준 (linter, 커버리지, 테스트)
- 개발 원칙 (가정 금지, 코드 직접 읽기)
- 에이전트 역할 정의
- 서브에이전트 호출 규칙

---

## 파일 크기 가이드

- **Rule**: ~200줄 (핵심이므로 예외)
- **Skill**: **50줄 이내** (권장)
- **AGENTS.md**: ~150줄
- **Metrics JSON**: 제한 없음 (자동 생성)
- **Improvement MD**: ~100줄

---

## 업데이트 주체

| 파일 유형 | 업데이트 주체 | 빈도 |
|----------|-------------|-----|
| Rules | 시스템 개선 에이전트 | 드물게 (20 사이클+) |
| Skills | 시스템 개선 에이전트 | 자주 (5-10 사이클) |
| AGENTS.md | 시스템 개선 에이전트 | 가끔 (30 사이클+) |
| Metrics JSON | 자동 (각 사이클) | 매 사이클 |
| MCP 서버 | MCP 개발 에이전트 | 필요 시 (10-20 사이클) |
| mcp-servers.json | MCP 개발 에이전트 | MCP 서버 추가 시 |

---

## 다음 단계

전체 디렉토리 구조를 이해했다면 [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)를 참조하여 단계별로 구현을 시작하세요.
