# 에이전트 시스템 디렉토리 구조

> 마지막 업데이트: 2026-03-20

## 전체 구조

```
.cursor/
├── AGENT_SYSTEM_DESIGN.md          # 시스템 설계 문서
├── CHANGELOG.md                    # 변경 이력
├── DIRECTORY_STRUCTURE.md          # 이 문서
├── mcp-servers.json                # MCP 서버 설정
│
├── agents/                         # 서브에이전트 정의 (7개)
│   ├── planner.md                  # 기획/설계 에이전트
│   ├── developer.md                # 구현 에이전트
│   ├── qa.md                       # 품질 보증 에이전트
│   ├── security.md                 # 보안 에이전트
│   ├── git-workflow.md             # Git 워크플로우 에이전트
│   ├── docs.md                     # 문서화 에이전트
│   └── mcp-development.md          # MCP 개발 에이전트 (메타)
│
├── rules/                          # Rule 파일 (메인 에이전트 전용)
│   ├── main-orchestrator.mdc       # 메인 에이전트 조율 규칙
│   ├── development-tools.mdc       # 개발 도구 사용 규칙
│   └── diagram-rule.mdc            # Mermaid 다이어그램 규칙
│
├── skills/                         # 스킬 파일 (3계층 지식 분리)
│   │
│   │  # ── 도메인 스킬 (에이전트별) ──
│   ├── developer/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── auto-formatting.md
│   │       ├── chrome-extension-routing.md
│   │       ├── chrome-extension-storage.md  # 스토리지 마이그레이션/FOUC 패턴
│   │       ├── code-implementation.md
│   │       ├── config-optimization.md
│   │       ├── dependency-management.md
│   │       ├── file-status-guide.md
│   │       ├── headless-components.md
│   │       ├── monorepo-patterns.md
│   │       ├── prohibited-practices.md
│   │       ├── refactoring-patterns.md
│   │       ├── svelte-conventions.md
│   │       ├── testable-code.md
│   │       └── mcp/                        # MCP 개발 전용
│   │           ├── mcp-design.md
│   │           ├── mcp-deployment.md
│   │           ├── mcp-implementation.md
│   │           ├── mcp-testing.md
│   │           ├── pattern-detection.md
│   │           └── tool-gap-analysis.md
│   ├── planner/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── api-design.md
│   │       ├── architecture-design.md
│   │       ├── plan-todo-format.md
│   │       └── requirement-analysis.md
│   ├── qa/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── async-store-testing.md      # async 스토어 테스트 패턴
│   │       ├── chrome-extension-testing.md
│   │       ├── code-review.md
│   │       ├── coverage-check.md
│   │       ├── storybook-strategy.md
│   │       ├── svelte-testing.md
│   │       ├── tdd-gate-workflow.md
│   │       ├── test-necessity-evaluation.md
│   │       ├── test-quality.md
│   │       └── test-strategy.md
│   ├── security/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── api-security-check.md
│   │       ├── code-vulnerability-scan.md
│   │       ├── input-validation.md
│   │       ├── prompt-injection-defense.md
│   │       └── sensitive-data-detection.md
│   ├── git-workflow/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── change-analysis.md
│   │       ├── commit-message-generation.md
│   │       ├── pr-description-generation.md
│   │       └── reviewer-recommendation.md
│   ├── docs-agent/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── changelog-generation.md
│   │       ├── code-documentation.md
│   │       ├── readme-maintenance.md
│   │       ├── staleness-detection.md
│   │       └── technology-documentation.md
│   ├── orchestrator/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── parallel-execution.md
│   │       ├── progress-monitoring.md
│   │       ├── quality-gate.md
│   │       ├── subagent-communication.md
│   │       ├── task-classifier.md
│   │       ├── task-decomposition.md
│   │       ├── workflow-checklist.md
│   │       ├── workflow-manager.md
│   │       └── workflow-orchestration.md
│   ├── system-improvement/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── ab-testing.md
│   │       ├── automated-improvement.md
│   │       ├── bottleneck-analysis.md
│   │       ├── metrics-analysis.md
│   │       ├── metrics-collection.md
│   │       ├── performance-monitoring.md
│   │       ├── rule-optimization.md
│   │       ├── skill-generation.md
│   │       └── workflow-optimization.md
│   │
│   │  # ── 공용 스킬 ──
│   ├── cli-usage/
│   │   └── SKILL.md                        # CLI/pnpm 사용 규칙
│   ├── error-handling/
│   │   └── SKILL.md                        # 에러 처리 패턴
│   ├── project-conventions/
│   │   └── SKILL.md                        # 코딩 컨벤션 (HOW)
│   └── project-knowledge/                  # 프로젝트 구현 지식 (WHAT)
│       ├── SKILL.md
│       └── references/
│           └── ecount-dev-tool.md          # Chrome Extension 패키지 지식
│
├── workflows/                      # 워크플로우 정의
│   ├── plan-execution-workflow.md  # 플랜 실행 워크플로우 (0~10단계)
│   ├── final-report-template.md    # 작업 완료 보고서 템플릿
│   └── domain-specific/
│       ├── add-svelte-component.md # Svelte 5 컴포넌트 추가 절차
│       └── add-api-endpoint.md     # API 엔드포인트 추가 절차
│
├── metrics/                        # 성능 메트릭 데이터
│   ├── cycle-template.json         # 사이클 JSON 스키마
│   ├── cycles/                     # 사이클별 메트릭 (YYYY-MM-DD-NNN.json)
│   ├── reports/                    # 최종 보고서 (YYYY-MM-DD-NNN-*.md)
│   ├── improvements/               # 시스템 개선 이력
│   └── summaries/                  # 집계 요약 (향후)
│
├── commands/                       # 커스텀 명령어 정의
│   ├── plan-execution.md           # /plan-execution 커맨드
│   └── test-when-needed.md         # /test-when-needed 커맨드
│
├── docs/                           # 프로젝트 문서
│   ├── agent-architecture-guide.md # 에이전트 시스템 아키텍처 가이드
│   ├── setup-logs/                 # 셋업 로그
│   └── ...                         # 기타 설계/분석 문서
│
├── mcp-servers/                    # MCP 서버
│   └── template/                   # MCP 서버 템플릿
│
├── git-workflow/                   # Git 워크플로우 작업 파일
├── temp/                           # 임시 파일 (커밋 메시지 등)
├── plans/                          # 플랜 파일
└── old/                            # 아카이브된 구 문서
    ├── AGENT_SYSTEM_DESIGN.md      # v1.0 시스템 설계 (2026-01-28)
    ├── DIRECTORY_STRUCTURE.md      # v1.0 디렉토리 구조
    └── IMPLEMENTATION_ROADMAP.md   # v1.0 구현 로드맵 (완료)
```

## 프로젝트 패키지 구조

```
packages/
├── ecount-dev-tool/    # Chrome Extension (Svelte 5)
├── uikit/              # UI Kit (Svelte 5, Vanilla Extract)
├── time-tracker/       # 시간 추적기
├── docs/               # VitePress 문서
└── mcp-server/         # MCP 서버
```
